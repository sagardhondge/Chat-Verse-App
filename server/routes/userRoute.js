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

const protect = require("../middleware/protect");
const registerUser = require("../controllers/registerController");
const loginUser = require("../controllers/loginController");

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  },
});
const upload = multer({ storage });

// Public
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected
router.put("/profile", protect, upload.single("avatar"), updateProfile);
router.get("/me", protect, getMe);
router.get("/", protect, searchUsers);        
router.get("/search", protect, searchUsers);    
router.get("/:id", protect, getUserById);       
router.delete("/delete", protect, deleteUser);
router.post("/verify-password", protect, verifyPassword);

module.exports = router;
