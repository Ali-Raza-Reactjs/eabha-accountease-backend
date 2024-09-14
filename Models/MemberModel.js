const mongoose = require("mongoose");

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
    phone: {
      type: Number,
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
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("member", memberSchema);
