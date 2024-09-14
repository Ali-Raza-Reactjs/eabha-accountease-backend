const mongoose = require("mongoose");
const { ApiResponseModel } = require("../Utils/classes");
const { transactionTypesEnum } = require("../Utils/enum");
const MembersTransactionModel = require("../Models/MembersTransactionModel");
const MemberModel = require("../Models/MemberModel");

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

const addTransaction = async (req, res) => {
  const { type, ...others } = req.body;
  let apiResponse = new ApiResponseModel();
  try {
    const memberData = await MemberModel.findOne({ userId: req.tokenId });
    const memberId = memberData._id;
    let history;
    if (type === transactionTypesEnum.GIVE_A_LOAN) {
      history = await MembersTransactionModel.insertMany([
        {
          ...others,
          memberId: memberId,
          type: transactionTypesEnum.GIVE_A_LOAN,
          additionalType: transactionTypesEnum.RECEIVABLE,
        },
      ]);
    } else if (type === transactionTypesEnum.TAKE_A_LOAN) {
      history = await MembersTransactionModel.insertMany([
        {
          ...others,
          memberId: memberId,
          type: transactionTypesEnum.TAKE_A_LOAN,
          additionalType: transactionTypesEnum.RECEIVED,
        },
      ]);
    } else if (type === transactionTypesEnum.REPAY_A_LOAN) {
      history = await MembersTransactionModel.insertMany([
        {
          memberId: memberId,
          type: transactionTypesEnum.REPAY_A_LOAN,
          additionalType: transactionTypesEnum.SPENT,
          ...others,
        },
      ]);
    } else if (req.body.payLoan) {
      history = await MembersTransactionModel.insertMany([
        {
          type: transactionTypesEnum.RECEIVED,
          memberId: memberId,
          ...others,
        },
        {
          memberId: memberId,
          type: transactionTypesEnum.REPAY_A_LOAN,
          additionalType: transactionTypesEnum.SPENT,
          ...others,
        },
      ]);
    } else {
      history = await MembersTransactionModel.create({
        memberId: memberId,
        type,
        ...others,
      });
    }
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
const updateTransaction = async (req, res) => {
  const {
    transactionId,
    date,
    amount,
    type,
    additionalType,
    category,
    comment,
  } = req.body;
  let apiResponse = new ApiResponseModel();
  try {
    const oldTransaction = await MembersTransactionModel.findById(
      transactionId
    );
    // if give a loan type
    let _additionalType = oldTransaction.additionalType;
    // received case
    if (type === transactionTypesEnum.RECEIVED) {
      _additionalType = 0;
    }
    // receivable case
    if (type === transactionTypesEnum.RECEIVABLE) {
      _additionalType = 0;
    }
    // spent case
    if (type === transactionTypesEnum.SPENT) {
      _additionalType = 0;
    }
    //  give a loan case
    if (type === transactionTypesEnum.GIVE_A_LOAN) {
      _additionalType = transactionTypesEnum.RECEIVABLE;
      _additionalType = additionalType;
    }
    // take a loan case
    if (type === transactionTypesEnum.TAKE_A_LOAN) {
      _additionalType = transactionTypesEnum.RECEIVED;
    }
    // pay a loan case
    if (type === transactionTypesEnum.REPAY_A_LOAN) {
      _additionalType = transactionTypesEnum.SPENT;
    }

    const updatedTansaction = await MembersTransactionModel.findOneAndUpdate(
      { _id: transactionId },
      {
        date,
        amount,
        type,
        additionalType: _additionalType,
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
    if (type === transactionTypesEnum.SPENT) {
      typeMatchQuery = {
        $or: [
          {
            type: {
              $in: [
                transactionTypesEnum.SPENT,
                transactionTypesEnum.GIVE_A_LOAN,
              ],
            },
          },
          { additionalType: type },
        ],
      };
    } else {
      typeMatchQuery = {
        $or: [{ type: type }, { additionalType: type }],
      };
    }
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
      { $sort: { date: -1, createdAt: -1 } },
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
    const [membersReceivableAndLoanAmountDetail] =
      await MembersTransactionModel.aggregate([
        {
          $match: { memberId },
        },
        {
          $group: {
            _id: null,
            totalLoanAmount: {
              $sum: {
                $cond: {
                  if: {
                    $or: [
                      { $eq: ["$type", transactionTypesEnum.TAKE_A_LOAN] },
                      {
                        $eq: [
                          "$additionalType",
                          transactionTypesEnum.TAKE_A_LOAN,
                        ],
                      },
                    ],
                  },
                  then: "$amount",
                  else: {
                    $cond: {
                      if: {
                        $or: [
                          {
                            $eq: ["$type", transactionTypesEnum.REPAY_A_LOAN],
                          },
                          {
                            $eq: [
                              "$additionalType",
                              transactionTypesEnum.REPAY_A_LOAN,
                            ],
                          },
                        ],
                      },
                      then: { $multiply: ["$amount", -1] }, // Subtract by multiplying by -1
                      else: 0,
                    },
                  },
                },
              },
            },
            totalPendingAmount: {
              $sum: {
                $cond: {
                  if: {
                    $or: [
                      { $eq: ["$type", transactionTypesEnum.RECEIVABLE] },
                      {
                        $eq: [
                          "$additionalType",
                          transactionTypesEnum.RECEIVABLE,
                        ],
                      },
                    ],
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
      membersReceivableAndLoanAmountDetail,
    };
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

module.exports = {
  getTransactionTypes,
  addTransaction,
  updateTransaction,
  getMemberTransactionDetails,
  deleteTransaction,
};
