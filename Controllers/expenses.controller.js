const SharedGroupContributedAmountHistoryModel = require("../Models/SharedGroupContributedAmountHistoryModel");
const ExpenseModel = require("../Models/ExpenseModel");
const GroupMembersExpensesModel = require("../Models/GroupMembersExpensesModel");
const MemberModel = require("../Models/MemberModel");
const ReceivedAmountHistoryModel = require("../Models/ReceivedAmountHistoryModel");
const SharedGroupMembersExpensesModel = require("../Models/SharedGroupMembersExpensesModel");
const { ApiResponseModel } = require("../Utils/classes");
const {
  convertStringIdToObjectId,
  getTokenMemberData,
  handleGetDateForTime00,
} = require("../Utils/utils");

const getGroupMembersExpenses = async (req, res) => {
  const { groupId } = req.params;
  let apiResponse = new ApiResponseModel();
  try {
    const groupMembersExpenses = await GroupMembersExpensesModel.aggregate([
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
          name: {
            $concat: [
              { $ifNull: ["$memberData.firstName", ""] },
              " ",
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
          email: "$memberData.email",
        },
      },
      {
        $project: {
          memberData: 0,
        },
      },
      {
        $unwind: {
          path: "$balanceAdjustmentDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "expenses",
          localField: "balanceAdjustmentDetails.expenseId",
          foreignField: "_id",
          as: "expenseData",
        },
      },
      {
        $unwind: {
          path: "$expenseData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          "balanceAdjustmentDetails.expenseDescription":
            "$expenseData.description",
          "balanceAdjustmentDetails.expenseDate": "$expenseData.expenseDate",
        },
      },
      {
        $group: {
          _id: "$_id",
          groupId: { $first: "$groupId" },
          memberId: { $first: "$memberId" },
          expenseBalance: { $first: "$expenseBalance" },
          balanceAdjustmentDetails: {
            $push: "$balanceAdjustmentDetails", // Reassemble the array
          },
          name: { $first: "$name" },
          profile: { $first: "$profile" },
          email: { $first: "$email" },
        },
      },
      {
        $unwind: {
          path: "$balanceAdjustmentDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "received_amount_histories",
          localField: "balanceAdjustmentDetails.receivedAmontId",
          foreignField: "_id",
          as: "receivedAmountData",
        },
      },
      {
        $unwind: {
          path: "$receivedAmountData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          "balanceAdjustmentDetails.receivedAmountDate":
            "$receivedAmountData.receivedDate",
          "balanceAdjustmentDetails.receivedAmontComment":
            "$receivedAmountData.comment",
          "balanceAdjustmentDetails.fromMemberId":
            "$receivedAmountData.fromMemberId",
          "balanceAdjustmentDetails.toMemberId":
            "$receivedAmountData.toMemberId",
        },
      },
      {
        $lookup: {
          from: "members",
          localField: "receivedAmountData.fromMemberId",
          foreignField: "_id",
          as: "fromMemberData",
        },
      },
      {
        $unwind: {
          path: "$fromMemberData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "members",
          localField: "receivedAmountData.toMemberId",
          foreignField: "_id",
          as: "toMemberData",
        },
      },
      {
        $unwind: {
          path: "$toMemberData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $set: {
          "balanceAdjustmentDetails.toMemberName": {
            $cond: {
              if: { $lte: ["$toMemberData", null] },
              then: "$$REMOVE",
              else: {
                $concat: [
                  "$toMemberData.firstName",
                  " ",
                  "$toMemberData.lastName",
                  {
                    $cond: [
                      {
                        $eq: [
                          "$toMemberData.userId",
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
          "balanceAdjustmentDetails.fromMemberName": {
            $cond: {
              if: { $lte: ["$fromMemberData", null] },
              then: "$$REMOVE",
              else: {
                $concat: [
                  "$fromMemberData.firstName",
                  " ",
                  "$fromMemberData.lastName",
                  {
                    $cond: [
                      {
                        $eq: [
                          "$fromMemberData.userId",
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
        },
      },
      {
        $group: {
          _id: "$_id",
          groupId: { $first: "$groupId" },
          memberId: { $first: "$memberId" },
          expenseBalance: { $first: "$expenseBalance" },
          balanceAdjustmentDetails: {
            $push: {
              $cond: {
                if: {
                  $eq: [
                    { $size: { $objectToArray: "$balanceAdjustmentDetails" } },
                    0,
                  ],
                },
                then: "$$REMOVE",
                else: "$balanceAdjustmentDetails",
              },
            },
          },
          name: { $first: "$name" },
          profile: { $first: "$profile" },
          email: { $first: "$email" },
        },
      },
    ]);
    if (groupMembersExpenses) {
      apiResponse.status = true;
      apiResponse.data = groupMembersExpenses;
    }
    res.status(200).json(apiResponse);
  } catch (error) {
    apiResponse.errors = error;
    res.status(500).send(apiResponse);
  }
};
const getExpenses = async (req, res) => {
  const { createdFrom, createdTo, groupId } = req.body;
  let apiResponse = new ApiResponseModel();
  let dateMatchQuery = {};
  if (createdFrom && createdTo) {
    dateMatchQuery = {
      expenseDate: {
        $gte: new Date(createdFrom),
        $lte: new Date(createdTo),
      },
    };
  } else if (createdFrom) {
    dateMatchQuery = {
      expenseDate: { $gte: new Date(createdFrom) },
    };
  } else if (createdTo) {
    dateMatchQuery = {
      expenseDate: { $lte: new Date(createdTo) },
    };
  }

  try {
    const expenses = await ExpenseModel.aggregate([
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
        $addFields: {
          paidMembers: {
            $map: {
              input: { $objectToArray: "$paidMemberDetails" },
              as: "detail",
              in: {
                memberId: { $toObjectId: "$$detail.k" },
                amountPaid: { $toInt: "$$detail.v" },
              },
            },
          },
        },
      },
      {
        $unwind: "$paidMembers",
      },
      {
        $lookup: {
          from: "members",
          localField: "paidMembers.memberId",
          foreignField: "_id",
          as: "paidMemberData",
        },
      },
      {
        $unwind: "$paidMemberData",
      },

      {
        $addFields: {
          splitMembers: {
            $map: {
              input: { $objectToArray: "$splitMemberDetails" },
              as: "detail",
              in: {
                memberId: { $toObjectId: "$$detail.k" },
                amountSplitted: { $toInt: "$$detail.v" },
              },
            },
          },
        },
      },
      {
        $unwind: "$splitMembers",
      },
      {
        $lookup: {
          from: "members",
          localField: "splitMembers.memberId",
          foreignField: "_id",
          as: "splitMemberData",
        },
      },
      {
        $unwind: "$splitMemberData",
      },

      {
        $addFields: {
          "paidMembers.name": {
            $concat: [
              "$paidMemberData.firstName",
              " ",
              "$paidMemberData.lastName",
              {
                $cond: [
                  {
                    $eq: [
                      "$paidMemberData.userId",
                      convertStringIdToObjectId(req.tokenId),
                    ],
                  },
                  " (You)",
                  "",
                ],
              },
            ],
          },
          "paidMembers.email": "$paidMemberData.email",
          "paidMembers.profile": "$paidMemberData.profile",
          "splitMembers.name": {
            $concat: [
              "$splitMemberData.firstName",
              " ",
              "$splitMemberData.lastName",
              {
                $cond: [
                  {
                    $eq: [
                      "$splitMemberData.userId",
                      convertStringIdToObjectId(req.tokenId),
                    ],
                  },
                  " (You)",
                  "",
                ],
              },
            ],
          },
          "splitMembers.email": "$splitMemberData.email",
          "splitMembers.profile": "$splitMemberData.profile",
        },
      },
      {
        $group: {
          _id: "$_id",
          paidMemberDetailsArray: { $addToSet: "$paidMembers" },
          splitMemberDetailsArray: { $addToSet: "$splitMembers" },
          description: { $first: "$description" },
          expenseAmount: { $first: "$expenseAmount" },
          expenseDate: { $first: "$expenseDate" },
          createdBy: { $first: "$createdBy" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          groupId: { $first: "$groupId" },
        },
      },
      {
        $lookup: {
          from: "members",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdByMemberData",
        },
      },
      {
        $unwind: "$createdByMemberData",
      },
      {
        $addFields: {
          createdBy: {
            $concat: [
              "$createdByMemberData.firstName",
              " ",
              "$createdByMemberData.lastName",
              {
                $cond: [
                  {
                    $eq: [
                      "$createdByMemberData.userId",
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

      { $sort: { createdAt: -1 } },
    ]);

    if (expenses) {
      apiResponse.status = true;
      apiResponse.data = expenses;
    }
    res.status(200).json(apiResponse);
  } catch (error) {
    apiResponse.errors = error;
    res.status(500).send(apiResponse);
  }
};

const addGroupMembersExpenses = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  const { groupId, paidMemberDetails, splitMemberDetails } = req.body;

  try {
    const tokenMemberData = await getTokenMemberData(req.tokenId);
    const reqData = {
      ...req.body,
      createdBy: tokenMemberData?._id,
      updatedBy: null,
    };
    const expenseResponse = await ExpenseModel.create(reqData);

    if (expenseResponse) {
      const updates = [];
      // Handling paidMemberDetails updates
      for (const [memberId, paidAmount] of Object.entries(paidMemberDetails)) {
        const updateOperation = {
          updateOne: {
            filter: { groupId, memberId },
            update: [
              {
                $set: {
                  expenseBalance: {
                    $add: ["$expenseBalance", Number(paidAmount)],
                  },
                  balanceAdjustmentDetails: {
                    $concatArrays: [
                      [
                        {
                          expenseId: expenseResponse._id,
                          receivedAmontId: null,
                          prevBalance: "$expenseBalance",
                          adjustmentAmount: Number(paidAmount),
                          newBalance: {
                            $add: ["$expenseBalance", Number(paidAmount)],
                          },
                          type: "+",
                          createdBy: tokenMemberData?._id,
                          createdAt: new Date().toISOString(),
                          updatedBy: null,
                          updatedAt: null,
                        },
                      ],
                      "$balanceAdjustmentDetails",
                    ],
                  },
                },
              },
            ],
          },
        };

        updates.push(updateOperation);
      }

      // Handling splitMemberDetails updates
      for (const [memberId, splitAmount] of Object.entries(
        splitMemberDetails
      )) {
        const updateOperation = {
          updateOne: {
            filter: { groupId, memberId },
            update: [
              {
                $set: {
                  expenseBalance: {
                    $subtract: ["$expenseBalance", Number(splitAmount)],
                  },
                  balanceAdjustmentDetails: {
                    $concatArrays: [
                      [
                        {
                          expenseId: expenseResponse._id,
                          receivedAmontId: null,
                          prevBalance: "$expenseBalance",
                          adjustmentAmount: Number(splitAmount),
                          newBalance: {
                            $subtract: ["$expenseBalance", Number(splitAmount)],
                          },
                          type: "-",
                          createdBy: tokenMemberData?._id,
                          createdAt: new Date().toISOString(),
                          updatedBy: null,
                          updatedAt: null,
                        },
                      ],
                      "$balanceAdjustmentDetails",
                    ],
                  },
                },
              },
            ],
          },
        };

        updates.push(updateOperation);
      }
      // Perform the bulkWrite operation
      await GroupMembersExpensesModel.bulkWrite(updates);
      const [data] = await GroupMembersExpensesModel.aggregate([
        { $match: { groupId: convertStringIdToObjectId(groupId) } },
        {
          $group: {
            _id: null,
            membersBalanceArray: {
              $push: {
                k: { $toString: "$memberId" }, // Convert memberId to string to use as a key
                v: "$expenseBalance", // Balance as the value
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            membersBalance: { $arrayToObject: "$membersBalanceArray" },
          },
        },
        {
          $replaceRoot: { newRoot: "$membersBalance" },
        },
      ]);
      const memberBalanceUpdateOperation = Object.keys(data).map(
        (memberId) => ({
          updateOne: {
            filter: {
              _id: convertStringIdToObjectId(memberId),
              "groups.groupId": convertStringIdToObjectId(groupId),
            },
            update: {
              $set: {
                "groups.$.balance": data[memberId],
              },
            },
          },
        })
      );

      await MemberModel.bulkWrite(memberBalanceUpdateOperation);
      apiResponse.status = true;
      apiResponse.msg = "Expense Added successfully";
      apiResponse.data = expenseResponse;
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
    console.log(error);
    apiResponse.errors = error;
    res.status(500).send(apiResponse);
  }
};
const updateExpense = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  const { expenseId, groupId, paidMemberDetails, splitMemberDetails } =
    req.body;
  try {
    const [selectedExpense] = await GroupMembersExpensesModel.aggregate([
      { $match: { groupId: convertStringIdToObjectId(groupId) } }, // Correctly match the document by groupId
      {
        $project: {
          isTargetIdAtZeroIndex: {
            $cond: {
              if: {
                $and: [
                  { $gt: [{ $size: "$balanceAdjustmentDetails" }, 0] }, // Check if the array is not empty
                  {
                    $eq: [
                      {
                        $arrayElemAt: [
                          "$balanceAdjustmentDetails.expenseId",
                          0,
                        ],
                      },
                      convertStringIdToObjectId(expenseId), // Convert expenseId to ObjectId for comparison
                    ],
                  }, // Compare ID at index 0
                ],
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
          isDeleteAble: { $first: "$isTargetIdAtZeroIndex" },
        },
      },
    ]);

    if (selectedExpense?.isDeleteAble) {
      const tokenMemberData = await getTokenMemberData(req.tokenId);
      const reqData = {
        ...req.body,
        updatedBy: tokenMemberData?._id,
      };

      const updatedData = await ExpenseModel.findByIdAndUpdate(
        expenseId,
        reqData
      );

      await GroupMembersExpensesModel.updateMany(
        { groupId: convertStringIdToObjectId(groupId) },
        {
          $pull: {
            balanceAdjustmentDetails: {
              expenseId: convertStringIdToObjectId(expenseId),
            },
          },
        }
      );
      await GroupMembersExpensesModel.updateMany(
        { groupId: convertStringIdToObjectId(groupId) },
        [
          {
            $set: {
              expenseBalance: {
                $cond: {
                  if: { $gt: [{ $size: "$balanceAdjustmentDetails" }, 0] },
                  then: {
                    $arrayElemAt: ["$balanceAdjustmentDetails.newBalance", 0],
                  },
                  else: 0,
                },
              },
            },
          },
        ]
      );
      const updates = [];

      // Handling paidMemberDetails updates
      for (const [memberId, paidAmount] of Object.entries(paidMemberDetails)) {
        const updateOperation = {
          updateOne: {
            filter: { groupId, memberId },
            update: [
              {
                $set: {
                  expenseBalance: {
                    $add: ["$expenseBalance", Number(paidAmount)],
                  },
                  balanceAdjustmentDetails: {
                    $concatArrays: [
                      [
                        {
                          expenseId: convertStringIdToObjectId(expenseId),
                          receivedAmontId: null,
                          prevBalance: "$expenseBalance",
                          adjustmentAmount: Number(paidAmount),
                          newBalance: {
                            $add: ["$expenseBalance", Number(paidAmount)],
                          },
                          type: "+",
                          createdBy: updatedData?.createdBy,
                          createdAt: updatedData.createdAt,
                          updatedBy: updatedData?.updatedBy,
                          updatedAt: updatedData?.updatedAt,
                        },
                      ],
                      "$balanceAdjustmentDetails",
                    ],
                  },
                },
              },
            ],
          },
        };

        updates.push(updateOperation);
      }

      // Handling splitMemberDetails updates
      for (const [memberId, splitAmount] of Object.entries(
        splitMemberDetails
      )) {
        const updateOperation = {
          updateOne: {
            filter: { groupId, memberId },
            update: [
              {
                $set: {
                  expenseBalance: {
                    $subtract: ["$expenseBalance", Number(splitAmount)],
                  },
                  balanceAdjustmentDetails: {
                    $concatArrays: [
                      [
                        {
                          expenseId: convertStringIdToObjectId(expenseId),
                          receivedAmontId: null,
                          prevBalance: "$expenseBalance",
                          adjustmentAmount: Number(splitAmount),
                          newBalance: {
                            $subtract: ["$expenseBalance", Number(splitAmount)],
                          },
                          type: "-",
                          createdBy: updatedData?.createdBy,
                          createdAt: updatedData.createdAt,
                          updatedBy: updatedData?.updatedBy,
                          updatedAt: updatedData?.updatedAt,
                        },
                      ],
                      "$balanceAdjustmentDetails",
                    ],
                  },
                },
              },
            ],
          },
        };

        updates.push(updateOperation);
      }
      // Perform the bulkWrite operation
      await GroupMembersExpensesModel.bulkWrite(updates);
      const [data] = await GroupMembersExpensesModel.aggregate([
        { $match: { groupId: convertStringIdToObjectId(groupId) } },
        {
          $group: {
            _id: null,
            membersBalanceArray: {
              $push: {
                k: { $toString: "$memberId" }, // Convert memberId to string to use as a key
                v: "$expenseBalance", // Balance as the value
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            membersBalance: { $arrayToObject: "$membersBalanceArray" },
          },
        },
        {
          $replaceRoot: { newRoot: "$membersBalance" },
        },
      ]);
      const memberBalanceUpdateOperation = Object.keys(data).map(
        (memberId) => ({
          updateOne: {
            filter: {
              _id: convertStringIdToObjectId(memberId),
              "groups.groupId": convertStringIdToObjectId(groupId),
            },
            update: {
              $set: {
                "groups.$.balance": data[memberId],
              },
            },
          },
        })
      );
      await MemberModel.bulkWrite(memberBalanceUpdateOperation);
      if (updatedData) {
        apiResponse.status = true;
        apiResponse.msg = "Expense updated successfully";
        return res.status(200).json(apiResponse);
      }
      apiResponse.msg = "Expense not found";
      return res.status(200).json(apiResponse);
    }
    apiResponse.data = selectedExpense;
    apiResponse.msg =
      "The system restricts update of the expense unless it is the final expense recorded. This ensures the integrity of expense tracking.";
    return res.status(200).json(apiResponse);
  } catch (error) {
    console.log(error);
    apiResponse.errors = error;
    return res.status(500).send(apiResponse);
  }
};
const deleteExpense = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  const { groupId, expenseId } = req.params;
  try {
    const [selectedExpense] = await GroupMembersExpensesModel.aggregate([
      { $match: { groupId: convertStringIdToObjectId(groupId) } }, // Correctly match the document by groupId
      {
        $project: {
          isTargetIdAtZeroIndex: {
            $cond: {
              if: {
                $and: [
                  { $gt: [{ $size: "$balanceAdjustmentDetails" }, 0] }, // Check if the array is not empty
                  {
                    $eq: [
                      {
                        $arrayElemAt: [
                          "$balanceAdjustmentDetails.expenseId",
                          0,
                        ],
                      },
                      convertStringIdToObjectId(expenseId), // Convert expenseId to ObjectId for comparison
                    ],
                  }, // Compare ID at index 0
                ],
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
          isDeleteAble: { $first: "$isTargetIdAtZeroIndex" },
        },
      },
    ]);
    if (selectedExpense.isDeleteAble) {
      const deletedData = await ExpenseModel.findByIdAndDelete(expenseId);
      await GroupMembersExpensesModel.updateMany(
        { groupId: convertStringIdToObjectId(groupId) },
        {
          $pull: {
            balanceAdjustmentDetails: {
              expenseId: convertStringIdToObjectId(expenseId),
            },
          },
        }
      );
      await GroupMembersExpensesModel.updateMany(
        { groupId: convertStringIdToObjectId(groupId) },
        [
          {
            $set: {
              expenseBalance: {
                $cond: {
                  if: { $gt: [{ $size: "$balanceAdjustmentDetails" }, 0] },
                  then: {
                    $arrayElemAt: ["$balanceAdjustmentDetails.newBalance", 0],
                  },
                  else: 0,
                },
              },
            },
          },
        ]
      );
      if (deletedData) {
        apiResponse.status = true;
        apiResponse.msg = "Expense deleted successfully";
        return res.status(200).json(apiResponse);
      }
      apiResponse.status = true;
      apiResponse.msg = "Expense not found";
      return res.status(200).json(apiResponse);
    }
    apiResponse.msg =
      "The system restricts deletion of the expense unless it is the final expense recorded. This ensures the integrity of expense tracking.";
    return res.status(200).json(apiResponse);
  } catch (error) {
    console.log(error);
    apiResponse.errors = error;
    return res.status(500).send(apiResponse);
  }
};

const receivedAmout = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  const { fromMemberId, groupId, receivedAmount } = req.body;

  try {
    // Fetch the member data using the token
    const tokenMemberData = await getTokenMemberData(req.tokenId);
    const fromMemberData = await MemberModel.findById(
      convertStringIdToObjectId(fromMemberId)
    );

    // Prepare the request data
    const reqData = {
      ...req.body,
      fromMemberId: convertStringIdToObjectId(fromMemberId),
      toMemberId: tokenMemberData?._id,
    };

    // Create the received amount history record
    const receivedAmountResponse = await ReceivedAmountHistoryModel.create(
      reqData
    );

    if (receivedAmountResponse) {
      // Define operations for updating member balances

      const fromMemberOperation = {
        updateOne: {
          filter: {
            groupId,
            memberId: convertStringIdToObjectId(fromMemberId),
          },
          update: [
            {
              $set: {
                expenseBalance: {
                  $add: ["$expenseBalance", Number(receivedAmount)],
                },
                balanceAdjustmentDetails: {
                  $concatArrays: [
                    [
                      {
                        expenseId: null,
                        receivedAmontId: receivedAmountResponse._id,
                        prevBalance: "$expenseBalance",
                        adjustmentAmount: Number(receivedAmount),
                        newBalance: {
                          $add: ["$expenseBalance", Number(receivedAmount)],
                        },
                        type: "+",
                        createdBy: tokenMemberData?._id,
                        createdAt: new Date().toISOString(),
                        updatedBy: null,
                        updatedAt: null,
                      },
                    ],
                    "$balanceAdjustmentDetails",
                  ],
                },
              },
            },
          ],
        },
      };
      const toMemberOperation = {
        updateOne: {
          filter: { groupId, memberId: tokenMemberData._id },
          update: [
            {
              $set: {
                expenseBalance: {
                  $subtract: ["$expenseBalance", Number(receivedAmount)],
                },
                balanceAdjustmentDetails: {
                  $concatArrays: [
                    [
                      {
                        expenseId: null,
                        receivedAmontId: receivedAmountResponse._id,
                        prevBalance: "$expenseBalance",
                        adjustmentAmount: Number(receivedAmount),
                        newBalance: {
                          $subtract: [
                            "$expenseBalance",
                            Number(receivedAmount),
                          ],
                        },
                        type: "-",
                        createdBy: tokenMemberData?._id,
                        createdAt: new Date().toISOString(),
                        updatedBy: null,
                        updatedAt: null,
                      },
                    ],
                    "$balanceAdjustmentDetails",
                  ],
                },
              },
            },
          ],
        },
      };

      // Perform the bulk write operation
      await GroupMembersExpensesModel.bulkWrite([
        fromMemberOperation,
        toMemberOperation,
      ]);

      // Prepare the response
      apiResponse.status = true;
      apiResponse.msg = `The amount of ${receivedAmount} was successfully received from ${fromMemberData.firstName} ${fromMemberData.lastName}.`;
      apiResponse.data = receivedAmountResponse;
    }

    // Send the response
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
    console.log(error);
    apiResponse.errors = error;
    res.status(500).send(apiResponse);
  }
};
const addSharedGroupExpense = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  try {
    const tokenMemberData = await MemberModel.findOne({ userId: req.tokenId });
    const reqBody = { ...req.body, memberId: tokenMemberData._id };
    const data = await SharedGroupMembersExpensesModel.create(reqBody);
    if (data) {
      apiResponse.status = true;
      apiResponse.msg = "Expenses added successfully";
      apiResponse.data = data;
    } else {
      apiResponse.msg = "Error in adding expense";
    }
    res.status(200).json(apiResponse);
  } catch (error) {
    console.log(error);
    apiResponse.errors = error;
    res.status(500).json(apiResponse);
  }
};
const updateSharedGroupExpense = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  try {
    // const tokenMemberData = await MemberModel.findOne({ userId: req.tokenId });
    // const reqBody = { ...req.body, memberId: tokenMemberData._id };
    const data = await SharedGroupMembersExpensesModel.findByIdAndUpdate(
      req.body.expenseId,
      req.body
    );
    if (data) {
      apiResponse.status = true;
      apiResponse.msg = "Expenses updated successfully";
      apiResponse.data = data;
    } else {
      apiResponse.msg = "Error in updating expense";
    }
    res.status(200).json(apiResponse);
  } catch (error) {
    console.log(error);
    apiResponse.errors = error;
    res.status(500).json(apiResponse);
  }
};
const deleteSharedGroupExpense = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  try {
    const data = await SharedGroupMembersExpensesModel.findByIdAndDelete(
      req.params.contributionId
    );
    if (data) {
      apiResponse.status = true;
      apiResponse.msg = "Deleted successfully";
      apiResponse.data = data;
    } else {
      apiResponse.msg = "Error in Deleting";
    }
    res.status(200).json(apiResponse);
  } catch (error) {
    console.log(error);
    apiResponse.errors = error;
    res.status(500).json(apiResponse);
  }
};

const getSharedGroupExpenses = async (req, res) => {
  const { createdFrom, createdTo, groupId } = req.body;

  let apiResponse = new ApiResponseModel();
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
    const expenses = await SharedGroupMembersExpensesModel.aggregate([
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
        $lookup: {
          from: "members",
          localField: "memberId",
          foreignField: "_id",
          as: "membersData",
        },
      },

      {
        $unwind: "$membersData",
      },
      {
        $addFields: {
          name: {
            $concat: [
              "$membersData.firstName",
              " ",
              "$membersData.lastName",
              {
                $cond: [
                  {
                    $eq: [
                      "$membersData.userId",
                      convertStringIdToObjectId(req.tokenId),
                    ],
                  },
                  " (You)",
                  "",
                ],
              },
            ],
          },
          email: "$membersData.email",
          profile: "$membersData.profile",
        },
      },
      {
        $project: {
          membersData: 0,
        },
      },

      { $sort: { createdAt: -1 } },
    ]);

    if (expenses) {
      apiResponse.status = true;
      apiResponse.data = expenses;
    }
    res.status(200).json(apiResponse);
  } catch (error) {
    apiResponse.errors = error;
    res.status(500).send(apiResponse);
  }
};
const getSharedGroupContributions = async (req, res) => {
  const { createdFrom, createdTo, groupId } = req.body;
  let apiResponse = new ApiResponseModel();
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
    const expenses = await SharedGroupContributedAmountHistoryModel.aggregate([
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
        $lookup: {
          from: "members",
          localField: "memberId",
          foreignField: "_id",
          as: "membersData",
        },
      },

      {
        $unwind: "$membersData",
      },
      {
        $addFields: {
          name: {
            $concat: [
              "$membersData.firstName",
              " ",
              "$membersData.lastName",
              {
                $cond: [
                  {
                    $eq: [
                      "$membersData.userId",
                      convertStringIdToObjectId(req.tokenId),
                    ],
                  },
                  " (You)",
                  "",
                ],
              },
            ],
          },
          email: "$membersData.email",
          profile: "$membersData.profile",
        },
      },
      {
        $project: {
          membersData: 0,
        },
      },

      { $sort: { createdAt: -1 } },
    ]);

    if (expenses) {
      apiResponse.status = true;
      apiResponse.data = expenses;
    }
    res.status(200).json(apiResponse);
  } catch (error) {
    apiResponse.errors = error;
    res.status(500).send(apiResponse);
  }
};
module.exports = {
  addGroupMembersExpenses,
  getGroupMembersExpenses,
  getExpenses,
  getSharedGroupExpenses,
  getSharedGroupContributions,
  deleteExpense,
  updateExpense,
  receivedAmout,
  addSharedGroupExpense,
  updateSharedGroupExpense,
  deleteSharedGroupExpense,
};
