const {
  getAllMembersForAddGroup,
  getSingleMemberData,
  updateProfile,
  updatePassword,
  resetPassword,
  getMemberUsingUsernameOrEmail,
  getAllMembersForUpdateGroup,
} = require("../../Controllers/member.controller");

const router = require("express").Router();

router.get(
  "/getMemberUsingUsernameOrEmail/:usernameOrEmail",
  getMemberUsingUsernameOrEmail
);
router.get("/getAllMembersForAddGroup", getAllMembersForAddGroup);
router.get(
  "/getAllMembersForUpdateGroup/:groupId",
  getAllMembersForUpdateGroup
);
router.get("/getSingleMemberData", getSingleMemberData);
router.post("/updateProfile", updateProfile);
router.post("/updatePassword", updatePassword);
router.post("/resetPassword", resetPassword);

module.exports = router;
