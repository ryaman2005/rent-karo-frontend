const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Otp = require("../models/Otp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOtpEmail } = require("../services/mailService");
const protect = require("../middleware/authMiddleware");
const kycUpload = require("../middleware/kycUploadMiddleware");

// ─── Helper: sign token ───────────────────────────────
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ─── Register Route (Send OTP) ───────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    // Generate a 6-digit pure number OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Remove any existing OTP for this email
    await Otp.deleteMany({ email });

    // Save newly generated OTP
    await Otp.create({ email, otp: otpCode });

    // Send the email (wait for it to guarantee delivery)
    await sendOtpEmail({ toEmail: email, otp: otpCode });

    res.status(200).json({
      message: "An OTP has been sent to your email.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ─── Verify OTP & Create Account ───────────────────────
router.post("/verify-otp", async (req, res) => {
  try {
    const { name, email, password, role, otp, phone, termsAccepted } = req.body;

    if (!name || !email || !password || !otp || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    if (termsAccepted !== true) {
      return res.status(400).json({ message: "You must accept the terms and conditions." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Account already exists" });
    }

    // Verify OTP
    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "renter",
      phone,
      termsAccepted: true,
    });

    // Delete OTP
    await Otp.deleteMany({ email });

    const token = signToken(newUser._id);

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        idVerificationStatus: newUser.idVerificationStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ─── Login Route ──────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "No account found with this email" });
    }

    // Prevent password login for Google-only accounts
    if (!user.password) {
      return res.status(400).json({ message: "This account uses Google sign-in. Please sign in with Google." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = signToken(user._id);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        bio: user.bio,
        street: user.street,
        city: user.city,
        state: user.state,
        pin: user.pin,
        idVerificationStatus: user.idVerificationStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ─── Google OAuth Route ───────────────────────────────
// Called after the client receives a Google credential token.
// Expects: { googleId, name, email, avatar }
router.post("/google", async (req, res) => {
  try {
    const { googleId, name, email, avatar, role } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({ message: "Invalid Google credentials" });
    }

    // Upsert: find by googleId or email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Update googleId / avatar if signing in via Google for the first time
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = avatar;
        await user.save();
      }
    } else {
      // New user — create with chosen role
      user = await User.create({
        name,
        email,
        googleId,
        avatar,
        role: role || "renter",
        password: null,
      });
    }

    const token = signToken(user._id);

    res.status(200).json({
      message: "Google sign-in successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        bio: user.bio,
        street: user.street,
        city: user.city,
        state: user.state,
        pin: user.pin,
        idVerificationStatus: user.idVerificationStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ─── POST /api/auth/kyc — Renter uploads their ID document ───
router.post("/kyc", protect, kycUpload.single("idDocument"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an ID document." });
    }

    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.idVerificationStatus === "approved") {
      return res.status(400).json({ message: "Your ID is already verified." });
    }

    user.idDocumentUrl = req.file.path;
    user.idVerificationStatus = "pending";
    await user.save();

    // ── Emit Socket Event to Owners ──
    const io = req.app.get("io");
    const userSockets = req.app.get("userSockets");

    if (io && userSockets) {
      // Find all owners to notify them
      const owners = await User.find({ role: "owner" }).select("_id");
      owners.forEach((owner) => {
        const socketId = userSockets.get(owner._id.toString());
        if (socketId) {
          io.to(socketId).emit("new_kyc_submission", {
            userId: user._id,
            userName: user.name,
            status: "pending",
          });
        }
      });
    }

    res.status(200).json({
      message: "ID document submitted successfully. Awaiting admin review.",
      idVerificationStatus: user.idVerificationStatus,
    });
  } catch (error) {
    console.error("[KYC] Upload error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─── GET /api/auth/kyc/pending — Admin fetches all pending KYC requests ───
router.get("/kyc/pending", protect, async (req, res) => {
  try {
    const admin = await User.findById(req.user);
    if (!admin || admin.role !== "owner") {
      return res.status(403).json({ message: "Admin access only." });
    }

    const pendingUsers = await User.find({ idVerificationStatus: "pending" })
      .select("name email phone idDocumentUrl idVerificationStatus createdAt")
      .sort({ createdAt: -1 });

    res.json(pendingUsers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─── PATCH /api/auth/kyc/:id — Admin approves or rejects KYC ───
router.patch("/kyc/:id", protect, async (req, res) => {
  try {
    const admin = await User.findById(req.user);
    if (!admin || admin.role !== "owner") {
      return res.status(403).json({ message: "Admin access only." });
    }

    const { status } = req.body; // "approved" | "rejected"
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: "User not found." });

    targetUser.idVerificationStatus = status;
    await targetUser.save();

    res.json({
      message: `KYC ${status} for ${targetUser.name}.`,
      user: { _id: targetUser._id, name: targetUser.name, idVerificationStatus: status },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


// ─── PATCH /api/auth/profile — Update profile fields ───
router.patch("/profile", protect, async (req, res) => {
  try {
    const { name, phone, bio, street, city, state, pin } = req.body;
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (name)   user.name   = name;
    if (phone !== undefined) user.phone = phone;
    // Store extra fields loosely (bio, address) — extend schema if needed
    user.bio    = bio    ?? user.bio;
    user.street = street ?? user.street;
    user.city   = city   ?? user.city;
    user.state  = state  ?? user.state;
    user.pin    = pin    ?? user.pin;

    await user.save();
    res.json({
      message: "Profile updated.",
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, phone: user.phone, bio: user.bio, street: user.street, city: user.city, state: user.state, pin: user.pin },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
// ─── GET /api/auth/user/:id — Fetch public user profile ───
router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("name avatar bio city state role idVerificationStatus createdAt");
    
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;