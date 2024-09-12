const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();
const router = require("./Routes/index");
const app = express();
const cookieParser = require("cookie-parser");

const dbs = Object.freeze({
  EABHA_PROD: process.env.EABHA_PROD,
  EABHA_DEV: process.env.EABHA_DEV,
});
const db_connection = Object.freeze({
  office: `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@eabhabackend.o0wkwav.mongodb.net/${dbs.EABHA_PROD}?retryWrites=true&w=majority&appName=EabhaBackend`,
  home: `mongodb://${process.env.USER}:${process.env.PASSWORD}@ac-g2d4z2j-shard-00-00.o0wkwav.mongodb.net:27017,ac-g2d4z2j-shard-00-01.o0wkwav.mongodb.net:27017,ac-g2d4z2j-shard-00-02.o0wkwav.mongodb.net:27017/${dbs.EABHA_PROD}?ssl=true&replicaSet=atlas-7ocb8t-shard-0&authSource=admin&retryWrites=true&w=majority&appName=EabhaBackend`,
});
// const db_connection = Object.freeze({
//   office: `mongodb://127.0.0.1:27017/eabha-accountease`,
//   home: `mongodb://127.0.0.1:27017/eabha-accountease`,
// });

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
      "https://eabha-accountease.web.app/",
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
