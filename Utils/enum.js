const moment = require("moment");
const date = {
  currentMonth: moment().format("YYYY-MM"),
  firstDateOfMonth: moment().startOf("month").format("YYYY-MM-DD"),
  currentDate: moment().format("YYYY-MM-DD"),
};
const transactionTypes = {
  RECEIVED: 1,
  RECEIVABLE: 2,
  SPENT: 3,
  GIVE_A_LOAN: 4,
  TAKE_A_LOAN: 5,
  REPAY_A_LOAN: 6,
};
const notificationTypes = {
  ADD_FRIEND: { id: 1, msg: "FRIEND_ADDED" },
  REMOVE_FRIEND: { id: 2, msg: "FRIEND_REMOVED" },
};
const dbs = Object.freeze({
  EABHA_PROD: process.env.EABHA_PROD,
  EABHA_DEV: process.env.EABHA_DEV,
});

const deployed_db_urls = {
  office: `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@eabhabackend.o0wkwav.mongodb.net/${dbs.EABHA_PROD}?retryWrites=true&w=majority&appName=EabhaBackend`,
  home: `mongodb://${process.env.USER}:${process.env.PASSWORD}@ac-g2d4z2j-shard-00-00.o0wkwav.mongodb.net:27017,ac-g2d4z2j-shard-00-01.o0wkwav.mongodb.net:27017,ac-g2d4z2j-shard-00-02.o0wkwav.mongodb.net:27017/${dbs.EABHA_PROD}?ssl=true&replicaSet=atlas-7ocb8t-shard-0&authSource=admin&retryWrites=true&w=majority&appName=EabhaBackend`,
};
const local_db_url = `mongodb://127.0.0.1:27017/eabha-accountease`;
const cors_origin = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://eabha-accountease.web.app",
];
const cors_methods = ["GET", "POST", "DELETE"];

module.exports = Object.freeze({
  dateEnum: date,
  transactionTypesEnum: transactionTypes,
  // dbUrl: local_db_url,
  dbUrl: deployed_db_urls.office,
  corsOrigin: cors_origin,
  corsMethods: cors_methods,
  notificationTypesEnum: notificationTypes,
});
