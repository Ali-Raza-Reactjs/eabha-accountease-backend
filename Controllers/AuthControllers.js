const PaymentHistoryModel = require("../Models/PaymentHistoryModel");
const MembersModel = require("../Models/MemberModel");
const UserModel = require("../Models/UserModel");
const jwt = require("jsonwebtoken");
const ExpenseModel = require("../Models/ExpenseModel");
const MembersExpenseModel = require("../Models/MembersExpenseModel");
const admin = require("firebase-admin");
const moment = require("moment");
const otpGenerator = require("otp-generator");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const serviceAccount = {
  type: process.env.SERVICE_ACCOUNT_TYPE,
  project_id: process.env.SERVICE_ACCOUNT_PROJECT_ID,
  private_key_id: process.env.SERVICE_ACCOUNT_PRIVATE_KEY_ID,
  private_key: process.env.SERVICE_ACCOUNT_PRIVATE_KEY,
  client_email: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL,
  client_id: process.env.SERVICE_ACCOUNT_CLIENT_ID,
  auth_uri: process.env.SERVICE_ACCOUNT_AUTH_ID,
  token_uri: process.env.SERVICE_ACCOUNT_TOKEN_URI,
  auth_provider_x509_cert_url:
    process.env.SERVICE_ACCOUNT_AUTH_PROVIDER_x509_CERT_URL,
  client_x509_cert_url: process.env.SERVICE_ACCOUNT_CLIENT_x509_CERT_URL,
  universe_domain: process.env.SERVICE_ACCOUNT_UNIVERSE_DOMAIN,
};
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://eabha-foundation.appspot.com",
});
const formidable = require("formidable");
const OTPModel = require("../Models/OTPModel");
const ReceivedAmountHistoryModel = require("../Models/ReceivedAmountHistoryModel");
const MembersTransactionModel = require("../Models/MembersTransactionModel");
const bucket = admin.storage().bucket();

const maxAge = 2 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: maxAge,
  });
};

const handleErrors = (err) => {
  let errors = { email: "", password: "" };
  console.log(errors);
  if (err.message === "incorrect email") {
    errors.email = "That email is not Registered";
  }
  if (err.message === "incorrect password") {
    errors.email = "That password is incorrect";
  }
  if (err.code === 11000) {
    errors.email = "Email is already registered";
    return errors;
  }

  if (err.message.includes("User validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
};

// Enum
const Enum = Object.freeze({
  paymentMethodIds: {
    Deposit: 1,
    Withdraw: 2,
  },
  paymentStatusIds: {
    Approved: 1,
    PendingApproval: 2,
  },
  transactionTypesIds: {
    RECEIVED: 1,
    RECEIVABLE: 2,
    SPENT: 3,
    GIVE_A_LOAN: 4,
    TAKE_A_LOAN: 5,
    REPAY_A_LOAN: 6,
  },
  transactionCategoriesIds: {
    GENERAL: 1,
    HOME: 2,
    UTILITY_BILL: 3,
    FOOD: 4,
    TRAVELIING: 5,
    FUEL: 6,
    PERSONAL: 7,
  },
  currentMonth: moment().format("YYYY-MM"),
  firstDateOfMonth: moment().startOf("month").format("YYYY-MM-DD"),
  currentDate: moment().format("YYYY-MM-DD"),
});

// find by id methods
const handleFindMemberById = async (id) => {
  const member = await mongoose.connection.db
    .collection("members")
    .findOne({ _id: Number(id) });
  return member;
};
const handleFindUserById = async (id) => {
  const member = await UserModel.findById(id);
  return member;
};
const handleFindPaymentMethodById = async (id) => {
  return (member = await mongoose.connection.db
    .collection("paymentMethods")
    .findOne({ paymentMethodId: id }));
};
const handleFindPaymentStatusById = async (id) => {
  return (member = await mongoose.connection.db
    .collection("paymentStatuses")
    .findOne({ paymentStatusId: id }));
};

// log in
module.exports.register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.create({ email, password });
    const token = createToken(user._id);
    res.cookie("jwt", token, {
      withCredentials: true, // Corrected typo
      httpOnly: false,
      maxAge: maxAge * 1000,
    });
    res.status(201).json({ user: user._id, created: true });
  } catch (err) {
    console.log(err);
    const errors = handleErrors(err);
    res.json({ errors, created: false });
  }
};

