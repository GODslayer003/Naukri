const asyncHandler = require("../middleware/async.middleware");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const CrmUser = require("../models/CrmUser");
const Lead = require("../models/Lead");
const {
  BUSINESS_CATEGORIES,
  LEAD_SOURCES,
  LEAD_STATUSES,
  LEAD_PRIORITIES,
} = require("../constants/lead-generator.constants");

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const generateToken = (id) =>
  jwt.sign({ id, type: "CRM_PANEL" }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const escapeRegExp = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseEnum = (value, allowedValues, fallback) => {
  const normalized = String(value || "")
    .trim()
    .toUpperCase();
  return allowedValues.includes(normalized) ? normalized : fallback;
};

const normalizeCreateLeadInput = (payload = {}, user = {}) => ({
  contactName: String(payload.contactName || payload.fullName || "").trim(),
  companyName: String(payload.companyName || "").trim(),
  phone: String(payload.phone || payload.phoneNumber || "").trim(),
  alternatePhone: String(payload.alternatePhone || "").trim(),
  email: String(payload.email || "").trim().toLowerCase(),
  businessCategory: String(payload.businessCategory || "").trim(),
  leadSource: String(payload.leadSource || "").trim(),
  status: parseEnum(payload.status, LEAD_STATUSES, "NEW"),
  priority: parseEnum(payload.priority, LEAD_PRIORITIES, "MEDIUM"),
  city: String(payload.city || "").trim() || "Unknown",
  state: String(payload.state || user.state || "").trim() || "Unknown",
  address: String(payload.address || payload.location || "").trim(),
  pincode: String(payload.pincode || "").trim(),
  notes: String(payload.notes || "").trim(),
  nextFollowUpAt: payload.nextFollowUpAt || null,
});

const buildLeadAccessFilter = (user) => {
  if (!user) {
    return {};
  }

  if (["ADMIN", "APPROVER"].includes(user.role)) {
    return {};
  }

  if (user.role === "STATE_MANAGER") {
    if (!user.state?.trim()) {
      return { _id: null };
    }

    return {
      state: {
        $regex: `^${escapeRegExp(user.state.trim())}$`,
        $options: "i",
      },
    };
  }

  return { createdBy: user._id };
};

const formatLead = (lead) => ({
  id: String(lead._id),
  leadCode: lead.leadCode,
  contactName: lead.contactName,
  companyName: lead.companyName,
  phone: lead.phone,
  alternatePhone: lead.alternatePhone || "",
  email: lead.email || "",
  businessCategory: lead.businessCategory,
  leadSource: lead.leadSource,
  status: lead.isForwardedToSM ? "FORWARDED" : lead.status,
  priority: lead.priority,
  city: lead.city,
  state: lead.state,
  address: lead.address || "",
  pincode: lead.pincode || "",
  notes: lead.notes || "",
  nextFollowUpAt: lead.nextFollowUpAt,
  lastContactedAt: lead.lastContactedAt,
  activities: lead.activities || [],
  createdAt: lead.createdAt,
  updatedAt: lead.updatedAt,
  createdBy:
    lead.createdBy && typeof lead.createdBy === "object"
      ? {
          id: String(lead.createdBy._id),
          fullName: lead.createdBy.fullName,
          role: lead.createdBy.role,
        }
      : null,
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

  const normalizedPhone = Lead.normalizePhoneNumber(payload.phone);
  if (normalizedPhone.length < 10) {
    throw createHttpError(400, "Phone number must contain at least 10 digits");
  }

  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(payload.email).trim())) {
    throw createHttpError(400, "Enter a valid email address");
  }
};

exports.getLeadGeneratorMeta = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      businessCategories: BUSINESS_CATEGORIES,
      leadSources: LEAD_SOURCES,
      leadStatuses: LEAD_STATUSES,
      leadPriorities: LEAD_PRIORITIES,
      defaultState: req.user.state || "",
    },
  });
});

