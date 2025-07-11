const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect");
const multer = require("multer");
const path = require("path");
const {
  sendMessage,
  getMessages,
  deleteMessage,
  updateMessage,
  uploadFileMessage,
  deleteAllMessages, // new
} = require("../controllers/messageController");

// Ensure 'uploads/' folder exists
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Standard message routes
router.post("/", protect, sendMessage);
router.get("/:chatId", protect, getMessages);
router.delete("/:id", protect, deleteMessage);
router.put("/:id", protect, updateMessage);
router.delete("/chat/:chatId", protect, deleteAllMessages);

// 🔥 New file upload message route
router.post("/upload", protect, upload.single("file"), uploadFileMessage);

module.exports = router;
