const CrmUser = require("../models/CrmUser");
const Lead = require("../models/Lead");
const asyncHandler = require("../middleware/async.middleware");
const createHttpError = require("http-errors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  CANONICAL_ZONES,
  normalizeZoneInput,
  normalizeIndianStateInput,
  inferZoneFromTerritory,
  isValidStateForZone,
  getAvailableStatesForZone,
  buildZoneRegex,
} = require("../utils/zone.util");
const { replaceCrmProfileImage } = require("../services/profile-image-storage.service");

const FULL_NAME_MIN_LENGTH = 2;
const FULL_NAME_MAX_LENGTH = 80;
const FULL_NAME_PATTERN = /^[A-Za-z][A-Za-z .'-]*$/;

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};
const escapeRegExp = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getUserZone = (user = {}) => {
  return normalizeZoneInput(user.territory) || inferZoneFromTerritory(user.territory);
};

const getUserState = (user = {}) => {
  return normalizeIndianStateInput(user.state);
};

const buildTerritoryFilter = (zone = "") => {
  const regex = buildZoneRegex(zone);
  if (!regex) {
    return {};
  }

  return { territory: regex };
};

const RESERVED_STATE_MANAGER_STATUSES = ["ACTIVE", "PENDING_INVITE"];
const MANAGED_MEMBER_ROLES = ["LEAD_GENERATOR", "FSE"];
const DEFAULT_TEAM_MEMBER_LIMIT = 10;
const MAX_TEAM_MEMBER_LIMIT = 50;

const buildStateReservationQuery = (zone = "", state = "", excludedUserId = null) => {
  const normalizedZone = normalizeZoneInput(zone);
  const normalizedState = normalizeIndianStateInput(state);

  if (!normalizedZone || !normalizedState) {
    return null;
  }

  const query = {
    role: "STATE_MANAGER",
    ...buildTerritoryFilter(normalizedZone),
    state: normalizedState,
    accessStatus: { $in: RESERVED_STATE_MANAGER_STATUSES },
  };

  if (excludedUserId) {
    query._id = { $ne: excludedUserId };
  }

  return query;
};

const getReservedStatesForZone = async (zone = "", excludedUserId = null) => {
  const normalizedZone = normalizeZoneInput(zone);
  if (!normalizedZone) {
    return [];
  }

  const query = {
    role: "STATE_MANAGER",
    ...buildTerritoryFilter(normalizedZone),
    accessStatus: { $in: RESERVED_STATE_MANAGER_STATUSES },
  };

  if (excludedUserId) {
    query._id = { $ne: excludedUserId };
  }

  const managers = await CrmUser.find(query).select("state");
  return managers
    .map((item) => normalizeIndianStateInput(item.state))
    .filter(Boolean);
};

const resolvePageOptions = (page = 1, limit = DEFAULT_TEAM_MEMBER_LIMIT) => {
  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const parsedLimit = Number.parseInt(limit, 10) || DEFAULT_TEAM_MEMBER_LIMIT;
  const safeLimit = Math.min(MAX_TEAM_MEMBER_LIMIT, Math.max(1, parsedLimit));

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
};

const buildManagerOwnershipFilter = (managerId) => ({
  $or: [{ assignedTo: managerId }, { assignedBy: managerId }],
});

const managerOwnsLead = (lead, managerId) => {
  const managerKey = String(managerId || "");
  if (!lead || !managerKey) {
    return false;
  }

  const assignedToKey = lead.assignedTo ? String(lead.assignedTo._id || lead.assignedTo) : "";
  const assignedByKey = lead.assignedBy ? String(lead.assignedBy._id || lead.assignedBy) : "";

  return assignedToKey === managerKey || assignedByKey === managerKey;
};

