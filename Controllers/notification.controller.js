const MemberModel = require("../Models/MemberModel");
const NotificationModel = require("../Models/NotificationModel");
const { ApiResponseModel } = require("../Utils/classes");

const getNotifications = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  const tokenMemberData = await MemberModel.findOne({ userId: req.tokenId });
  try {
    const notificationData = await NotificationModel.aggregate([
      {
        $match: { toMemberId: tokenMemberData._id },
      },
      {
        $lookup: {
          from: "members",
          localField: "fromMemberId",
          foreignField: "_id",
          as: "memberData",
        },
      },
      {
        $unwind: "$memberData",
      },
      {
        $addFields: {
          memberName: {
            $concat: [
              { $ifNull: [{ $toString: "$memberData.firstName" }, ""] },
              " ",
              { $ifNull: [{ $toString: "$memberData.lastName" }, ""] },
            ],
          },
          memberProfile: "$memberData.profile",
        },
      },
      {
        $project: {
          memberData: 0,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    if (notificationData) {
      apiResponse.status = true;
      apiResponse.data = notificationData;
    }
    return res.status(200).json(apiResponse);
  } catch (error) {
    console.log(error);
    apiResponse.errors = error;
    return res.status(500).send(apiResponse);
  }
};
const updateNotificationOpenStatus = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  const tokenMemberData = await MemberModel.findOne({ userId: req.tokenId });
  try {
    const notificationData = await NotificationModel.updateMany(
      { toMemberId: tokenMemberData._id },
      {
        open: true,
      }
    );

    if (notificationData) {
      apiResponse.status = true;
    }
    return res.status(200).json(apiResponse);
  } catch (error) {
    console.log(error);
    apiResponse.errors = error;
    return res.status(500).send(apiResponse);
  }
};
const updateNotificationReadStatus = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  const { notificationId } = req.params;
  try {
    const notificationData = await NotificationModel.findByIdAndUpdate(
      notificationId,
      {
        read: true,
      }
    );

    if (notificationData) {
      apiResponse.status = true;
    }
    return res.status(200).json(apiResponse);
  } catch (error) {
    console.log(error);
    apiResponse.errors = error;
    return res.status(500).send(apiResponse);
  }
};
module.exports = {
  getNotifications,
  updateNotificationOpenStatus,
  updateNotificationReadStatus,
};