exports.getLeadGeneratorDashboard = asyncHandler(async (req, res) => {
  const accessFilter = buildLeadAccessFilter(req.user);
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalLeads,
    newLeads,
    contactedLeads,
    wonLeads,
    followUpsToday,
    leadsThisMonth,
    recentLeads,
    upcomingFollowUps,
    statusBreakdown,
    sourceBreakdown,
    categoryBreakdown,
  ] = await Promise.all([
    Lead.countDocuments(accessFilter),
    Lead.countDocuments({ ...accessFilter, status: "NEW" }),
    Lead.countDocuments({ ...accessFilter, status: "CONTACTED" }),
    Lead.countDocuments({ ...accessFilter, status: "WON" }),
    Lead.countDocuments({
      ...accessFilter,
      nextFollowUpAt: { $gte: dayStart, $lt: dayEnd },
    }),
    Lead.countDocuments({
      ...accessFilter,
      createdAt: { $gte: monthStart },
    }),
    Lead.find(accessFilter)
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("createdBy", "fullName role"),
    Lead.find({
      ...accessFilter,
      nextFollowUpAt: { $gte: dayStart },
    })
      .sort({ nextFollowUpAt: 1 })
      .limit(5)
      .populate("createdBy", "fullName role"),
    Lead.aggregate([
      { $match: accessFilter },
      { $group: { _id: "$status", value: { $sum: 1 } } },
      { $sort: { value: -1, _id: 1 } },
    ]),
    Lead.aggregate([
      { $match: accessFilter },
      { $group: { _id: "$leadSource", value: { $sum: 1 } } },
      { $sort: { value: -1, _id: 1 } },
      { $limit: 6 },
    ]),
    Lead.aggregate([
      { $match: accessFilter },
      { $group: { _id: "$businessCategory", value: { $sum: 1 } } },
      { $sort: { value: -1, _id: 1 } },
      { $limit: 6 },
    ]),
  ]);

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalLeads,
        newLeads,
        contactedLeads,
        wonLeads,
        followUpsToday,
        leadsThisMonth,
      },
      pipeline: statusBreakdown.map((item) => ({
        label: item._id,
        value: item.value,
      })),
      sourceBreakdown: sourceBreakdown.map((item) => ({
        label: item._id,
        value: item.value,
      })),
      categoryBreakdown: categoryBreakdown.map((item) => ({
        label: item._id,
        value: item.value,
      })),
      recentLeads: recentLeads.map(formatLead),
      upcomingFollowUps: upcomingFollowUps.map(formatLead),
    },
  });
});

exports.getLeads = asyncHandler(async (req, res) => {
  const accessFilter = buildLeadAccessFilter(req.user);
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
  const skip = (page - 1) * limit;

  const search = String(req.query.search || "").trim();
  const status = String(req.query.status || "").trim().toUpperCase();
  const statusGroup = String(req.query.statusGroup || "").trim().toUpperCase();
  const leadSource = String(req.query.leadSource || "").trim();
  const businessCategory = String(req.query.businessCategory || "").trim();

  const filters = { ...accessFilter };

  if (search) {
    filters.$or = [
      { contactName: { $regex: escapeRegExp(search), $options: "i" } },
      { companyName: { $regex: escapeRegExp(search), $options: "i" } },
      { leadCode: { $regex: escapeRegExp(search), $options: "i" } },
      { phone: { $regex: escapeRegExp(search) } },
      { email: { $regex: escapeRegExp(search), $options: "i" } },
    ];
  }

  if (status && LEAD_STATUSES.includes(status)) {
    filters.status = status;
  }

  if (statusGroup) {
    const statusGroupMap = {
      APPROVED: ["QUALIFIED", "WON"],
      PENDING: ["NEW", "CONTACTED", "FOLLOW_UP"],
      REJECTED: ["LOST"],
    };

    if (statusGroupMap[statusGroup]) {
      filters.status = { $in: statusGroupMap[statusGroup] };
    }
  }

  if (leadSource && LEAD_SOURCES.includes(leadSource)) {
    filters.leadSource = leadSource;
  }

  if (businessCategory && BUSINESS_CATEGORIES.includes(businessCategory)) {
    filters.businessCategory = businessCategory;
  }

  const [items, total] = await Promise.all([
    Lead.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "fullName role"),
    Lead.countDocuments(filters),
  ]);

  res.status(200).json({
    success: true,
    data: {
      items: items.map(formatLead),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    },
  });
});

