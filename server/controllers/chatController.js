const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const Message = require("../models/messageModel");
const fs = require("fs");
const path = require("path");

// 🧑‍🤝‍🧑 Access 1-to-1 Chat
const accessChat = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).send("User ID required");

    let existingChat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [req.user._id, userId] },
    })
      .populate("users", "firstName lastName avatar")
      .populate("latestMessage");

    if (existingChat) return res.status(200).json(existingChat);

    const newChat = await Chat.create({
      isGroupChat: false,
      users: [req.user._id, userId],
    });

    const fullChat = await Chat.findById(newChat._id).populate("users", "firstName lastName avatar");
    res.status(201).json(fullChat);
  } catch (err) {
    console.error("Access Chat Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// 📥 Fetch All Chats with unreadCount + latestMessage sorted
const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ users: { $in: [req.user._id] } })
      .populate("users", "firstName lastName avatar")
      .populate("groupAdmin", "firstName lastName avatar")
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "firstName lastName avatar",
        },
      });

    const enrichedChats = await Promise.all(
      chats.map(async (chat) => {
        const unreadCount = await Message.countDocuments({
          chat: chat._id,
          sender: { $ne: req.user._id },
          readBy: { $ne: req.user._id },
        });

        return {
          ...chat.toObject(),
          unreadCount,
          latestMessageTime: chat.latestMessage?.createdAt || chat.updatedAt,
        };
      })
    );

    enrichedChats.sort((a, b) => new Date(b.latestMessageTime) - new Date(a.latestMessageTime));

    res.status(200).json(enrichedChats);
  } catch (err) {
    console.error("Get Chats Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// 👥 Create Group Chat
const createGroupChat = async (req, res) => {
  try {
    const { users, chatName } = req.body;

    if (!users || !chatName)
      return res.status(400).json({ message: "All fields are required" });

    if (users.length < 2)
      return res.status(400).json({ message: "Group chat requires at least 3 members" });

    const groupChat = await Chat.create({
      chatName,
      users: [...users, req.user._id],
      isGroupChat: true,
      groupAdmin: req.user._id,
    });

    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate("users", "firstName lastName avatar")
      .populate("groupAdmin", "firstName lastName avatar");

    res.status(201).json(fullGroupChat);
  } catch (err) {
    console.error("Create Group Chat Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ 🛠 Update Group Name or Image
const updateGroupDetails = async (req, res) => {
  const { chatId } = req.params;
  const newName = req.body.chatName;
  const file = req.file;

  try {
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroupChat) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only group admin can update" });
    }

    // Handle group name update
    if (newName) chat.chatName = newName;

    // Handle group image upload
    if (file) {
      // Delete previous image if exists
      if (chat.groupImage) {
        const prevPath = path.join(__dirname, "..", "uploads", path.basename(chat.groupImage));
        if (fs.existsSync(prevPath)) fs.unlinkSync(prevPath);
      }

      chat.groupImage = `/uploads/${file.filename}`;
    }

    await chat.save();

    const updatedChat = await Chat.findById(chatId)
      .populate("users", "firstName lastName avatar")
      .populate("groupAdmin", "firstName lastName avatar");

    res.json(updatedChat);
  } catch (err) {
    console.error("Update Group Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Existing group modification controllers (same)
const renameGroup = async (req, res) => {
  const { chatId, newName } = req.body;
  try {
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroupChat)
      return res.status(404).json({ message: "Group not found" });

    if (chat.groupAdmin.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only admin can rename" });

    chat.chatName = newName;
    await chat.save();

    const updated = await Chat.findById(chatId)
      .populate("users", "firstName lastName avatar")
      .populate("groupAdmin", "firstName lastName avatar");

    res.json(updated);
  } catch (err) {
    console.error("Rename Group Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;
  try {
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroupChat)
      return res.status(404).json({ message: "Group not found" });

    if (chat.groupAdmin.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only admin can add" });

    if (chat.users.includes(userId))
      return res.status(400).json({ message: "User already in group" });

    chat.users.push(userId);
    await chat.save();

    const updated = await Chat.findById(chatId)
      .populate("users", "firstName lastName avatar")
      .populate("groupAdmin", "firstName lastName avatar");

    res.json(updated);
  } catch (err) {
    console.error("Add User Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;
  try {
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroupChat)
      return res.status(404).json({ message: "Group not found" });

    if (
      chat.groupAdmin.toString() !== req.user._id.toString() &&
      userId !== req.user._id.toString()
    )
      return res.status(403).json({ message: "Not authorized" });

    chat.users = chat.users.filter((id) => id.toString() !== userId);
    await chat.save();

    const updated = await Chat.findById(chatId)
      .populate("users", "firstName lastName avatar")
      .populate("groupAdmin", "firstName lastName avatar");

    res.json(updated);
  } catch (err) {
    console.error("Remove User Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const leaveGroup = async (req, res) => {
  const { chatId } = req.body;
  try {
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroupChat)
      return res.status(404).json({ message: "Group not found" });

    if (
      chat.groupAdmin.toString() === req.user._id.toString() &&
      chat.users.length > 1
    )
      return res.status(400).json({
        message: "Admin cannot leave a group with members. Please delete or transfer admin.",
      });

    chat.users = chat.users.filter((id) => id.toString() !== req.user._id.toString());

    if (chat.users.length === 0) {
      await chat.remove();
      return res.status(200).json({ message: "Group deleted as it became empty" });
    }

    if (chat.groupAdmin.toString() === req.user._id.toString()) {
      chat.groupAdmin = chat.users[0];
    }

    await chat.save();

    const updated = await Chat.findById(chatId)
      .populate("users", "firstName lastName avatar")
      .populate("groupAdmin", "firstName lastName avatar");

    res.json(updated);
  } catch (err) {
    console.error("Leave Group Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteGroup = async (req, res) => {
  const { chatId } = req.params;
  try {
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroupChat)
      return res.status(404).json({ message: "Group not found" });

    if (chat.groupAdmin.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only admin can delete the group" });

    await chat.deleteOne();
    res.status(200).json({ message: "Group deleted" });
  } catch (err) {
    console.error("Delete Group Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  accessChat,
  getChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  leaveGroup,
  deleteGroup,
  updateGroupDetails, // ✅ NEW
};
