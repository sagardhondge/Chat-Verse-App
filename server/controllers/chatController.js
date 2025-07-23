const Chat = require("../models/chatModel");
const User = require("../models/userModel");

// 📨 Access or create one-on-one chat
const accessChat = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).send("UserId param not sent");

    let chat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [req.user._id, userId] },
    }).populate("users", "-password").populate("latestMessage");

    chat = await User.populate(chat, {
      path: "latestMessage.sender",
      select: "name email avatar",
    });

    if (chat) return res.status(200).send(chat);

    const newChat = await Chat.create({
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    });

    const fullChat = await Chat.findById(newChat._id).populate("users", "-password");
    res.status(200).json(fullChat);
  } catch (error) {
    res.status(500).json({ message: "Failed to access chat", error });
  }
};

// 📚 Fetch all chats for the logged-in user
const fetchChats = async (req, res) => {
  try {
    const chats = await Chat.find({ users: req.user._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    const results = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "name email avatar",
    });

    res.status(200).send(results);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch chats", error });
  }
};

module.exports = {
  accessChat,
  fetchChats,
};
