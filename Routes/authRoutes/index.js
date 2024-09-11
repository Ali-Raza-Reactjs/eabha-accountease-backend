const router = require("express").Router();
const transactionRouter = require("./transaction.routes");
const memberRouter = require("./member.routes");
const groupRouter = require("./group.routes");
const friendRouter = require("./friends.routes");
const expenseRouter = require("./expenses.routes");

router.use("/transaction", transactionRouter);
router.use("/member", memberRouter);
router.use("/group", groupRouter);
router.use("/friend", friendRouter);
router.use("/expense", expenseRouter);

module.exports = router;
