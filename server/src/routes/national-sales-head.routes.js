const express = require("express");
const controller = require("../controllers/national-sales-head.controller");
const { protectCRM } = require("../middleware/auth.middleware");

const router = express.Router();

// Public
router.post("/auth/login", controller.login);

// Protected - NSH only (enforced in controller guards)
router.use(protectCRM);

router.get("/dashboard", controller.getDashboard);
router.get("/zones", controller.getZoneStats);
router.get("/leads", controller.getAllLeads);
router.get("/performance/states", controller.getStatePerformance);
router.get("/performance/individual", controller.getIndividualPerformance);
router.get("/approvals/pending", controller.getPendingApprovals);
router.post("/approvals/:id/decision", controller.reviewApproval);
router.get("/approval-policy", controller.getApprovalPolicy);
router.put("/approval-policy", controller.updateApprovalPolicy);
router.get("/profile", controller.getProfile);

module.exports = router;
