const User = require("../models/userModel");

// ✅ Get Your Own Profile
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (err) {
    console.error("Profile Fetch Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get Other Users (for chat list)
const getAllPeople = async (req, res) => {
  try {
    const people = await User.find({
      _id: { $ne: req.user._id },
      isPublic: true, // ✅ only public accounts
    }).select("-password");

    res.status(200).json(people);
  } catch (err) {
    console.error("Get People Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = { getMyProfile, getAllPeople };
