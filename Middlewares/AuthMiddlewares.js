const User = require("../Models/UserModel");
const jwt = require("jsonwebtoken");
const { ApiResponseModel } = require("../Utils/classes");

module.exports.checkAuthorization = async (req, res, next) => {
  const bearerHeader = req.headers["authorization"];
  let apiResponse = new ApiResponseModel();
  if (typeof bearerHeader !== "undefined") {
    try {
      const bearer = bearerHeader.split(" ");
      const token = bearer[1];
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const user = await User.findById(decodedToken.id);
      if (user) {
        req.tokenId = decodedToken.id;
        next();
      } else {
        apiResponse.msg = "Invalid token";
        return res.status(401).json(apiResponse);
      }
    } catch (err) {
      apiResponse.msg = "Invalid token";
      return res.status(401).json(apiResponse);
    }
  } else {
    apiResponse.msg = "Invalid token";
    return res.status(401).json(apiResponse);
  }
};
