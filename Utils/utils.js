const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const MemberModel = require("../Models/MemberModel");
const admin = require("firebase-admin");
const bcrypt = require("bcrypt");
const { getIO } = require("../socket");
const NotificationModel = require("../Models/NotificationModel");
const moment = require("moment");

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
const bucket = admin.storage().bucket();

const tryCatchMethod = async (method) => {
  const response = { status: false, statusCode: 200, errors: {}, data: [] };

  try {
    const result = await method();
    console.log(result);
    if (result) {
      response.statusCode = 200;
      response.status = true;
      response.data = result;
    } else {
      response.statusCode = 200;
      response.status = false;
      response.data = result;
    }
    return response;
  } catch (error) {
    let errors = {};
    if (error.name === "ValidationError") {
      errors = Object.keys(error.errors).reduce((acc, key) => {
        acc[key] = error.errors[key].message;
        return acc;
      }, {});
      response.statusCode = 200;
      response.status = false;
      response.errors = errors;
      return response;
    }

    if (error.code === 11000) {
      const errors = Object.keys(error.keyValue).reduce((acc, key) => {
        acc[key] = `${error.keyValue[key]} is already in use`;
        return acc;
      }, {});
      response.statusCode = 200;
      response.status = false;
      response.errors = errors;
      return response;
    }
    response.statusCode = 500;
    response.status = false;
    response.msg = "Something went wrong";
    return response;
  }
};

const compareObjectIds = (a, b) => {
  return String(a) === String(b);
};
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: 2 * 60 * 60,
  });
};
const convertStringIdToObjectId = (id) => {
  if (id && typeof id === "string" && id.length === 24) {
    return new mongoose.Types.ObjectId(id);
  } else {
    return null;
  }
};
const getTokenMemberData = async (tokenId) => {
  try {
    const tokenMemberData = await MemberModel.findOne({ userId: tokenId });
    return tokenMemberData;
  } catch (error) {}
};

const uploadFile = async (file) => {
  let imageUrl = null;

  const filePath = file.filepath;
  const fileOriginalName = file.originalFilename; // Original filename with extension
  const remoteFilePath = `images/${file.newFilename}_${fileOriginalName}`;
  console.log(remoteFilePath);
  try {
    // Upload file to Firebase Storage
    await bucket.upload(filePath, {
      destination: remoteFilePath,
      metadata: {
        contentType: file.mimetype, // Set content type
      },
    });
    // Make the file public
    await bucket.file(remoteFilePath).makePublic();
    imageUrl = `https://storage.googleapis.com/${bucket.name}/${remoteFilePath}`;
  } catch (error) {
    console.error("Failed to upload file:", error);
  }
  return imageUrl;
};
const deleteFile = async (url) => {
  try {
    const file = bucket.file(url);
    await file.delete();
  } catch (error) {
    console.error("Failed to upload file:", error);
  }
};

const maxAge = 2 * 60 * 60;

const MAX_FILE_SIZE_MB = 1; // Maximum file size in MB
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024; // Convert
const handleGetTokenExpiryDateAndTime = () => {
  const expiryTimeMs = maxAge * 1000;
  const expiryDateTime = new Date(Date.now() + expiryTimeMs);
  const formattedExpiryDateTime = expiryDateTime.toISOString();
  return formattedExpiryDateTime;
};
const getBooleanFromObject = (data = {}) => {
  const hasValue = Object.values(data).length > 0;
  return hasValue;
};

const comparePassword = async (oldPassword, newPassword) => {
  const auth = await bcrypt.compare(oldPassword, newPassword);
  return auth;
};

const handleSendNotification = async (memberId, _notificationData) => {
  const io = getIO();
  try {
    const notificationResponse = await NotificationModel.create(
      _notificationData
    );
    const [notificationData] = await NotificationModel.aggregate([
      {
        $match: { _id: notificationResponse._id },
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
    ]);

    if (notificationData) {
      io.emit(`notification:${memberId}`, notificationData);
    }
  } catch (error) {
    console.log(error);
  }
};

const handleGetDateForTime00 = (date) => {
  if (date) {
    const originalDate = moment(new Date(date));
    const newDate = originalDate.add(1, "days");
    return newDate.toISOString();
  }
  return null;
};
module.exports = {
  uploadFile,
  deleteFile,
  tryCatchMethod,
  createToken,
  handleGetTokenExpiryDateAndTime,
  compareObjectIds,
  convertStringIdToObjectId,
  getTokenMemberData,
  maxAge,
  MAX_FILE_SIZE_BYTES,
  getBooleanFromObject,
  comparePassword,
  handleSendNotification,
  handleGetDateForTime00,
};
