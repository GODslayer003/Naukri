const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const createHttpError = require("http-errors");
const asyncHandler = require("../middleware/async.middleware");
const CrmUser = require("../models/CrmUser");
const Lead = require("../models/Lead");
const {
  LEAD_STATUSES,
  LEAD_SOURCES,
  LEAD_PRIORITIES,
  BUSINESS_CATEGORIES,
} = require("../constants/lead-generator.constants");
const {
  normalizeZoneInput,
  inferZoneFromTerritory,
  buildZoneRegex,
} = require("../utils/zone.util");
const { replaceCrmProfileImage } = require("../services/profile-image-storage.service");

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

const getUserZone = (user = {}) => {
  return normalizeZoneInput(user.territory) || inferZoneFromTerritory(user.territory);
};

const parseEnum = (value, allowedValues, fallback) => {
  const normalized = String(value || "").trim();
  return allowedValues.includes(normalized) ? normalized : fallback;
};

const normalizeCreateLeadInput = (payload = {}) => ({
  contactName: String(payload.contactName || payload.fullName || "").trim(),
  companyName: String(payload.companyName || "").trim(),
  phone: String(payload.phone || payload.phoneNumber || "").trim(),
  alternatePhone: String(payload.alternatePhone || "").trim(),
  email: String(payload.email || "").trim().toLowerCase(),
  businessCategory: String(payload.businessCategory || "").trim(),
  leadSource: String(payload.leadSource || "").trim(),
  priority: parseEnum(payload.priority, LEAD_PRIORITIES, "MEDIUM"),
  city: String(payload.city || "").trim() || "Unknown",
  state: String(payload.state || "").trim() || "Unknown",
  address: String(payload.address || payload.location || "").trim(),
  pincode: String(payload.pincode || "").trim(),
  notes: String(payload.notes || "").trim(),
  nextFollowUpAt: payload.nextFollowUpAt || null,
});

const ensureLeadPayload = (payload = {}) => {
  const requiredFields = [
    ["contactName", "Contact name is required"],
    ["companyName", "Company name is required"],
    ["phone", "Phone number is required"],
    ["businessCategory", "Business category is required"],
    ["leadSource", "Lead source is required"],
    ["address", "Location / address is required"],
  ];

  requiredFields.forEach(([field, message]) => {
    if (!String(payload[field] || "").trim()) {
      throw createHttpError(400, message);
    }
  });

  if (!BUSINESS_CATEGORIES.includes(payload.businessCategory)) {
    throw createHttpError(400, "Invalid business category");
  }

  if (!LEAD_SOURCES.includes(payload.leadSource)) {
    throw createHttpError(400, "Invalid lead source");
  }

  const normalizedPhone = Lead.normalizePhoneNumber(payload.phone);
  if (normalizedPhone.length < 10) {
    throw createHttpError(400, "Phone number must contain at least 10 digits");
  }

  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(payload.email).trim())) {
    throw createHttpError(400, "Enter a valid email address");
  }
};

const buildDateFilter = (date) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (date === "today") {
    return { $gte: startOfToday };
  }

  if (date === "yesterday") {
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    return { $gte: startOfYesterday, $lt: startOfToday };
  }

  if (date === "this_week") {
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    return { $gte: startOfWeek };
  }

  if (date === "this_month") {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return { $gte: startOfMonth };
  }

  return null;
};

