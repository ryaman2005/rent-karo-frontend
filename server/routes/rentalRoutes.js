const express = require("express");
const router = express.Router();
const Rental = require("../models/Rental");
const Product = require("../models/Product");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");
const { sendRentalConfirmation, sendRentalRejection } = require("../services/mailService");

// ── POST /api/rentals — Renter creates a rental request ──────────────
router.post("/", protect, async (req, res) => {
  try {
    const { productId, productName, price, deposit, startDate, endDate } = req.body;

    if (!productName || !price || !deposit || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required rental fields including dates." });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({ message: "End date must be after start date." });
    }

    // Block overlapping date windows completely for active (pending/confirmed) rentals
    const overlapping = await Rental.findOne({
      product: productId,
      status: { $in: ["pending", "confirmed"] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (overlapping) {
      return res.status(400).json({ message: "Oops! These dates are already booked or pending confirmation." });
    }

    // ── KYC Gate: block unverified renters ──
    const renterUser = await User.findById(req.user).select("idVerificationStatus");
    if (!renterUser || renterUser.idVerificationStatus !== "approved") {
      return res.status(403).json({
        message: "KYC_REQUIRED",
        detail: "You must verify your ID before renting items. Please upload a valid ID document.",
      });
    }

    // Find product to get owner
    let ownerId = null;
    if (productId) {
      const product = await Product.findById(productId);
      if (product) ownerId = product.owner;
    }

    const rental = await Rental.create({
      user: req.user,
      product: productId || null,
      owner: ownerId,
      productName,
      price,
      deposit,
      startDate: start,
      endDate: end,
      status: "pending",
    });

    // Populate renter info for the notification payload
    const renter = await User.findById(req.user).select("name email phone");

    // ── Emit real-time notification to the owner ──
    if (ownerId) {
      const io = req.app.get("io");
      const userSockets = req.app.get("userSockets");
      const ownerSocketId = userSockets.get(ownerId.toString());

      if (ownerSocketId) {
        io.to(ownerSocketId).emit("new_rental_request", {
          rentalId: rental._id,
          productName,
          price,
          deposit,
          startDate: start,
          endDate: end,
          renter: {
            id: renter._id,
            name: renter.name,
            email: renter.email,
          },
          createdAt: rental.createdAt,
        });
        console.log(`[Socket] Notified owner ${ownerId} about rental request`);
      } else {
        console.log(`[Socket] Owner ${ownerId} not connected — notification queued in DB`);
      }
    }

    res.status(201).json({ message: "Rental request sent. Awaiting owner confirmation.", rental });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ── GET /api/rentals — Renter's own rentals ───────────────────────────
router.get("/", protect, async (req, res) => {
  try {
    const rentals = await Rental.find({ user: req.user }).sort({ createdAt: -1 });
    res.json(rentals);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── GET /api/rentals/owner — Pending requests for owner's items ───────
router.get("/owner", protect, async (req, res) => {
  try {
    const rentals = await Rental.find({ owner: req.user, status: "pending" })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
    res.json(rentals);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── GET /api/rentals/inbox — All confirmed rentals for Chat ───────────
router.get("/inbox", protect, async (req, res) => {
  try {
    const rentals = await Rental.find({
      $or: [{ user: req.user }, { owner: req.user }],
      status: "confirmed"
    })
      .populate("user", "name avatar")
      .populate("owner", "name avatar")
      .sort({ updatedAt: -1 });
    res.json(rentals);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── PATCH /api/rentals/:id — Owner confirms or rejects ────────────────
router.patch("/:id", protect, async (req, res) => {
  try {
    const { status } = req.body; // "confirmed" | "rejected"

    if (!["confirmed", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Use 'confirmed' or 'rejected'." });
    }

    const rental = await Rental.findById(req.params.id).populate("user", "name email phone");

    if (!rental) return res.status(404).json({ message: "Rental not found." });

    // Ensure only the owner can confirm/reject
    if (!rental.owner || rental.owner.toString() !== req.user.toString()) {
      return res.status(403).json({ message: "Not authorized to update this rental." });
    }

    rental.status = status;
    await rental.save();

    // ── Notify the renter via socket ──
    const io = req.app.get("io");
    const userSockets = req.app.get("userSockets");
    const renterSocketId = userSockets.get(rental.user._id.toString());

    if (renterSocketId) {
      io.to(renterSocketId).emit("rental_status_update", {
        rentalId: rental._id,
        productName: rental.productName,
        status,
      });
    }

    // ── Email notification to renter ──
    const renter = rental.user;
    if (status === "confirmed") {
      // Calculate diff in months roughly for email compat
      const diffMs = new Date(rental.endDate) - new Date(rental.startDate);
      const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const dur = Math.max(1, Math.round(days / 30)); 

      await sendRentalConfirmation({
        toEmail: renter.email,
        renterName: renter.name,
        productName: rental.productName,
        duration: dur,
        price: rental.price,
        deposit: rental.deposit,
      });
    } else {
      await sendRentalRejection({
        toEmail: renter.email,
        renterName: renter.name,
        productName: rental.productName,
      });
    }

    res.json({ message: `Rental ${status} successfully.`, rental });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ── DELETE /api/rentals/:id — Renter returns item ─────────────────────
router.delete("/:id", protect, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ message: "Rental not found." });
    if (rental.user.toString() !== req.user.toString()) {
      return res.status(403).json({ message: "Not authorized." });
    }
    await rental.deleteOne();
    res.json({ message: "Item returned successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;