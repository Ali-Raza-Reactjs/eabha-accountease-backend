const mongoose = require("mongoose");
const membersTransactionSchema = mongoose.Schema(
  {
    memberId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    date: {
      type: Date,
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
    additionalType: {
      type: Number,
      required: false,
      default: 0,
    },
    category: {
      type: Number,
      required: false,
      default: 0,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "members_transactions",
  membersTransactionSchema
);
