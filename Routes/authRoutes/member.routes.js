const {
  getMemberUsingEmail,
  getAllMembersForAddGroup,
  getSingleMemberData,
  updateProfile,
  updatePassword,
  resetPassword,
} = require("../../Controllers/member.controller");

const router = require("express").Router();

router.get("/getMemberUsingEmail/:email", getMemberUsingEmail);
router.get("/getAllMembersForAddGroup/:groupId", getAllMembersForAddGroup);
router.get("/getSingleMemberData", getSingleMemberData);
router.post("/updateProfile", updateProfile);
router.post("/updatePassword", updatePassword);
router.post("/resetPassword", resetPassword);

module.exports = router;