const normalizeFullName = (value = "") => {
  const normalized = String(value || "")
    .trim()
    .replace(/\s+/g, " ");

  if (!normalized) {
    throw createHttpError(400, "Full name is required.");
  }

  if (normalized.length < FULL_NAME_MIN_LENGTH || normalized.length > FULL_NAME_MAX_LENGTH) {
    throw createHttpError(
      400,
      `Full name must be between ${FULL_NAME_MIN_LENGTH} and ${FULL_NAME_MAX_LENGTH} characters.`,
    );
  }

  if (!FULL_NAME_PATTERN.test(normalized)) {
    throw createHttpError(400, "Full name can only contain letters, spaces, apostrophes, hyphens, and periods.");
  }

  return normalized;
};

exports.getSignupMeta = asyncHandler(async (req, res) => {
  const requestedZone = normalizeZoneInput(req.query.zone);
  if (req.query.zone && !requestedZone) {
    throw createHttpError(400, "Invalid zone. Use North, South, East, or West.");
  }

  if (requestedZone) {
    const occupiedStates = await getReservedStatesForZone(requestedZone);
    return res.status(200).json({
      success: true,
      data: {
        zones: CANONICAL_ZONES,
        selectedZone: requestedZone,
        availableStates: getAvailableStatesForZone(requestedZone, occupiedStates),
      },
    });
  }

  const availableStatesByZoneEntries = await Promise.all(
    CANONICAL_ZONES.map(async (zone) => {
      const occupiedStates = await getReservedStatesForZone(zone);
      return [zone, getAvailableStatesForZone(zone, occupiedStates)];
    }),
  );

  res.status(200).json({
    success: true,
    data: {
      zones: CANONICAL_ZONES,
      availableStatesByZone: Object.fromEntries(availableStatesByZoneEntries),
    },
  });
});

