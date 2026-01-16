const asyncHandler = require('express-async-handler');
const User = require('../models/user.model');


const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

const updateUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const user = await User.findById(id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Update allowed fields
  Object.keys(updates).forEach((key) => {
    user[key] = updates[key];
  });

  const updatedUser = await user.save();

  res.json({
    message: 'User updated successfully',
    user: updatedUser,
  });
});


// PUT /api/users/profile
// Accepts { name, email } — updates username/email (and verifies email uniqueness)
const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Optional: change email, but ensure it's unique
  if (email && email !== user.email) {
    const exists = await User.findOne({ email });
    if (exists) {
      res.status(400);
      throw new Error("Email already in use");
    }
    user.email = email;
  }

  if (name) user.username = name;

  const saved = await user.save();

  res.json({
    message: "Profile updated successfully",
    user: {
      _id: saved._id,
      name: saved.username,
      email: saved.email,
      role: saved.role,
    },
  });
});

// PUT /api/users/update-password
// Accepts { currentPassword, newPassword }
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Current and new password are required");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(400);
    throw new Error("Current password is incorrect");
  }

  user.password = newPassword; // will be hashed by pre-save hook
  await user.save();

  res.json({ message: "Password updated successfully" });
});




const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
});


module.exports = { getUserProfile, updateUserProfile, updatePassword, getUsers , updateUserById };

