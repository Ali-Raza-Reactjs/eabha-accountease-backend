const mongoose = require("mongoose");
const SharedGroupContributedAmountSchema = mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    groupId: {
      type: mongoose.Types.ObjectId,
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
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Shared_Group_Contributed_Amount_History",
  SharedGroupContributedAmountSchema
);
