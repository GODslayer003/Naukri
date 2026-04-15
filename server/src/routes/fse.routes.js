const express = require("express");
const controller = require("../controllers/fse.controller");
const { protectCRM } = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const uploadProfilePhoto = require("../middleware/profile-image-upload.middleware");

const router = express.Router();

router.post("/auth/login", controller.login);

router.use(protectCRM);
router.use(role("FSE", "ADMIN"));

router.patch("/auth/change-password", controller.changePassword);
router.get("/meta", controller.getLeadMeta);
router.get("/dashboard", controller.getDashboard);
router.post("/leads", controller.createLead);
router.get("/leads", controller.getLeads);
router.patch("/leads/:id/status", controller.updateLeadStatus);
router.patch("/leads/:id/projection", controller.updateLeadProjection);
router.post("/leads/:id/activity", controller.logLeadActivity);
router.delete("/leads/:id/activity/:index", controller.deleteLeadActivity);
router.get("/profile", controller.getProfile);
router.patch("/profile", controller.updateProfile);
router.patch("/profile/photo", uploadProfilePhoto, controller.uploadProfilePhoto);

module.exports = router;
