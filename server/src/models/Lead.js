const crypto = require("crypto");
const mongoose = require("mongoose");
const {
  BUSINESS_CATEGORIES,
  LEAD_SOURCES,
  LEAD_STATUSES,
  LEAD_PRIORITIES,
} = require("../constants/lead-generator.constants");

const normalizePhoneNumber = (value = "") => value.replace(/\D/g, "");

const leadSchema = new mongoose.Schema(
  {
    leadCode: {
      type: String,
      unique: true,
      index: true,
    },
    contactName: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    alternatePhone: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    businessCategory: {
      type: String,
      enum: BUSINESS_CATEGORIES,
      required: true,
    },
    leadSource: {
      type: String,
      enum: LEAD_SOURCES,
      required: true,
    },
    status: {
      type: String,
      enum: LEAD_STATUSES,
      default: "NEW",
      index: true,
    },
    priority: {
      type: String,
      enum: LEAD_PRIORITIES,
      default: "MEDIUM",
    },
    city: {
      type: String,
      trim: true,
      required: true,
    },
    state: {
      type: String,
      trim: true,
      required: true,
      index: true,
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    pincode: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    nextFollowUpAt: {
      type: Date,
      default: null,
      index: true,
    },
    lastContactedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CrmUser",
      required: true,
      index: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CrmUser",
      required: true,
    },
  },
  { timestamps: true },
);

leadSchema.index({ leadSource: 1, createdAt: -1 });
leadSchema.index({ businessCategory: 1, createdAt: -1 });
leadSchema.index({ phone: 1 });
leadSchema.index({ email: 1 });

leadSchema.pre("validate", function assignLeadCode(next) {
  if (!this.leadCode) {
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
    this.leadCode = `LD-${stamp}-${suffix}`;
  }

  next();
});

leadSchema.pre("save", function normalizeLeadFields(next) {
  this.phone = normalizePhoneNumber(this.phone);
  this.alternatePhone = normalizePhoneNumber(this.alternatePhone);
  this.email = (this.email || "").trim().toLowerCase();
  this.contactName = this.contactName.trim();
  this.companyName = this.companyName.trim();
  this.city = this.city.trim();
  this.state = this.state.trim();
  this.address = (this.address || "").trim();
  this.notes = (this.notes || "").trim();
  this.pincode = (this.pincode || "").trim();
  next();
});

leadSchema.statics.normalizePhoneNumber = normalizePhoneNumber;

module.exports = mongoose.model("Lead", leadSchema);
