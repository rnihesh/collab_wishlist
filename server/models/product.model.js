const mongoose= require("mongoose")

const productSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true,
    unqiue: true
  },
  imageUrl:{
    type: String,
    required: true
  },
  price:{
    type: String,
    required: true
  }

},{strict: "throw", timestamps: true})

const Product = mongoose.model("product", productSchema)

module.exports = Product