module.exports.updateProfile = async (req, res) => {
  let imageUrl = "";
  try {
    const form = formidable.formidable({ multiples: false });
    form.parse(req, async (err, fields, files) => {
      const { memberId, name, phone, gmailId } = fields;
      if (err) {
        return res.status(500).json({ success: false, error: err });
      }
      if (files.profilePhoto) {
        const file = files.profilePhoto[0];
        const filePath = file.filepath;
        const remoteFilePath = `images/${file.newFilename}`;

        try {
          await bucket.upload(filePath, { destination: remoteFilePath });
          const _options = {
            action: "read",
            expires: Date.now() + 1000000 * 60 * 60 * 1000,
          };
          const signedUrl = await bucket
            .file(remoteFilePath)
            .getSignedUrl(_options);
          imageUrl = signedUrl[0];
        } catch (error) {
          console.error("Failed to upload file:", error);
          return res
            .status(500)
            .json({ success: false, error: "Failed to upload file" });
        }
      }

      const filter = { _id: Number(memberId) };
      const update = {
        $set: {
          ...(name && { name: name[0] }),
          ...(phone && { phone: phone[0] }),
          ...(gmailId && { gmailId: gmailId[0] }),
          ...(files.profilePhoto && { profilePhoto: imageUrl }),
        },
      };
      const options = { returnOriginal: false };
      const user = await mongoose.connection.db
        .collection("members")
        .findOneAndUpdate(filter, update, options);
      if (user) {
        res.status(200).json({
          status: true,
          message: "Your profile has updated successfully",
        });
      } else {
        res.status(404).json({ status: false, message: "User not found" });
      }
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

module.exports.updatePassword = async (req, res) => {
  try {
    const { userId, newPassword, oldPassword } = req.body;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({
      status: true,
      data: user,
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors });
  }
};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.login(email, password);
    const token = createToken(user._id);
    const expiryTimeMs = maxAge * 1000;
    const expiryDateTime = new Date(Date.now() + expiryTimeMs);
    const formattedExpiryDateTime = expiryDateTime.toISOString();
    const member = await MembersModel.findById(user?.memberId);
    res.status(200).json({
      data: {
        jwt: token,
        expiryDateTime: formattedExpiryDateTime,
        userId: user?._id,
        memberId: user?.memberId,
        name: member?.name,
        profile: member?.profilePhoto,
        email: user.email,
      },
      status: true,
    });
  } catch (err) {
    const errors = handleErrors(err);
    res.json({ errors, status: false });
  }
};

const getMemberDataByUserId = async (userId) => {
  try {
    const memberData = await MembersModel.findOne({
      userId: new ObjectId(userId),
    });
    return memberData;
  } catch (error) {
    console.error("Error fetching member data:", error);
    throw error;
  }
};

module.exports.deletePaymentHistory = async (req, res) => {
  const { paymentHistoryId } = req.params;
  try {
    const deletedPayment = await PaymentHistoryModel.findOneAndDelete({
      _id: paymentHistoryId,
    });
    if (!deletedPayment) {
      return res
        .status(404)
        .json({ message: "Payment not found", status: false });
    }
    res.status(200).json({ data: deletedPayment, status: true });
  } catch (error) {
    if (error.name === "ValidationError") {
      let errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res.status(200).json({ errors, status: false });
    }
    res.status(500).send("Something went wrong");
  }
};

// dashboard card
module.exports.getTotalAmount = async (req, res) => {
  const { paymentMethodId, paymentMonth, history } = req.body;
  try {
    let result = {};
    if (paymentMethodId === 0 && !paymentMonth) {
      result.data = [];
      if (history) {
        result.data = await PaymentHistoryModel.aggregate([
          {
            $match: {
              paymentStatusId: Enum.paymentStatusIds.Approved,
            },
          },
          {
            $lookup: {
              from: "members", // Collection name
              localField: "memberId",
              foreignField: "_id",
              as: "memberData",
            },
          },
          {
            $addFields: {
              memberName: { $arrayElemAt: ["$memberData.name", 0] },
              memberProfilePhoto: {
                $arrayElemAt: ["$memberData.profilePhoto", 0],
              },
            },
          },
          {
            $project: {
              memberData: 0, // Remove the memberData array from the result if not needed anymore
            },
          },
          {
            $sort: {
              paymentDate: -1, // Sort by createdAt field in descending order
            },
          },
        ]);
      }
      const total = await PaymentHistoryModel.aggregate([
        {
          $match: {
            paymentStatusId: Enum.paymentStatusIds.Approved,
          },
        },
        {
          $group: {
            _id: null,
            totalDeposits: {
              $sum: {
                $cond: [
                  { $eq: ["$paymentMethodId", Enum.paymentMethodIds.Deposit] },
                  "$paymentAmount",
                  0,
                ],
              },
            },
            totalWithdraws: {
              $sum: {
                $cond: [
                  { $eq: ["$paymentMethodId", Enum.paymentMethodIds.Withdraw] },
                  "$paymentAmount",
                  0,
                ],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalDeposits: 1,
            totalWithdraws: 1,
            netTotal: { $subtract: ["$totalDeposits", "$totalWithdraws"] },
          },
        },
      ]);
      result.sum = total.length > 0 ? total[0].netTotal : 0;
      result.totalDeposits = total.length > 0 ? total[0].totalDeposits : 0;
      result.totalWithdraws = total.length > 0 ? total[0].totalWithdraws : 0;
    } else {
      result.data = [];
      if (history) {
        result.data = await PaymentHistoryModel.aggregate([
          {
            $match: {
              paymentMethodId: paymentMethodId,
              paymentMonth: paymentMonth,
              paymentStatusId: Enum.paymentStatusIds.Approved,
            },
          },
          {
            $lookup: {
              from: "members", // Collection name
              localField: "memberId",
              foreignField: "_id",
              as: "memberData",
            },
          },
          {
            $addFields: {
              memberName: { $arrayElemAt: ["$memberData.name", 0] },
              memberProfilePhoto: {
                $arrayElemAt: ["$memberData.profilePhoto", 0],
              },
            },
          },
          {
            $project: {
              memberData: 0, // Remove the memberData array from the result if not needed anymore
            },
          },
          {
            $sort: {
              paymentDate: -1, // Sort by createdAt field in descending order
            },
          },
        ]);
      }
      const sumResult = await PaymentHistoryModel.aggregate([
        {
          $match: {
            paymentMethodId: paymentMethodId,
            paymentMonth: paymentMonth,
            paymentStatusId: Enum.paymentStatusIds.Approved,
          },
        },
        { $group: { _id: null, total: { $sum: "$paymentAmount" } } },
      ]);
      result.sum = sumResult.length > 0 ? sumResult[0].total : 0;
    }
    res.status(200).json({ data: result, status: true });
  } catch (error) {
    if (error.name === "ValidationError") {
      let errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res.status(200).json({ errors, status: false });
    }
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};
// members data (dashboard table)
module.exports.getMembersData = async (req, res) => {
  const { memberId } = req.body;
  try {
    let result = {};
    if (parseInt(memberId) === 0) {
      const aggregateResult = await PaymentHistoryModel.aggregate([
        {
          $group: {
            _id: "$memberId",
            totalDeposits: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      {
                        $eq: [
                          "$paymentMethodId",
                          Enum.paymentMethodIds.Deposit,
                        ],
                      },
                      {
                        $eq: [
                          "$paymentStatusId",
                          Enum.paymentStatusIds.Approved,
                        ],
                      },
                    ],
                  },
                  "$paymentAmount",
                  0,
                ],
              },
            },
            totalWithdraws: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      {
                        $eq: [
                          "$paymentMethodId",
                          Enum.paymentMethodIds.Withdraw,
                        ],
                      },
                      {
                        $eq: [
                          "$paymentStatusId",
                          Enum.paymentStatusIds.Approved,
                        ],
                      },
                    ],
                  },
                  "$paymentAmount",
                  0,
                ],
              },
            },
          },
        },
        {
          $lookup: {
            from: "members", // Assuming your members collection is named 'members'
            localField: "_id",
            foreignField: "_id",
            as: "memberInfo",
          },
        },
        {
          $unwind: { path: "$memberInfo", preserveNullAndEmptyArrays: true },
        },
        {
          $project: {
            memberId: "$_id",
            memberName: "$memberInfo.name",
            memberProfilePhoto: "$memberInfo.profilePhoto",
            totalDeposits: 1,
            totalWithdraws: 1,
            netTotal: { $subtract: ["$totalDeposits", "$totalWithdraws"] },
            _id: 0,
          },
        },
      ]);

      result = aggregateResult;
    } else {
      result = await PaymentHistoryModel.aggregate([
        {
          $match: {
            memberId: memberId,
          },
        },
        {
          $lookup: {
            from: "members", // Collection name
            localField: "memberId",
            foreignField: "_id",
            as: "memberData",
          },
        },
        {
          $addFields: {
            memberName: { $arrayElemAt: ["$memberData.name", 0] },
            memberProfilePhoto: {
              $arrayElemAt: ["$memberData.profilePhoto", 0],
            },
          },
        },
        {
          $project: {
            memberData: 0, // Remove the memberData array from the result if not needed anymore
          },
        },
      ]);
    }

    res.status(200).json({ data: result, status: true });
  } catch (error) {
    if (error.name === "ValidationError") {
      let errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res.status(200).json({ errors, status: false });
    }
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};
module.exports.getSingleMemberData = async (req, res) => {
  const { memberId } = req.params;
  try {
    const member = await handleFindMemberById(memberId);
    res.status(200).json({ data: member, status: true });
  } catch (error) {
    if (error.name === "ValidationError") {
      let errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res.status(200).json({ errors, status: false });
    }
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};

module.exports.getAllMembers = async (req, res) => {
  try {
    const members = await MembersModel.find({});
    res.status(200).json({ data: members, status: true });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};

//  lookups
module.exports.getPaymentMethods = async (req, res) => {
  try {
    const paymentMethodsData = await mongoose.connection.db
      .collection("paymentMethods")
      .find({})
      .toArray();
    res.status(200).json({ data: paymentMethodsData, status: true });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};
module.exports.getPaymentStatuses = async (req, res) => {
  try {
    const paymentStatusesData = await mongoose.connection.db
      .collection("paymentStatuses")
      .find({})
      .toArray();
    res.status(200).json({ data: paymentStatusesData, status: true });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};
module.exports.getInstallmentStatuses = async (req, res) => {
  try {
    const installmentStatusesData = await mongoose.connection.db
      .collection("installmentStatus")
      .find({})
      .toArray();
    res.status(200).json({ data: installmentStatusesData, status: true });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};

module.exports.getTransactionTypes = async (req, res) => {
  try {
    const transactionTypesData = await mongoose.connection.db
      .collection("transactionTypes")
      .find({})
      .toArray();
    res.status(200).json({ data: transactionTypesData, status: true });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};
module.exports.getTransactionCategories = async (req, res) => {
  try {
    const transactionTypesData = await mongoose.connection.db
      .collection("transactionCategories")
      .find({})
      .toArray();
    res.status(200).json({ data: transactionTypesData, status: true });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};

// update payment status
module.exports.updatePaymentStatus = async (req, res) => {
  const { paymentId, paymentStatusId } = req.body;
  try {
    const updatedPayment = await PaymentHistoryModel.findOneAndUpdate(
      { _id: paymentId },
      { paymentStatusId: paymentStatusId },
      { new: true }
    );
    const member = await handleFindMemberById(updatedPayment.memberId);
    const paymentMethod = await handleFindPaymentMethodById(
      updatedPayment.paymentMethodId
    );
    const paymentStatus = await handleFindPaymentStatusById(
      updatedPayment.paymentStatusId
    );
    res.status(200).json({
      data: {
        ...updatedPayment.toObject(),
        memberName: member.name,
        paymentStatusName: paymentStatus.paymentStatusName,
        paymentMethodName: paymentMethod.paymentMethodName,
      },
      status: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};

// add expense
module.exports.addExpense = async (req, res) => {
  const {
    expenseAmount,
    description,
    splitMemberIds,
    expenseDate,
    paidByEabhaAmountMembersDetails,
  } = req.body;
  const splitMemberArray = splitMemberIds.split(",").map(Number);
  const individualAmount = expenseAmount / splitMemberArray.length;

  try {
    const user = await handleFindUserById(req.tokenId);
    const memberId = user.memberId;
    const expense = await ExpenseModel.create({
      ...req.body,
      createdBy: memberId,
    });
    const paidMemberDetails = Object.entries(req.body.paidMemberDetails);
    const paidMemberOperations = await Promise.all(
      paidMemberDetails.map(async ([memberId, amount]) => {
        const memberExpense = await MembersExpenseModel.findOne({
          memberId: memberId,
        });
        const previousAmount = memberExpense ? memberExpense.expenseAmount : 0;
        const currentAmount = Number(previousAmount) + Number(amount);

        return {
          updateOne: {
            filter: { memberId: memberId },
            update: {
              $set: { expenseAmount: currentAmount },
              $push: {
                adjustmentDetails: {
                  $each: [
                    {
                      createdOn: new Date().toISOString(),
                      date: expenseDate,
                      expenseAmount: expenseAmount,
                      fromMemberId: 0,
                      toMemberId: 0,
                      type: "+",
                      description: description,
                      history: `+${amount} by You. ${previousAmount} to ${currentAmount}`,
                    },
                  ],
                  $position: 0,
                },
              },
            },
          },
        };
      })
    );

    await MembersExpenseModel.bulkWrite(paidMemberOperations);
    const documentsToUpdate = await MembersExpenseModel.find({
      memberId: { $in: splitMemberArray },
    });
    const deductionOperations = documentsToUpdate.map((document) => {
      const previousAmount = document.expenseAmount;
      const currentAmount = previousAmount - individualAmount;
      return {
        updateOne: {
          filter: { memberId: document.memberId },
          update: {
            $set: { expenseAmount: currentAmount },
            $push: {
              adjustmentDetails: {
                $each: [
                  {
                    createdOn: new Date().toISOString(),
                    date: expenseDate,
                    expenseAmount: expenseAmount,
                    fromMemberId: 0,
                    toMemberId: 0,
                    type: "-",
                    description: description,
                    history: `-${individualAmount} by expense.${previousAmount} to ${currentAmount}`,
                  },
                ],
                $position: 0,
              },
            },
          },
        },
      };
    });

    await MembersExpenseModel.bulkWrite(deductionOperations);

    const histories = await Promise.all(
      Object.entries(paidByEabhaAmountMembersDetails).map(
        ([memberId, amount]) => {
          const data = {
            createdOn: new Date().toISOString(),
            paymentMonth: Enum.currentMonth,
            paymentDate: expenseDate,
            paymentMethodId: Enum.paymentMethodIds.Withdraw,
            paymentStatusId: Enum.paymentStatusIds.Approved,
            memberId: memberId,
            paymentAmount: amount,
            comment: `${description}(Expense)`,
          };
          return PaymentHistoryModel.create(data);
        }
      )
    );
    res.status(200).json({
      msg: "Expense added successfully",
      data: { expense, histories },
      status: true,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      let errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res.status(200).json({ errors, status: false });
    }
    res.status(500).send("Something went wrong");
  }
};

module.exports.revceivedAmount = async (req, res) => {
  const { date, fromMemberId, amount, toId } = req.body;
  try {
    const user = await handleFindUserById(req.tokenId);
    const toMemberId = toId || user.memberId;
    const toMemberData = await MembersExpenseModel.findOne({
      memberId: toMemberId,
    });
    const receivedAmountHistory = await ReceivedAmountHistoryModel.create({
      paymentDate: date,
      fromMemberId,
      toMemberId,
      paymentAmount: amount,
    });
    const fromMemberDetails = await handleFindMemberById(fromMemberId);
    const adjustment1 = await MembersExpenseModel.findOneAndUpdate(
      { memberId: toMemberId },
      {
        $inc: { expenseAmount: -amount },
        $push: {
          adjustmentDetails: {
            $each: [
              {
                createdOn: new Date().toISOString(),
                date: date,
                amount,
                fromMemberId,
                toMemberId,
                history: `-${amount} by ${fromMemberDetails.name}. ${
                  toMemberData.expenseAmount
                } to ${toMemberData.expenseAmount - amount}`,
              },
            ],
            $position: 0,
          },
        },
      },
      { new: true }
    );
    const fromMemberData = await MembersExpenseModel.findOne({
      memberId: fromMemberId,
    });
    const toMemberDetails = await handleFindMemberById(toMemberId);
    const adjustment2 = await MembersExpenseModel.findOneAndUpdate(
      { memberId: fromMemberId },
      {
        $inc: { expenseAmount: amount },
        $push: {
          adjustmentDetails: {
            $each: [
              {
                createdOn: new Date().toISOString(),
                date: date,
                amount,
                fromMemberId,
                toMemberId,
                history: `+${amount} to ${toMemberDetails.name}.${
                  fromMemberData.expenseAmount
                } to ${fromMemberData.expenseAmount + amount}`,
              },
            ],
            $position: 0,
          },
        },
      },
      { new: true }
    );
    res.status(200).json({
      msg: "Amount received successfully",
      data: { adjustment1, adjustment2, receivedAmountHistory },
      status: true,
    });
  } catch (error) {
    console.error("Error in getAllExpenses:", error); // Log the error for debugging
    if (error.name === "ValidationError") {
      let errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res.status(200).json({ errors, status: false });
    }
    res.status(500).send("Something went wrong");
  }
};

// ------------------------------------------
//   optimization

// dashboard
module.exports.getAmountSum = async (req, res) => {
  try {
    const [data] = await PaymentHistoryModel.aggregate([
      { $match: { paymentStatusId: Enum.paymentStatusIds.Approved } },
      {
        $group: {
          _id: null,
          totalDeposits: {
            $sum: {
              $cond: [
                { $eq: ["$paymentMethodId", Enum.paymentMethodIds.Deposit] },
                "$paymentAmount",
                0,
              ],
            },
          },
          totalWithdraws: {
            $sum: {
              $cond: [
                { $eq: ["$paymentMethodId", Enum.paymentMethodIds.Withdraw] },
                "$paymentAmount",
                0,
              ],
            },
          },
          thisMonthDeposits: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $eq: ["$paymentMethodId", Enum.paymentMethodIds.Deposit],
                    },
                    { $eq: ["$paymentMonth", Enum.currentMonth] },
                  ],
                },
                "$paymentAmount",
                0,
              ],
            },
          },
          thisMonthWithdraws: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $eq: ["$paymentMethodId", Enum.paymentMethodIds.Withdraw],
                    },
                    { $eq: ["$paymentMonth", Enum.currentMonth] },
                  ],
                },
                "$paymentAmount",
                0,
              ],
            },
          },
        },
      },
      {
        $addFields: {
          netTotal: { $subtract: ["$totalDeposits", "$totalWithdraws"] },
        },
      },
    ]);

    res.status(200).json({ data: data, status: true });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};
