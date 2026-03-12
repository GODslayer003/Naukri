const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["ADMIN", "CRM", "FSE", "CLIENT", "CANDIDATE"],
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null, // Only for CLIENT users
    },
    department: { type: String, default: "" },
    scope: { type: String, default: "" },
    accessStatus: {
      type: String,
      enum: ["ACTIVE", "PENDING_INVITE", "RESTRICTED"],
      default: "ACTIVE",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
