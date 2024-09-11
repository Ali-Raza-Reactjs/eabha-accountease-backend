const {
  getMemberUsingEmail,
  getAllMembersForAddGroup,
} = require("../../Controllers/member.controller");

const router = require("express").Router();

router.get("/getMemberUsingEmail/:email", getMemberUsingEmail);
router.get("/getAllMembersForAddGroup/:groupId", getAllMembersForAddGroup);

module.exports = router;