module.exports.getTotalAmountDetails = async (req, res) => {
  try {
    const data = await PaymentHistoryModel.aggregate([
      { $match: { paymentStatusId: Enum.paymentStatusIds.Approved } },
      {
        $lookup: {
          from: "members",
          localField: "memberId",
          foreignField: "_id",
          as: "memberData",
        },
      },
      {
        $lookup: {
          from: "paymentMethods",
          localField: "paymentMethodId",
          foreignField: "paymentMethodId",
          as: "paymentMethodData",
        },
      },
      { $unwind: "$paymentMethodData" },
      { $unwind: "$memberData" },
      {
        $addFields: {
          name: "$memberData.name",
          profile: "$memberData.profilePhoto",
          paymentMethodName: "$paymentMethodData.paymentMethodName",
        },
      },
      {
        $project: {
          memberData: 0,
          paymentMethodData: 0,
        },
      },
      {
        $sort: { paymentDate: -1 },
      },
      {
        $project: {
          memberId: 0,
          paymentStatusId: 0,
          __v: 0,
        },
      },
    ]);

    res.status(200).json({ data: data, status: true });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};
module.exports.getThisMonthAmountDetails = async (req, res) => {
  const { paymentMethodId } = req.params;
  try {
    const data = await PaymentHistoryModel.aggregate([
      {
        $match: {
          paymentStatusId: Enum.paymentStatusIds.Approved,
          paymentMethodId: Number(paymentMethodId),
          paymentMonth: Enum.currentMonth,
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
          name: "$memberData.name",
          profile: "$memberData.profilePhoto",
        },
      },
      {
        $project: {
          memberData: 0,
          paymentMethodId: 0,
          paymentStatusId: 0,
          memberId: 0,
          __v: 0,
        },
      },
      {
        $sort: { paymentDate: -1 },
      },
    ]);

    res.status(200).json({ data: data, status: true });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};
module.exports.getMembersAmountDetails = async (req, res) => {
  try {
    const data = await PaymentHistoryModel.aggregate([
      {
        $group: {
          _id: "$memberId",
          totalDeposits: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $eq: ["$paymentMethodId", Enum.paymentMethodIds.Deposit],
                    },
                    {
                      $eq: ["$paymentStatusId", Enum.paymentStatusIds.Approved],
                    },
                  ],
                },
                "$paymentAmount",
                0,
              ],
            },
          },
          totalWithdraws: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $eq: ["$paymentMethodId", Enum.paymentMethodIds.Withdraw],
                    },
                    {
                      $eq: ["$paymentStatusId", Enum.paymentStatusIds.Approved],
                    },
                  ],
                },
                "$paymentAmount",
                0,
              ],
            },
          },
          totalPendingApprovals: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$paymentStatusId",
                    Enum.paymentStatusIds.PendingApproval,
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $addFields: {
          netTotal: { $subtract: ["$totalDeposits", "$totalWithdraws"] },
        },
      },
      {
        $lookup: {
          from: "members", // Collection name
          localField: "_id",
          foreignField: "_id",
          as: "memberData",
        },
      },
      { $unwind: "$memberData" },
      {
        $addFields: {
          name: "$memberData.name",
          profile: "$memberData.profilePhoto",
        },
      },
      {
        $project: {
          memberData: 0,
        },
      },
    ]);

    res.status(200).json({ data: data, status: true });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};
