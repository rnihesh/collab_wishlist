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
    const { name, baseId, listName, imageUrl, price } = req.body;
    if (!name || !baseId || !listName || !imageUrl || !price) {
      return res.send({ message: "data insufficient" });
    }
    try {
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
        product: { name, imageUrl, price },
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
      console.log(email, name, comment, pName);
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

userApp.post(
  "/createwishlist",
  expressAsyncHandler(async (req, res) => {
    console.log("[CreateWishlist] Request body:", req.body);
    const { baseId, wName } = req.body;
    if (!baseId || !wName) {
      return res.status(400).send({ message: "Missing baseId or wName" });
    }
    try {
      const user = await User.findById(baseId);
      console.log("[CreateWishlist] User found:", user);
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }
      let wishlist = user.wishlist.find((wl) => wl.wName === wName);
      if (wishlist) {
        return res.status(400).send({ message: "Wishlist already exists" });
      }
      user.wishlist.push({ wName, list: [], hasAccessTo: [] });
      await user.save();
      console.log("[CreateWishlist] Wishlist created and user saved:", user);
      res.status(201).send({ message: "Wishlist created", payload: user });
    } catch (e) {
      console.error("[CreateWishlist] Error:", e);
      res
        .status(500)
        .send({ message: "Internal server error", error: e.message });
    }
  })
);

userApp.post(
  "/editwishitem",
  expressAsyncHandler(async (req, res) => {
    const { email, wName, oldName, name, imageUrl, price, newWName } = req.body;
    if (!email || !wName || !oldName || !name || !imageUrl || !price) {
      return res.send({ message: "data insufficient" });
    }
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.send({ message: "User not found" });
      }
      let wishlist = user.wishlist.find((wl) => wl.wName === wName);
      if (!wishlist) {
        return res.send({ message: "Wishlist not found" });
      }
      const itemIndex = wishlist.list.findIndex(
        (item) => item.product && item.product.name === oldName
      );
      if (itemIndex === -1) {
        return res.send({ message: "Product not found in wishlist" });
      }
      // If newWName is provided and different, move the item
      if (newWName && newWName !== wName) {
        // Remove from old wishlist
        const [item] = wishlist.list.splice(itemIndex, 1);
        // Update product fields
        item.product.name = name;
        item.product.imageUrl = imageUrl;
        item.product.price = price;
        // Find or create new wishlist
        let newWishlist = user.wishlist.find((wl) => wl.wName === newWName);
        if (!newWishlist) {
          newWishlist = { wName: newWName, list: [] };
          user.wishlist.push(newWishlist);
        }
        newWishlist.list.push(item);
      } else {
        // Just update in place
        const item = wishlist.list[itemIndex];
        item.product.name = name;
        item.product.imageUrl = imageUrl;
        item.product.price = price;
      }
      await user.save();
      res.send({ message: "Wishlist item updated", payload: user });
    } catch (e) {
      console.log("error: ", e);
      res.send({ message: "error", error: e });
    }
  })
);

userApp.post(
  "/renamewishlist",
  expressAsyncHandler(async (req, res) => {
    const { email, oldName, newName } = req.body;
    if (!email || !oldName || !newName) {
      return res.send({ message: "data insufficient" });
    }
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.send({ message: "User not found" });
      }
      if (oldName === newName) {
        return res.send({ message: "New name must be different" });
      }
      let oldWishlistIdx = user.wishlist.findIndex(
        (wl) => wl.wName === oldName
      );
      if (oldWishlistIdx === -1) {
        return res.send({ message: "Old wishlist not found" });
      }
      if (user.wishlist.some((wl) => wl.wName === newName)) {
        return res.send({
          message: "A wishlist with the new name already exists",
        });
      }
      // Move all items and sharing info, deep clone and remove createdAt/updatedAt
      const oldWishlist = user.wishlist[oldWishlistIdx];
      const cleanList = (oldWishlist.list || []).map((item) => {
        const newItem = JSON.parse(JSON.stringify(item));
        if (newItem.product) {
          delete newItem.product.createdAt;
          delete newItem.product.updatedAt;
        }
        delete newItem.createdAt;
        delete newItem.updatedAt;
        if (Array.isArray(newItem.comment)) {
          newItem.comment = newItem.comment.map((c) => {
            const nc = { ...c };
            delete nc.createdAt;
            delete nc.updatedAt;
            return nc;
          });
        }
        return newItem;
      });
      const newWishlist = {
        wName: newName,
        list: cleanList,
        hasAccessTo: oldWishlist.hasAccessTo || [],
      };
      user.wishlist.splice(oldWishlistIdx, 1); // Remove old
      user.wishlist.push(newWishlist); // Add new
      await user.save();
      res.send({ message: "Wishlist renamed", payload: user });
    } catch (e) {
      console.log("error: ", e);
      res.send({ message: "error", error: e });
    }
  })
);

module.exports = userApp;
