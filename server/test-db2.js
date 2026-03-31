require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    try {
      const p = await Product.create({
        name: "Test Location",
        price: "100",
        deposit: "50",
        image: "http://example.com/img.jpg",
        category: "Tech",
        owner: new mongoose.Types.ObjectId(),
        address: "Bandra",
        location: {
            type: "Point",
            coordinates: [19.0760, 72.8777] // Mock coords
        }
      });
      console.log("SUCCESS:", p);
    } catch(err) {
      console.error("MONGO ERROR:", err.message);
    }
    process.exit(0);
  });
