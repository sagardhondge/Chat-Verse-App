require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");
const connection = require("./db/db");
const initSocket = require("./socketServer");
const userRoutes = require("./routes/userRoute");
const userRoute = require("./routes/userRoute");
const avatarRoute = require("./routes/avatarRoute");
const chatRoute = require("./routes/chatRoute");
const messageRoute = require("./routes/messageRoute");
const uploadRoute = require("./routes/uploadRoute");

// Log route files
console.log("Routes folder contains:", fs.readdirSync("./routes"));

// Initialize app and server
const app = express();
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// Attach io to every request (optional if needed in routes)
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// API Routes
app.use("/api/user", userRoute);
app.use("/api/avatar", avatarRoute);
app.use("/api/chat", chatRoute);
app.use("/api/message", messageRoute);
app.use("/api/upload", uploadRoute); // ✅ new file/image route
app.use("/api/user", userRoutes);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// DB Connection
connection();

// Start listening and init sockets
server.listen(process.env.PORT || 4000, () => {
  console.log("🚀 Server running on port", process.env.PORT || 4000);
});

// Start Socket.IO logic
initSocket(io); // 🔌 handles events like join-chat, new-message, etc.
