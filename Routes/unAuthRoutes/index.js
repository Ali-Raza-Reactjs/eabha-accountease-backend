const router = require("express").Router();
const userRouter = require("./user.routes");
router.use("/", userRouter);

module.exports = router;
