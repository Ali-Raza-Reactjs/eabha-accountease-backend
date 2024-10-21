const cron = require("node-cron");
const NotificationModel = require("../Models/NotificationModel");

// Schedule a job to run daily
cron.schedule("0 0 * * *", async () => {
  // Runs every day at midnight
  const cutoffDate = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000); // 30 days ago
  await NotificationModel.deleteMany({
    createdAt: { $lt: cutoffDate },
    read: true,
    open: true,
  });
  console.log("Deleted read notifications older than 15 days");
});

module.exports = cron; // Export if needed elsewhere
