const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const MemberModel = require("../Models/MemberModel");
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
module.exports = {
  tryCatchMethod,
  createToken,
  compareObjectIds,
  convertStringIdToObjectId,
  getTokenMemberData,
};
