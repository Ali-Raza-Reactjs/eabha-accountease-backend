const mongoose = require("mongoose");
const sharedGroupMembersExpenseSchema = mongoose.Schema(
  {
    groupId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
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
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("shared_group_members_expense", sharedGroupMembersExpenseSchema);
