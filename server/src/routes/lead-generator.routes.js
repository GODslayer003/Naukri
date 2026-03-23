const express = require("express");
const controller = require("../controllers/lead-generator.controller");
const { protectCRM } = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

const router = express.Router();

router.post("/auth/signup", controller.signup);
router.post("/auth/login", controller.login);

router.use(protectCRM);
router.use(role("LEAD_GENERATOR", "STATE_MANAGER", "APPROVER", "ADMIN"));

router.get("/meta", controller.getLeadGeneratorMeta);
router.get("/dashboard", controller.getLeadGeneratorDashboard);
router.get("/leads", controller.getLeads);
router.post("/leads", controller.createLead);
router.patch("/leads/:id/status", controller.updateLeadStatus);

module.exports = router;