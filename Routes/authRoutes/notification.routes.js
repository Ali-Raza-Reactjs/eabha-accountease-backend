const {
  getNotifications,
  updateNotificationReadStatus,
  updateNotificationOpenStatus,
} = require("../../Controllers/notification.controller");
const router = require("express").Router();
router.get("/getNotifications", getNotifications);
router.get("/updateNotificationOpenStatus", updateNotificationOpenStatus);
router.get("/updateNotificationReadStatus/:notificationId", updateNotificationReadStatus);

module.exports = router;
