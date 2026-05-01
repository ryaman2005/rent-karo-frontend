const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false, // optional for Google OAuth users
      default: null,
    },
    role: {
      type: String,
      enum: ["renter", "owner"],
      default: "renter",
    },
    googleId: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    termsAccepted: {
      type: Boolean,
      default: false,
    },
    idVerificationStatus: {
      type: String,
      enum: ["unverified", "pending", "approved", "rejected"],
      default: "unverified",
    },
    idDocumentUrl: {
      type: String,
      default: null,
    },
    bio:    { type: String, default: null },
    street: { type: String, default: null },
    city:   { type: String, default: null },
    state:  { type: String, default: null },
    pin:    { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);