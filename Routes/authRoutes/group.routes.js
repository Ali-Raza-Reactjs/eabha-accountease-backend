const {
  addGroup,
  getAllGroups,
  updateGroup,
  deleteGroup,
  getExpenses,
  addSharedGroup,
  updateSharedGroup,
  deleteSharedGroup,
  getAllSharedGroups,
  getAllSharedGroupMembersByGroupId,
  addContributionInSharedGroup,
  updateContributionInSharedGroup,
  deleteContributionInSharedGroup,
  getSharedGroupTotalExpensesAmountByGroupId,
} = require("../../Controllers/group.controller");

const router = require("express").Router();

router.post("/addGroup", addGroup);
router.post("/addSharedGroup", addSharedGroup);
router.post("/updateGroup", updateGroup);
router.post("/updateSharedGroup", updateSharedGroup);
router.delete("/deleteGroup/:groupId", deleteGroup);
router.delete("/deleteSharedGroup/:groupId", deleteSharedGroup);
router.get("/getAllGroups", getAllGroups);
router.post(
  "/getAllSharedGroupMembersByGroupId",
  getAllSharedGroupMembersByGroupId
);
router.post(
  "/getSharedGroupTotalExpensesAmountByGroupId",
  getSharedGroupTotalExpensesAmountByGroupId
);
router.get("/getAllSharedGroups", getAllSharedGroups);
router.get("/getExpenses/:groupId", getExpenses);
router.post("/addContributionInSharedGroup", addContributionInSharedGroup);
router.post(
  "/updateContributionInSharedGroup",
  updateContributionInSharedGroup
);
router.delete(
  "/deleteContributionInSharedGroup/:contributionId",
  deleteContributionInSharedGroup
);

module.exports = router;
