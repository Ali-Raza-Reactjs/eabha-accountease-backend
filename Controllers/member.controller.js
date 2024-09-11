const MemberModel = require("../Models/MemberModel");
const { ApiResponseModel } = require("../Utils/classes");
const {
  compareObjectIds,
  convertStringIdToObjectId,
} = require("../Utils/utils");

const getMemberUsingEmail = async (req, res) => {
  const { email } = req.params;
  let apiResponse = new ApiResponseModel();
  try {
    const tokenMemberData = await MemberModel.findOne({ userId: req.tokenId });
    const memberData = await MemberModel.findOne({ email });

    if (memberData) {
      if (!compareObjectIds(tokenMemberData._id, memberData._id)) {
        const checkIsAlreadyFriended = tokenMemberData.friends.some((dt) =>
          compareObjectIds(dt.memberId, memberData._id)
        );
        if (checkIsAlreadyFriended) {
          apiResponse.msg = "Already friend";
          apiResponse.data = memberData;
        } else {
          apiResponse.status = true;
          apiResponse.msg = "Member found successfully";
          apiResponse.data = memberData;
        }
      } else {
        apiResponse.msg = "You can't add yourself as a friend.";
      }
    } else {
      apiResponse.msg = "No member exists with this email address.";
    }
    res.status(200).json(apiResponse);
  } catch (error) {
    apiResponse.errors = error;
    res.status(500).send(apiResponse);
  }
};
const getAllMembersForAddGroup = async (req, res) => {
  const { groupId } = req.params;

  let apiResponse = new ApiResponseModel();
  try {
    const tokenMemberData = await MemberModel.aggregate([
      {
        $match: { userId: convertStringIdToObjectId(req.tokenId) },
      },
      {
        $facet: {
          memberData: [
            {
              $addFields: {
                lastName: {
                  $concat: [
                    { $ifNull: [{ $toString: "$lastName" }, ""] },
                    " (You)",
                  ],
                },
              },
            },
            {
              $project: {
                friends: 0,
                groups: 0,
                __v: 0,
              },
            },
          ],
          friendsData: [
            {
              $unwind: "$friends",
            },
            {
              $project: {
                _id: 0,
                friendId: "$friends.memberId",
              },
            },
            {
              $lookup: {
                from: "members",
                localField: "friendId",
                foreignField: "_id",
                as: "friendData",
              },
            },
            {
              $unwind: "$friendData",
            },
            {
              $replaceRoot: { newRoot: "$friendData" },
            },
            {
              $project: {
                friends: 0,
                groups: 0,
                __v: 0,
              },
            },
          ],
        },
      },
      {
        $project: {
          combinedData: {
            $concatArrays: ["$memberData", "$friendsData"],
          },
        },
      },
      {
        $unwind: "$combinedData",
      },
      {
        $lookup: {
          from: "group_members_expenses",
          let: {
            groupId: convertStringIdToObjectId(groupId),
            memberId: "$combinedData._id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$groupId", "$$groupId"] },
                    { $eq: ["$memberId", "$$memberId"] },
                  ],
                },
              },
            },
          ],
          as: "groupMembersExpensesData",
        },
      },
      {
        $unwind: {
          path: "$groupMembersExpensesData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          "combinedData.groupId": {
            $cond: {
              if: "$groupMembersExpensesData.groupId",
              then: "$groupMembersExpensesData.groupId",
              else: null,
            },
          },
          "combinedData.expenseBalance": {
            $cond: {
              if: "$groupMembersExpensesData.expenseBalance",
              then: "$groupMembersExpensesData.expenseBalance",
              else: 0,
            },
          },
        },
      },
      {
        $replaceRoot: { newRoot: "$combinedData" },
      },
    ]);

    if (tokenMemberData) {
      apiResponse.status = true;
      apiResponse.data = tokenMemberData;
    }
    return res.status(200).json(apiResponse);
  } catch (error) {
    console.log(error);
    apiResponse.errors = error;
    return res.status(500).send(apiResponse);
  }
};

module.exports = {
  getMemberUsingEmail,
  getAllMembersForAddGroup,
};