exports.signup = asyncHandler(async (req, res) => {
  const { email, zone, state, password, confirmPassword, fullName } = req.body;

  if (!email || !zone || !state || !password || !confirmPassword || !fullName) {
    throw createHttpError(
      400,
      "All fields are required (fullName, email, zone, state, password, confirmPassword)",
    );
  }

  if (password !== confirmPassword) {
    throw createHttpError(400, "Passwords do not match");
  }

  if (String(password).length < 8) {
    throw createHttpError(400, "Password must be at least 8 characters.");
  }

  const normalizedZone = normalizeZoneInput(zone);
  if (!normalizedZone) {
    throw createHttpError(400, "Valid zone is required (North, South, East, West)");
  }

  const normalizedState = normalizeIndianStateInput(state);
  if (!normalizedState || !isValidStateForZone(normalizedState, normalizedZone)) {
    throw createHttpError(400, "Selected state is not valid for the selected zone.");
  }

  const normalizedFullName = normalizeFullName(fullName);
  const normalizedEmail = email.trim().toLowerCase();
  const [existingUser, existingZoneStateManager] = await Promise.all([
    CrmUser.findOne({ email: normalizedEmail }),
    CrmUser.findOne(buildStateReservationQuery(normalizedZone, normalizedState)).select("_id"),
  ]);

  if (existingUser) {
    throw createHttpError(409, "User with this email already exists");
  }

  if (existingZoneStateManager) {
    throw createHttpError(409, `${normalizedState} is already assigned to another State Manager in ${normalizedZone} zone.`);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await CrmUser.create({
    fullName: normalizedFullName,
    email: normalizedEmail,
    password: hashedPassword,
    role: "STATE_MANAGER",
    territory: normalizedZone,
    state: normalizedState,
    accessStatus: "PENDING_INVITE",
    isActive: false,
  });

  res.status(201).json({
    success: true,
    message: "Signup request submitted. Please wait for zonal manager approval.",
    user: {
      id: String(user._id),
      fullName: user.fullName,
      email: user.email,
      zone: normalizedZone,
      state: normalizedState,
      role: user.role,
      accessStatus: user.accessStatus,
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

  const normalizedEmail = email.trim().toLowerCase();
  const user = await CrmUser.findOne({ email: normalizedEmail }).select("+password");

  if (!user || user.role !== "STATE_MANAGER") {
    throw createHttpError(401, "Invalid email, zone, or password");
  }

  if (getUserZone(user) !== normalizedZone) {
    throw createHttpError(401, "Incorrect zone for this user");
  }

  if (user.accessStatus === "PENDING_INVITE") {
    throw createHttpError(403, "Your account is pending zonal manager approval.");
  }

  if (user.accessStatus === "RESTRICTED" || !user.isActive) {
    throw createHttpError(403, "Your account is restricted. Please contact your zonal manager.");
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
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
      state: user.state || "",
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

exports.getProfile = asyncHandler(async (req, res) => {
  const zone = getUserZone(req.user);

  res.status(200).json({
    success: true,
    data: {
      id: String(req.user._id),
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role,
      zone,
      state: req.user.state || "",
      phone: req.user.phone || "",
      profileImage: req.user.profileImageUrl || "",
    },
  });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { fullName } = req.body;

  if (fullName === undefined) {
    throw createHttpError(400, "fullName is required.");
  }

  const normalizedFullName = normalizeFullName(fullName);

  const user = await CrmUser.findById(req.user._id);
  if (!user) {
    throw createHttpError(404, "User not found.");
  }

  user.fullName = normalizedFullName;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    data: {
      id: String(user._id),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      zone: getUserZone(user),
      state: user.state || "",
      phone: user.phone || "",
      profileImage: user.profileImageUrl || "",
    },
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
      state: user.state || "",
      profileImage: user.profileImageUrl || "",
    },
  });
});

// Get Leads for State Manager
exports.getLeads = asyncHandler(async (req, res) => {
  const { search, location, date, page = 1, limit = 50 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  // State Manager can only see leads forwarded by Lead Generators in their Zone
  let targetZone = req.user.role === "STATE_MANAGER" ? getUserZone(req.user) : "";
  const managerState = getUserState(req.user);
  if (!targetZone) {
    throw createHttpError(403, "Unable to resolve zone for this State Manager account.");
  }
  if (!managerState) {
    throw createHttpError(403, "Unable to resolve state for this State Manager account.");
  }

  if (location && location !== "All Zones") {
    const requestedZone = normalizeZoneInput(location.replace(" Zone", "").trim());
    if (!requestedZone) {
      throw createHttpError(400, "Invalid zone filter.");
    }

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

  const zoneQuery = {
    role: "LEAD_GENERATOR",
    ...buildTerritoryFilter(targetZone),
    state: managerState,
  };

  // Find all lead generators matching the zone constraint
  const zoneLGUsers = await CrmUser.find(zoneQuery).select("_id");
  const generatorIds = zoneLGUsers.map(u => u._id);

  // Build Query
  const query = {
    createdBy: { $in: generatorIds },
    state: managerState,
    status: { $in: ["FORWARDED", "ASSIGNED", "CONVERTED", "REJECTED", "LOST"] },
  };

  if (req.user.role === "STATE_MANAGER") {
    query.$and = [buildManagerOwnershipFilter(req.user._id)];
  }

  if (search) {
    const searchRegex = { $regex: search, $options: "i" };
    const searchFilter = {
      $or: [
        { companyName: searchRegex },
        { contactName: searchRegex },
        { phone: searchRegex },
        { leadCode: searchRegex },
      ],
    };

    if (Array.isArray(query.$and)) {
      query.$and.push(searchFilter);
    } else {
      query.$or = searchFilter.$or;
    }
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
      .populate("assignedTo", "fullName email territory profileImageUrl")
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

exports.getFSEs = asyncHandler(async (req, res) => {
  const myZone = getUserZone(req.user);
  const myState = getUserState(req.user);
  if (!myZone) {
    throw createHttpError(403, "Unable to resolve zone for this State Manager account.");
  }
  if (!myState) {
    throw createHttpError(403, "Unable to resolve state for this State Manager account.");
  }

  const fses = await CrmUser.find({
    role: "FSE",
    ...buildTerritoryFilter(myZone),
    state: myState,
    isActive: true,
    accessStatus: { $ne: "RESTRICTED" },
  }).select("_id fullName email territory state phone profileImageUrl");

  const fseIds = fses.map((fse) => fse._id);
  const leadCounts = fseIds.length
    ? await Lead.aggregate([
        {
          $match: {
            assignedTo: { $in: fseIds },
            status: { $nin: ["CONVERTED", "LOST", "REJECTED"] },
          },
        },
        {
          $group: {
            _id: "$assignedTo",
            activeLeads: { $sum: 1 },
          },
        },
      ])
    : [];

  const activeLeadMap = new Map(
    leadCounts.map((item) => [String(item._id), Number(item.activeLeads || 0)]),
  );

  res.status(200).json({
    success: true,
    data: fses.map((fse) => ({
      id: String(fse._id),
      fullName: fse.fullName,
      email: fse.email,
      zone: getUserZone(fse),
      state: fse.state || "",
      phone: fse.phone || "",
      activeLeads: activeLeadMap.get(String(fse._id)) || 0,
      profileImage: fse.profileImageUrl || "",
    })),
  });
});

exports.getManagedMembers = asyncHandler(async (req, res) => {
  const managerZone = getUserZone(req.user);
  const managerState = getUserState(req.user);
  const role = String(req.query.role || "").trim().toUpperCase();
  const search = String(req.query.search || "").trim();
  const { page, limit, skip } = resolvePageOptions(req.query.page, req.query.limit);

  if (!managerZone || !managerState) {
    throw createHttpError(403, "State Manager zone/state is not configured.");
  }

  if (!MANAGED_MEMBER_ROLES.includes(role)) {
    throw createHttpError(400, `role must be one of: ${MANAGED_MEMBER_ROLES.join(", ")}`);
  }

  const baseFilter = {
    role,
    ...buildTerritoryFilter(managerZone),
    state: managerState,
    isActive: true,
    accessStatus: { $ne: "RESTRICTED" },
  };

  const query = { ...baseFilter };
  if (search) {
    const searchRegex = { $regex: escapeRegExp(search), $options: "i" };
    query.$or = [
      { fullName: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
    ];
  }

  const [members, total] = await Promise.all([
    CrmUser.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("_id fullName email role territory state phone isActive accessStatus profileImageUrl createdAt updatedAt"),
    CrmUser.countDocuments(query),
  ]);

  const memberIds = members.map((member) => member._id);
  const generatedLeadCounts = memberIds.length
    ? await Lead.aggregate([
        {
          $match: {
            createdBy: { $in: memberIds },
          },
        },
        {
          $group: {
            _id: "$createdBy",
            totalLeadsGenerated: { $sum: 1 },
            convertedLeads: {
              $sum: {
                $cond: [{ $eq: ["$status", "CONVERTED"] }, 1, 0],
              },
            },
          },
        },
      ])
    : [];

  const generatedLeadMap = new Map(
    generatedLeadCounts.map((item) => [
      String(item._id),
      {
        totalLeadsGenerated: Number(item.totalLeadsGenerated || 0),
        convertedLeads: Number(item.convertedLeads || 0),
      },
    ]),
  );

  res.status(200).json({
    success: true,
    data: {
      items: members.map((member) => {
        const stats = generatedLeadMap.get(String(member._id)) || {
          totalLeadsGenerated: 0,
          convertedLeads: 0,
        };

        return {
          id: String(member._id),
          fullName: member.fullName,
          email: member.email,
          role: member.role,
          zone: getUserZone(member),
          state: member.state || "",
          phone: member.phone || "",
          profileImage: member.profileImageUrl || "",
          accessStatus: member.accessStatus,
          isActive: Boolean(member.isActive),
          totalLeadsGenerated: stats.totalLeadsGenerated,
          convertedLeads: stats.convertedLeads,
          createdAt: member.createdAt,
          updatedAt: member.updatedAt,
        };
      }),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    },
  });
});

exports.getManagedMemberById = asyncHandler(async (req, res) => {
  const managerZone = getUserZone(req.user);
  const managerState = getUserState(req.user);
  const { id } = req.params;

  if (!managerZone || !managerState) {
    throw createHttpError(403, "State Manager zone/state is not configured.");
  }

  const member = await CrmUser.findOne({
    _id: id,
    role: { $in: MANAGED_MEMBER_ROLES },
    ...buildTerritoryFilter(managerZone),
    state: managerState,
  }).select("_id fullName email role territory state phone department scope isActive accessStatus profileImageUrl createdAt updatedAt");

  if (!member) {
    throw createHttpError(404, "Team member not found in your state.");
  }

  const [leadStats] = await Lead.aggregate([
    {
      $match: {
        createdBy: member._id,
      },
    },
    {
      $group: {
        _id: "$createdBy",
        totalLeadsGenerated: { $sum: 1 },
        convertedLeads: {
          $sum: {
            $cond: [{ $eq: ["$status", "CONVERTED"] }, 1, 0],
          },
        },
        forwardedLeads: {
          $sum: {
            $cond: [{ $in: ["$status", ["FORWARDED", "ASSIGNED"]] }, 1, 0],
          },
        },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      id: String(member._id),
      fullName: member.fullName,
      email: member.email,
      role: member.role,
      zone: getUserZone(member),
      state: member.state || "",
      phone: member.phone || "",
      department: member.department || "",
      scope: member.scope || "",
      profileImage: member.profileImageUrl || "",
      isActive: Boolean(member.isActive),
      accessStatus: member.accessStatus,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      totalLeadsGenerated: Number(leadStats?.totalLeadsGenerated || 0),
      convertedLeads: Number(leadStats?.convertedLeads || 0),
      forwardedLeads: Number(leadStats?.forwardedLeads || 0),
    },
  });
});

exports.deleteManagedMember = asyncHandler(async (req, res) => {
  const managerZone = getUserZone(req.user);
  const managerState = getUserState(req.user);
  const { id } = req.params;

  if (!managerZone || !managerState) {
    throw createHttpError(403, "State Manager zone/state is not configured.");
  }

  const member = await CrmUser.findOne({
    _id: id,
    role: { $in: MANAGED_MEMBER_ROLES },
    ...buildTerritoryFilter(managerZone),
    state: managerState,
  }).select("_id fullName email role");

  if (!member) {
    throw createHttpError(404, "Team member not found in your state.");
  }

  member.isActive = false;
  member.accessStatus = "RESTRICTED";
  await member.save();

  if (member.role === "FSE") {
    await Lead.updateMany(
      {
        assignedTo: member._id,
        status: { $nin: ["CONVERTED", "LOST", "REJECTED"] },
      },
      {
        $set: {
          assignedTo: null,
          assignedBy: req.user._id,
          updatedBy: req.user._id,
          status: "FORWARDED",
        },
      },
    );
  }

  res.status(200).json({
    success: true,
    message: `${member.role === "FSE" ? "FSE" : "Lead Generator"} deleted successfully.`,
    data: {
      id: String(member._id),
      role: member.role,
      email: member.email,
    },
  });
});

exports.assignLead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { fseId } = req.body;

  if (!fseId || typeof fseId !== "string" || fseId.length !== 24) {
    throw createHttpError(400, "Valid fseId is required.");
  }

  const managerZone = getUserZone(req.user);
  const managerState = getUserState(req.user);
  if (!managerZone) {
    throw createHttpError(403, "State Manager zone is not configured.");
  }
  if (!managerState) {
    throw createHttpError(403, "State Manager state is not configured.");
  }

  const [lead, fse] = await Promise.all([
    Lead.findById(id).populate("createdBy", "territory fullName"),
    CrmUser.findById(fseId),
  ]);

  if (!lead) {
    throw createHttpError(404, "Lead not found");
  }

  if (!fse || fse.role !== "FSE" || !fse.isActive || fse.accessStatus === "RESTRICTED") {
    throw createHttpError(404, "Active FSE not found");
  }

  const leadZone = inferZoneFromTerritory(lead.createdBy?.territory);
  const fseZone = getUserZone(fse);
  const fseState = getUserState(fse);
  const leadState = normalizeIndianStateInput(lead.state);

  if (!leadZone || leadZone !== managerZone) {
    throw createHttpError(403, "This lead does not belong to your zone.");
  }

  if (!leadState || leadState !== managerState) {
    throw createHttpError(403, "This lead does not belong to your state.");
  }

  if (!managerOwnsLead(lead, req.user._id)) {
    throw createHttpError(403, "This lead is not assigned to your account.");
  }

  if (!fseZone || fseZone !== managerZone) {
    throw createHttpError(403, "FSE must belong to the same zone as the State Manager.");
  }

  if (!fseState || fseState !== managerState) {
    throw createHttpError(403, "FSE must belong to the same state as the State Manager.");
  }

  lead.status = "ASSIGNED";
  lead.assignedTo = fseId;
  lead.assignedBy = req.user._id;
  lead.updatedBy = req.user._id;

  await lead.save();

  const updatedLead = await Lead.findById(lead._id)
    .populate("createdBy", "fullName territory email")
    .populate("assignedTo", "fullName email territory profileImageUrl");

  res.status(200).json({
    success: true,
    message: "Lead assigned successfully",
    data: updatedLead
  });
});

exports.getDashboard = asyncHandler(async (req, res) => {
  const myZone = getUserZone(req.user);
  const myState = getUserState(req.user);
  if (!myZone) {
    throw createHttpError(403, "Unable to resolve zone for this State Manager account.");
  }
  if (!myState) {
    throw createHttpError(403, "Unable to resolve state for this State Manager account.");
  }

  const [zoneLGUsers, zoneFSEUsers] = await Promise.all([
    CrmUser.find({
      role: "LEAD_GENERATOR",
      ...buildTerritoryFilter(myZone),
      state: myState,
    }).select("_id"),
    CrmUser.find({
      role: "FSE",
      ...buildTerritoryFilter(myZone),
      state: myState,
      isActive: true,
      accessStatus: { $ne: "RESTRICTED" },
    })
      .sort({ updatedAt: -1, createdAt: -1 })
      .select("_id fullName territory profileImageUrl"),
  ]);

  const generatorIds = zoneLGUsers.map((user) => user._id);
  const fseIds = zoneFSEUsers.map((user) => user._id);

  const [leads, fseOpenLeadCounts, managedFseIds, recentAssigned] = await Promise.all([
    Lead.find({
      createdBy: { $in: generatorIds },
      ...buildManagerOwnershipFilter(req.user._id),
    }).sort({ updatedAt: -1 }),
    fseIds.length
      ? Lead.aggregate([
          {
            $match: {
              assignedBy: req.user._id,
              assignedTo: { $in: fseIds },
              status: { $nin: ["CONVERTED", "LOST", "REJECTED"] },
            },
          },
          {
            $group: {
              _id: "$assignedTo",
              activeLeads: { $sum: 1 },
            },
          },
        ])
      : Promise.resolve([]),
    fseIds.length
      ? Lead.distinct("assignedTo", {
          assignedBy: req.user._id,
          assignedTo: { $in: fseIds },
        })
      : Promise.resolve([]),
    Lead.find({
      assignedBy: req.user._id,
      assignedTo: { $in: fseIds },
      status: { $in: ["ASSIGNED", "CONVERTED", "LOST", "REJECTED"] },
    })
      .populate("assignedTo", "fullName profileImageUrl")
      .sort({ updatedAt: -1 })
      .limit(50),
  ]);

  const pendingValidation = leads.filter((lead) => lead.status === "FORWARDED").length;
  const totalAssigned = leads.filter((lead) => lead.status === "ASSIGNED").length;
  const converted = leads.filter((lead) => lead.status === "CONVERTED").length;
  const conversionRate = totalAssigned + converted > 0
    ? Math.round((converted / (totalAssigned + converted)) * 100)
    : 0;

  const activeLeadMap = new Map(
    fseOpenLeadCounts.map((item) => [String(item._id), Number(item.activeLeads || 0)]),
  );

  const managedFseIdSet = new Set(managedFseIds.map((id) => String(id)));
  const scopedFSEUsers = zoneFSEUsers.filter((fse) => managedFseIdSet.has(String(fse._id)));

  const teamOverview = scopedFSEUsers.map((fse) => {
    const name = fse.fullName || "FSE";
    const initials = name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "F";

    return {
      id: String(fse._id),
      initials,
      name,
      location: myState,
      activeLeads: activeLeadMap.get(String(fse._id)) || 0,
      status: "Active",
      profileImage: fse.profileImageUrl || "",
    };
  });

  const recentActivity = recentAssigned.map((lead) => ({
    id: String(lead._id),
    type: lead.status === "CONVERTED" ? "success" : lead.status === "REJECTED" || lead.status === "LOST" ? "danger" : "primary",
    text: `Lead ${lead.leadCode || "#"} ${lead.status.toLowerCase()} by ${lead.assignedTo?.fullName || "FSE"}`,
    time: new Date(lead.updatedAt).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  res.status(200).json({
    success: true,
    data: {
      pendingValidation,
      activeFses: scopedFSEUsers.length,
      totalAssigned,
      conversionRate: `${conversionRate}%`,
      conversionGrowth: "0%",
      teamOverview,
      recentActivity
    }
  });
});

exports.updateLeadStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const ALLOWED_STATUSES = ["CONVERTED", "FORWARDED", "REJECTED", "ASSIGNED", "LOST"];

  const nextStatus = String(status || "").toUpperCase();

  if (!ALLOWED_STATUSES.includes(nextStatus)) {
    throw createHttpError(400, "Invalid status upgrade");
  }

  const managerZone = getUserZone(req.user);
  const managerState = getUserState(req.user);
  if (!managerZone) {
    throw createHttpError(403, "State Manager zone is not configured.");
  }
  if (!managerState) {
    throw createHttpError(403, "State Manager state is not configured.");
  }

  const lead = await Lead.findById(id).populate("createdBy", "territory");

  if (!lead) {
    throw createHttpError(404, "Lead not found");
  }

  const leadZone = inferZoneFromTerritory(lead.createdBy?.territory);
  const leadState = normalizeIndianStateInput(lead.state);
  if (!leadZone || leadZone !== managerZone) {
    throw createHttpError(403, "You can only update leads from your own zone.");
  }
  if (!leadState || leadState !== managerState) {
    throw createHttpError(403, "You can only update leads from your own state.");
  }

  if (!managerOwnsLead(lead, req.user._id)) {
    throw createHttpError(403, "This lead is not assigned to your account.");
  }

  if (nextStatus === "ASSIGNED" && !lead.assignedTo) {
    throw createHttpError(400, "Lead must be assigned to an FSE before moving to ASSIGNED.");
  }

  lead.status = nextStatus;
  lead.updatedBy = req.user._id;

  if (nextStatus === "CONVERTED") {
    lead.convertedAt = new Date();
  }

  await lead.save();

  res.status(200).json({
    success: true,
    message: "Lead status updated",
    data: lead
  });
});
