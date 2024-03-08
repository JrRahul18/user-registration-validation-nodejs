const express = require("express")
const router = express.Router();

const userController = require("../controllers/User")

router.post("/register", userController.createUser)
router.post("/login", userController.loginUser)
router.get("/logout", userController.logoutUser);

router.post("/password/forget-password", userController.postForgetPassword)
router.post("/password/reset/:token", userController.resetPassword)
module.exports = router