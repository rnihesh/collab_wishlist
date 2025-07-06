require("dotenv").config();
const User = require("../models/user.model.js");


async function createUser(req, res) {
  try {
    const newUser = req.body;
    const existing = await User.findOne({ email: newUser.email });

    if (existing) {
      return res
        .status(200)
        .send({ message: newUser.firstName, payload: existing });
    }

    // Save the new user
    const userDoc = await new User(newUser).save();

    return res.status(201).send({
      message: userDoc.name,
      payload: userDoc,
    });
  } catch (err) {
    console.error("Error in createUser:", err);
    return res
      .status(500)
      .send({ message: "Internal server error", error: err.message });
  }
}

module.exports = createUser;
