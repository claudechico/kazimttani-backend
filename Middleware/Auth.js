const User = require("../Model/User");
const JWT = require("jsonwebtoken");

// protected route
exports.requireSignIn = async (req, res, next) => {
  try {
    const decode = JWT.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    req.user = decode;
    next();
  } catch (error) {
    console.log(error);
  }
};

;
// validadtion user after make payments