exports.createLead = asyncHandler(async (req, res) => {
  const input = normalizeCreateLeadInput(req.body, req.user);
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
    status: input.status,
    priority: input.priority,
    city: input.city,
    state: input.state,
    address: input.address,
    pincode: input.pincode,
    notes: input.notes,
    nextFollowUpAt: input.nextFollowUpAt,
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });

  const hydratedLead = await Lead.findById(lead._id).populate("createdBy", "fullName role");

  res.status(201).json({
    success: true,
    data: formatLead(hydratedLead),
  });
});

exports.updateLeadStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const ALLOWED_STATUSES = ["CONVERTED", "FORWARDED"];

  if (!status || !ALLOWED_STATUSES.includes(String(status).toUpperCase())) {
    throw createHttpError(400, `Status must be one of: ${ALLOWED_STATUSES.join(", ")}`);
  }

  const lead = await Lead.findById(id);

  if (!lead) {
    throw createHttpError(404, "Lead not found");
  }

  // Only the creator or admin/approver can update the status
  const isOwner = String(lead.createdBy) === String(req.user._id);
  const isPrivileged = ["ADMIN", "APPROVER", "STATE_MANAGER"].includes(req.user.role);

  if (!isOwner && !isPrivileged) {
    throw createHttpError(403, "You do not have permission to update this lead");
  }

  if (String(status).toUpperCase() === "FORWARDED") {
    lead.isForwardedToSM = true;
  }
  
  lead.status = String(status).toUpperCase();
  lead.updatedBy = req.user._id;
  await lead.save();

  const updated = await Lead.findById(lead._id).populate("createdBy", "fullName role");

  res.status(200).json({
    success: true,
    data: formatLead(updated),
  });
});

exports.signup = asyncHandler(async (req, res) => {
  const { email, zone, password, confirmPassword } = req.body;

  if (!email || !zone || !password || !confirmPassword) {
    throw createHttpError(400, "All fields are required (email, zone, password, confirmPassword)");
  }

  if (password !== confirmPassword) {
    throw createHttpError(400, "Passwords do not match");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await CrmUser.findOne({ email: normalizedEmail });
  
  if (existingUser) {
    throw createHttpError(409, "User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await CrmUser.create({
    fullName: "Lead Generator",
    email: normalizedEmail,
    password: hashedPassword,
    role: "LEAD_GENERATOR",
    territory: zone.trim(), // mapping 'Zone' to 'territory'
    accessStatus: "ACTIVE",
    isActive: true,
  });

  res.status(201).json({
    success: true,
    message: "Registration successful. You can now log in.",
    token: generateToken(user._id),
    user: {
      id: user._id,
      email: user.email,
      zone: user.territory,
      role: user.role,
    },
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, zone, password } = req.body;

  if (!email || !zone || !password) {
    throw createHttpError(400, "All fields are required (email, zone, password)");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await CrmUser.findOne({ email: normalizedEmail });

  if (!user) {
    throw createHttpError(401, "Invalid credentials or zone");
  }

  if (user.role !== "LEAD_GENERATOR") {
    throw createHttpError(403, "Access denied. Only Lead Generators can log in here.");
  }

  if (user.territory !== zone.trim()) {
    throw createHttpError(401, "Invalid zone selection for this account.");
  }

  if (!user.isActive || user.accessStatus === "RESTRICTED") {
    throw createHttpError(403, "Account is inactive or restricted.");
  }

  const passwordMatches = await bcrypt.hash(password, 10).then(() => bcrypt.compare(password, user.password));

  if (!passwordMatches) {
    throw createHttpError(401, "Invalid credentials or zone");
  }

  res.status(200).json({
    success: true,
    token: generateToken(user._id),
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      zone: user.territory,
      role: user.role,
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

  const activityData = {
    outcome,
    notes,
    nextFollowUpAt: nextFollowUpAt || null,
    date: new Date(),
  };

  if (activityIndex !== undefined && activityIndex !== null) {
    // Update existing activity
    if (!lead.activities[activityIndex]) {
      throw createHttpError(404, "Activity not found");
    }
    lead.activities[activityIndex] = {
      ...lead.activities[activityIndex].toObject(),
      ...activityData,
      date: lead.activities[activityIndex].date, // Keep original date
    };
  } else {
    // Add new activity
    lead.activities.push(activityData);
  }

  // Also update lead's main follow-up date and last contacted date
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
