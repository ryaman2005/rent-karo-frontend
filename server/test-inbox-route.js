const mongoose = require("mongoose");
const User = require("./models/User");
const Rental = require("./models/Rental");
const Message = require("./models/Message");
const express = require("express");
const chatRoutes = require("./routes/chatRoutes");
require("dotenv").config();

async function testInbox() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // mock req and res
  const req = {
    user: "662db12f84bc46714d693f44" // fake
  };
  const res = {
    json: (data) => console.log("Inbox Data Length:", data.length),
    status: (code) => ({
      json: (data) => console.log("Error", code, data)
    })
  };
  
  // We can't directly test router easily without express app. 
  console.log("DB connected");
  process.exit(0);
}
testInbox().catch(console.log);
