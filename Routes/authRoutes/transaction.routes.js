const {
  getTransactionTypes,
  addTransaction,
  getMemberTransactionDetails,
  deleteTransaction,
  updateTransaction,
  getTransactionCategories,
  addLoanTransaction,
  getMemberTransactionLoanDetails,
  revertLoanTransaction,
} = require("../../Controllers/transaction.controller");
const router = require("express").Router();

router.get("/getTransactionTypes", getTransactionTypes);
router.get("/getTransactionCategories", getTransactionCategories);
router.post("/addTransaction", addTransaction);
router.post("/addLoanTransaction", addLoanTransaction);
router.get("/getMemberTransactionLoanDetails", getMemberTransactionLoanDetails);
router.post("/updateTransaction", updateTransaction);
router.post("/getMemberTransactionDetails", getMemberTransactionDetails);
router.delete("/deleteTransaction/:transactionId", deleteTransaction);
router.post("/revertLoanTransaction", revertLoanTransaction);

module.exports = router;
