const asyncHandler = require("../middleware/async.middleware");
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
  status: lead.status,
  priority: lead.priority,
  city: lead.city,
  state: lead.state,
  address: lead.address || "",
  pincode: lead.pincode || "",
  notes: lead.notes || "",
  nextFollowUpAt: lead.nextFollowUpAt,
  lastContactedAt: lead.lastContactedAt,
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
