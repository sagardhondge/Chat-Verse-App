const User = require("../models/userModel");

const updateProfile = async (req, res) => {
  try {
    const { avatar, dob, gender, about, isPublic } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar, dob, gender, about, isPublic },
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Profile Update Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { updateProfile }; // ✅ This is important
