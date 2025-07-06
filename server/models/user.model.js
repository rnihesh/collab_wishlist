const mongoose = require("mongoose");
const Product = require("./product.model"); 

const productSchema = Product.schema;

const commentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    text: {
      type: String,
    },
  },
  { strict: "throw", timestamps: true }
);


const modifiedProductSchema = new mongoose.Schema(
  {
    product: {
      type: productSchema,
    },
    emoji: {
      type: [String],
    },
    comment: {
      type: [commentSchema],
    },
  },
  { strict: "throw", timestamps: true }
);

const wishlistSchema = new mongoose.Schema(
  {
    wName: {
      type: String,
      required: true,
    },
    hasAccessTo:{
      type: [String]
    },
    list: {
      type: [modifiedProductSchema],
    },
  },
  { strict: "throw", timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    wishlist: {
      type: [wishlistSchema],
    },
    hasAccessTo:{
      type:[{
        email: {
          type: String
        },
        listName:{
          type: String
        }
      }]
    }
  },
  {
    strict: "throw",
    timestamps: true,
  }
);



const User = mongoose.model("user", userSchema)

module.exports = User