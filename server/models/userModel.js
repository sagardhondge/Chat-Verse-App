const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: false }, // 👈 Make this optional
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false },
    avatar: { type: String, default: "" },
    dob: { type: Date },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    about: { type: String, trim: true },
    isPublic: {type: Boolean,default: true,
},

  },
  { timestamps: true }
);
module.exports = mongoose.model("User", userSchema);