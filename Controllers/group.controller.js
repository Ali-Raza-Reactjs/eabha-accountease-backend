const formidable = require("formidable");
const GroupModel = require("../Models/GroupModel");
const { ApiResponseModel } = require("../Utils/classes");
const {
  convertStringIdToObjectId,
  compareObjectIds,
  handleGetDateForTime00,
} = require("../Utils/utils");
const GroupMembersExpensesModel = require("../Models/GroupMembersExpensesModel");
const ExpenseModel = require("../Models/ExpenseModel");
const ReceivedAmountHistoryModel = require("../Models/ReceivedAmountHistoryModel");
const MemberModel = require("../Models/MemberModel");
const SharedGroupContributedAmountHistoryModel = require("../Models/SharedGroupContributedAmountHistoryModel");
const SharedGroupMembersExpensesModel = require("../Models/SharedGroupMembersExpensesModel");

const getAllGroups = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  try {
    const tokenMemberData = await MemberModel.findOne({ userId: req.tokenId });

    const tokenMemberdGroupIdsArr = tokenMemberData.groups.map(
      (dt) => dt.groupId
    );
    const tokenMemberdGroupBalanceObj = tokenMemberData.groups.reduce(
      (acc, curr) => {
        acc[curr.groupId] = curr.balance;
        return acc;
      },
      {}
    );

    const data = await GroupModel.aggregate([
      {
        $match: {
          _id: { $in: tokenMemberdGroupIdsArr },
          isShared: false,
        },
      },

      {
        $lookup: {
          from: "members",
          localField: "createdBy",
          foreignField: "userId",
          as: "createdByMembersData",
        },
      },
      {
        $lookup: {
          from: "members",
          localField: "updatedBy",
          foreignField: "userId",
          as: "updatedByMembersData",
        },
      },
      {
        $unwind: "$createdByMembersData",
      },
      {
        $unwind: {
          path: "$updatedByMembersData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          createdByName: {
            $concat: [
              { $ifNull: ["$createdByMembersData.firstName", ""] },
              " ",
              { $ifNull: ["$createdByMembersData.lastName", ""] },
              {
                $cond: [
                  {
                    $eq: [
                      "$createdByMembersData.userId",
                      convertStringIdToObjectId(req.tokenId),
                    ],
                  },
                  " (You)",
                  "",
                ],
              },
            ],
          },
          updatedByName: {
            $concat: [
              { $ifNull: ["$updatedByMembersData.firstName", ""] },
              " ",
              { $ifNull: ["$updatedByMembersData.lastName", ""] },
              {
                $cond: [
                  {
                    $eq: [
                      "$updatedByMembersData.userId",
                      convertStringIdToObjectId(req.tokenId),
                    ],
                  },
                  " (You)",
                  "",
                ],
              },
            ],
          },
        },
      },
      {
        $project: {
          createdByMembersData: 0,
          updatedByMembersData: 0,
          createdBy: 0,
          updatedBy: 0,
        },
      },
    ]);
    if (data) {
      apiResponse.status = true;
      apiResponse.data = data.map((dt) => {
        return {
          ...dt,
          balance: tokenMemberdGroupBalanceObj[dt._id],
        };
      });
    } else {
      apiResponse.msg = "No groups found";
    }
    res.status(200).json(apiResponse);
  } catch (error) {
    console.log(error);
    apiResponse.errors = error;
    res.status(500).json(apiResponse);
  }
};
const getAllSharedGroups = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  try {
    const tokenMemberData = await MemberModel.findOne({ userId: req.tokenId });

    const tokenMemberdGroupIdsArr = tokenMemberData.groups.map(
      (dt) => dt.groupId
    );
    const tokenMemberdGroupBalanceObj = tokenMemberData.groups.reduce(
      (acc, curr) => {
        acc[curr.groupId] = curr.balance;
        return acc;
      },
      {}
    );

    const data = await GroupModel.aggregate([
      {
        $match: {
          _id: { $in: tokenMemberdGroupIdsArr },
          isShared: true,
        },
      },

      {
        $lookup: {
          from: "members",
          localField: "createdBy",
          foreignField: "userId",
          as: "createdByMembersData",
        },
      },
      {
        $lookup: {
          from: "members",
          localField: "updatedBy",
          foreignField: "userId",
          as: "updatedByMembersData",
        },
      },
      {
        $unwind: "$createdByMembersData",
      },
      {
        $unwind: {
          path: "$updatedByMembersData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          createdByName: {
            $concat: [
              { $ifNull: ["$createdByMembersData.firstName", ""] },
              " ",
              { $ifNull: ["$createdByMembersData.lastName", ""] },
              {
                $cond: [
                  {
                    $eq: [
                      "$createdByMembersData.userId",
                      convertStringIdToObjectId(req.tokenId),
                    ],
                  },
                  " (You)",
                  "",
                ],
              },
            ],
          },
          updatedByName: {
            $concat: [
              { $ifNull: ["$updatedByMembersData.firstName", ""] },
              " ",
              { $ifNull: ["$updatedByMembersData.lastName", ""] },
              {
                $cond: [
                  {
                    $eq: [
                      "$updatedByMembersData.userId",
                      convertStringIdToObjectId(req.tokenId),
                    ],
                  },
                  " (You)",
                  "",
                ],
              },
            ],
          },
        },
      },
      {
        $project: {
          createdByMembersData: 0,
          updatedByMembersData: 0,
          createdBy: 0,
          updatedBy: 0,
        },
      },
    ]);
    if (data) {
      apiResponse.status = true;
      apiResponse.data = data.map((dt) => {
        return {
          ...dt,
          balance: tokenMemberdGroupBalanceObj[dt._id],
        };
      });
    } else {
      apiResponse.msg = "No groups found";
    }
    res.status(200).json(apiResponse);
  } catch (error) {
    console.log(error);
    apiResponse.errors = error;
    res.status(500).json(apiResponse);
  }
};
const getExpenses = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  try {
    const data = await GroupModel.find({});
    if (data) {
      apiResponse.status = true;
      apiResponse.data = data;
    } else {
      apiResponse.msg = "No groups found";
    }
    res.status(200).json(apiResponse);
  } catch (error) {
    apiResponse.errors = error;
    res.status(500).json(apiResponse);
  }
};

