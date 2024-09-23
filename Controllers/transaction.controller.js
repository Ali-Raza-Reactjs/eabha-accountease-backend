const mongoose = require("mongoose");
const { ApiResponseModel } = require("../Utils/classes");
const { transactionTypesEnum } = require("../Utils/enum");
const MembersTransactionModel = require("../Models/MembersTransactionModel");
const MemberModel = require("../Models/MemberModel");
const MembersLoanTransactionModel = require("../Models/MembersLoanTransactionModel");
const _enum = require("../Utils/enum");

const getTransactionTypes = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  try {
    const data = await mongoose.connection.db
      .collection("transactionTypes")
      .find({ forSelection: true })
      .toArray();
    apiResponse.status = true;
    apiResponse.data = data;
    res.status(200).json(apiResponse);
  } catch (error) {
    console.error(error);
    apiResponse.errors = error;
    res.status(500).send(apiResponse);
  }
};
const getTransactionCategories = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  try {
    const data = await mongoose.connection.db
      .collection("transactionCategories")
      .find({})
      .toArray();
    apiResponse.status = true;
    apiResponse.data = data;
    res.status(200).json(apiResponse);
  } catch (error) {
    console.error(error);
    apiResponse.errors = error;
    res.status(500).send(apiResponse);
  }
};

const addTransaction = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  try {
    const memberData = await MemberModel.findOne({ userId: req.tokenId });
    const memberId = memberData._id;

    const history = await MembersTransactionModel.create({
      memberId: memberId,
      ...req.body,
    });
    apiResponse.status = true;
    apiResponse.msg = "Transaction Added Successfully";
    apiResponse.data = history;
    res.status(200).json(apiResponse);
  } catch (error) {
    if (error.name === "ValidationError") {
      let errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      apiResponse.errors = errors;
      return res.status(200).json(apiResponse);
    }
    apiResponse.errors = error;
    res.status(500).send(apiResponse);
  }
};
const addLoanTransaction = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  const { type, amount } = req.body;
  try {
    const memberData = await MemberModel.findOne({ userId: req.tokenId });
    const memberId = memberData._id;

    const history = await MembersLoanTransactionModel.create({
      ...req.body,
      date: _enum.dateEnum.currentDate,
      memberId: memberId,
    });

    await MemberModel.findOneAndUpdate(
      { userId: req.tokenId },
      {
        $inc: {
          loan:
            type === _enum.transactionTypesEnum.TAKE_A_LOAN ? amount : -amount,
        },
      },
      { new: true } // Option to return the updated document
    );

    if (history) {
      apiResponse.status = true;
      apiResponse.msg = "Transaction Added Successfully";
      apiResponse.data = history;
    }
    return res.status(200).json(apiResponse);
  } catch (error) {
    if (error.name === "ValidationError") {
      let errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      apiResponse.errors = errors;
      return res.status(200).json(apiResponse);
    }
    console.log(error);
    apiResponse.errors = error;
    res.status(500).send(apiResponse);
  }
};
const updateTransaction = async (req, res) => {
  const { transactionId, date, amount, type, category, comment } = req.body;
  let apiResponse = new ApiResponseModel();
  try {
    const updatedTansaction = await MembersTransactionModel.findOneAndUpdate(
      { _id: transactionId },
      {
        date,
        amount,
        type,
        category,
        comment,
      },
      { new: true }
    );
    apiResponse.status = true;
    apiResponse.msg = "Transaction Updated Successfully";
    apiResponse.data = updatedTansaction;
    res.status(200).json(apiResponse);
  } catch (error) {
    console.error(error);
    apiResponse.errors = error;
    res.status(500).send(apiResponse);
  }
};

