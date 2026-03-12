const express = require("express");
const { protectAdmin } = require("../middleware/admin.middleware");
const adminController = require("../controllers/admin.controller");

const router = express.Router();

router.post("/auth/login", adminController.login);
router.get("/auth/me", protectAdmin, adminController.me);

router.get("/dashboard", protectAdmin, adminController.getDashboard);
router.get("/sections/:sectionKey", protectAdmin, adminController.getSection);

router.get("/users", protectAdmin, adminController.getUsers);
router.post("/users", protectAdmin, adminController.createUser);
router.put("/users/:source/:id", protectAdmin, adminController.updateUser);
router.delete("/users/:source/:id", protectAdmin, adminController.deleteUser);

router.get("/roles", protectAdmin, adminController.getRoles);
router.post("/roles", protectAdmin, adminController.createRole);
router.patch("/roles/:id/permissions", protectAdmin, adminController.updateRolePermissions);
router.post("/roles/:id/assign", protectAdmin, adminController.assignRole);

module.exports = router;
