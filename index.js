const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();
const router = require("./Routes/index");
const app = express();
const cookieParser = require("cookie-parser");

// const dbs = Object.freeze({
//   EABHA_PROD: process.env.EABHA_PROD,
//   EABHA_DEV: process.env.EABHA_DEV,
// });
const db_connection = Object.freeze({
  office: `mongodb://127.0.0.1:27017/eabha-accountease`,
  home: `mongodb://127.0.0.1:27017/eabha-accountease`,
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Eabha Accountease" });
});
app.listen(8000, () => {
  console.log("Server started on PORT 8000");
});
mongoose
  .connect(db_connection.home)
  .then(() => {
    console.log("mongodb connected");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://eabha-foundation.web.app",
    ],
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());
app.use("/api", router);
