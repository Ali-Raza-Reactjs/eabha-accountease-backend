const {
  addGroup,
  getAllGroups,
  updateGroup,
  deleteGroup,
  getExpenses,
} = require("../../Controllers/group.controller");

const router = require("express").Router();

router.post("/addGroup", addGroup);
router.post("/updateGroup", updateGroup);
router.delete("/deleteGroup/:groupId", deleteGroup);
router.get("/getAllGroups", getAllGroups);
router.get("/getExpenses/:groupId",   getExpenses);

module.exports = router;