const formatLead = (lead) => ({
  id: String(lead._id),
  leadCode: lead.leadCode,
  companyName: lead.companyName,
  contactName: lead.contactName,
  phone: lead.phone,
  email: lead.email || "",
  city: lead.city,
  state: lead.state,
  address: lead.address || "",
  status: lead.status,
  priority: lead.priority,
  leadSource: lead.leadSource,
  businessCategory: lead.businessCategory,
  notes: lead.notes || "",
  nextFollowUpAt: lead.nextFollowUpAt,
  lastContactedAt: lead.lastContactedAt,
  activities: lead.activities || [],
  createdAt: lead.createdAt,
  updatedAt: lead.updatedAt,
  createdBy: lead.createdBy
    ? {
        id: String(lead.createdBy._id),
        fullName: lead.createdBy.fullName,
        role: lead.createdBy.role,
        zone: getUserZone(lead.createdBy),
        profileImage: lead.createdBy.profileImageUrl || "",
      }
    : null,
  assignedBy: lead.assignedBy
    ? {
        id: String(lead.assignedBy._id),
        fullName: lead.assignedBy.fullName,
        role: lead.assignedBy.role,
      }
    : null,
  assignedTo: lead.assignedTo
    ? {
        id: String(lead.assignedTo._id),
        fullName: lead.assignedTo.fullName,
        role: lead.assignedTo.role,
        profileImage: lead.assignedTo.profileImageUrl || "",
      }
    : null,
});

exports.signup = asyncHandler(async (req, res) => {
  const { email, zone, password, confirmPassword, fullName } = req.body;

  if (!email || !zone || !password || !confirmPassword) {
    throw createHttpError(400, "All fields are required (email, zone, password, confirmPassword)");
  }

  if (password !== confirmPassword) {
    throw createHttpError(400, "Passwords do not match");
  }

  const normalizedZone = normalizeZoneInput(zone);
  if (!normalizedZone) {
    throw createHttpError(400, "Valid zone is required (North, South, East, West)");
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existingUser = await CrmUser.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw createHttpError(409, "User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await CrmUser.create({
    fullName: String(fullName || "Field Sales Executive").trim() || "Field Sales Executive",
    email: normalizedEmail,
    password: hashedPassword,
    role: "FSE",
    territory: normalizedZone,
    accessStatus: "ACTIVE",
    isActive: true,
  });

  res.status(201).json({
    success: true,
    message: "FSE registered successfully",
    token: generateToken(user._id),
    user: {
      id: String(user._id),
      fullName: user.fullName,
      email: user.email,
      zone: normalizedZone,
      role: user.role,
      profileImage: user.profileImageUrl || "",
    },
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, zone, password } = req.body;

  if (!email || !zone || !password) {
    throw createHttpError(400, "Email, zone, and password are required");
  }

  const normalizedZone = normalizeZoneInput(zone);
  if (!normalizedZone) {
    throw createHttpError(400, "Valid zone is required (North, South, East, West)");
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await CrmUser.findOne({ email: normalizedEmail }).select("+password");

  if (!user || user.role !== "FSE") {
    throw createHttpError(401, "Invalid email, zone, or password");
  }

  if (getUserZone(user) !== normalizedZone) {
    throw createHttpError(401, "Incorrect zone for this user");
  }

  if (!user.isActive || user.accessStatus === "RESTRICTED") {
    throw createHttpError(403, "Account is inactive or restricted.");
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    throw createHttpError(401, "Invalid email, zone, or password");
  }

  res.status(200).json({
    success: true,
    token: generateToken(user._id),
    user: {
      id: String(user._id),
      fullName: user.fullName,
      email: user.email,
      zone: normalizedZone,
      role: user.role,
      profileImage: user.profileImageUrl || "",
    },
  });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw createHttpError(400, "Current password and new password are required.");
  }

  if (newPassword.length < 8) {
    throw createHttpError(400, "New password must be at least 8 characters.");
  }

  const user = await CrmUser.findById(req.user._id);
  if (!user) {
    throw createHttpError(404, "User not found.");
  }

  const passwordMatches = await bcrypt.compare(currentPassword, user.password);
  if (!passwordMatches) {
    throw createHttpError(401, "Current password is incorrect.");
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password updated successfully.",
  });
});

exports.uploadProfilePhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw createHttpError(400, "Profile photo file is required.");
  }

  const user = await CrmUser.findById(req.user._id);
  if (!user) {
    throw createHttpError(404, "User not found.");
  }

  const uploaded = await replaceCrmProfileImage(req.file, {
    userId: user._id,
    role: user.role,
    previousPublicId: user.profileImagePublicId,
  });

  user.profileImageUrl = uploaded.url;
  user.profileImagePublicId = uploaded.publicId;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile picture updated successfully.",
    data: {
      id: String(user._id),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      zone: getUserZone(user),
      profileImage: user.profileImageUrl || "",
    },
  });
});

