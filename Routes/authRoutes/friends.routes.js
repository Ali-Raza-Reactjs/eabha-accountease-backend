const {
  getFriends,
  addFriends,
  deleteFriend,
} = require("../../Controllers/friend.controller");

const router = require("express").Router();

router.get("/getFriends", getFriends);
router.post("/addFriends", addFriends);
router.delete("/deleteFriend/:memberId", deleteFriend);

module.exports = router;
