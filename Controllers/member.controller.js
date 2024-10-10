const MemberModel = require("../Models/MemberModel");
const UserModel = require("../Models/UserModel");
const { ApiResponseModel } = require("../Utils/classes");
const formidable = require("formidable");
const {
  compareObjectIds,
  convertStringIdToObjectId,
  getBooleanFromObject,
  MAX_FILE_SIZE_BYTES,
  uploadFile,
  comparePassword,
} = require("../Utils/utils");
const GroupMembersExpensesModel = require("../Models/GroupMembersExpensesModel");

const getMemberUsingUsernameOrEmail = async (req, res) => {
  const { usernameOrEmail } = req.params;
  let apiResponse = new ApiResponseModel();
  try {
    const tokenMemberData = await MemberModel.findOne({ userId: req.tokenId });
    const memberData = await MemberModel.findOne({ email: usernameOrEmail });

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
      const userData = await UserModel.findOne({ username: usernameOrEmail });
      if (userData) {
        const memberData = await MemberModel.findOne({ userId: userData._id });
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
        apiResponse.msg = "No member exists with this username/email  address.";
      }
    }
    res.status(200).json(apiResponse);
  } catch (error) {
    apiResponse.errors = error;
    res.status(500).send(apiResponse);
  }
};
const getAllMembersForAddGroup = async (req, res) => {
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
      // {
      //   $lookup: {
      //     from: "group_members_expenses",
      //     let: {
      //       groupId: convertStringIdToObjectId(groupId),
      //       memberId: "$combinedData._id",
      //     },
      //     pipeline: [
      //       {
      //         $match: {
      //           $expr: {
      //             $and: [
      //               { $eq: ["$groupId", "$$groupId"] },
      //               { $eq: ["$memberId", "$$memberId"] },
      //             ],
      //           },
      //         },
      //       },
      //     ],
      //     as: "groupMembersExpensesData",
      //   },
      // },
      // {
      //   $unwind: {
      //     path: "$groupMembersExpensesData",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
      // {
      //   $addFields: {
      //     "combinedData.groupId": {
      //       $cond: {
      //         if: "$groupMembersExpensesData.groupId",
      //         then: "$groupMembersExpensesData.groupId",
      //         else: null,
      //       },
      //     },
      //     "combinedData.expenseBalance": {
      //       $cond: {
      //         if: "$groupMembersExpensesData.expenseBalance",
      //         then: "$groupMembersExpensesData.expenseBalance",
      //         else: 0,
      //       },
      //     },
      //   },
      // },
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
const getAllMembersForUpdateGroup = async (req, res) => {
  const { groupId } = req.params;
  let apiResponse = new ApiResponseModel();
  try {
    const groupMembers = await GroupMembersExpensesModel.aggregate([
      {
        $match: {
          groupId: convertStringIdToObjectId(groupId),
        },
      },
      {
        $lookup: {
          from: "members",
          localField: "memberId",
          foreignField: "_id",
          as: "memberData",
        },
      },
      { $unwind: "$memberData" },
      {
        $addFields: {
          _id: "$memberData._id",
          "memberData.expenseBalance": "$expenseBalance",
          firstName: "$memberData.firstName",
          lastName: {
            $concat: [
              { $ifNull: ["$memberData.lastName", ""] },
              {
                $cond: [
                  {
                    $eq: [
                      "$memberData.userId",
                      convertStringIdToObjectId(req.tokenId),
                    ],
                  },
                  " (You)",
                  "",
                ],
              },
            ],
          },
          profile: "$memberData.profile",
          phone: "$memberData.phone",
          email: "$memberData.email",
        },
      },

      {
        $project: {
          memberData: 0,
          memberId: 0,
          balanceAdjustmentDetails: 0,
          __v: 0,
        },
      },
    ]);
    const tokenMemberDataFriends = await MemberModel.aggregate([
      {
        $match: { userId: convertStringIdToObjectId(req.tokenId) },
      },
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
          userId: 0,
          isEmailVerified: 0,
          loan: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
        },
      },
    ]);
    const userFriendsNotInGroup = tokenMemberDataFriends.filter((dt) => {
      return !groupMembers.some((mbr) => compareObjectIds(mbr._id, dt._id));
    });
    if (groupMembers) {
      apiResponse.status = true;
      apiResponse.data = [...groupMembers, ...userFriendsNotInGroup];
    }
    res.status(200).json(apiResponse);
  } catch (error) {
    console.log(error);
    apiResponse.errors = error;
    res.status(500).send(apiResponse);
  }
};

