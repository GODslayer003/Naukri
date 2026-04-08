const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../middleware/async.middleware");
const User = require("../models/User");
const Company = require("../models/Company");
const Job = require("../models/Job");
const Application = require("../models/Application");
const CandidateProfile = require("../models/CandidateProfile");

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const toTrimmedString = (value) => (typeof value === "string" ? value.trim() : "");

const toSafeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const generateUserToken = (id) =>
  jwt.sign({ id, type: "USER" }, process.env.JWT_SECRET, { expiresIn: "7d" });

const formatRelativeTime = (value) => {
  if (!value) {
    return "Unavailable";
  }

  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
};

const resolveClientUserAndCompany = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user || user.role !== "CLIENT") {
    throw createHttpError(403, "Client access required");
  }

  if (!user.companyId) {
    throw createHttpError(403, "No company is linked to this account");
  }

  const company = await Company.findById(user.companyId);
  if (!company) {
    throw createHttpError(404, "Company not found");
  }

  return { user, company };
};

const formatCompanyForClient = (company) => {
  const activeJobCount = Number(company.activeJobCount || 0);
  const jobLimit = Number(company.jobLimit || 0);

  return {
    id: String(company._id),
    name: company.name,
    logoUrl: company.logoUrl || "",
    industry: company.industry || "",
    status: company.status || "ACTIVE",
    packageType: company.packageType || "STANDARD",
    jobLimit,
    activeJobCount,
    remainingSlots: Math.max(jobLimit - activeJobCount, 0),
    email: company.email || "",
    phone: company.phone || "",
    website: company.website || "",
    linkedIn: company.linkedIn || "",
    accountManager: company.accountManager || "",
    configurationNotes: company.configurationNotes || "",
    location: {
      city: company.location?.city || "",
      region: company.location?.region || "",
      zone: company.location?.zone || "",
      address: company.location?.address || "",
      pincode: company.location?.pincode || "",
    },
    updatedAt: company.updatedAt || null,
    lastUpdated: formatRelativeTime(company.updatedAt),
  };
};

exports.login = asyncHandler(async (req, res) => {
  const username = toTrimmedString(req.body.username);
  const email = toTrimmedString(req.body.email).toLowerCase();
  const password = toTrimmedString(req.body.password);

  if (!username || !email || !password) {
    throw createHttpError(400, "Username, email, and password are required");
  }

  const user = await User.findOne({ email, role: "CLIENT" }).select("+password");
  if (!user) {
    throw createHttpError(401, "Invalid credentials");
  }

  if (String(user.name || "").trim().toLowerCase() !== username.toLowerCase()) {
    throw createHttpError(401, "Invalid credentials");
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    throw createHttpError(401, "Invalid credentials");
  }

  if (!user.isActive || user.accessStatus === "RESTRICTED") {
    throw createHttpError(403, "Client account is inactive");
  }

  const company = user.companyId ? await Company.findById(user.companyId) : null;
  if (!company) {
    throw createHttpError(404, "Company profile not found");
  }

  if (company.status === "INACTIVE") {
    throw createHttpError(403, "Company profile is inactive");
  }

  res.status(200).json({
    success: true,
    token: generateUserToken(user._id),
    user: {
      id: String(user._id),
      username: user.name || "",
      email: user.email || "",
      role: user.role || "CLIENT",
      companyId: String(company._id),
      companyName: company.name || "",
    },
    company: formatCompanyForClient(company),
  });
});

