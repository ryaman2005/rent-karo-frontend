const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Message = require("../models/Message");
const Rental = require("../models/Rental");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

// ── GET /api/chat/inbox — Unified inbox for Rentals and Direct Messages ──
router.get("/inbox", protect, async (req, res) => {
  try {
    const userId = req.user;

    // 1. Fetch Confirmed Rentals
    const rentals = await Rental.find({
      $or: [{ user: userId }, { owner: userId }],
      status: "confirmed"
    })
      .populate("user", "name avatar")
      .populate("owner", "name avatar")
      .lean();

    // 2. Fetch Direct Messages (rentalId: null) involving this user
    const dmAggregation = await Message.aggregate([
      {
        $match: {
          rentalId: null,
          $or: [{ sender: new mongoose.Types.ObjectId(userId) }, { receiver: new mongoose.Types.ObjectId(userId) }]
        }
      },
      {
        $sort: { createdAt: -1 } // sort latest first
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", new mongoose.Types.ObjectId(userId)] },
              "$receiver",
              "$sender"
            ]
          },
          latestMessage: { $first: "$$ROOT" }
        }
      }
    ]);

    // Populate the other user for DMs
    const dmPartnerIds = dmAggregation.map(dm => dm._id);
    const dmPartners = await User.find({ _id: { $in: dmPartnerIds } }).select("name avatar").lean();
    const partnerMap = dmPartners.reduce((acc, user) => {
      acc[user._id.toString()] = user;
      return acc;
    }, {});

    const conversations = [];

    // Add rentals to conversations
    for (const r of rentals) {
      const isOwner = r.owner && r.owner._id.toString() === userId.toString();
      const otherUser = isOwner ? r.user : r.owner;
      if (!otherUser) continue; // skip if user was deleted
      
      conversations.push({
        type: "rental",
        rental: r,
        otherUser: otherUser,
        updatedAt: r.updatedAt
      });
    }

    // Add DMs to conversations
    for (const dm of dmAggregation) {
      const otherUser = partnerMap[dm._id.toString()];
      if (!otherUser) continue; // skip if user was deleted

      conversations.push({
        type: "direct",
        otherUser: otherUser,
        latestMessage: dm.latestMessage.text,
        updatedAt: dm.latestMessage.createdAt
      });
    }

    // Sort all by updatedAt descending
    conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.json(conversations);
  } catch (error) {
    console.error("Inbox error:", error);
    res.status(500).json({ message: "Server error fetching inbox" });
  }
});

// ── GET /api/chat/:rentalId ──
// Fetch all messages for a specific rental transaction
router.get("/:rentalId", protect, async (req, res) => {
  try {
    const { rentalId } = req.params;

    // Verify the user is either the renter or the owner of this rental
    const rental = await Rental.findById(rentalId);
    if (!rental) return res.status(404).json({ message: "Rental not found" });

    const isRenter = rental.user?.toString() === req.user.toString();
    const isOwner = rental.owner?.toString() === req.user.toString();

    if (!isRenter && !isOwner) {
      return res.status(403).json({ message: "Not authorized to view this chat" });
    }

    const messages = await Message.find({ rentalId })
      .populate("sender", "name avatar")
      .populate("receiver", "name avatar")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error: error.message });
  }
});

// ── GET /api/chat/direct/:otherUserId — Fetch direct (Support) messages ──
router.get("/direct/:otherUserId", protect, async (req, res) => {
  try {
    const { otherUserId } = req.params;

    // Find messages between these two users that HAVE NO rentalId
    const messages = await Message.find({
      rentalId: null,
      $or: [
        { sender: req.user, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user }
      ]
    })
      .populate("sender", "name avatar")
      .populate("receiver", "name avatar")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching DM", error: error.message });
  }
});

// ── POST /api/chat ──
// Save a new message securely
router.post("/", protect, async (req, res) => {
  try {
    const { rentalId, text, receiverId } = req.body;

    if (!text || !receiverId) {
      return res.status(400).json({ message: "text and receiverId are required" });
    }

    // If it's a rental chat, verify authorization
    if (rentalId) {
      const rental = await Rental.findById(rentalId);
      if (!rental) return res.status(404).json({ message: "Rental not found" });

      const isRenter = rental.user?.toString() === req.user.toString();
      const isOwner = rental.owner?.toString() === req.user.toString();

      if (!isRenter && !isOwner) {
        return res.status(403).json({ message: "Not authorized for this rental chat" });
      }
    }

    const message = await Message.create({
      rentalId: rentalId || null,
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
