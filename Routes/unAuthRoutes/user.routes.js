const {
  sigup,
  signin,
  sendPasswordUpdateVerificationOtp,
  sendVerificationOtp,
  VerifyOtp,
} = require("../../Controllers/user.controller");
const router = require("express").Router();

router.post("/signin", signin);
router.post("/signup", sigup);
router.post("/sendVerificationOtp", sendVerificationOtp);
router.post(
  "/sendPasswordUpdateVerificationOtp",
  sendPasswordUpdateVerificationOtp
);
router.post("/verifyOtp", VerifyOtp);

module.exports = router;
