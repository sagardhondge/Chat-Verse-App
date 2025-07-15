const jwt = require("jsonwebtoken");
const User = require("./models/userModel");
const Chat = require("./models/chatModel");

const onlineUsers = new Map();

const initSocket = (io) => {
  // 🔒 Authenticate each socket connection
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      console.error("❌ No token provided for socket connection");
      return next(new Error("No token provided"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded._id);

      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch (err) {
      console.error("❌ Socket auth error:", err.message);
      next(new Error("Authentication failed"));
    }
  });

  // 🌐 Handle socket connections
  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();

    // ✅ Add user to online list
    onlineUsers.set(userId, socket.id);
    io.emit("onlineUsers", [...onlineUsers.keys()]);
    console.log(`✅ ${socket.user.firstName} connected`);

    // 👥 Join chat room
    socket.on("join-chat", (chatId) => {
      if (chatId) {
        socket.join(chatId);
        console.log(`📥 ${socket.user.firstName} joined chat ${chatId}`);
      }
    });

    // 💬 Handle new message
    socket.on("newMessage", async (message) => {
      try {
        const chat =
          typeof message.chat === "string"
            ? await Chat.findById(message.chat).populate("users", "_id")
            : message.chat;

        if (!chat?.users) return;

        message.chat = chat;

        // 📤 Send message to users in chat room (except sender)
        socket.to(chat._id.toString()).emit("messageReceived", message);

        // 🔔 Send unread message notification
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
        console.error("❌ newMessage error:", err);
      }
    });
    // Typing indicators
    socket.on("typing", (chatId) => {
      socket.to(chatId).emit("typing", chatId, socket.user); // send user info
    });
    
    socket.on("stop typing", (chatId) => {
      socket.to(chatId).emit("stop typing", chatId);
    });


    // ✅ Message read acknowledgment
    socket.on("readMessage", ({ chatId }) => {
      socket.to(chatId).emit("messageRead", {
        chatId,
        userId,
      });
    });

    // ❌ Handle disconnect
    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      io.emit("onlineUsers", [...onlineUsers.keys()]);
      console.log(`❌ ${socket.user.firstName} disconnected`);
    });
  });
};

module.exports = initSocket;