module.exports.getSingleMembersAmountDetails = async (req, res) => {
  const { memberId } = req.params;
  try {
    const [data] = await PaymentHistoryModel.aggregate([
      { $match: { memberId: Number(memberId) } },
      { $sort: { paymentMonth: -1, paymentDate: -1 } },
      {
        $group: {
          _id: null,
          totalDeposits: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $eq: ["$paymentMethodId", Enum.paymentMethodIds.Deposit],
                    },
                    {
                      $eq: ["$paymentStatusId", Enum.paymentStatusIds.Approved],
                    },
                  ],
                },
                "$paymentAmount",
                0,
              ],
            },
          },
          totalWithdraws: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $eq: ["$paymentMethodId", Enum.paymentMethodIds.Withdraw],
                    },
                    {
                      $eq: ["$paymentStatusId", Enum.paymentStatusIds.Approved],
                    },
                  ],
                },
                "$paymentAmount",
                0,
              ],
            },
          },
          paymentHistory: {
            $push: "$$ROOT",
          },
        },
      },
      {
        $addFields: {
          netTotal: { $subtract: ["$totalDeposits", "$totalWithdraws"] },
        },
      },
    ]);

    res.status(200).json({ data: data, status: true });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};
// payment history
module.exports.createPaymentHistory = async (req, res) => {
  try {
    const memberData = await getMemberDataByUserId(req.tokenId);
    const { memberId } = req.body;
    const history = await PaymentHistoryModel.create({
      ...req.body,
      memberId: memberId ? memberId : memberData._id,
    });
    res.status(200).json({ data: history, status: true });
  } catch (error) {
    if (error.name === "ValidationError") {
      let errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res.status(200).json({ errors, status: false });
    }
    res.status(500).send("Something went wrong");
  }
};
module.exports.addTransaction = async (req, res) => {
  const { type, ...others } = req.body;
  try {
    const memberData = await getMemberDataByUserId(req.tokenId);
    const memberId = memberData._id;
    let history;
    if (type === Enum.transactionTypesIds.GIVE_A_LOAN) {
      history = await MembersTransactionModel.insertMany([
        {
          ...others,
          memberId: memberId,
          type: Enum.transactionTypesIds.GIVE_A_LOAN,
          additionalType: Enum.transactionTypesIds.RECEIVABLE,
        },
      ]);
    } else if (type === Enum.transactionTypesIds.TAKE_A_LOAN) {
      history = await MembersTransactionModel.insertMany([
        {
          ...others,
          memberId: memberId,
          type: Enum.transactionTypesIds.TAKE_A_LOAN,
          additionalType: Enum.transactionTypesIds.RECEIVED,
        },
      ]);
    } else if (type === Enum.transactionTypesIds.REPAY_A_LOAN) {
      history = await MembersTransactionModel.insertMany([
        {
          memberId: memberId,
          type: Enum.transactionTypesIds.REPAY_A_LOAN,
          additionalType: Enum.transactionTypesIds.SPENT,
          ...others,
        },
      ]);
    } else if (req.body.payLoan) {
      history = await MembersTransactionModel.insertMany([
        {
          type: Enum.transactionTypesIds.RECEIVED,
          memberId: memberId,
          ...others,
        },
        {
          memberId: memberId,
          type: Enum.transactionTypesIds.REPAY_A_LOAN,
          additionalType: Enum.transactionTypesIds.SPENT,
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
    res.status(200).json({
      msg: "Transaction Added Successfully",
      data: history,
      status: true,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      let errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res.status(200).json({ errors, status: false });
    }
    res.status(500).send("Something went wrong");
  }
};
module.exports.updateTransaction = async (req, res) => {
  const {
    transactionId,
    date,
    amount,
    type,
    additionalType,
    category,
    comment,
  } = req.body;

  try {
    const oldTransaction = await MembersTransactionModel.findById(
      transactionId
    );
    // if give a loan type
    let _additionalType = oldTransaction.additionalType;
    // received case
    if (type === Enum.transactionTypesIds.RECEIVED) {
      _additionalType = 0;
    }
    // receivable case
    if (type === Enum.transactionTypesIds.RECEIVABLE) {
      _additionalType = 0;
    }
    // spent case
    if (type === Enum.transactionTypesIds.SPENT) {
      _additionalType = 0;
    }
    //  give a loan case
    if (type === Enum.transactionTypesIds.GIVE_A_LOAN) {
      _additionalType = Enum.transactionTypesIds.RECEIVABLE;
      _additionalType = additionalType;
    }
    // take a loan case
    if (type === Enum.transactionTypesIds.TAKE_A_LOAN) {
      _additionalType = Enum.transactionTypesIds.RECEIVED;
    }
    // pay a loan case
    if (type === Enum.transactionTypesIds.REPAY_A_LOAN) {
      _additionalType = Enum.transactionTypesIds.SPENT;
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
    res.status(200).json({
      msg: "Transaction Updated Successfully",
      data: updatedTansaction,
      status: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};
module.exports.deleteTransaction = async (req, res) => {
  const { transactionId } = req.params;
  try {
    const deleted = await MembersTransactionModel.findOneAndDelete({
      _id: transactionId,
    });
    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Payment not found", status: false });
    }
    res.status(200).json({ data: deleted, status: true });
  } catch (error) {
    if (error.name === "ValidationError") {
      let errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res.status(200).json({ errors, status: false });
    }
    res.status(500).send("Something went wrong");
  }
};
// expenses
module.exports.getAllExpenses = async (req, res) => {
  const { createdFrom, createdTo, memberId } = req.body;
  try {
    let dateMatchQuery = {};
    if (createdFrom && createdTo) {
      dateMatchQuery = {
        expenseDate: {
          $gte: createdFrom,
          $lte: createdTo,
        },
      };
    } else if (createdFrom) {
      dateMatchQuery = {
        expenseDate: { $gte: createdFrom },
      };
    } else if (createdTo) {
      dateMatchQuery = {
        expenseDate: { $lte: createdTo },
      };
    }
    if (memberId) {
      splitMemberMatch = {
        splitMemberIds: {
          $regex: new RegExp(`(^|,)${memberId}(,|$)`),
        },
      };
    }
    let paidMemberMatch = {};
    if (memberId) {
      paidMemberMatch = {
        $expr: {
          $gt: [
            {
              $indexOfArray: [
                { $objectToArray: "$paidMemberDetails" },
                { k: memberId },
              ],
            },
            -1,
          ],
        },
      };
    }
    const expenses = await ExpenseModel.aggregate([
      {
        $match: dateMatchQuery,
      },
      {
        $addFields: {
          paidMemberDetailsArray: { $objectToArray: "$paidMemberDetails" },
          splitMemberDetailsArray: {
            $split: ["$splitMemberIds", ","],
          },
        },
      },
      {
        $match: memberId
          ? {
              $or: [
                {
                  paidMemberDetailsArray: {
                    $elemMatch: { k: String(memberId) },
                  },
                },
                {
                  $expr: {
                    $in: [String(memberId), "$splitMemberDetailsArray"],
                  },
                },
              ],
            }
          : {},
      },
      { $sort: { createdOn: -1 } },
    ]);
    res.status(200).json({
      data: expenses,
      status: true,
    });
  } catch (error) {
    console.error("Error in getAllExpenses:", error);
    res.status(500).send("Something went wrong");
  }
};
module.exports.getMemberExpenses = async (req, res) => {
  try {
    const memberExpenses = await MembersExpenseModel.aggregate([
      {
        $lookup: {
          from: "members", // Collection name
          localField: "memberId",
          foreignField: "_id",
          as: "memberData",
        },
      },
      { $unwind: "$memberData" },
      {
        $addFields: {
          name: "$memberData.name",
          profile: "$memberData.profilePhoto",
        },
      },
      {
        $project: {
          memberData: 0,
        },
      },
      {
        $addFields: {
          adjustmentDetails: {
            $filter: {
              input: "$adjustmentDetails",
              as: "adjustment",
              cond: {
                $and: [
                  { $gte: ["$$adjustment.date", Enum.firstDateOfMonth] },
                  // { $lte: ["$$adjustment.date", Enum.currentDate] },
                ],
              },
            },
          },
        },
      },
    ]);
    res.status(200).json({
      data: memberExpenses,
      status: true,
    });
  } catch (error) {
    res.status(500).send({ error });
  }
};
module.exports.getMemberTransactionDetails = async (req, res) => {
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
    if (type === Enum.transactionTypesIds.SPENT) {
      typeMatchQuery = {
        $or: [
          {
            type: {
              $in: [
                Enum.transactionTypesIds.SPENT,
                Enum.transactionTypesIds.GIVE_A_LOAN,
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
    const memberData = await getMemberDataByUserId(req.tokenId);
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
                      { $eq: ["$type", Enum.transactionTypesIds.TAKE_A_LOAN] },
                      {
                        $eq: [
                          "$additionalType",
                          Enum.transactionTypesIds.TAKE_A_LOAN,
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
                            $eq: [
                              "$type",
                              Enum.transactionTypesIds.REPAY_A_LOAN,
                            ],
                          },
                          {
                            $eq: [
                              "$additionalType",
                              Enum.transactionTypesIds.REPAY_A_LOAN,
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
                      { $eq: ["$type", Enum.transactionTypesIds.RECEIVABLE] },
                      {
                        $eq: [
                          "$additionalType",
                          Enum.transactionTypesIds.RECEIVABLE,
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
    res.status(200).json({
      data: { membersTransactionDetail, membersReceivableAndLoanAmountDetail },
      status: true,
    });
  } catch (error) {
    res.status(500).send({ error });
  }
};
module.exports.loadMemberExpensesHistory = async (req, res) => {
  const { memberId, createdFrom, createdTo } = req.body;
  try {
    const [data] = await MembersExpenseModel.aggregate([
      { $match: { memberId: Number(memberId) } },
      {
        $addFields: {
          adjustmentDetails: {
            $filter: {
              input: "$adjustmentDetails",
              as: "adjustment",
              cond: {
                $and: [
                  { $gte: ["$$adjustment.date", createdFrom] },
                  { $lte: ["$$adjustment.date", createdTo] },
                ],
              },
            },
          },
        },
      },
    ]);
    res.status(200).json({
      data: data,
      status: true,
    });
  } catch (error) {
    res.status(500).send({ error });
  }
};
module.exports.getMembersExpenseSummary = async (req, res) => {
  const { createdFrom, createdTo, memberId } = req.body;
  let dateMatchQuery = {};
  if (createdFrom && createdTo) {
    dateMatchQuery = {
      expenseDate: {
        $gte: createdFrom,
        $lte: createdTo,
      },
    };
  } else if (createdFrom) {
    dateMatchQuery = {
      expenseDate: { $gte: createdFrom },
    };
  } else if (createdTo) {
    dateMatchQuery = {
      expenseDate: { $lte: createdTo },
    };
  }
  try {
    const data = await ExpenseModel.aggregate([
      {
        $match: dateMatchQuery,
      },
      {
        $addFields: {
          splitMembers: {
            $split: ["$splitMemberIds", ","],
          },
        },
      },
      {
        $addFields: {
          splitedAmount: {
            $divide: ["$expenseAmount", { $size: "$splitMembers" }],
          },
        },
      },
      {
        $addFields: {
          paidMemberDetailsArray: { $objectToArray: "$paidMemberDetails" },
        },
      },
      {
        $unwind: "$splitMembers",
      },
      {
        $addFields: {
          newPaidMember: {
            $cond: [
              { $in: ["$splitMembers", "$paidMemberDetailsArray.k"] },
              null,
              { k: "$splitMembers", v: 0 },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          newPaidMemberDetailsArray: {
            $push: {
              $cond: [
                { $ne: ["$newPaidMember", null] },
                "$newPaidMember",
                "$$REMOVE",
              ],
            },
          },
          oldPaidMemberDetailsArray: { $first: "$paidMemberDetailsArray" },
          splitMembers: { $push: "$splitMembers" },
          splitedAmount: { $first: "$splitedAmount" },
          description: { $first: "$description" },
        },
      },
      {
        $project: {
          _id: 1,
          paidMemberDetailsArray: {
            $concatArrays: [
              "$oldPaidMemberDetailsArray",
              "$newPaidMemberDetailsArray",
            ],
          },
          splitMembers: 1,
          splitedAmount: 1,
          description: 1,
        },
      },
      {
        $unwind: "$paidMemberDetailsArray",
      },
      {
        $group: {
          _id: { $toInt: "$paidMemberDetailsArray.k" },
          expenses: { $sum: 1 },
          paidAmount: { $sum: { $toInt: "$paidMemberDetailsArray.v" } },
          splitAmount: {
            $sum: {
              $cond: [
                { $in: ["$paidMemberDetailsArray.k", "$splitMembers"] },
                "$splitedAmount",
                0,
              ],
            },
          },
        },
      },
      {
        $match: memberId
          ? {
              _id: memberId,
            }
          : {},
      },
      {
        $lookup: {
          from: "members", // Collection name
          localField: "_id",
          foreignField: "_id",
          as: "memberData",
        },
      },
      { $unwind: "$memberData" },
      {
        $addFields: {
          name: "$memberData.name",
          profile: "$memberData.profilePhoto",
        },
      },
      {
        $project: {
          memberData: 0,
        },
      },
    ]);

    let dateMatchQueryOFReceivedAmount = {};
    if (createdFrom && createdTo) {
      dateMatchQueryOFReceivedAmount = {
        date: {
          $gte: createdFrom,
          $lte: createdTo,
        },
      };
    } else if (createdFrom) {
      dateMatchQueryOFReceivedAmount = {
        date: { $gte: createdFrom },
      };
    } else if (createdTo) {
      dateMatchQueryOFReceivedAmount = {
        date: { $lte: createdTo },
      };
    }

    const [result] = await ReceivedAmountHistoryModel.aggregate([
      {
        $match: dateMatchQueryOFReceivedAmount,
      },
      {
        $facet: {
          receivedAmountFromMember: [
            {
              $group: {
                _id: "$toMemberId",
                amount: { $sum: "$paymentAmount" },
              },
            },
          ],
          givenAmountToMember: [
            {
              $group: {
                _id: "$fromMemberId",
                amount: { $sum: "$paymentAmount" },
              },
            },
          ],
        },
      },
    ]);
    const combinedData = data.map((data) => {
      const receivedAmountData = result.receivedAmountFromMember.find(
        (dt) => dt._id === data._id
      );
      const receivedAmount = receivedAmountData?.amount || 0;
      const givenAmountData = result.givenAmountToMember.find(
        (dt) => dt._id === data._id
      );
      const givenAmount = givenAmountData?.amount || 0;

      const net =
        data.paidAmount + givenAmount - data.splitAmount - receivedAmount;
      return {
        ...data,
        receivedAmount: receivedAmountData?.amount || 0,
        givenAmount: givenAmountData?.amount || 0,
        net: net,
      };
    });
    res.status(200).json({
      data: combinedData,
      status: true,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};
module.exports.GetReceivedHistory = async (req, res) => {
  const { createdFrom, createdTo, id } = req.body;
  const memberData = await getMemberDataByUserId(req.tokenId);
  const memberId = id || memberData._id;
  let dateMatchQuery = {};
  if (createdFrom && createdTo) {
    dateMatchQuery = {
      date: {
        $gte: createdFrom,
        $lte: createdTo,
      },
    };
  } else if (createdFrom) {
    dateMatchQuery = {
      date: { $gte: createdFrom },
    };
  } else if (createdTo) {
    dateMatchQuery = {
      date: { $lte: createdTo },
    };
  }
  try {
    const receivedAmountDetails = await ReceivedAmountHistoryModel.aggregate([
      {
        $match: {
          $and: [
            dateMatchQuery,
            {
              $or: [{ fromMemberId: memberId }, { toMemberId: memberId }],
            },
          ],
        },
      },
      {
        $facet: {
          receivedAmountFromMember: [
            {
              $match: {
                toMemberId: memberId,
              },
            },
            {
              $group: {
                _id: "$fromMemberId",
                receivedAmount: { $sum: "$paymentAmount" },
              },
            },
          ],
          givenAmountToMember: [
            {
              $match: {
                fromMemberId: memberId,
              },
            },
            {
              $group: {
                _id: "$toMemberId",
                paidAmount: { $sum: "$paymentAmount" },
              },
            },
          ],
        },
      },
      {
        $project: {
          combinedData: {
            $concatArrays: [
              {
                $map: {
                  input: "$receivedAmountFromMember",
                  as: "item",
                  in: {
                    _id: "$$item._id",
                    receivedAmount: "$$item.receivedAmount",
                  },
                },
              },
              {
                $map: {
                  input: "$givenAmountToMember",
                  as: "item",
                  in: { _id: "$$item._id", givenAmount: "$$item.paidAmount" },
                },
              },
            ],
          },
        },
      },
      {
        $unwind: "$combinedData",
      },
      {
        $group: {
          _id: "$combinedData._id",
          receivedAmount: {
            $sum: { $ifNull: ["$combinedData.receivedAmount", 0] },
          },
          givenAmount: { $sum: { $ifNull: ["$combinedData.givenAmount", 0] } },
        },
      },

      {
        $lookup: {
          from: "members",
          localField: "_id",
          foreignField: "_id",
          as: "memberData",
        },
      },
      { $unwind: "$memberData" },
      {
        $addFields: {
          name: "$memberData.name",
          profile: "$memberData.profilePhoto",
        },
      },
      {
        $project: {
          memberData: 0,
        },
      },
    ]);
    res.status(200).json({ data: receivedAmountDetails, status: true });
  } catch (error) {
    if (error.name === "ValidationError") {
      let errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res.status(200).json({ errors, status: false });
    }
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};
module.exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    // Check if user is already present
    const checkUserPresent = await UserModel.findOne({ email });
    if (checkUserPresent) {
      const memberData = await getMemberDataByUserId(checkUserPresent._id);
      const otp = otpGenerator.generate(4, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });

      let result = await OTPModel.findOne({ otp: otp });
      while (result) {
        otp = otpGenerator.generate(6, {
          upperCaseAlphabets: false,
        });
        result = await OTPModel.findOne({ otp: otp });
      }
      const otpPayload = { email: memberData.gmailId, otp };
      const otpBody = await OTPModel.create(otpPayload);
      const token = createToken(checkUserPresent._id);
      res.status(200).json({
        status: true,
        message: "OTP sent successfully",
        data: otpBody,
        token,
        userId: checkUserPresent._id,
      });
      return;
    } else {
      res.status(200).json({
        status: false,
        message: "User Not Found",
      });
    }
  } catch (error) {
    return res.status(500).json({ status: false, error });
  }
};
