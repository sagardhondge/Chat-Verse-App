const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect");
const { updateProfile } = require("../controllers/avatarController");
const { getMyProfile, getAllPeople } = require("../controllers/profileController");

console.log("Protect:", typeof protect); // Add this for debugging

// ✅ Update full profile
router.post("/update", protect, updateProfile);

// ✅ Get own profile
router.get("/me", protect, getMyProfile);

// ✅ Get all users except self
router.get("/people", protect, getAllPeople);

module.exports = router;
