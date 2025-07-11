const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect");
const upload = require("../middleware/upload"); // ⬅️ for image uploads

const {
  accessChat,
  getChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  leaveGroup,
  deleteGroup,
  updateGroupDetails // ✅ new
} = require("../controllers/chatController");

// 🧑‍🤝‍🧑 Access or Create One-on-One Chat
router.post("/", protect, accessChat);

// 📥 Fetch All Chats for logged-in user
router.get("/", protect, getChats);

// 👥 Create Group Chat
router.post("/group", protect, createGroupChat);

// 📝 Rename Group (deprecated in favor of PUT /:chatId)
router.put("/rename", protect, renameGroup); // (optional legacy)

// ✏️ Update Group Details (name or image)
router.put("/:chatId", protect, upload.single("groupImage"), updateGroupDetails); // ✅ new

// ➕ Add user to group
router.put("/add", protect, addToGroup);

// ➖ Remove user from group
router.put("/remove", protect, removeFromGroup);

// 🚪 Leave Group
router.put("/leave", protect, leaveGroup);

// ❌ Delete Group (admin only)
router.delete("/:chatId", protect, deleteGroup);

module.exports = router;
