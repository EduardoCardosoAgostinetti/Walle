const express = require("express");
const router = express.Router();
const userController = require("../controllers/user_controller");

router.post("/register", userController.createUser);
router.post("/login", userController.loginUser);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);
router.get("/activate-account", userController.activateUser);

router.put("/update/fullname", userController.updateFullName);
router.put("/update/email", userController.updateEmail);
router.put("/update/username", userController.updateUsername);
router.put("/update/password", userController.updatePassword);

module.exports = router;
