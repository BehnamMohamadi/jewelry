const User = require("../models/user-model");
const jwt = require("jsonwebtoken");
const { promisify } = require("node:util");

const setViewUser = async (req, res, next) => {
  // برای استفاده در EJS
  res.locals.user = null;
  res.locals.currentPath = req.path;

  // کاربر مهمان
  if (!req.cookies?.jwt) {
    return next();
  }

  try {
    const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return next();
    }

    if (user.changedPasswordAfter(decoded.iat)) {
      return next();
    }

    // کاربر لاگین شده
    res.locals.user = user;

    next();
  } catch (error) {
    // JWT نامعتبر → کاربر را مهمان در نظر بگیر
    next();
  }
};

module.exports = {
  setViewUser,
};
