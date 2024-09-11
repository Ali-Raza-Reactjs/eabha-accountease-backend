const {
  register,
  createPaymentHistory,
  getTotalAmount,
  getMembersData,
  getPaymentMethods,
  getPaymentStatuses,
  getInstallmentStatuses,
  updatePaymentStatus,
  getSingleMemberData,
  deletePaymentHistory,
  updatePassword,
  updateProfile,
  getAllMembers,
  addExpense,
  getMemberExpenses,
  getAllExpenses,
  revceivedAmount,
  getAmountSum,
  getMembersAmountDetails,
  getTotalAmountDetails,
  getThisMonthAmountDetails,
  getSingleMembersAmountDetails,
  loadMemberExpensesHistory,
  membersExpenseHistory,
  getMembersExpenseHistory,
  getMembersExpenseSummary,
  getTransactionTypes,
  addTransaction,
  getMemberTransactionDetails,
  deleteTransaction,
  updateTransaction,
  getTransactionCategories,
  getReceivedHistroy,
  GetReceivedHistory,
} = require("../Controllers/AuthControllers");
const multer = require("multer");
const { checkAuthorization } = require("../Middlewares/AuthMiddlewares");
const router = require("express").Router();

// testing comment
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads");
    },
    filename: function (req, file, cb) {
      const fileName = file.fieldname + "-" + Date.now() + ".jpg";
      cb(null, fileName);
      req.filename = fileName;
    },
  }),
}).single("profilePhoto");

router.post("/update-profile", updateProfile);
router.post("/", checkAuthorization);
router.post("/register", register);
router.post("/update-password", updatePassword);

// payment history
router.post("/create-payment-history", createPaymentHistory);
router.delete(
  "/delete-payment-history/:paymentHistoryId",
  deletePaymentHistory
);
router.delete("/deleteTransaction/:transactionId", deleteTransaction);
router.post("/updateTransaction", updateTransaction);

// dashboard total
router.post("/get-total-amount", getTotalAmount);

// dashboard table
router.post("/get-members-data", getMembersData);
router.get("/get-single-member-data/:memberId", getSingleMemberData);
router.post("/getReceivedHistory", GetReceivedHistory);
router.get("/getAllMembers", getAllMembers);

// lookup
router.get("/get-payment-methods", getPaymentMethods);
router.get("/get-payment-statuses", getPaymentStatuses);
router.get("/get-installment-statuses", getInstallmentStatuses);
router.get("/getTransactionTypes", getTransactionTypes);
router.get("/getTransactionCategories", getTransactionCategories);

// update payment status
router.post("/update-payment-status", updatePaymentStatus);
router.post("/addExpense", addExpense);
router.get("/getMemberExpenses", getMemberExpenses);
router.post("/getAllExpenses", getAllExpenses);
router.post("/revceivedAmount", revceivedAmount);

// ..................................
// optimization

// dashboard
router.get("/getAmountSum", getAmountSum);
router.get("/getTotalAmountDetails", getTotalAmountDetails);
router.get(
  "/getThisMonthAmountDetails/:paymentMethodId",
  getThisMonthAmountDetails
);
router.get("/getMembersAmountDetails", getMembersAmountDetails);
router.get(
  "/getSingleMembersAmountDetails/:memberId",
  getSingleMembersAmountDetails
);
router.post("/loadMemberExpensesHistory", loadMemberExpensesHistory);
router.post("/getMembersExpenseSummary", getMembersExpenseSummary);
router.post("/addTransaction", addTransaction);
router.post("/getMemberTransactionDetails", getMemberTransactionDetails);

module.exports = router;
