const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect");
const { accessChat, fetchChats } = require("../controllers/chatController");

router.post("/", protect, accessChat); // Access or create DM
router.get("/", protect, fetchChats);  // Fetch all chats

module.exports = router;
