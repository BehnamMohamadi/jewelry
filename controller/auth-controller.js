const User = require("../models/user-model");
const { AppError } = require("../utils/app-error");

const jwt = require("jsonwebtoken");
const { promisify } = require("node:util");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + Number(process.env.JWT_COOKIE_EXPIRES_IN) * 60 * 60 * 1000,
    ),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

/* ===========================
          SIGNUP
=========================== */

const signup = async (req, res, next) => {
  if (req.cookies?.jwt) {
    return next(new AppError(400, "You are already logged in."));
  }

  const { firstname, lastname, phonenumber, password, email } = req.body;

  const exists = await User.findOne({ phonenumber });

  if (exists) {
    return next(new AppError(409, "Phone number already exists."));
  }

  const user = await User.create({
    firstname,
    lastname,
    phonenumber,
    password,
    email,
    role: "customer",
  });

  sendToken(user, 201, res);
};

/* ===========================
          LOGIN
=========================== */

const login = async (req, res, next) => {
  if (req.cookies?.jwt) {
    return next(new AppError(400, "You are already logged in."));
  }

  const { phonenumber, password } = req.body;

  if (!phonenumber || !password) {
    return next(new AppError(400, "Please provide phone number and password."));
  }

  const user = await User.findOne({ phonenumber });

  if (!user) {
    return next(new AppError(401, "Invalid phone number or password."));
  }

  const correct = await user.comparePassword(password);

  if (!correct) {
    return next(new AppError(401, "Invalid phone number or password."));
  }

  sendToken(user, 200, res);
};

/* ===========================
          PROTECT
=========================== */

const protect = async (req, res, next) => {
  let token;

  if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError(401, "You are not logged in."));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(new AppError(401, "User no longer exists."));
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError(401, "Password changed recently. Please login again."));
  }

  req.user = currentUser;

  next();
};

/* ===========================
        RESTRICT TO
=========================== */

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(403, "You do not have permission to perform this action."),
      );
    }

    next();
  };
};

/* ===========================
        IS LOGGED IN
=========================== */

const isLoggedIn = async (req, res, next) => {
  if (!req.cookies?.jwt) return next();

  try {
    const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) return next();

    if (user.changedPasswordAfter(decoded.iat)) {
      return next();
    }

    res.locals.user = user;
  } catch (err) {}

  next();
};

/* ===========================
          LOGOUT
=========================== */

const logout = (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "lax",
  });

  res.status(200).json({
    status: "success",
    data: null,
  });
};

module.exports = {
  signup,
  login,
  logout,
  protect,
  restrictTo,
  isLoggedIn,
};
