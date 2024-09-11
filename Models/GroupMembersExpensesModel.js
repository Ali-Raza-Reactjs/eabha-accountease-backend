const mongoose = require("mongoose");
const membersExpenseSchema = mongoose.Schema({
  groupId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  memberId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  expenseBalance: {
    type: Number,
    required: true,
  },
  balanceAdjustmentDetails: {
    type: Array,
    required: false,
  },
});

module.exports = mongoose.model("group_members_expense", membersExpenseSchema);
