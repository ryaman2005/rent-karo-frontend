const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const Rental = require("../models/Rental");
const protect = require("../middleware/authMiddleware");

// ── GET /api/chat/:rentalId ──
// Fetch all messages for a specific rental transaction
router.get("/:rentalId", protect, async (req, res) => {
  try {
    const { rentalId } = req.params;

    // Verify the user is either the renter or the owner of this rental
    const rental = await Rental.findById(rentalId).populate("product");
    if (!rental) return res.status(404).json({ message: "Rental not found" });

    const isRenter = rental.user?.toString() === req.user.toString();
    const isOwner = rental.owner?.toString() === req.user.toString();

    if (!isRenter && !isOwner) {
      return res.status(403).json({ message: "Not authorized to view this chat" });
    }

    const messages = await Message.find({ rentalId })
      .populate("sender", "name avatar")
      .populate("receiver", "name avatar")
      .sort({ createdAt: 1 }); // Oldest to newest

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error: error.message });
  }
});

// ── POST /api/chat ──
// Save a new message securely
router.post("/", protect, async (req, res) => {
  try {
    const { rentalId, text, receiverId } = req.body;

    if (!rentalId || !text || !receiverId) {
      return res.status(400).json({ message: "rentalId, text, and receiverId are required" });
    }

    // Security verify
    const rental = await Rental.findById(rentalId);
    if (!rental) return res.status(404).json({ message: "Rental not found" });

    const isRenter = rental.user?.toString() === req.user.toString();
    const isOwner = rental.owner?.toString() === req.user.toString();

    if (!isRenter && !isOwner) {
      return res.status(403).json({ message: "Not authorized to send messages in this chat" });
    }

    const message = await Message.create({
      rentalId,
      sender: req.user,
      receiver: receiverId,
      text,
    });

    const populatedMsg = await Message.findById(message._id)
      .populate("sender", "name avatar")
      .populate("receiver", "name avatar");

    res.status(201).json(populatedMsg);
  } catch (error) {
    console.error("DEBUG CHAT ERROR:", error);
    res.status(500).json({ message: error.message || "Unknown error occurred" });
  }
});

module.exports = router;