exports.getDashboard = asyncHandler(async (req, res) => {
  const { company } = await resolveClientUserAndCompany(req.user._id);

  const [jobs, applications] = await Promise.all([
    Job.find({ companyId: company._id }).sort({ updatedAt: -1 }),
    Application.find({ companyId: company._id })
      .sort({ updatedAt: -1 })
      .populate("jobId", "title")
      .populate("candidateId", "name email"),
  ]);

  const candidateIds = [
    ...new Set(
      applications
        .map((item) => (item.candidateId?._id ? String(item.candidateId._id) : String(item.candidateId || "")))
        .filter(Boolean),
    ),
  ];

  const candidateProfiles = candidateIds.length
    ? await CandidateProfile.find({ userId: { $in: candidateIds } }).select(
        "userId phone currentTitle totalExperience currentCity currentState resume",
      )
    : [];

  const profileMap = new Map(
    candidateProfiles.map((profile) => [String(profile.userId), profile]),
  );

  const applicationCountByJob = new Map();
  applications.forEach((application) => {
    const jobId = application.jobId?._id ? String(application.jobId._id) : String(application.jobId || "");
    if (!jobId) {
      return;
    }
    applicationCountByJob.set(jobId, Number(applicationCountByJob.get(jobId) || 0) + 1);
  });

  const jobRows = jobs.map((job) => ({
    id: String(job._id),
    title: job.title || "",
    department: job.department || "",
    location: job.location || "",
    experience: job.experience || "",
    approvalStatus: job.approvalStatus || "PENDING",
    rejectionReason: job.rejectionReason || "",
    isActive: Boolean(job.isActive),
    createdBySource: job.createdBySource || "CLIENT",
    requiresPackageOverride: Boolean(job.requiresPackageOverride),
    applicantCount: Number(applicationCountByJob.get(String(job._id)) || 0),
    updatedAt: job.updatedAt || null,
    lastUpdated: formatRelativeTime(job.updatedAt),
  }));

  const applicationRows = applications.map((application) => {
    const candidateId = application.candidateId?._id
      ? String(application.candidateId._id)
      : String(application.candidateId || "");
    const profile = profileMap.get(candidateId);

    return {
      id: String(application._id),
      jobId: application.jobId?._id ? String(application.jobId._id) : String(application.jobId || ""),
      jobTitle: application.jobId?.title || "Unknown job",
      candidateId,
      candidateName: application.candidateId?.name || "Candidate",
      candidateEmail: application.candidateId?.email || "",
      candidatePhone: profile?.phone || "",
      candidateCurrentTitle: profile?.currentTitle || "",
      candidateExperience: profile?.totalExperience || "",
      candidateCity: profile?.currentCity || "",
      candidateState: profile?.currentState || "",
      status: application.status || "APPLIED",
      resumeUrl: application.resumeUrl || profile?.resume?.url || "",
      resumeFileName: application.resumeFileName || profile?.resume?.fileName || "",
      appliedAt: application.createdAt || null,
      updatedAt: application.updatedAt || null,
      lastUpdated: formatRelativeTime(application.updatedAt || application.createdAt),
    };
  });

  const approvedJobs = jobs.filter((job) => job.approvalStatus === "APPROVED");
  const pendingJobs = jobs.filter((job) => job.approvalStatus === "PENDING");
  const rejectedJobs = jobs.filter((job) => job.approvalStatus === "REJECTED");

  company.activeJobCount = approvedJobs.filter((job) => job.isActive).length;
  company.openRoles = company.activeJobCount;
  await company.save();

  res.status(200).json({
    success: true,
    data: {
      company: formatCompanyForClient(company),
      tracking: {
        totalJobs: jobs.length,
        activeApprovedJobs: approvedJobs.filter((job) => job.isActive).length,
        pendingApprovals: pendingJobs.length,
        rejectedJobs: rejectedJobs.length,
        packageOverflowRequests: pendingJobs.filter((job) => job.requiresPackageOverride).length,
        totalApplications: applications.length,
        uniqueCandidates: candidateIds.length,
      },
      jobs: jobRows,
      applications: applicationRows,
    },
  });
});

