const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
require("dotenv").config();
const router = require("./Routes/index");
const { init } = require("./socket"); // Import the init function from socket.js
const _enum = require("./Utils/enum");
require("./Utils/cornJobs.js"); 

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = init(server);

io.on("connection", (socket) => {
  console.log("connected");
});

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://eabha-accountease.web.app",
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

server.listen(8000, () => {
  console.log("Server started on PORT 8000");
});

mongoose
  .connect(_enum.dbUrl)
  .then(() => {
    console.log("mongodb connected");
  })
  .catch((err) => {
    console.log(err.message);
  });