exports.getLeadMeta = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      businessCategories: BUSINESS_CATEGORIES,
      leadSources: LEAD_SOURCES,
      leadPriorities: LEAD_PRIORITIES,
    },
  });
});

exports.createLead = asyncHandler(async (req, res) => {
  const input = normalizeCreateLeadInput(req.body);
  ensureLeadPayload(input);

  const normalizedPhone = Lead.normalizePhoneNumber(input.phone);
  const normalizedEmail = input.email;
  const duplicateFilter = normalizedEmail
    ? {
        $or: [{ phone: normalizedPhone }, { email: normalizedEmail }],
      }
    : { phone: normalizedPhone };

  const existingLead = await Lead.findOne(duplicateFilter).select("_id leadCode");
  if (existingLead) {
    throw createHttpError(
      409,
      `A lead already exists for this contact. Existing lead code: ${existingLead.leadCode}`,
    );
  }

  const lead = await Lead.create({
    contactName: input.contactName,
    companyName: input.companyName,
    phone: input.phone,
    alternatePhone: input.alternatePhone,
    email: normalizedEmail,
    businessCategory: input.businessCategory,
    leadSource: input.leadSource,
    status: "ASSIGNED",
    priority: input.priority,
    city: input.city,
    state: input.state,
    address: input.address,
    pincode: input.pincode,
    notes: input.notes,
    nextFollowUpAt: input.nextFollowUpAt,
    createdBy: req.user._id,
    updatedBy: req.user._id,
    assignedTo: req.user._id,
    assignedBy: req.user._id,
  });

  const hydratedLead = await Lead.findById(lead._id)
    .populate("createdBy", "fullName role territory profileImageUrl")
    .populate("assignedBy", "fullName role")
    .populate("assignedTo", "fullName role profileImageUrl");

  res.status(201).json({
    success: true,
    message: "Lead created and assigned successfully",
    data: formatLead(hydratedLead),
  });
});

exports.getDashboard = asyncHandler(async (req, res) => {
  const myZone = getUserZone(req.user);
  const baseQuery = { assignedTo: req.user._id };
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const [totalAssigned, converted, pending, followUpsToday, recentLeads] = await Promise.all([
    Lead.countDocuments(baseQuery),
    Lead.countDocuments({ ...baseQuery, status: "CONVERTED" }),
    Lead.countDocuments({ ...baseQuery, status: { $in: ["ASSIGNED", "CONTACTED", "FOLLOW_UP", "QUALIFIED"] } }),
    Lead.countDocuments({
      ...baseQuery,
      nextFollowUpAt: { $gte: startOfToday, $lt: endOfToday },
    }),
    Lead.find(baseQuery)
      .sort({ updatedAt: -1 })
      .limit(8)
      .populate("createdBy", "fullName role territory profileImageUrl"),
  ]);

  const conversionRate = totalAssigned > 0 ? Math.round((converted / totalAssigned) * 100) : 0;

  res.status(200).json({
    success: true,
    data: {
      zone: myZone,
      summary: {
        totalAssigned,
        pending,
        converted,
        followUpsToday,
        conversionRate,
      },
      recentLeads: recentLeads.map(formatLead),
    },
  });
});

exports.getLeads = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
  const skip = (page - 1) * limit;
  const search = String(req.query.search || "").trim();
  const status = String(req.query.status || "").trim().toUpperCase();
  const date = String(req.query.date || "").trim().toLowerCase();

  const query = { assignedTo: req.user._id };

  if (status) {
    if (!LEAD_STATUSES.includes(status)) {
      throw createHttpError(400, "Invalid status filter.");
    }
    query.status = status;
  }

  if (search) {
    const safeRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    query.$or = [
      { companyName: safeRegex },
      { contactName: safeRegex },
      { phone: safeRegex },
      { leadCode: safeRegex },
    ];
  }

  const createdAtFilter = buildDateFilter(date);
  if (createdAtFilter) {
    query.createdAt = createdAtFilter;
  }

  const [leads, total] = await Promise.all([
    Lead.find(query)
      .populate("createdBy", "fullName role territory profileImageUrl")
      .populate("assignedBy", "fullName role")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    Lead.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: {
      items: leads.map(formatLead),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 0,
      },
    },
  });
});

