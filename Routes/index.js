const router = require("express").Router();
const authRouter = require("./authRoutes/index.js");
const unAuthRouter = require("./unAuthRoutes/index.js");
const { checkAuthorization } = require("../Middlewares/AuthMiddlewares");

router.use("/", unAuthRouter);
router.use("/", checkAuthorization, authRouter);
module.exports = router;
