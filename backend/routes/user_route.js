const express = require("express");
const router = express.Router();
const userController = require("../controllers/user_controller");
const authenticate = require("../config/middleware");

router.post("/register", userController.createUser);
router.post("/login", userController.loginUser);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);
router.get("/activate-account", userController.activateUser);

router.put("/update-fullname", authenticate, userController.updateFullName);
router.put("/update-email", authenticate, userController.updateEmail);
router.put("/update-username", authenticate, userController.updateUsername);
router.put("/update-password", authenticate, userController.updatePassword);

module.exports = router;
