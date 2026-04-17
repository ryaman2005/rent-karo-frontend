const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const protect = require("../middleware/authMiddleware");

// ─── POST /api/reviews — Post a new review ───
router.post("/", protect, async (req, res) => {
  try {
    const { targetUserId, productId, rating, comment } = req.body;

    if (!targetUserId || !rating || !comment) {
      return res.status(400).json({ message: "Missing required review fields." });
    }

    const review = await Review.create({
      reviewer: req.user,
      targetUser: targetUserId,
      product: productId || null,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─── GET /api/reviews/product/:productId — Get reviews for a product ───
router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("reviewer", "name avatar")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ─── GET /api/reviews/user/:userId — Get reviews for a user ───
router.get("/user/:userId", async (req, res) => {
  try {
    const reviews = await Review.find({ targetUser: req.params.userId })
      .populate("reviewer", "name avatar")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
