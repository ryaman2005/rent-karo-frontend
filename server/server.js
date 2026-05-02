require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const rentalRoutes = require("./routes/rentalRoutes");
const productRoutes = require("./routes/productRoutes");
const chatRoutes = require("./routes/chatRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const protect = require("./middleware/authMiddleware");

const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:5173").trim();

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      FRONTEND_URL,
      "https://rentkaro.shop",
      "https://www.rentkaro.shop"
    ];
    
    if (
      !origin || 
      allowedOrigins.includes(origin) || 
      origin.endsWith(".vercel.app") || 
      origin.startsWith("http://localhost")
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
};

// ── Socket.io setup ──────────────────────────────────
const io = new Server(server, {
  cors: corsOptions,
});

// Map userId → socketId for targeted emission
const userSockets = new Map();

io.on("connection", (socket) => {
  console.log("[Socket] Client connected:", socket.id);

  // Client sends their userId after connecting
  socket.on("authenticate", (userId) => {
    if (userId) {
      userSockets.set(userId.toString(), socket.id);
      console.log(`[Socket] User ${userId} mapped to socket ${socket.id}`);
    }
  });

  // Join a specific rental chat room
  socket.on("join_chat", (rentalId) => {
    socket.join(rentalId);
    console.log(`[Socket] Socket ${socket.id} joined chat room: ${rentalId}`);
  });

  // Broadcast message to everyone in the chat room
  socket.on("send_message", (data) => {
    // data: { rentalId, text, sender: {}, receiver: {}, createdAt }
    io.to(data.rentalId).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    // Remove the mapping for this socket
    for (const [uid, sid] of userSockets.entries()) {
      if (sid === socket.id) {
        userSockets.delete(uid);
        console.log(`[Socket] User ${uid} disconnected`);
        break;
      }
    }
  });
});

// Export io and userSockets so routes can emit events
app.set("io", io);
app.set("userSockets", userSockets);

// ── CORS ─────────────────────────────────────────────
app.use(
  cors({
    ...corsOptions,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// ── Routes ────────────────────────────────────────────
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/reviews", reviewRoutes);

// Protected profile route
app.get("/api/profile", protect, (req, res) => {
  res.json({ message: "Protected route accessed", userId: req.user });
});

// ── DB ────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("DB Error:", err));

app.get("/", (req, res) => res.send("rentKaro API running"));

// ── Health check for deployment monitoring ────────────
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));