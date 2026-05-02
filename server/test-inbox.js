require("dotenv").config();
const mongoose = require("mongoose");
const Message = require("./models/Message");
const User = require("./models/User");
const Rental = require("./models/Rental");

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");
  
  const user = await User.findOne();
  console.log("Testing with user:", user._id);
  const userId = user._id.toString();

  try {
    const dmAggregation = await Message.aggregate([
      {
        $match: {
          rentalId: null,
          $or: [{ sender: new mongoose.Types.ObjectId(userId) }, { receiver: new mongoose.Types.ObjectId(userId) }]
        }
      },
      {
        $sort: { createdAt: -1 }
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
    console.log("DM Aggregation:", dmAggregation);
  } catch(e) {
    console.error("Aggregation Error:", e);
  }

  mongoose.disconnect();
}
test();
