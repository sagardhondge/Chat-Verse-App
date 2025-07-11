const jwt = require("jsonwebtoken");
const User = require("./models/userModel");
const Chat = require("./models/chatModel");

const onlineUsers = new Map();

const initSocket = (io) => {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded._id);
      if (!user) return next(new Error("User not found"));
      socket.user = user;
      next();
    } catch (err) {
      console.error("Socket auth error:", err.message);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, socket.id);
    io.emit("onlineUsers", [...onlineUsers.keys()]);
    console.log(`✅ ${socket.user.firstName} connected`);

    socket.on("join-chat", (chatId) => {
      if (chatId) {
        socket.join(chatId);
        console.log(`${socket.user.firstName} joined chat ${chatId}`);
      }
    });

    socket.on("newMessage", async (message) => {
      try {
        const chat = typeof message.chat === "string"
          ? await Chat.findById(message.chat).populate("users", "_id")
          : message.chat;

        if (!chat?.users) return;

        message.chat = chat;

        socket.to(chat._id.toString()).emit("messageReceived", message);

        chat.users.forEach((user) => {
          const id = user._id?.toString?.() || user.toString?.();
          if (id && id !== userId) {
            const targetSocket = onlineUsers.get(id);
            if (targetSocket) {
              io.to(targetSocket).emit("chatHasUnread", {
                chatId: chat._id,
                message,
              });
            }
          }
        });
      } catch (err) {
        console.error("newMessage error:", err);
      }
    });

    socket.on("typing", ({ chatId }) => {
      socket.to(chatId).emit("typing", { user: socket.user, chatId });
    });

    socket.on("stopTyping", ({ chatId }) => {
      socket.to(chatId).emit("stopTyping", { chatId });
    });

    socket.on("readMessage", ({ chatId }) => {
      socket.to(chatId).emit("messageRead", {
        chatId,
        userId,
      });
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      io.emit("onlineUsers", [...onlineUsers.keys()]);
      console.log(`❌ ${socket.user.firstName} disconnected`);
    });
  });
};

module.exports = initSocket;
