const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// Get all products (with optional distance filtering)
router.get("/", async (req, res) => {
  try {
    const { lat, lng, radius = 5, category, search } = req.query;
    let query = {};

    if (category && category !== "All") query.category = category;
    if (search) query.name = { $regex: search, $options: "i" };

    // Geospatial filter (radius in KM)
    if (lat && lng) {
      query.location = {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)] // MongoDB needs [lng, lat]
          },
          $maxDistance: parseFloat(radius) * 1000 // Convert KM to meters
        }
      };
    }

    const products = await Product.find(query).sort({createdAt: -1});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


// Get products listed by logged user
router.get("/my-listings/:userId", protect, async (req,res)=>{
  try{
    // Ensure the user is requesting their own listings
    if (req.user.toString() !== req.params.userId) {
      return res.status(403).json({ message: "Not authorized to view these listings" });
    }

    const products = await Product.find({ owner: req.params.userId }).sort({createdAt: -1});
    res.json(products);
  }catch(error){
    res.status(500).json({message:"Server error"});
  }
});


// Get single product
router.get("/:id", async (req,res)=>{

  try{

    const product = await Product.findById(req.params.id).populate("owner", "name avatar createdAt");

    if(!product){
      return res.status(404).json({message:"Product not found"});
    }

    res.json(product);

  }catch(error){

    res.status(500).json({message:"Server error"});

  }

});


// ─── Create Product (protected + file upload) ───
router.post("/", protect, (req, res) => {
  upload.single("image")(req, res, async (multerErr) => {
    if (multerErr) {
      console.error("MULTER/CLOUDINARY ERROR:", multerErr);
      return res.status(500).json({ message: "Upload failed: " + multerErr.message });
    }
    
    try {
      console.log("INCOMING LISTING:", req.body);
      const { name, price, deposit, category, lat, lng, address } = req.body;

      if (!name || !price || !deposit || !req.file) {
        return res.status(400).json({ message: "All fields and an image file are required" });
      }

    let locationData = undefined;
    if (lat && lng) {
      locationData = {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)]
      };
    }

    const product = await Product.create({
      name,
      price,
      deposit,
      image: req.file.path, // Cloudinary secure URL
      category: category || "General",
      owner: req.user,
      address: address || "",
      ...(locationData && { location: locationData })
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
  }); // End of upload.single closure
});


// Delete product
router.delete("/:id", protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Verify ownership
    if (product.owner.toString() !== req.user.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this product" });
    }

    // Delete image from Cloudinary
    if (product.image && product.image.includes("cloudinary.com")) {
      const parts = product.image.split("/");
      const uploadIndex = parts.findIndex(p => p === "upload");
      if (uploadIndex !== -1) {
        const publicIdWithExt = parts.slice(uploadIndex + 2).join("/");
        const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
          console.log(`[Cloudinary] Deleted asset: ${publicId}`);
        }
      }
    }

    await product.deleteOne();
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


module.exports = router;