exports.createJob = asyncHandler(async (req, res) => {
  const { user, company } = await resolveClientUserAndCompany(req.user._id);

  if (company.status === "INACTIVE") {
    throw createHttpError(403, "Company profile is inactive");
  }

  const title = toTrimmedString(req.body.title);
  if (!title) {
    throw createHttpError(400, "Job title is required");
  }

  const activeApprovedCount = await Job.countDocuments({
    companyId: company._id,
    isActive: true,
    approvalStatus: "APPROVED",
  });
  const hasAvailablePackageSlot = activeApprovedCount < Number(company.jobLimit || 0);

  const rawSkills = Array.isArray(req.body.skills)
    ? req.body.skills
    : String(req.body.skills || "")
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

  const deadlineInput = toTrimmedString(req.body.deadline);
  const deadline = deadlineInput ? new Date(deadlineInput) : null;
  if (deadlineInput && Number.isNaN(deadline?.getTime())) {
    throw createHttpError(400, "Deadline must be a valid date");
  }

  const job = await Job.create({
    companyId: company._id,
    title,
    summary: toTrimmedString(req.body.summary),
    department: toTrimmedString(req.body.department),
    jobType: toTrimmedString(req.body.jobType),
    workplaceType: toTrimmedString(req.body.workplaceType),
    location: toTrimmedString(req.body.location),
    experience: toTrimmedString(req.body.experience),
    salaryMin: toSafeNumber(req.body.salaryMin, 0),
    salaryMax: toSafeNumber(req.body.salaryMax, 0),
    skills: rawSkills,
    deadline,
    description: toTrimmedString(req.body.description),
    approvalStatus: hasAvailablePackageSlot ? "APPROVED" : "PENDING",
    rejectionReason: "",
    createdBySource: "CLIENT",
    createdByClient: user._id,
    publishedByCRMAt: hasAvailablePackageSlot ? new Date() : null,
    packageSlotCount: hasAvailablePackageSlot ? 1 : 0,
    requiresPackageOverride: !hasAvailablePackageSlot,
    isActive: hasAvailablePackageSlot,
  });

  company.activeJobCount = hasAvailablePackageSlot ? activeApprovedCount + 1 : activeApprovedCount;
  company.openRoles = company.activeJobCount;
  await company.save();

  res.status(201).json({
    success: true,
    message: hasAvailablePackageSlot
      ? "Job posted successfully."
      : "Package limit reached. Job has been sent to CRM for approval.",
    data: {
      id: String(job._id),
      title: job.title,
      approvalStatus: job.approvalStatus,
      requiresPackageOverride: job.requiresPackageOverride,
      isActive: job.isActive,
      createdAt: job.createdAt,
    },
  });
});

exports.getProfile = asyncHandler(async (req, res) => {
  const { user, company } = await resolveClientUserAndCompany(req.user._id);

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: String(user._id),
        username: user.name || "",
        email: user.email || "",
      },
      company: formatCompanyForClient(company),
    },
  });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { user, company } = await resolveClientUserAndCompany(req.user._id);

  const nextUsername = toTrimmedString(req.body.username);
  const nextUserEmail = toTrimmedString(req.body.email).toLowerCase();
  const nextCompanyEmail = toTrimmedString(req.body.companyEmail).toLowerCase();

  if (nextUsername) {
    user.name = nextUsername;
  }

  if (nextUserEmail && nextUserEmail !== user.email) {
    const existingUser = await User.findOne({
      email: nextUserEmail,
      _id: { $ne: user._id },
    }).select("_id");

    if (existingUser) {
      throw createHttpError(409, "Another account already uses this email");
    }

    user.email = nextUserEmail;
  }

  const currentPassword = toTrimmedString(req.body.currentPassword);
  const newPassword = toTrimmedString(req.body.newPassword);
  if (currentPassword || newPassword) {
    if (!currentPassword || !newPassword) {
      throw createHttpError(400, "Current password and new password are required to update password");
    }

    const currentUserWithPassword = await User.findById(user._id).select("+password");
    const passwordMatches = await bcrypt.compare(currentPassword, currentUserWithPassword.password);
    if (!passwordMatches) {
      throw createHttpError(400, "Current password is incorrect");
    }

    currentUserWithPassword.password = await bcrypt.hash(newPassword, 10);
    await currentUserWithPassword.save();
  }

  if (nextCompanyEmail && nextCompanyEmail !== company.email) {
    const existingCompany = await Company.findOne({
      email: nextCompanyEmail,
      _id: { $ne: company._id },
    }).select("_id");

    if (existingCompany) {
      throw createHttpError(409, "Another company already uses this company email");
    }

    company.email = nextCompanyEmail;
  }

  company.phone = toTrimmedString(req.body.phone) || company.phone;
  company.industry = toTrimmedString(req.body.industry) || company.industry;
  company.website = toTrimmedString(req.body.website) || company.website;
  company.linkedIn = toTrimmedString(req.body.linkedIn) || company.linkedIn;

  company.location = {
    ...(company.location || {}),
    city: toTrimmedString(req.body.city) || company.location?.city || "",
    region: toTrimmedString(req.body.region) || company.location?.region || "",
    zone: toTrimmedString(req.body.zone) || company.location?.zone || "",
    address: toTrimmedString(req.body.address) || company.location?.address || "",
    pincode: toTrimmedString(req.body.pincode) || company.location?.pincode || "",
  };

  await Promise.all([user.save(), company.save()]);

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: {
      user: {
        id: String(user._id),
        username: user.name || "",
        email: user.email || "",
      },
      company: formatCompanyForClient(company),
    },
  });
});
