const mongoose = require("mongoose");
const { required } = require("nodemon/lib/config");
const NotificationSchema = mongoose.Schema(
  {
    fromMemberId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    toMemberId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    type: {
      type: Number,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    open: {
      type: Boolean,
      default: false,
    },
    dbRecordId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("notification", NotificationSchema);
