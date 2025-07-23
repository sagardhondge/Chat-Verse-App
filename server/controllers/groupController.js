const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const fs = require("fs");
const path = require("path");
const asyncHandler = require("express-async-handler");

// 👥 Create Group Chat
const createGroupChat = asyncHandler(async (req, res) => {
  const { users, name } = req.body;
  if (!users || !name) return res.status(400).send("Please provide all fields");

  const parsedUsers = JSON.parse(users);
  if (parsedUsers.length < 2) return res.status(400).send("At least 2 users required");

  parsedUsers.push(req.user);

  const groupChat = await Chat.create({
    chatName: name,
    users: parsedUsers,
    isGroupChat: true,
    groupAdmin: req.user._id,
  });

  const fullGroupChat = await Chat.findById(groupChat._id)
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.status(200).json(fullGroupChat);
});

// ✏️ Update Group (name/image)
const updateGroupDetails = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { chatName } = req.body;

  const chat = await Chat.findById(chatId);
  if (!chat || !chat.isGroupChat)
    return res.status(404).json({ message: "Group not found" });

  if (chat.groupAdmin.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "Only admin can update group" });

  // Delete old image if exists
  if (req.file && chat.groupImage && chat.groupImage !== "/group-avatar.png") {
    const oldPath = path.join(__dirname, "..", "uploads", chat.groupImage.split("/uploads/")[1]);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  chat.chatName = chatName || chat.chatName;
  if (req.file) chat.groupImage = `/uploads/${req.file.filename}`;

  const updatedChat = await chat.save();
  const fullChat = await Chat.findById(updatedChat._id)
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.status(200).json(fullChat);
});

// ➕ Add user to group
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { userId } = req.body;

  const chat = await Chat.findById(chatId);
  if (!chat || !chat.isGroupChat)
    return res.status(404).json({ message: "Group not found" });

  if (!chat.users.includes(userId)) chat.users.push(userId);
  await chat.save();

  const fullChat = await Chat.findById(chatId)
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.status(200).json(fullChat);
});

// ➖ Remove user from group
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { userId } = req.body;

  const chat = await Chat.findById(chatId);
  if (!chat || !chat.isGroupChat)
    return res.status(404).json({ message: "Group not found" });

  chat.users = chat.users.filter(id => id.toString() !== userId);
  await chat.save();

  const fullChat = await Chat.findById(chatId)
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.status(200).json(fullChat);
});

// 🚪 Leave group
const leaveGroup = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const chat = await Chat.findById(chatId);
  if (!chat || !chat.isGroupChat)
    return res.status(404).json({ message: "Group not found" });

  chat.users = chat.users.filter(id => id.toString() !== req.user._id.toString());

  // If admin leaves, optionally assign new admin
  if (chat.groupAdmin.toString() === req.user._id.toString()) {
    chat.groupAdmin = chat.users[0] || null;
  }

  await chat.save();

  res.status(200).json({ message: "Left group", newAdmin: chat.groupAdmin });
});

// ❌ Delete group
const deleteGroup = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const chat = await Chat.findById(chatId);

  if (!chat || !chat.isGroupChat)
    return res.status(404).json({ message: "Group not found" });

  if (chat.groupAdmin.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "Only admin can delete group" });

  await Chat.findByIdAndDelete(chatId);

  res.status(200).json({ message: "Group deleted" });
});

// 👑 Promote member to admin
const promoteToAdmin = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { userId } = req.body;

  const chat = await Chat.findById(chatId);
  if (!chat || !chat.isGroupChat) {
    return res.status(404).json({ message: "Group not found" });
  }

  if (chat.groupAdmin.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Only group admin can promote members" });
  }

  if (!chat.users.includes(userId)) {
    return res.status(400).json({ message: "User not in group" });
  }

  chat.groupAdmin = userId;
  await chat.save();

  const updatedChat = await Chat.findById(chatId)
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.status(200).json(updatedChat);
});

module.exports = {
  createGroupChat,
  updateGroupDetails,
  addToGroup,
  removeFromGroup,
  leaveGroup,
  deleteGroup,
  promoteToAdmin,
};
