const {
  getGroupMembersExpenses,
  addGroupMembersExpenses,
  getExpenses,
  deleteExpense,
  updateExpense,
  receivedAmout,
} = require("../../Controllers/expenses.controller");

const router = require("express").Router();

router.get("/getGroupMembersExpenses/:groupId", getGroupMembersExpenses);
router.post("/getExpenses", getExpenses);
router.post("/addGroupMembersExpenses", addGroupMembersExpenses);
router.post("/updateGroupMembersExpenses", updateExpense);
router.delete("/deleteExpense/:groupId/:expenseId", deleteExpense);
router.post("/receivedAmout", receivedAmout);
module.exports = router;
