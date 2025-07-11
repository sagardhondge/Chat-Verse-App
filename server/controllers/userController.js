const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

// 🔁 Update logged-in user's profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const {
      firstName,
      lastName,
      email,
      password,
      about,
      gender,
      dateOfBirth,
    } = req.body;

    // 🔐 Email uniqueness check (only if changed)
    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    // 🔐 Update password if provided
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // 📄 Other profile fields
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.about = about || user.about;
    user.gender = gender || user.gender;
    user.dateOfBirth = dateOfBirth || user.dateOfBirth;

    // 🖼️ Avatar
    if (req.file) {
      user.avatar = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await user.save();

    // 🔁 Generate new JWT token
    const token = jwt.sign(
      { _id: updatedUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Profile updated",
      token,
      updatedUser: {
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        about: updatedUser.about,
        gender: updatedUser.gender,
        dateOfBirth: updatedUser.dateOfBirth,
        avatar: updatedUser.avatar,
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// 👤 Get current user's profile
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 👥 Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("GetUserById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔍 Search users by name/email
const searchUsers = async (req, res) => {
  const keyword = req.query.search;
  const query = keyword
    ? {
        $or: [
          { firstName: { $regex: keyword, $options: "i" } },
          { lastName: { $regex: keyword, $options: "i" } },
          { email: { $regex: keyword, $options: "i" } },
        ],
      }
    : {};

  try {
    const users = await User.find(query).find({ _id: { $ne: req.user._id } });
    res.json(users);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Search failed" });
  }
};

// 🔐 Verify password before deleting account
const verifyPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    res.json({ valid });
  } catch (err) {
    console.error("Password check failed:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🗑️ Delete user account
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  updateProfile,
  getMe,
  getUserById,
  searchUsers,
  verifyPassword,
  deleteUser,
};
