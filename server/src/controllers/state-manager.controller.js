const CrmUser = require("../models/CrmUser");
const Lead = require("../models/Lead");
const asyncHandler = require("../middleware/async.middleware");
const createHttpError = require("http-errors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

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
    fullName: "State Manager",
    email: normalizedEmail,
    password: hashedPassword,
    role: "STATE_MANAGER",
    territory: zone, // e.g. "North", "South"
  });

  res.status(201).json({
    success: true,
    message: "State Manager registered successfully",
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

exports.login = asyncHandler(async (req, res) => {
  const { email, zone, password } = req.body;

  if (!email || !zone || !password) {
    throw createHttpError(400, "Email, zone, and password are required");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await CrmUser.findOne({ email: normalizedEmail }).select("+password");

  if (!user || user.role !== "STATE_MANAGER") {
    throw createHttpError(401, "Invalid email, zone, or password");
  }

  if (user.territory !== zone) {
    throw createHttpError(401, "Incorrect zone for this user");
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw createHttpError(401, "Invalid email, zone, or password");
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

// Get Leads for State Manager
exports.getLeads = asyncHandler(async (req, res) => {
  const { search, location, date, page = 1, limit = 50 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  // State Manager can only see leads forwarded by Lead Generators in their Zone
  let targetZone = req.user.role === "STATE_MANAGER" ? req.user.territory : null;

  if (location && location !== "All Zones") {
    const requestedZone = location.replace(" Zone", "").trim();

    // If the user is a STATE_MANAGER, they can only query their own zone
    if (req.user.role === "STATE_MANAGER" && targetZone !== requestedZone) {
      return res.status(200).json({
        success: true,
        count: 0,
        total: 0,
        pagination: { page: Number(page), limit: Number(limit), totalPages: 0 },
        data: []
      });
    }
    targetZone = requestedZone;
  }

  const zoneQuery = { role: "LEAD_GENERATOR" };
  if (targetZone) {
    zoneQuery.territory = targetZone;
  }

  // Find all lead generators matching the zone constraint
  const zoneLGUsers = await CrmUser.find(zoneQuery).select("_id");
  const generatorIds = zoneLGUsers.map(u => u._id);

  // Build Query
  const query = {
    createdBy: { $in: generatorIds },
    status: { $in: ["FORWARDED", "ASSIGNED", "CONVERTED", "REJECTED"] }
  };

  if (search) {
    const searchRegex = { $regex: search, $options: "i" };
    query.$or = [
      { companyName: searchRegex },
      { contactName: searchRegex },
      { phone: searchRegex },
      { leadCode: searchRegex }
    ];
  }

  if (date && date !== "All Dates") {
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));

    if (date === "today") {
      query.createdAt = { $gte: startOfToday };
    } else if (date === "yesterday") {
      const startOfYesterday = new Date(new Date(startOfToday).setDate(startOfToday.getDate() - 1));
      query.createdAt = { $gte: startOfYesterday, $lt: startOfToday };
    } else if (date === "this_week") {
      const startOfWeek = new Date(new Date(startOfToday).setDate(startOfToday.getDate() - 7));
      query.createdAt = { $gte: startOfWeek };
    } else if (date === "this_month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      query.createdAt = { $gte: startOfMonth };
    }
  }

  const [leads, total] = await Promise.all([
    Lead.find(query)
      .populate("createdBy", "fullName territory email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Lead.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: leads.length,
    total,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    },
    data: leads,
  });
});

exports.assignLead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { fseId } = req.body; // In mock, fseId might be a dummy string

  const lead = await Lead.findById(id);

  if (!lead) {
    throw createHttpError(404, "Lead not found");
  }

  // FSE handling: For now since we don't have FSE users yet, we'll store
  // a mock reference or just change the status to ASSIGNED.
  // In reality, assignedTo should be a valid ObjectId of an FSE.
  // We'll skip ObjectId validation if it's a mock.

  lead.status = "ASSIGNED";
  if (fseId.length === 24) {
    lead.assignedTo = fseId; // If it's a valid object ID
  }

  await lead.save();

  res.status(200).json({
    success: true,
    message: "Lead assigned successfully",
    data: lead
  });
});

exports.getDashboard = asyncHandler(async (req, res) => {
  const myZone = req.user.territory;

  // Find all lead generators in this zone
  const zoneLGUsers = await CrmUser.find({
    role: "LEAD_GENERATOR",
    territory: myZone
  }).select("_id");

  const generatorIds = zoneLGUsers.map((u) => u._id);

  // Fetch all leads for this zone
  const leads = await Lead.find({
    createdBy: { $in: generatorIds },
  });

  const pendingValidation = leads.filter(l => l.status === "FORWARDED").length;
  const totalAssigned = leads.filter(l => l.status === "ASSIGNED").length;
  const converted = leads.filter(l => l.status === "CONVERTED").length;

  let conversionRate = 0;
  if (totalAssigned + converted > 0) {
    conversionRate = Math.round((converted / (totalAssigned + converted)) * 100);
  } else {
    conversionRate = 68; // mock default if zero data
  }

  // Mock FSEs for Team Overview
  const teamOverview = [
    { id: "f1", initials: "RS", name: "Rahul Sharma", location: "Dehradun", activeLeads: 12, status: "Active" },
    { id: "f2", initials: "PS", name: "Priya Singh", location: "Delhi", activeLeads: 8, status: "Active" },
    { id: "f3", initials: "VM", name: "Vikram Malhotra", location: "Mumbai", activeLeads: 5, status: "On Leave" },
    { id: "f4", initials: "AG", name: "Anjali Gupta", location: "Bangalore", activeLeads: 15, status: "Active" },
  ];

  // Mock Recent Activity matches the image exactly
  const recentActivity = [
    { id: "a1", type: "success", text: "Lead #123 assigned to Rahul", time: "10 mins ago" },
    { id: "a2", type: "danger", text: "Lead #455 Rejected (Bad Data)", time: "1 hour ago" },
    { id: "a3", type: "primary", text: "New FSE 'Anjali Gupta' added", time: "2 hours ago" },
    { id: "a4", type: "success", text: "Lead #112 marked as 'Closed'", time: "4 hours ago" },
  ];

  res.status(200).json({
    success: true,
    data: {
      pendingValidation,
      activeFses: 3,
      totalAssigned,
      conversionRate: `${conversionRate}%`,
      conversionGrowth: "+2.4%",
      teamOverview,
      recentActivity
    }
  });
});

exports.updateLeadStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const ALLOWED_STATUSES = ["CONVERTED", "FORWARDED", "REJECTED", "ASSIGNED"];

  if (!ALLOWED_STATUSES.includes(status)) {
    throw createHttpError(400, "Invalid status upgrade");
  }

  const lead = await Lead.findById(id);

  if (!lead) {
    throw createHttpError(404, "Lead not found");
  }

  lead.status = status;
  await lead.save();

  res.status(200).json({
    success: true,
    message: "Lead status updated",
    data: lead
  });
});
