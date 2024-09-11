const dateEnum = require("./enum");

class FilterModel {
  createdFrom = dateEnum.firstDateOfMonth();
  createdTo = dateEnum.currentDate();
  start = 0;
  length = 1000;
  search = "";
  sortDir = -1; // 1 for ascending, -1 for descending
}

class ApiResponseModel {
  status = false;
  msg = "";
  id = null;
  data = [];
  errors = {};
}
class GroupMemberExpenseBalanceAdjustementsModel {
  createdAt = new Date().toISOString();
  updatedAt = null;
  expenseId = null;
  receivedAmontId = null;
  prevBalance = 0;
  adjustmentAmount = 0;
  newBalance = 0;
  type = "+";
}

module.exports = {
  FilterModel,
  ApiResponseModel,
  GroupMemberExpenseBalanceAdjustementsModel,
};
