const mongoose = require("mongoose");
const membersExpenseSchema = mongoose.Schema({
  memberId: {
    type: Number,
    required: false,
  },
  expenseAmount: {
    type: Number,
    required: false,
  },
  adjustmentDetails: {
    type: Array,
    required: false,
  },
  _id: {
    type: Number,
    required: false,
  },
});

module.exports = mongoose.model("member_expenses", membersExpenseSchema);
