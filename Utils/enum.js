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
module.exports = Object.freeze({
  dateEnum: date,
  transactionTypesEnum: transactionTypes,
});