const addGroup = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  try {
    const form = formidable.formidable({ multiples: true });
    form.parse(req, async (error, fields, files) => {
      try {
        if (error) {
          apiResponse.errors = error;
          return res.status(200).json(apiResponse);
        }

        const { img, name, members } = fields;
        const _name = name[0] || "";
        const _img = img[0] || "";
        const _members = members[0] || "";
        const membersIds = _members.split(",");
        const mappedMembers = membersIds.map((dt) => {
          return { memberId: convertStringIdToObjectId(dt) };
        });
        const data = await GroupModel.create({
          img: _img,
          name: _name,
          members: mappedMembers,
          createdBy: req.tokenId,
        });

        const membersExpenseData = mappedMembers.map((dt) => {
          return {
            memberId: dt.memberId,
            groupId: data._id,
            expenseBalance: 0,
            balanceAdjustmentDetails: [],
          };
        });
        await GroupMembersExpensesModel.insertMany(membersExpenseData);
        await MemberModel.updateMany(
          { _id: { $in: membersIds } }, // Filter criteria: match documents where the _id is in membersIds
          {
            $push: { groups: { groupId: data._id } }, // Update operation: push a new object into the groups array
          }
        );

        if (data) {
          apiResponse.status = true;
          apiResponse.msg = "Group created successfully";
          apiResponse.data = data;
        } else {
          apiResponse.msg = "Can't create group";
        }
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
        console.log({ error });
        apiResponse.errors = error;
        return res.status(500).json(apiResponse);
      }
    });
  } catch (error) {
    console.log({ error });
    apiResponse.errors = error;
    return res.status(500).json(apiResponse);
  }
};
const addSharedGroup = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  try {
    const form = formidable.formidable({ multiples: true });
    form.parse(req, async (error, fields, files) => {
      try {
        if (error) {
          apiResponse.errors = error;
          return res.status(200).json(apiResponse);
        }

        const { img, name, members } = fields;
        const _name = name[0] || "";
        const _img = img[0] || "";
        const _members = members[0] || "";
        const membersIds = _members.split(",");
        const mappedMembers = membersIds.map((dt) => {
          return { memberId: convertStringIdToObjectId(dt) };
        });
        const data = await GroupModel.create({
          img: _img,
          name: _name,
          isShared: true,
          members: mappedMembers,
          createdBy: req.tokenId,
        });

        await MemberModel.updateMany(
          { _id: { $in: membersIds } }, // Filter criteria: match documents where the _id is in membersIds
          {
            $push: { groups: { groupId: data._id } }, // Update operation: push a new object into the groups array
          }
        );

        if (data) {
          apiResponse.status = true;
          apiResponse.msg = "Group created successfully";
          apiResponse.data = data;
        } else {
          apiResponse.msg = "Can't create group";
        }
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
        console.log({ error });
        apiResponse.errors = error;
        return res.status(500).json(apiResponse);
      }
    });
  } catch (error) {
    console.log({ error });
    apiResponse.errors = error;
    return res.status(500).json(apiResponse);
  }
};
const updateGroup = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  try {
    const form = formidable.formidable({ multiples: true });
    form.parse(req, async (error, fields, files) => {
      try {
        if (error) {
          apiResponse.errors = error;
          return res.status(200).json(apiResponse);
        }

        const { img, name, members, groupId } = fields;
        const _name = name[0] || "";
        const _img = img[0] || "";
        const _groupId = groupId[0] || "";
        const _members = members[0] || "";
        const mappedMembers = _members.split(",").map((dt) => {
          return { memberId: convertStringIdToObjectId(dt) };
        });
        const oldGroupData = await GroupModel.findById(groupId);
        const isMemberIdInArray = (arr, memberId) =>
          arr.some((item) => String(item.memberId) === String(memberId));

        const willAddedAsNewMembers = mappedMembers.filter(
          (item) => !isMemberIdInArray(oldGroupData.members, item.memberId)
        );
        const willAddedAsNewMembersExpenseData = willAddedAsNewMembers.map(
          (dt) => {
            return {
              memberId: dt.memberId,
              groupId: groupId,
              expenseBalance: 0,
              adjustmentDetails: [],
            };
          }
        );
        const willDeletedMembers = oldGroupData.members
          .filter((item) => !isMemberIdInArray(mappedMembers, item.memberId))
          .map((dt) => {
            return dt.memberId;
          });

        const [selectedGroup] = await GroupMembersExpensesModel.aggregate([
          {
            $match: {
              $and: [
                {
                  groupId: convertStringIdToObjectId(_groupId),
                },
                {
                  memberId: { $in: willDeletedMembers },
                },
              ],
            },
          },
          {
            $project: {
              isAllMembersBalanceZero: {
                $cond: {
                  if: {
                    $eq: ["$expenseBalance", 0],
                  },
                  then: true,
                  else: false,
                },
              },
            },
          },
          {
            $group: {
              _id: null,
              isDeleteAble: { $first: "$isAllMembersBalanceZero" },
            },
          },
        ]);

        if (selectedGroup ? selectedGroup?.isDeleteAble : true) {
          await GroupMembersExpensesModel.deleteMany({
            groupId: convertStringIdToObjectId(_groupId),
            memberId: { $in: willDeletedMembers },
          });

          await GroupMembersExpensesModel.insertMany(
            willAddedAsNewMembersExpenseData
          );
          const data = await GroupModel.findByIdAndUpdate(groupId, {
            img: _img,
            name: _name,
            members: mappedMembers,
            updatedBy: req.tokenId,
          });

          if (data) {
            apiResponse.status = true;
            apiResponse.msg = "Group updated successfully";
            apiResponse.data = data;
          } else {
            apiResponse.msg = "Can't update group";
          }
        } else {
          apiResponse.msg =
            "You can't exclude friends who have a balance in this group.";
        }
        return res.status(200).json(apiResponse);
      } catch (error) {
        console.log("line 174", { error });
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
        apiResponse.errors = error;
        return res.status(500).json(apiResponse);
      }
    });
  } catch (error) {
    apiResponse.errors = error;
    return res.status(500).json(apiResponse);
  }
};
const updateSharedGroup = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  try {
    const form = formidable.formidable({ multiples: true });
    form.parse(req, async (error, fields, files) => {
      try {
        if (error) {
          apiResponse.errors = error;
          return res.status(200).json(apiResponse);
        }

        const { img, name, members, groupId } = fields;
        const _name = name[0] || "";
        const _img = img[0] || "";
        const _groupId = groupId[0] || "";
        const _members = members[0] || "";
        const mappedMembers = _members.split(",").map((dt) => {
          return { memberId: convertStringIdToObjectId(dt) };
        });
        if (true) {
          const data = await GroupModel.findByIdAndUpdate(_groupId, {
            img: _img,
            name: _name,
            members: mappedMembers,
            updatedBy: req.tokenId,
          });

          if (data) {
            apiResponse.status = true;
            apiResponse.msg = "Group updated successfully";
            apiResponse.data = data;
          } else {
            apiResponse.msg = "Can't update group";
          }
        } else {
          apiResponse.msg =
            "You can't exclude friends who have a balance in this group.";
        }
        return res.status(200).json(apiResponse);
      } catch (error) {
        console.log("line 174", { error });
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
        apiResponse.errors = error;
        return res.status(500).json(apiResponse);
      }
    });
  } catch (error) {
    apiResponse.errors = error;
    return res.status(500).json(apiResponse);
  }
};
const deleteGroup = async (req, res) => {
  const { groupId } = req.params;
  let apiResponse = new ApiResponseModel();
  try {
    const [selectedGroup] = await GroupMembersExpensesModel.aggregate([
      { $match: { groupId: convertStringIdToObjectId(groupId) } }, // Correctly match the document by groupId
      {
        $project: {
          isAllMembersBalanceZero: {
            $cond: {
              if: {
                $eq: ["$expenseBalance", 0],
              },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          isDeleteAble: { $first: "$isAllMembersBalanceZero" },
        },
      },
    ]);
    if (selectedGroup.isDeleteAble) {
      const [groupMembers] = await GroupModel.aggregate([
        {
          $match: {
            _id: convertStringIdToObjectId(groupId),
          },
        },
        {
          $unwind: {
            path: "$members",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: null,
            members: {
              $push: "$members.memberId",
            },
          },
        },
        {
          $project: {
            _id: 0,
          },
        },
      ]);

      const data = await GroupModel.findByIdAndDelete(groupId);
      if (data) {
        await MemberModel.updateMany(
          {
            _id: { $in: groupMembers?.members },
          },
          { $pull: { groups: { groupId: convertStringIdToObjectId(groupId) } } }
        );
        await GroupMembersExpensesModel.deleteMany({
          groupId: convertStringIdToObjectId(groupId),
        });
        await ExpenseModel.deleteMany({
          groupId: convertStringIdToObjectId(groupId),
        });
        await ReceivedAmountHistoryModel.deleteMany({
          groupId: convertStringIdToObjectId(groupId),
        });

        apiResponse.status = true;
        apiResponse.msg = "Group deleted successfully";
        return res.status(200).json(apiResponse);
      }
      apiResponse.data = data;
      apiResponse.msg = "Can't delete group";
      return res.status(200).json(apiResponse);
    }
    apiResponse.msg =
      "You can only delete a group if each member's expense balance is zero.";
    return res.status(200).json(apiResponse);
  } catch (error) {
    console.log(error);
    apiResponse.errors = error;
    return res.status(500).json(apiResponse);
  }
};
const deleteSharedGroup = async (req, res) => {
  const { groupId } = req.params;
  let apiResponse = new ApiResponseModel();
  try {
    if (true) {
      const [groupMembers] = await GroupModel.aggregate([
        {
          $match: {
            _id: convertStringIdToObjectId(groupId),
          },
        },
        {
          $unwind: {
            path: "$members",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: null,
            members: {
              $push: "$members.memberId",
            },
          },
        },
        {
          $project: {
            _id: 0,
          },
        },
      ]);

      const data = await GroupModel.findByIdAndDelete(groupId);
      if (data) {
        await MemberModel.updateMany(
          {
            _id: { $in: groupMembers?.members },
          },
          { $pull: { groups: { groupId: convertStringIdToObjectId(groupId) } } }
        );
        await GroupMembersExpensesModel.deleteMany({
          groupId: convertStringIdToObjectId(groupId),
        });
        await ExpenseModel.deleteMany({
          groupId: convertStringIdToObjectId(groupId),
        });
        await ReceivedAmountHistoryModel.deleteMany({
          groupId: convertStringIdToObjectId(groupId),
        });

        apiResponse.status = true;
        apiResponse.msg = "Group deleted successfully";
        return res.status(200).json(apiResponse);
      }
      apiResponse.data = data;
      apiResponse.msg = "Can't delete group";
      return res.status(200).json(apiResponse);
    }
    apiResponse.msg =
      "You can only delete a group if each member's expense balance is zero.";
    return res.status(200).json(apiResponse);
  } catch (error) {
    console.log(error);
    apiResponse.errors = error;
    return res.status(500).json(apiResponse);
  }
};
const getAllSharedGroupMembersByGroupId = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  const { createdFrom, createdTo, groupId } = req.body;
  let dateMatchQuery = {};
  if (createdFrom && createdTo) {
    dateMatchQuery = {
      date: {
        $gte: new Date(createdFrom),
        $lte: new Date(createdTo),
      },
    };
  } else if (createdFrom) {
    dateMatchQuery = {
      date: { $gte: new Date(createdFrom) },
    };
  } else if (createdTo) {
    dateMatchQuery = {
      date: { $lte: new Date(createdTo) },
    };
  }
  try {
    const gorupMemberData = await GroupModel.aggregate([
      {
        $match: {
          _id: convertStringIdToObjectId(groupId),
        },
      },
      {
        $unwind: "$members",
      },
      {
        $lookup: {
          from: "members",
          localField: "members.memberId",
          foreignField: "_id",
          as: "memberData",
        },
      },
      {
        $unwind: {
          path: "$memberData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $replaceRoot: {
          newRoot: "$memberData",
        },
      },
      {
        $addFields: {
          lastName: {
            $concat: [
              { $ifNull: ["$lastName", ""] },
              {
                $cond: [
                  {
                    $eq: ["$userId", convertStringIdToObjectId(req.tokenId)],
                  },
                  " (You)",
                  "",
                ],
              },
            ],
          },
        },
      },
      {
        $project: {
          phone: 0,
          userId: 0,
          friends: 0,
          isEmailVerified: 0,
          loan: 0,
          __v: 0,
          createdAt: 0,
          updatedAt: 0,
          groups: 0,
          createdBy: 0,
          updatedBy: 0,
        },
      },
    ]);
    const gorupMemberContributionAmountData =
      await SharedGroupContributedAmountHistoryModel.aggregate([
        {
          $match: {
            $and: [
              dateMatchQuery,
              {
                groupId: convertStringIdToObjectId(groupId),
              },
            ],
          },
        },
        {
          $group: {
            _id: "$memberId",
            totalContributed: {
              $sum: "$amount",
            },
          },
        },
      ]);
    const data = gorupMemberData.map((dt) => {
      const selectedMember = gorupMemberContributionAmountData.find((amt) =>
        compareObjectIds(amt._id, dt._id)
      );
      const totalContributed = selectedMember?.totalContributed || 0;
      return {
        ...dt,
        totalContributed,
      };
    });
    if (gorupMemberData) {
      apiResponse.status = true;
      apiResponse.data = data;
    } else {
      apiResponse.msg = "No groups found";
    }
    res.status(200).json(apiResponse);
  } catch (error) {
    console.log(error);
    apiResponse.errors = error;
    res.status(500).json(apiResponse);
  }
};
const getSharedGroupTotalExpensesAmountByGroupId = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  const { createdFrom, createdTo, groupId } = req.body;
  let dateMatchQuery = {};
  if (createdFrom && createdTo) {
    dateMatchQuery = {
      date: {
        $gte: new Date(createdFrom),
        $lte: new Date(createdTo),
      },
    };
  } else if (createdFrom) {
    dateMatchQuery = {
      date: { $gte: new Date(createdFrom) },
    };
  } else if (createdTo) {
    dateMatchQuery = {
      date: { $lte: new Date(createdTo) },
    };
  }
  try {
    const [sharedGroupMemberExpenseAmount] =
      await SharedGroupMembersExpensesModel.aggregate([
        {
          $match: {
            $and: [
              dateMatchQuery,
              {
                groupId: convertStringIdToObjectId(groupId),
              },
            ],
          },
        },
        {
          $group: {
            _id: null,
            totalExpesneAmount: {
              $sum: "$amount",
            },
          },
        },
      ]);

    apiResponse.status = true;
    apiResponse.data = sharedGroupMemberExpenseAmount?.totalExpesneAmount || 0;
    res.status(200).json(apiResponse);
  } catch (error) {
    console.log(error);
    apiResponse.errors = error;
    res.status(500).json(apiResponse);
  }
};

