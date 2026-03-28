const express = require("express");
const controller = require("../controllers/zonal-manager.controller");
const { protectCRM } = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const uploadProfilePhoto = require("../middleware/profile-image-upload.middleware");

const router = express.Router();

router.post("/auth/signup", controller.signup);
router.post("/auth/login", controller.login);

router.use(protectCRM);
router.use(role("ZONAL_MANAGER", "ADMIN"));

router.patch("/auth/change-password", controller.changePassword);
router.get("/dashboard", controller.getDashboard);
router.get("/leads", controller.getLeads);
router.get("/state-managers", controller.getStateManagers);
router.patch("/leads/:id/assign", controller.assignLead);
router.patch("/leads/:id/status", controller.updateLeadStatus);
router.post("/leads/:id/activity", controller.logLeadActivity);
router.delete("/leads/:id/activity/:index", controller.deleteLeadActivity);
router.get("/profile", controller.getProfile);
router.patch("/profile", controller.updateProfile);
router.patch("/profile/photo", uploadProfilePhoto, controller.uploadProfilePhoto);

module.exports = router;
