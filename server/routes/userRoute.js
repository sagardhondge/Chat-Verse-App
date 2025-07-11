const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const { getMe, getUserById, updateProfile,searchUsers,verifyPassword,deleteUser} = require("../controllers/userController");
const protect = require("../middleware/protect"); // assuming protect.js is default-exporting

const registerUser = require("../controllers/registerController");
const loginUser = require("../controllers/loginController");

// ✅ Remove this line:
// const protect = require("../middleware/protect");

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  },
});
const upload = multer({ storage });

// Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/profile", protect, upload.single("avatar"), updateProfile);
router.get("/me", protect, getMe);
router.get("/:id", protect, getUserById);
router.get("/", protect, searchUsers);
router.delete("/delete", protect, deleteUser);
router.post("/verify-password", protect, verifyPassword);

module.exports = router;