const addContributionInSharedGroup = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  try {
    // const tokenMemberData = await MemberModel.findOne({ userId: req.tokenId });
    // const reqBody = { ...req.body, memberId: tokenMemberData._id };
    const data = await SharedGroupContributedAmountHistoryModel.create(req.body);
    if (data) {
      apiResponse.status = true;
      apiResponse.msg = "Amount added successfully";
      apiResponse.data = data;
    } else {
      apiResponse.msg = "Error in adding amount";
    }
    res.status(200).json(apiResponse);
  } catch (error) {
    console.log(error);
    apiResponse.errors = error;
    res.status(500).json(apiResponse);
  }
};
const updateContributionInSharedGroup = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  try {
    // const tokenMemberData = await MemberModel.findOne({ userId: req.tokenId });
    // const reqBody = { ...req.body, memberId: tokenMemberData._id };
    const data =
      await SharedGroupContributedAmountHistoryModel.findByIdAndUpdate(
        req.body.contributionId,
        req.body
      );
    if (data) {
      apiResponse.status = true;
      apiResponse.msg = "Updated successfully";
      apiResponse.data = data;
    } else {
      apiResponse.msg = "Error in Updating";
    }
    res.status(200).json(apiResponse);
  } catch (error) {
    console.log(error);
    apiResponse.errors = error;
    res.status(500).json(apiResponse);
  }
};
const deleteContributionInSharedGroup = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  const { contributionId } = req.params;
  try {
    const data =
      await SharedGroupContributedAmountHistoryModel.findByIdAndDelete(
        contributionId
      );
    if (data) {
      apiResponse.status = true;
      apiResponse.msg = "Deleted successfully";
      apiResponse.data = data;
    } else {
      apiResponse.msg = "Error in deleing";
    }
    res.status(200).json(apiResponse);
  } catch (error) {
    console.log(error);
    apiResponse.errors = error;
    res.status(500).json(apiResponse);
  }
};
module.exports = {
  addGroup,
  addSharedGroup,
  updateGroup,
  updateSharedGroup,
  deleteGroup,
  deleteSharedGroup,
  getAllGroups,
  getAllSharedGroups,
  getExpenses,
  getAllSharedGroupMembersByGroupId,
  getSharedGroupTotalExpensesAmountByGroupId,
  addContributionInSharedGroup,
  updateContributionInSharedGroup,
  deleteContributionInSharedGroup,
};
