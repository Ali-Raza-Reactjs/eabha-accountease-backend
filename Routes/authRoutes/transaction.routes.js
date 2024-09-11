const {
  getTransactionTypes,
  addTransaction,
  getMemberTransactionDetails,
  deleteTransaction,
  updateTransaction,
} = require("../../Controllers/transaction.controller");
const router = require("express").Router();

router.get("/getTransactionTypes", getTransactionTypes);
router.post("/addTransaction", addTransaction);
router.post("/updateTransaction", updateTransaction);
router.post("/getMemberTransactionDetails", getMemberTransactionDetails);
router.delete("/deleteTransaction/:transactionId", deleteTransaction);

module.exports = router;
