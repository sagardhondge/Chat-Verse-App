const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");

// 📨 Send a message (text or with optional file)
const sendMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;

    if (!chatId && !req.file) {
      return res.status(400).json({ message: "chatId and content or file are required" });
    }

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const newMessage = await Message.create({
      sender: req.user._id,
      content: content || "",
      chat: chatId,
      file: fileUrl,
    });

    await Chat.findByIdAndUpdate(chatId, { updatedAt: new Date() });

    const fullMessage = await Message.findById(newMessage._id)
      .populate("sender", "firstName lastName avatar")
      .populate("chat", "isGroupChat users chatName")
      .populate({
        path: "chat.users",
        select: "firstName lastName avatar",
      });

    res.status(201).json({
      ...fullMessage.toObject(),
      sender: {
        ...fullMessage.sender.toObject(),
        name: `${fullMessage.sender.firstName || ""} ${fullMessage.sender.lastName || ""}`.trim(),
      },
    });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 📥 Get all messages for a chat
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "firstName lastName avatar")
      .sort({ createdAt: 1 });

    const fullMessages = messages.map((msg) => {
  const sender = msg.sender;

  return {
    ...msg.toObject(),
    sender: sender
      ? {
          ...sender.toObject(),
          name: `${sender.firstName || ""} ${sender.lastName || ""}`.trim(),
        }
      : {
          _id: null,
          name: "Unknown",
          avatar: null,
        },
  };
});


    res.status(200).json(fullMessages);
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🗑️ DELETE single message
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await message.deleteOne();
    res.status(200).json({ message: "Message deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✏️ UPDATE message
const updateMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const message = await Message.findById(req.params.id);

    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    message.content = content;
    await message.save();

    res.status(200).json(message);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 📤 Upload file as message
const uploadFileMessage = async (req, res) => {
  try {
    const { chatId } = req.body;

    if (!req.file || !chatId) {
      return res.status(400).json({ message: "File and chatId required" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const message = await Message.create({
      sender: req.user._id,
      chat: chatId,
      file: fileUrl,
    });

    await Chat.findByIdAndUpdate(chatId, { updatedAt: new Date() });

    const fullMessage = await Message.findById(message._id)
      .populate("sender", "firstName lastName avatar")
      .populate("chat", "isGroupChat users chatName")
      .populate({
        path: "chat.users",
        select: "firstName lastName avatar",
      });

    res.status(201).json({
      ...fullMessage.toObject(),
      sender: {
        ...fullMessage.sender.toObject(),
        name: `${fullMessage.sender.firstName || ""} ${fullMessage.sender.lastName || ""}`.trim(),
      },
    });
  } catch (err) {
    console.error("Upload file message error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🧹 DELETE all messages of logged-in user in a chat
const deleteAllMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const result = await Message.deleteMany({
      chat: chatId,
      sender: req.user._id,
    });

    res.status(200).json({
      message: `${result.deletedCount} message(s) deleted from chat`,
    });
  } catch (err) {
    console.error("Delete all messages error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  deleteMessage,
  updateMessage,
  uploadFileMessage,
  deleteAllMessages,
};
