const { login, sendOTP } = require("../Controllers/AuthControllers");
const router = require("express").Router();
router.post("/login", login);
router.post("/send-otp", sendOTP);

module.exports = router;
