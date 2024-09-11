const mongoose = require("mongoose");
const groupsSchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  groupId: mongoose.Types.ObjectId,
});
const memberSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    profile: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "User ID is required"],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    friends: {
      type: Array,
      default: [],
    },
    groups: {
      type: Array,
      default: [groupsSchema],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("member", memberSchema);
