const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Separate Cloudinary folder for ID documents
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "rentkaro_kyc",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
    transformation: [{ width: 1600, height: 1200, crop: "limit" }],
  },
});

const kycUpload = multer({ storage });

module.exports = kycUpload;
