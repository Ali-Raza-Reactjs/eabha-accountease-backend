const MemberModel = require("../Models/MemberModel");
const UserModel = require("../Models/UserModel");
const { ApiResponseModel } = require("../Utils/classes");
const { createToken } = require("../Utils/utils");
const admin = require("firebase-admin");
const bcrypt = require("bcrypt");
const formidable = require("formidable");
const otpGenerator = require("otp-generator");
const OTPModel = require("../Models/OTPModel");

const sigup = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  let userId = null;
  try {
    const form = formidable.formidable({ multiples: true });
    form.parse(req, async (err, fields, files) => {
      try {
        if (err) {
          console.error("Error parsing the form:", err);
          apiResponse.errors = err;
          return res.status(500).json(apiResponse);
        }

        const { firstName, lastName, profile, email, username, password } =
          fields;
        const _firstName = firstName[0] || "";
        const _lastName = lastName[0] || "";
        const _profile = profile[0] || "";
        const _email = email[0] || "";
        const _username = username[0] || "";
        const _password = password[0] || "";
        const userResponse = await UserModel.create({
          username: _username,
          password: _password,
        });

        if (userResponse) {
          userId = userResponse._id;
          const memberResponse = await MemberModel.create({
            firstName: _firstName,
            lastName: _lastName,
            profile: _profile,
            email: _email,
            userId: userResponse._id,
          });

          if (memberResponse) {
            apiResponse.status = true;
            apiResponse.message = "User created successfully";
            apiResponse.data = {
              user: userResponse,
              member: memberResponse,
            };
            return res.status(200).json(apiResponse);
          } else {
            await UserModel.findByIdAndDelete(userId);
            apiResponse.msg = "Unable to create";
            return res.status(200).json(apiResponse);
          }
        } else {
          apiResponse.msg = "Unable to create";
          return res.status(200).json(apiResponse);
        }
      } catch (error) {
        if (error.name === "ValidationError") {
          const errors = Object.keys(error.errors).reduce((acc, key) => {
            acc[key] = error.errors[key].message;
            return acc;
          }, {});
          await UserModel.findByIdAndDelete(userId);
          apiResponse.errors = errors;
          return res.status(200).json(apiResponse);
        }

        if (error.code === 11000) {
          const errors = Object.keys(error.keyValue).reduce((acc, key) => {
            acc[key] = `${error.keyValue[key]} is already in use`;
            return acc;
          }, {});
          apiResponse.errors = errors;
          await UserModel.findByIdAndDelete(userId);
          return res.status(200).json(apiResponse);
        }
      }
    });
  } catch (error) {
    console.error("Error in sigup function:", err);
    apiResponse.errors = error;
    return res.status(500).json(apiResponse);
  }
};

const signin = async (req, res, next) => {
  const { username, password } = req.body;
  let apiResponse = new ApiResponseModel();
  try {
    const userResponse = await UserModel.findOne({ username });
    // check user exist
    if (userResponse) {
      const auth = await bcrypt.compare(password, userResponse.password);
      // check password
      if (auth) {
        const maxAge = 2 * 60 * 60;
        const expiryTimeMs = maxAge * 1000;
        const expiryDateTime = new Date(Date.now() + expiryTimeMs);
        const formattedExpiryDateTime = expiryDateTime.toISOString();

        const memberResponse = await MemberModel.findOne({
          userId: userResponse?._id,
        });
        const token = createToken(userResponse._id);
        res.cookie("jwt", token, {
          withCredentials: true, // Corrected typo
          httpOnly: false,
          maxAge: maxAge * 1000,
        });
        if (memberResponse) {
          apiResponse.status = true;
          apiResponse.msg = "Login successful";
          apiResponse.data = {
            user: memberResponse,
            accessToken: token,
            expiryDateTime: formattedExpiryDateTime,
          };
        }
        return res.status(200).json(apiResponse);
      } else {
        apiResponse.msg = "Incorrect password";
        return res.status(200).json(apiResponse);
      }
    } else {
      apiResponse.msg = "Username Not Found";
      return res.status(200).json(apiResponse);
    }
  } catch (error) {}
};

const sendSignupVerificationOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    // Check if user is already present
    const userResponse = await UserModel.findOne({ userId });
    if (userResponse) {
      const memberData = await MemberModel.findOne({
        userId: userResponse._id,
      });
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
      const otpPayload = {
        email: memberData.email,
        otp,
        userId: userResponse._id,
      };
      const otpBody = await OTPModel.create(otpPayload);
      const token = createToken(userResponse._id);
      return res.status(200).json({
        status: true,
        message: "OTP sent successfully",
        data: otpBody,
        token,
      });
    } else {
      return res.status(200).json({
        status: false,
        message: "User Not Found",
      });
    }
  } catch (error) {
    return res.status(500).json({ status: false, error });
  }
};

const verifySignupOtp = async (req, res) => {
  const { userId, otp } = req.body;
  let apiResponse = new ApiResponseModel();
  try {
    const data = await OTPModel.findOne({ userId, otp });
    if (data) {
      await MemberModel.findOneAndUpdate(
        { userId },
        {
          isEmailVerified: true,
        }
      );
      apiResponse.status = true;
      apiResponse.data = data;
      apiResponse.msg = "OTP verified successfully";
    }
    return res.status(200).json(apiResponse);
  } catch (error) {
    apiResponse.errors = error;
    return res.status(500).json(apiResponse);
  }
};

module.exports = { sigup, signin, sendSignupVerificationOtp, verifySignupOtp };
