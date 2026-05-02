const mongoose = require("mongoose");
const User = require("./models/User");
const Rental = require("./models/Rental");
const Message = require("./models/Message");
require("dotenv").config();

async function testChat() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  // Create two users
  const u1 = await User.create({ name: "User 1", email: "u1@test.com", password: "pwd" });
  const u2 = await User.create({ name: "User 2", email: "u2@test.com", password: "pwd" });

  // Create a rental
  const rental = await Rental.create({
    user: u1._id,
    owner: u2._id,
    productName: "Test Product",
    price: "100",
    deposit: "50",
    startDate: new Date(),
    endDate: new Date(),
    status: "confirmed"
  });

  // Create a message
  const msg1 = await Message.create({
    rentalId: rental._id,
    sender: u1._id,
    receiver: u2._id,
    text: "Hello from u1"
  });

  console.log("Message created:", msg1);
  
  // Cleanup
  await Message.deleteMany({ _id: msg1._id });
  await Rental.deleteMany({ _id: rental._id });
  await User.deleteMany({ _id: { $in: [u1._id, u2._id] } });

  console.log("Cleanup done.");
  process.exit(0);
}
testChat().catch(console.error);
