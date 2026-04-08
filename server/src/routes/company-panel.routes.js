const express = require("express");
const controller = require("../controllers/company-panel.controller");
const { protectUser } = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

const router = express.Router();

router.post("/auth/login", controller.login);

router.use(protectUser);
router.use(role("CLIENT"));

router.get("/dashboard", controller.getDashboard);
router.post("/jobs", controller.createJob);
router.get("/applications", controller.getApplications);
router.patch("/applications/:applicationId/status", controller.updateApplicationStatus);
router.get("/applications/:applicationId/resume/preview", controller.previewApplicationResume);
router.get("/profile", controller.getProfile);
router.patch("/profile", controller.updateProfile);

module.exports = router;
