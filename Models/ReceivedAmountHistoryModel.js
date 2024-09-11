const mongoose = require("mongoose");
const PaymentSchema = mongoose.Schema(
  {
    receivedDate: {
      type: Date,
      required: true,
    },
    groupId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    fromMemberId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    toMemberId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    receivedAmount: {
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

module.exports = mongoose.model("Received_Amount_History", PaymentSchema);
