// routes/uploadRoute.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Ensure the uploads directory exists at project root: chatapp/server/uploads
// e.g., run: mkdir uploads  (from chatapp/server)

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // relative to server root
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// POST /api/upload
router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  // Construct the URL for accessing the file
  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(200).json({ url: fileUrl });
});

module.exports = router;
