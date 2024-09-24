const MemberModel = require("../Models/MemberModel");
const UserModel = require("../Models/UserModel");
const { ApiResponseModel } = require("../Utils/classes");
const {
  createToken,
  uploadFile,
  deleteFile,
  handleGetTokenExpiryDateAndTime,
  maxAge,
  MAX_FILE_SIZE_BYTES,
  comparePassword,
} = require("../Utils/utils");
const formidable = require("formidable");
const otpGenerator = require("otp-generator");
const OTPModel = require("../Models/OTPModel");

const sigup = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  let userId = null;
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

        const { firstName, lastName, email, phone, username, password } =
          fields;
        const _firstName = firstName[0] || "";
        const _lastName = lastName[0] || "";
        const _email = email[0] || "";
        const _phone = phone[0] || "";
        const _username = username[0] || "";
        const _password = password[0] || "";
        if (files.profile) {
          const file = files.profile[0];
          // check file size not greater than 1 Mb
          if (file.size <= MAX_FILE_SIZE_BYTES) {
            // check if member already exist with email
            const isMemberWithIncommingEmailExist = await MemberModel.findOne({
              email: _email,
            });
            if (!isMemberWithIncommingEmailExist) {
              const userResponse = await UserModel.create({
                username: _username,
                password: _password,
              });
              if (userResponse) {
                userId = userResponse._id;
                uploadedUrl = await uploadFile(file);
                const memberResponse = await MemberModel.create({
                  firstName: _firstName,
                  lastName: _lastName,
                  profile: uploadedUrl,
                  email: _email,
                  userId: userResponse._id,
                  phone: _phone,
                });

                if (memberResponse) {
                  apiResponse.status = true;
                  apiResponse.message = "User created successfully";
                  apiResponse.data = memberResponse;

                  return res.status(200).json(apiResponse);
                } else {
                  // Delete the file

                  await deleteFile(uploadedUrl);
                  await UserModel.findByIdAndDelete(userId);
                  apiResponse.msg = "Unable to create";
                  return res.status(200).json(apiResponse);
                }
              } else {
                apiResponse.msg = "Unable to create";
                return res.status(200).json(apiResponse);
              }
            } else {
              apiResponse.msg = `${_email} is already in use`;
              return res.status(200).json(apiResponse);
            }
          }
          apiResponse.msg = "Can't upload file larger than 1 MB";
          return res.status(200).json(apiResponse);
        }
        apiResponse.msg = "Please upload a profile image.";
        return res.status(200).json(apiResponse);
      } catch (error) {
        console.log("line 77", error);
        if (error.name === "ValidationError") {
          const errors = Object.keys(error.errors).reduce((acc, key) => {
            acc[key] = error.errors[key].message;
            return acc;
          }, {});
          await deleteFile(uploadedUrl);
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
  const { usernameOrEmail, password } = req.body;
  let apiResponse = new ApiResponseModel();
  try {
    const userResponse = await UserModel.findOne({ username: usernameOrEmail });
    // check user exist
    if (userResponse) {
      const auth = await comparePassword(password, userResponse.password);
      // check password
      if (auth) {
        const memberResponse = await MemberModel.findOne({
          userId: userResponse?._id,
        });
        const token = createToken(userResponse._id);
        const tokenExpiryDateTime = handleGetTokenExpiryDateAndTime();
        res.cookie("jwt", token, {
          withCredentials: true, // Corrected typo
          httpOnly: false,
          maxAge: maxAge * 1000,
        });
        if (memberResponse) {
          if (memberResponse?.isEmailVerified) {
            apiResponse.status = true;
            apiResponse.msg = "Login successful";
            apiResponse.data = {
              isEmailVerified: true,
              user: memberResponse,
              accessToken: token,
              expiryDateTime: tokenExpiryDateTime,
            };
            return res.status(200).json(apiResponse);
          } else {
            apiResponse.msg = "User not verified";
            apiResponse.data = {
              email: memberResponse.email,
              isEmailVerified: false,
            };
            return res.status(200).json(apiResponse);
          }
        }
        return res.status(200).json(apiResponse);
      } else {
        apiResponse.msg = "Incorrect password";
        return res.status(200).json(apiResponse);
      }
    } else {
      const memberResponse = await MemberModel.findOne({
        email: usernameOrEmail,
      });
      const user = await UserModel.findById(memberResponse.userId);
      const auth = await comparePassword(password, user.password);
      // check password
      if (auth) {
        const memberResponse = await MemberModel.findOne({
          userId: user?._id,
        });
        const token = createToken(user._id);
        const tokenExpiryDateTime = handleGetTokenExpiryDateAndTime();
        res.cookie("jwt", token, {
          withCredentials: true, // Corrected typo
          httpOnly: false,
          maxAge: maxAge * 1000,
        });
        if (memberResponse) {
          if (memberResponse?.isEmailVerified) {
            apiResponse.status = true;
            apiResponse.msg = "Login successful";
            apiResponse.data = {
              isEmailVerified: true,
              user: memberResponse,
              accessToken: token,
              expiryDateTime: tokenExpiryDateTime,
            };
            return res.status(200).json(apiResponse);
          } else {
            apiResponse.msg = "User not verified";
            apiResponse.data = {
              email: memberResponse.email,
              isEmailVerified: false,
            };
            return res.status(200).json(apiResponse);
          }
        }
        return res.status(200).json(apiResponse);
      } else {
        apiResponse.msg = "Incorrect password";
        return res.status(200).json(apiResponse);
      }
    }
  } catch (error) {
    console.log(error);
    apiResponse.errors = error;
    return res.status(500).json(apiResponse);
  }
};

const sendVerificationOtp = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  try {
    const { email } = req.body;
    const memberData = await MemberModel.findOne({ email });
    if (memberData) {
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
        userId: memberData.userId,
        otp,
      };
      const otpBody = await OTPModel.create(otpPayload);

      apiResponse.status = true;
      apiResponse.msg = "OTP sent successfully";
      apiResponse.id = memberData.userId;
      apiResponse.data = {
        otp: otpBody,
      };
      console.log("line 210");
      return res.status(200).json(apiResponse);
    } else {
      apiResponse.msg = "User Not Found";
      return res.status(200).json(apiResponse);
    }
  } catch (error) {
    apiResponse.errors = error;
    return res.status(500).json(apiResponse);
  }
};

