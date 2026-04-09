const Job = require("../models/Job");
const Company = require("../models/Company");
const {
  loadPackageCatalog,
  applyCompanyPackageSnapshot,
} = require("../services/package-limit.service");

// Create job (CLIENT or CRM)
exports.createJob = async (req, res) => {
  const { title, description, location } = req.body;

  let companyId;

  if (req.user.role === "CLIENT") {
    companyId = req.user.companyId;
  } else if (req.user.role === "CRM") {
    companyId = req.body.companyId;
  }

  const company = await Company.findById(companyId);
  if (!company) {
    return res.status(404).json({ message: "Company not found" });
  }

  const { packageLimitMap } = await loadPackageCatalog();
  const packageSnapshot = applyCompanyPackageSnapshot(company, packageLimitMap);

  if (packageSnapshot.dirty) {
    await company.save();
  }

  if (company.activeJobCount >= packageSnapshot.jobLimit) {
    return res.status(400).json({
      message: "Job limit exceeded for this package",
    });
  }

  const job = await Job.create({
    title,
    description,
    location,
    companyId,
    createdBy: req.user._id,
    approvalStatus:
      req.user.role === "CRM" ? "APPROVED" : "PENDING",
  });

  if (job.approvalStatus === "APPROVED") {
    company.activeJobCount += 1;
    await company.save();
  }

  res.status(201).json(job);
};

// CRM approves job
exports.approveJob = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  job.approvalStatus = "APPROVED";
  await job.save();

  const company = await Company.findById(job.companyId);
  if (!company) {
    return res.status(404).json({ message: "Company not found" });
  }

  const { packageLimitMap } = await loadPackageCatalog();
  const packageSnapshot = applyCompanyPackageSnapshot(company, packageLimitMap);

  if (packageSnapshot.dirty) {
    await company.save();
  }

  if (company.activeJobCount >= packageSnapshot.jobLimit) {
    return res.status(400).json({ message: "Job limit exceeded for this package" });
  }

  company.activeJobCount += 1;
  await company.save();

  res.json({ message: "Job approved" });
};
