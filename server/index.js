require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const connection = require("./db/db");
const initSocket = require("./socketServer");

const userRoutes = require("./routes/userRoute");
const avatarRoute = require("./routes/avatarRoute");
const chatRoute = require("./routes/chatRoute");
const messageRoute = require("./routes/messageRoute");
const uploadRoute = require("./routes/uploadRoute");

// ✅ Step 1: Create app & server
const app = express();
const server = http.createServer(app);

// ✅ Step 2: Set up Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "https://chatverseapp.vercel.app",
    credentials: true,
  },
});

// ✅ Step 3: Attach io to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ✅ Step 4: Middleware
const allowedOrigins = [
  "https://chatverseapp.vercel.app", // ✅ Your deployed frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.options("*", cors()); // ✅ handle preflight
app.use(express.json());
app.use(cookieParser());

// ✅ Step 5: Serve static files (uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Step 6: Routes
app.use("/api/user", userRoutes);
app.use("/api/avatar", avatarRoute);
app.use("/api/chat", chatRoute);
app.use("/api/message", messageRoute);
app.use("/api/upload", uploadRoute);

// ✅ Step 7: Connect to DB
connection();

// ✅ Step 8: Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ✅ Step 9: Initialize Socket.IO
initSocket(io);
