require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const rentalRoutes = require("./routes/rentalRoutes");
const productRoutes = require("./routes/productRoutes");
const protect = require("./middleware/authMiddleware");

const app = express();

// ✅ CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET","POST","PUT","DELETE","OPTIONS"],
    allowedHeaders: ["Content-Type","Authorization"],
    credentials: true
  })
);

// ✅ Middleware
app.use(express.json());

// ✅ Routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/rentals", rentalRoutes);

// Protected route
app.get("/api/profile", protect, (req, res) => {
  res.json({
    message: "Protected route accessed",
    userId: req.user,
  });
});

// DB connection
console.log("Attempting to connect to DB...");

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("DB Error:", err));

// Test route
app.get("/", (req,res)=>{
  res.send("RentEase API running");
});

const PORT = 8000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));