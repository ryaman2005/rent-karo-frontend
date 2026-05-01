require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const user = await User.findById("69cb69b0dd0dc25900a70679");
  console.log("User:", user);
  process.exit(0);
});
