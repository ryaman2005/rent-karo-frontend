const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  price: {
    type: String,
    required: true
  },

  deposit: {
    type: String,
    required: true
  },

  image: {
    type: String,
    required: true
  },

  category: {
    type: String,
    default: "General"
  },

  owner:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User"
  },

  address: {
    type: String,
  },

  location: {
    type: { type: String, enum: ['Point'] },
    coordinates: { type: [Number] } // [longitude, latitude]
  }

},{ timestamps:true });

productSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Product", productSchema);