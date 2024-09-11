const mongoose = require("mongoose");
const PaymentSchema = mongoose.Schema(
  {
    paymentMonth: {
      type: String,
      required: true,
    },
    paymentDate: {
      type: String,
      required: true,
    },
    paymentMethodId: {
      type: Number,
      required: true,
    },
    paymentStatusId: {
      type: Number,
      required: true,
    },
    memberId: {
      type: Number,
      required: true,
    },
    paymentAmount: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    attachment: {
      type: String,
      required: false,
    },
    createdOn: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentHistory", PaymentSchema);
