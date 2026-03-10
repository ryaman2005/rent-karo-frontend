const express = require("express");
const router = express.Router();
const Product = require("../models/Product");


// Get all products
router.get("/", async (req,res)=>{

  const products = await Product.find();

  res.json(products);

});


// Get products listed by logged user
router.get("/my-listings/:userId", async (req,res)=>{

  try{

    const products = await Product.find({ owner: req.params.userId });

    res.json(products);

  }catch(error){

    res.status(500).json({message:"Server error"});

  }

});


// Get single product
router.get("/:id", async (req,res)=>{

  try{

    const product = await Product.findById(req.params.id);

    if(!product){
      return res.status(404).json({message:"Product not found"});
    }

    res.json(product);

  }catch(error){

    res.status(500).json({message:"Server error"});

  }

});


// Add product
router.post("/", async (req,res)=>{

  try{

    const product = await Product.create(req.body);

    res.status(201).json(product);

  }catch(error){

    res.status(500).json({message:"Server error"});

  }

});


// Delete product
router.delete("/:id", async (req,res)=>{

  await Product.findByIdAndDelete(req.params.id);

  res.json({message:"Product deleted"});

});


module.exports = router;