const getSingleMemberData = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  try {
    const tokenMemberData = await MemberModel.findOne({ userId: req.tokenId });
    apiResponse.status = true;
    apiResponse.data = tokenMemberData;
    return res.status(200).send(apiResponse);
  } catch (error) {
    apiResponse.errors = error;
    return res.status(500).json(apiResponse);
  }
};

const updateProfile = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  let uploadedUrl = null;
  try {
    const form = formidable.formidable({ multiples: true });
    form.parse(req, async (err, fields, files) => {
      try {
        if (err) {
          console.error("Error parsing the form:", err);
          apiResponse.errors = err;
          return res.status(500).json(apiResponse);
        }
        const { firstName, lastName, email, phone } = fields;
        const _firstName = firstName[0] || "";
        const _lastName = lastName[0] || "";
        const _email = email[0] || "";
        const _phone = phone[0] || "";

        if (getBooleanFromObject(files) && files.profile) {
          const file = files.profile[0];
          if (file.size <= MAX_FILE_SIZE_BYTES) {
            // check if member already exist with email
            uploadedUrl = await uploadFile(file);
          } else {
            apiResponse.msg = "Can't upload file larger than 1 MB";
            return res.status(200).json(apiResponse);
          }
        }

        const filter = { userId: req.tokenId };
        let update = {
          firstName: _firstName,
          lastName: _lastName,
          email: _email,
          updatedBy: req.tokenId,
        };

        if (_phone !== "null") {
          update.phone = _phone;
        }

        if (uploadedUrl) {
          update.profile = uploadedUrl;
        }

        const updateData = await MemberModel.findOneAndUpdate(filter, update);
        apiResponse.status = true;
        apiResponse.data = updateData;
        apiResponse.msg = "You Profile has been updated";
        return res.status(200).json(apiResponse);
      } catch (error) {
        if (error.name === "ValidationError") {
          const errors = Object.keys(error.errors).reduce((acc, key) => {
            acc[key] = error.errors[key].message;
            return acc;
          }, {});

          apiResponse.errors = errors;
          return res.status(200).json(apiResponse);
        }
        if (error.code === 11000) {
          const errors = Object.keys(error.keyValue).reduce((acc, key) => {
            acc[key] = `${error.keyValue[key]} is already in use`;
            return acc;
          }, {});
          apiResponse.errors = errors;
          return res.status(200).json(apiResponse);
        }
        console.error("Error in sigup function:", error);
        apiResponse.errors = error;
        return res.status(500).json(apiResponse);
      }
    });
  } catch (error) {
    console.error("Error in sigup function:", error);
    apiResponse.errors = error;
    return res.status(500).json(apiResponse);
  }
};

const updatePassword = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  try {
    const user = await UserModel.findById(req.tokenId);
    const { newPassword, oldPassword } = req.body;
    if (user) {
      const auth = await comparePassword(oldPassword, user.password);
      if (auth) {
        user.password = newPassword;
        await user.save();
        apiResponse.status = true;
        apiResponse.msg = "Password updated successfully";
        return res.status(200).json(apiResponse);
      }
      apiResponse.msg = "Incorrect current password";
      return res.status(200).json(apiResponse);
    }
    apiResponse.msg = "User not found";
    return res.status(404).json(apiResponse);
  } catch (err) {
    console.error(err);
    apiResponse.errors = err;
    res.status(500).json(apiResponse);
  }
};
const resetPassword = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  const { newPassword } = req.body;
  try {
    const user = await UserModel.findById(req.tokenId);
    if (user) {
      user.password = newPassword;
      await user.save();
      apiResponse.status = true;
      apiResponse.msg = "Password reset successfully";
      return res.status(200).json(apiResponse);
    }
    apiResponse.msg = "User not found";
    return res.status(404).json(apiResponse);
  } catch (err) {
    console.error(err);
    apiResponse.errors = err;
    res.status(500).json(apiResponse);
  }
};
module.exports = {
  getMemberUsingUsernameOrEmail,
  getAllMembersForAddGroup,
  getSingleMemberData,
  getAllMembersForUpdateGroup,
  updateProfile,
  updatePassword,
  resetPassword,
};
