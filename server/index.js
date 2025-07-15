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

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "https://chatverseapp.vercel.app",
  "http://localhost:5173",
  
];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// ✅ Apply CORS for Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Attach io instance to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Health check route
app.get("/ping", (req, res) => {
  res.send("Backend is alive ✅");
});

// ✅ Main routes
app.use("/api/user", userRoutes);
app.use("/api/avatar", avatarRoute);
app.use("/api/chat", chatRoute);
app.use("/api/message", messageRoute);
app.use("/api/upload", uploadRoute);

// ✅ Catch-all route for 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ✅ DB connection and start server
connection();

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

initSocket(io);
