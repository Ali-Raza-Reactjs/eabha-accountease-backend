const mongoose = require("mongoose");
const expenseSchema = mongoose.Schema(
  {
    groupId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    expenseDate: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    expenseAmount: {
      type: Number,
      required: true,
    },
    paidMemberDetails: {
      type: Object,
      required: true,
    },
    splitMemberDetails: {
      type: Object,
      required: true,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
    },
    updatedBy: {
      type: mongoose.Types.ObjectId,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("expense", expenseSchema);
