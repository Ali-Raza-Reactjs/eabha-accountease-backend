const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    img: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    isShared: {
      type: Boolean,
      default: false,
    },
    members: {
      type: Array,
      default: [],
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

module.exports = mongoose.model("Group", userSchema);
