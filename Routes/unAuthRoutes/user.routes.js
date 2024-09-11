const {
  sigup,
  signin,
  sendSignupVerificationOtp,
  verifySignupOtp,
} = require("../../Controllers/user.controller");
const router = require("express").Router();

router.post("/signin", signin);
router.post("/signup", sigup);
router.post("/sendSignupVerificationOtp", sendSignupVerificationOtp);
router.post("/verifySignupOtp", verifySignupOtp);

module.exports = router;