const getMemberTransactionDetails = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  const { createdFrom, createdTo, type, categories } = req.body;
  let dateMathQuery = {};
  let typeMatchQuery = {};
  let categoryMatchQuery = {};
  if (createdFrom && createdTo) {
    dateMathQuery = {
      date: {
        $gte: new Date(createdFrom),
        $lte: new Date(createdTo),
      },
    };
  } else if (createdFrom) {
    dateMathQuery = {
      date: {
        $gte: new Date(createdFrom),
      },
    };
  } else if (createdTo) {
    dateMathQuery = {
      date: {
        $lte: new Date(createdTo),
      },
    };
  }

  if (type) {
    typeMatchQuery = {
      type: type,
    };
  } else {
    typeMatchQuery = {
      type: {
        $in: [
          _enum.transactionTypesEnum.RECEIVED,
          _enum.transactionTypesEnum.SPENT,
        ],
      },
    };
  }
  if (categories) {
    const categoriesArr = categories.split(",").map(Number);
    categoryMatchQuery = {
      category: {
        $in: categoriesArr,
      },
    };
  }

  try {
    const memberData = await MemberModel.findOne({ userId: req.tokenId });
    const memberId = memberData._id;
    const membersTransactionDetail = await MembersTransactionModel.aggregate([
      {
        $match: {
          $and: [
            dateMathQuery,
            typeMatchQuery,
            categoryMatchQuery,
            { memberId },
          ],
        },
      },
      {
        $lookup: {
          from: "transactionTypes", // Collection name
          localField: "type",
          foreignField: "transactionTypeId",
          as: "transactionsTypes",
        },
      },
      {
        $lookup: {
          from: "transactionTypes", // Collection name
          localField: "additionalType",
          foreignField: "transactionTypeId",
          as: "additionalTransactionTypes",
        },
      },
      {
        $lookup: {
          from: "transactionCategories", // Collection name
          localField: "category",
          foreignField: "transactionCategoryId",
          as: "transactionCategories",
        },
      },
      { $unwind: "$transactionsTypes" },
      {
        $unwind: {
          path: "$transactionCategories",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$additionalTransactionTypes",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          transactionTypeId: "$transactionsTypes.transactionTypeId",
          transactionTypeName: "$transactionsTypes.transactionTypeName",
          additionalTransactionTypeId:
            "$additionalTransactionTypes.transactionTypeId",
          additionalTransactionTypeName:
            "$additionalTransactionTypes.transactionTypeName",
          transactionCategoryId: "$transactionCategories.transactionCategoryId",
          transactionCategoryName:
            "$transactionCategories.transactionCategoryName",
        },
      },
      { $sort: { date: -1, createdAt: -1, updatedAt: -1 } },
      {
        $project: {
          transactionsTypes: 0,
          transactionCategories: 0,
          additionalTransactionTypes: 0,
          category: 0,
          type: 0,
          additionalType: 0,
        },
      },
    ]);
    const [membersReceivableAmountDetail] =
      await MembersTransactionModel.aggregate([
        {
          $match: { memberId },
        },
        {
          $group: {
            _id: null,
            totalReceivableAmount: {
              $sum: {
                $cond: {
                  if: {
                    $eq: ["$type", transactionTypesEnum.RECEIVABLE],
                  },
                  then: "$amount",
                  else: 0,
                },
              },
            },
          },
        },
      ]);

    const [membersTotalAmountBetweenDates] =
      await MembersLoanTransactionModel.aggregate([
        {
          $match: {
            $and: [dateMathQuery, { memberId }],
          },
        },
        {
          $group: {
            _id: null,
            totalLoanAmoutBetweenDates: {
              $sum: {
                $cond: {
                  if: {
                    $eq: ["$type", transactionTypesEnum.TAKE_A_LOAN],
                  },
                  then: "$amount",
                  else: 0,
                },
              },
            },
            totalRepaidAmoutBetweenDates: {
              $sum: {
                $cond: {
                  if: {
                    $eq: ["$type", transactionTypesEnum.REPAY_A_LOAN],
                  },
                  then: "$amount",
                  else: 0,
                },
              },
            },
          },
        },
      ]);
    apiResponse.status = true;
    apiResponse.data = {
      membersTransactionDetail,
      totalReceivableAmount:
        membersReceivableAmountDetail?.totalReceivableAmount || 0,
      totalLaonAmount: memberData.loan,

      totalLaonAmountBetweenDates:
        membersTotalAmountBetweenDates?.totalLoanAmoutBetweenDates || 0,
      totalRepaidAmountBetweenDates:
        membersTotalAmountBetweenDates?.totalRepaidAmoutBetweenDates || 0,
    };
    res.status(200).json(apiResponse);
  } catch (error) {
    console.log(error);
    apiResponse.errors = error;
    res.status(500).send(apiResponse);
  }
};
const getMemberTransactionLoanDetails = async (req, res) => {
  const apiResponse = new ApiResponseModel();
  try {
    const memberData = await MemberModel.findOne({ userId: req.tokenId });
    const memberId = memberData._id;
    const membersLoanTransactionDetail =
      await MembersLoanTransactionModel.aggregate([
        {
          $match: {
            memberId,
          },
        },
        {
          $lookup: {
            from: "transactionTypes", // Collection name
            localField: "type",
            foreignField: "transactionTypeId",
            as: "transactionsTypes",
          },
        },
        { $unwind: "$transactionsTypes" },

        {
          $addFields: {
            transactionTypeId: "$transactionsTypes.transactionTypeId",
            transactionTypeName: "$transactionsTypes.transactionTypeName",
            additionalTransactionTypeId:
              "$additionalTransactionTypes.transactionTypeId",
            additionalTransactionTypeName:
              "$additionalTransactionTypes.transactionTypeName",
            transactionCategoryId:
              "$transactionCategories.transactionCategoryId",
            transactionCategoryName:
              "$transactionCategories.transactionCategoryName",
          },
        },
        { $sort: { createdAt: -1 } },
        {
          $project: {
            transactionsTypes: 0,
          },
        },
      ]);

    apiResponse.status = true;
    apiResponse.data = membersLoanTransactionDetail;
    res.status(200).json(apiResponse);
  } catch (error) {
    apiResponse.errors = error;
    res.status(500).send(apiResponse);
  }
};

