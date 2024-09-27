const MemberModel = require("../Models/MemberModel");
const { ApiResponseModel } = require("../Utils/classes");
const { convertStringIdToObjectId } = require("../Utils/utils");

const getFriends = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  try {
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
          __v: 0,
        },
      },
    ]);
    if (tokenMemberDataFriends) {
      apiResponse.status = true;
      apiResponse.data = tokenMemberDataFriends;
    } else {
      apiResponse.msg = "Can't find friend(s)";
    }
    res.status(200).json(apiResponse);
  } catch (error) {
    apiResponse.errors = error;
    res.status(500).send(apiResponse);
  }
};
const addFriends = async (req, res) => {
  const { friends } = req.body;
  let apiResponse = new ApiResponseModel();
  try {
    const tokenMemberData = await MemberModel.findOne({ userId: req.tokenId });
    const oldFriends = tokenMemberData.friends;
    if (friends) {
      const newFriendsList = friends
        .split(",")
        .filter((x) => !oldFriends.some((dt) => String(dt.memberId) === x));
      const newFriends = newFriendsList.map((dt) => {
        return { memberId: convertStringIdToObjectId(dt) };
      });
      tokenMemberData.friends = [...oldFriends, ...newFriends];
      const data = await tokenMemberData.save();
      const updateOperation = newFriendsList.map((_id) => ({
        updateOne: {
          filter: { _id },
          update: {
            $push: {
              friends: {
                memberId: tokenMemberData._id,
              },
            },
          },
        },
      }));

      await MemberModel.bulkWrite(updateOperation);
      if (data) {
        apiResponse.status = false;
        apiResponse.msg = "Friend(s) added successfully";
        apiResponse.data = data;
      } else {
        apiResponse.msg = "Can't add friend(s)";
      }
    } else {
      apiResponse.msg = "Invalid friend(s)";
    }
    res.status(200).json(apiResponse);
  } catch (error) {
    console.log(error);
    apiResponse.errors = error;
    res.status(500).send(apiResponse);
  }
};

const deleteFriend = async (req, res) => {
  const { memberId } = req.params;
  let apiResponse = new ApiResponseModel();
  try {
    const data = await MemberModel.updateMany(
      { userId: req.tokenId },
      { $pull: { friends: { memberId: convertStringIdToObjectId(memberId) } } }
    );

    if (data) {
      apiResponse.status = true;
      apiResponse.msg = "Removed successfully";
    } else {
      apiResponse.msg = "Can't remove friend";
    }
    res.status(200).json(apiResponse);
  } catch (error) {
    apiResponse.errors = error;
    res.status(500).send(apiResponse);
  }
};

module.exports = {
  addFriends,
  getFriends,
  deleteFriend,
};
