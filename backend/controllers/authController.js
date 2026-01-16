const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { sendWelcomeEmail } = require("../utils/EmailServices");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const registerUser = asyncHandler(async (req, res) => {
  const {
    username,
    email,
    password,
    role,
    clientcompanyName,
    clientcontactName,
    clientphone,
    clientaddress,
    clientproductCategories,
  } = req.body;

  // ✅ Basic validation
  if (!username || !email || !password || !role) {
    res.status(400);
    throw new Error("Please add all required fields");
  }

  // ✅ Check for existing user
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // ✅ Create new user
  const user = await User.create({
    username,
    email,
    password,
    role,
    // Only add client details if provided
    clientcompanyName: clientcompanyName || "",
    clientcontactName: clientcontactName || "",
    clientphone: clientphone || "",
    clientaddress: clientaddress || "",
    clientproductCategories: Array.isArray(clientproductCategories)
      ? clientproductCategories
      : typeof clientproductCategories === "string"
      ? clientproductCategories.split(",").map((c) => c.trim())
      : [],
  });

  // ✅ Respond to frontend
  if (user) {
    // ✅ Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.username);
    } catch (err) {
      console.error("⚠️ Failed to send welcome email:", err.message);
      // Don’t block registration if email fails
    }

    res.status(201).json({
      _id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      clientcompanyName: user.clientcompanyName,
      clientcontactName: user.clientcontactName,
      clientphone: user.clientphone,
      clientaddress: user.clientaddress,
      clientproductCategories: user.clientproductCategories,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

module.exports = { registerUser, loginUser };
