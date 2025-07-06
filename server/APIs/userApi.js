const exp = require("express");
const userApp = exp.Router();

const expressAsyncHandler = require("express-async-handler");

const createUser = require("./createUser.js");

const User = require("../models/user.model.js");
const Product = require("../models/product.model.js");
require("dotenv").config();

//creating user
userApp.post("/user", expressAsyncHandler(createUser));

userApp.get(
  "/products",
  expressAsyncHandler(async (req, res) => {
    try {
      const res = await Product.find();
      res.send({ message: "ok", payload: res });
    } catch (e) {
      console.log("error: ", e);
      res.send({ message: "error", error: e });
    }
  })
);

userApp.post(
  "/wish",
  expressAsyncHandler(async (req, res) => {
    const { name, baseId, listName } = req.body;
    if (!name || !baseId || !listName) {
      return res.send({ message: "data insufficient" });
    }
    try {
      const product = await Product.findOne({ name });
      if (!product) {
        return res.send({ message: "Product not found" });
      }
      const user = await User.findById(baseId);
      if (!user) {
        return res.send({ message: "User not found" });
      }
      let wishlist = user.wishlist.find((wl) => wl.wName === listName);

      if (!wishlist) {
        wishlist = {
          wName: listName,
          list: [],
        };
        user.wishlist.push(wishlist);
        wishlist = user.wishlist.find((wl) => wl.wName === listName);
      }

      wishlist.list.push({
        product: product.toObject(),
        emoji: [],
        comment: [],
      });

      await user.save();

      res.send({ message: "Product added to wishlist", payload: user });
    } catch (e) {
      console.log("error: ", e);
      res.send({ message: "error", error: e });
    }
  })
);

userApp.post(
  "/share",
  expressAsyncHandler(async (req, res) => {
    const { baseId, name, toEmail } = req.body;
    if (!baseId || !name || !toEmail) {
      return res.send({ message: "data insufficient" });
    }
    try {
      // Find sender and recipient
      const sender = await User.findById(baseId);
      if (!sender) return res.send({ message: "Sender not found" });

      const wishlistToShare = sender.wishlist.find((wl) => wl.wName === name);
      if (!wishlistToShare) return res.send({ message: "Wishlist not found" });

      const recipient = await User.findOne({ email: toEmail });
      if (!recipient) return res.send({ message: "Recipient not found" });

      // 1. Add toEmail to sender's wishlist.hasAccessTo (if not already present)
      if (!Array.isArray(wishlistToShare.hasAccessTo))
        wishlistToShare.hasAccessTo = [];
      if (!wishlistToShare.hasAccessTo.includes(toEmail)) {
        wishlistToShare.hasAccessTo.push(toEmail);
      }

      // 2. Add { email: sender.email, listName: name } to recipient.hasAccessTo (if not already present)
      recipient.hasAccessTo = Array.isArray(recipient.hasAccessTo)
        ? recipient.hasAccessTo
        : [];
      const alreadyHas = recipient.hasAccessTo.some(
        (access) => access.email === sender.email && access.listName === name
      );
      if (!alreadyHas) {
        recipient.hasAccessTo.push({ email: sender.email, listName: name });
      }

      await sender.save();
      await recipient.save();

      res.send({
        message: "Wishlist shared successfully",
        payload: { sender, recipient },
      });
    } catch (e) {
      console.log("error: ", e);
      res.send({ message: "error", error: e });
    }
  })
);

userApp.get(
  "/getwish/:email",
  expressAsyncHandler(async (req, res) => {
    const { email } = req.params;
    if (!email) {
      return res.send({ message: "data insufficient" });
    }
    try {
      // 1. Get the user's own wishlists
      const user = await User.findOne({ email });
      if (!user) {
        return res.send({ message: "User not found" });
      }
      const ownWishlists = user.wishlist || [];

      // 2. Get wishlists shared with the user
      const sharedWishlists = [];
      if (Array.isArray(user.hasAccessTo)) {
        for (const access of user.hasAccessTo) {
          // Find the owner
          const owner = await User.findOne({ email: access.email });
          if (owner && Array.isArray(owner.wishlist)) {
            // Find the specific wishlist
            const wl = owner.wishlist.find((w) => w.wName === access.listName);
            if (wl) {
              sharedWishlists.push({
                owner: access.email,
                wName: access.listName,
                list: wl.list,
                emoji: wl.emoji,
                comment: wl.comment,
                hasAccessTo: wl.hasAccessTo,
              });
            }
          }
        }
      }

      res.send({
        message: "ok",
        ownWishlists,
        sharedWishlists,
      });
    } catch (e) {
      console.log("error: ", e);
      res.send({ message: "error", error: e });
    }
  })
);

userApp.post(
  "/emoji",
  expressAsyncHandler(async (req, res) => {
    const { emoji, email, name, pName } = req.body;
    // name = wishlist name, pName = product name
    if (!email || !name || !emoji || !pName) {
      return res.send({ message: "data insufficient" });
    }
    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        return res.send({ message: "User not found" });
      }
      const wish = user.wishlist.find((w) => w.wName === name);
      if (!wish) {
        return res.send({ message: "Wishlist not found" });
      }
      // Find the product in the wishlist's list
      const prod = wish.list.find(
        (item) => item.product && item.product.name === pName
      );
      if (!prod) {
        return res.send({ message: "Product not found in wishlist" });
      }
      if (!Array.isArray(prod.emoji)) prod.emoji = [];
      prod.emoji.push(emoji);
      await user.save();
      res.send({ message: "Emoji added", payload: user });
    } catch (e) {
      console.log("error: ", e);
      res.send({ message: "error", error: e });
    }
  })
);

userApp.post(
  "/comment",
  expressAsyncHandler(async (req, res) => {
    const { comment, email, name, pName, userName } = req.body;
    // name = wishlist name, pName = product name, userName = name of commenter
    if (!email || !name || !comment || !pName) {
      return res.send({ message: "data insufficient" });
    }
    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        return res.send({ message: "User not found" });
      }
      const wish = user.wishlist.find((w) => w.wName === name);
      if (!wish) {
        return res.send({ message: "Wishlist not found" });
      }
      // Find the product in the wishlist's list
      const prod = wish.list.find(
        (item) => item.product && item.product.name === pName
      );
      if (!prod) {
        return res.send({ message: "Product not found in wishlist" });
      }
      if (!Array.isArray(prod.comment)) prod.comment = [];
      // Push a comment object as per schema
      prod.comment.push({
        name: userName || user.name, // fallback to user's name if userName not provided
        email: email,
        text: comment,
      });
      await user.save();
      res.send({ message: "Comment added", payload: user });
    } catch (e) {
      console.log("error: ", e);
      res.send({ message: "error", error: e });
    }
  })
);

module.exports = userApp;
