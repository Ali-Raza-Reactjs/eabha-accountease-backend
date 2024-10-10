const {
  getGroupMembersExpenses,
  addGroupMembersExpenses,
  getExpenses,
  deleteExpense,
  updateExpense,
  receivedAmout,
  addSharedGroupExpense,
  getSharedGroupExpenses,
  getSharedGroupContributions,
  updateSharedGroupExpense,
  deleteSharedGroupExpense,
} = require("../../Controllers/expenses.controller");

const router = require("express").Router();

router.get("/getGroupMembersExpenses/:groupId", getGroupMembersExpenses);
router.post("/getExpenses", getExpenses);
router.post("/getSharedGroupExpenses", getSharedGroupExpenses);
router.post("/getSharedGroupContributions", getSharedGroupContributions);
router.post("/addGroupMembersExpenses", addGroupMembersExpenses);
router.post("/updateGroupMembersExpenses", updateExpense);
router.delete("/deleteExpense/:groupId/:expenseId", deleteExpense);
router.post("/receivedAmout", receivedAmout);
router.post("/addSharedGroupExpense", addSharedGroupExpense);
router.post("/updateSharedGroupExpense", updateSharedGroupExpense);
router.delete("/deleteSharedGroupExpense/:contributionId", deleteSharedGroupExpense);
module.exports = router;
