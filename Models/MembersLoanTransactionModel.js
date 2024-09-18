const mongoose = require("mongoose");
const membersLoanTransactionSchema = mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    memberId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "members_loan_transactions",
  membersLoanTransactionSchema
);
