const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");

const {
  getMe,
  getUserById,
  updateProfile,
  searchUsers,
  verifyPassword,
  deleteUser,
} = require("../controllers/userController");

const registerUser = require("../controllers/registerController");
const loginUser = require("../controllers/loginController");
const protect = require("../middleware/protect");

// Multer setup for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  },
});
const upload = multer({ storage });

// ✅ Public
router.post("/register", registerUser);
router.post("/login", loginUser);

// ✅ Protected
router.put("/profile", protect, upload.single("avatar"), updateProfile);
router.get("/me", protect, getMe);
router.post("/verify-password", protect, verifyPassword);
router.delete("/delete", protect, deleteUser);

// ⚠️ FIXED: search route must come BEFORE `/:id` to avoid path collision
router.get("/search", protect, searchUsers); // ✅ static route
router.get("/:id", protect, getUserById);    // ✅ dynamic route LAST

module.exports = router;
