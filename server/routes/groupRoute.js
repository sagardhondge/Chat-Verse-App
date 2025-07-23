const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect");
const upload = require("../middleware/upload");

const {
  createGroupChat,
  updateGroupDetails,
  addToGroup,
  removeFromGroup,
  leaveGroup,
  deleteGroup,
  promoteToAdmin,
} = require("../controllers/groupController");

// ✅ Create a group chat
router.post("/", protect, createGroupChat);

// ✏️ Update group name or image
router.put("/:chatId", protect, upload.single("groupImage"), updateGroupDetails);

// ➕ Add user to group
router.put("/:chatId/add", protect, addToGroup);

// ➖ Remove user from group
router.put("/:chatId/remove", protect, removeFromGroup);

// 🚪 Leave group
router.put("/:chatId/leave", protect, leaveGroup);

// ❌ Delete group (only admin)
router.delete("/:chatId", protect, deleteGroup);

// 👑 Promote member to group admin (only current admin)
router.put("/:chatId/promote", protect, promoteToAdmin);

module.exports = router;
