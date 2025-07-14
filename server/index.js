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

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "https://chatverseapp.vercel.app",
    credentials: true,
  },
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

const allowedOrigins = ["https://chatverseapp.vercel.app"];

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

app.options("*", cors());
app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/ping", (req, res) => {
  res.send("Backend is alive ✅");
});

app.use("/api/user", userRoutes);
app.use("/api/avatar", avatarRoute);
app.use("/api/chat", chatRoute);
app.use("/api/message", messageRoute);
app.use("/api/upload", uploadRoute);

// ✅ Catch-all 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

connection();

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

initSocket(io);