exports.updateLeadStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const nextStatus = String(status || "").trim().toUpperCase();
  const ALLOWED_STATUSES = ["CONTACTED", "FOLLOW_UP", "QUALIFIED", "CONVERTED", "LOST", "REJECTED"];

  if (!ALLOWED_STATUSES.includes(nextStatus)) {
    throw createHttpError(400, `Status must be one of: ${ALLOWED_STATUSES.join(", ")}`);
  }

  const lead = await Lead.findById(id).populate("createdBy", "territory");
  if (!lead) {
    throw createHttpError(404, "Lead not found");
  }

  if (String(lead.assignedTo) !== String(req.user._id)) {
    throw createHttpError(403, "You can only update leads assigned to you.");
  }

  const leadZone = inferZoneFromTerritory(lead.createdBy?.territory);
  const fseZone = getUserZone(req.user);
  if (!leadZone || !fseZone || leadZone !== fseZone) {
    throw createHttpError(403, "Lead zone does not match your assigned zone.");
  }

  lead.status = nextStatus;
  lead.updatedBy = req.user._id;
  lead.lastContactedAt = new Date();

  if (nextStatus === "CONVERTED") {
    lead.convertedAt = new Date();
  }

  await lead.save();
  const updatedLead = await Lead.findById(lead._id)
    .populate("createdBy", "fullName role territory profileImageUrl")
    .populate("assignedBy", "fullName role");

  res.status(200).json({
    success: true,
    message: "Lead status updated",
    data: formatLead(updatedLead),
  });
});

exports.logLeadActivity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { outcome, notes, nextFollowUpAt, activityIndex } = req.body;

  if (!outcome || !notes) {
    throw createHttpError(400, "Outcome and notes are required");
  }

  const lead = await Lead.findById(id);
  if (!lead) {
    throw createHttpError(404, "Lead not found");
  }

  if (String(lead.assignedTo) !== String(req.user._id)) {
    throw createHttpError(403, "You can only log activities for leads assigned to you.");
  }

  const activityData = {
    outcome: String(outcome).trim(),
    notes: String(notes).trim(),
    nextFollowUpAt: nextFollowUpAt || null,
    date: new Date(),
  };

  if (activityIndex !== undefined && activityIndex !== null) {
    if (!lead.activities[activityIndex]) {
      throw createHttpError(404, "Activity not found");
    }

    lead.activities[activityIndex] = {
      ...lead.activities[activityIndex].toObject(),
      ...activityData,
      date: lead.activities[activityIndex].date,
    };
  } else {
    lead.activities.push(activityData);
  }

  if (nextFollowUpAt) {
    lead.nextFollowUpAt = nextFollowUpAt;
  }
  lead.lastContactedAt = new Date();
  lead.updatedBy = req.user._id;

  await lead.save();

  res.status(200).json({
    success: true,
    data: formatLead(lead),
  });
});

exports.deleteLeadActivity = asyncHandler(async (req, res) => {
  const { id, index } = req.params;

  const lead = await Lead.findById(id);
  if (!lead) {
    throw createHttpError(404, "Lead not found");
  }

  if (String(lead.assignedTo) !== String(req.user._id)) {
    throw createHttpError(403, "You can only delete activities for leads assigned to you.");
  }

  if (!lead.activities[index]) {
    throw createHttpError(404, "Activity not found");
  }

  lead.activities.splice(index, 1);
  lead.updatedBy = req.user._id;
  await lead.save();

  res.status(200).json({
    success: true,
    data: formatLead(lead),
  });
});

exports.getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      id: String(req.user._id),
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role,
      zone: getUserZone(req.user),
      phone: req.user.phone || "",
      department: req.user.department || "Field Sales",
      profileImage: req.user.profileImageUrl || "",
    },
  });
});