const deleteTransaction = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  const { transactionId } = req.params;
  console.log(req.params);
  try {
    const deleted = await MembersTransactionModel.findOneAndDelete({
      _id: transactionId,
    });
    if (!deleted) {
      apiResponse.msg = "Transaction not found";
      return res.status(200).json(apiResponse);
    }
    apiResponse.status = true;
    apiResponse.msg = "Transaction deleted successfully";
    return res.status(200).json(apiResponse);
  } catch (error) {
    apiResponse.errors = error;
    return res.status(500).send(apiResponse);
  }
};
const revertLoanTransaction = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  const { transactionId } = req.body;
  try {
    const transactionDetails = await MembersLoanTransactionModel.findById(
      transactionId
    );
    await MemberModel.findOneAndUpdate(
      { userId: req.tokenId },
      {
        $inc: {
          loan:
            transactionDetails.type === _enum.transactionTypesEnum.TAKE_A_LOAN
              ? -transactionDetails.amount
              : transactionDetails.amount,
        },
      },
      { new: true } // Option to return the updated document
    );
    const deleted = await MembersLoanTransactionModel.findOneAndDelete({
      _id: transactionId,
    });
    if (deleted) {
      apiResponse.status = true;
      apiResponse.msg = "Transaction reverted successfully";
    }
    apiResponse.msg = "Transaction not found";
    return res.status(200).json(apiResponse);
  } catch (error) {
    apiResponse.errors = error;
    return res.status(500).send(apiResponse);
  }
};
module.exports = {
  getTransactionTypes,
  getTransactionCategories,
  addTransaction,
  addLoanTransaction,
  updateTransaction,
  getMemberTransactionDetails,
  getMemberTransactionLoanDetails,
  deleteTransaction,
  revertLoanTransaction,
};