const sendPasswordUpdateVerificationOtp = async (req, res) => {
  let apiResponse = new ApiResponseModel();
  try {
    const { usernameOrEmail } = req.body;
    const userData = await UserModel.findOne({ username: usernameOrEmail });
    if (userData) {
      const memberData = await MemberModel.findOne({ userId: userData?._id });
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
        userId: memberData.userId,
      };
      const otpBody = await OTPModel.create(otpPayload);
      const token = createToken(memberData.userId);
      const tokenExpiryDateTime = handleGetTokenExpiryDateAndTime();
      apiResponse.status = true;
      apiResponse.msg = "OTP sent successfully";
      apiResponse.id = memberData.userId;
      apiResponse.data = {
        accessToken: token,
        expiryDateTime: tokenExpiryDateTime,
        otp: otpBody,
      };
      return res.status(200).json(apiResponse);
    } else {
      const memberResponse = await MemberModel.findOne({
        email: usernameOrEmail,
      });
      if (memberResponse) {
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
          email: memberResponse.email,
          otp,
          userId: memberResponse.userId,
        };
        const otpBody = await OTPModel.create(otpPayload);
        const token = createToken(memberResponse.userId);
        const tokenExpiryDateTime = handleGetTokenExpiryDateAndTime();
        apiResponse.status = true;
        apiResponse.msg = "OTP sent successfully";
        apiResponse.id = memberResponse.userId;
        apiResponse.data = {
          accessToken: token,
          expiryDateTime: tokenExpiryDateTime,
          otp: otpBody,
        };
        return res.status(200).json(apiResponse);
      }
      apiResponse.msg = "User Not Found";
      return res.status(200).json(apiResponse);
    }
  } catch (error) {
    console.log(error);
    apiResponse.errors = error;
    return res.status(500).json(apiResponse);
  }
};

const VerifyOtp = async (req, res) => {
  const { usernameOrEmail, otp } = req.body;
  let apiResponse = new ApiResponseModel();
  try {
    const data = await OTPModel.findOne({ email: usernameOrEmail, otp });
    if (data) {
      await MemberModel.findOneAndUpdate(
        { email: usernameOrEmail },
        {
          isEmailVerified: true,
        }
      );
      apiResponse.status = true;
      apiResponse.data = data;
      apiResponse.msg = "OTP verified successfully";
      return res.status(200).json(apiResponse);
    } else {
      const userResponse = await UserModel.findOne({
        username: usernameOrEmail,
      });
      if (userResponse) {
        const data = await OTPModel.findOne({ userId: userResponse._id, otp });
        if (data) {
          await MemberModel.findOneAndUpdate(
            { email: usernameOrEmail },
            {
              isEmailVerified: true,
            }
          );
          apiResponse.status = true;
          apiResponse.data = data;
          apiResponse.msg = "OTP verified successfully";
        }
      }
      apiResponse.msg = "Invalid OTP";
      return res.status(200).json(apiResponse);
    }
  } catch (error) {
    console.log(error);
    apiResponse.errors = error;
    return res.status(500).json(apiResponse);
  }
};

module.exports = {
  sigup,
  signin,
  sendVerificationOtp,
  sendPasswordUpdateVerificationOtp,
  VerifyOtp,
};
