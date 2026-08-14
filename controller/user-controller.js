const User = require("../models/user-model");
const { AppError } = require("../utils/app-error");
const { ApiFeatures } = require("../utils/api-features");

const getUserById = async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select("-password -__v");

  if (!user) {
    return next(new AppError(404, `user (id: ${userId}) not found`));
  }

  res.status(200).json({
    status: "success",
    data: { user },
  });
};

const getAllUsers = async (req, res) => {
  const userModel = new ApiFeatures(
    User.find().select(
      "_id firstname lastname phonenumber email role isPhonenumberVerified createdAt",
    ),
    req.query,
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await userModel.model;

  const total = await User.countDocuments();

  const { page = 1, limit = 10 } = req.query;

  res.status(200).json({
    status: "success",
    page: Number(page),
    perpage: Number(limit),
    total,
    totalPages: Math.ceil(total / Number(limit)),
    data: { users },
  });
};

const addUser = async (req, res, next) => {
  const {
    firstname,
    lastname,
    phonenumber,
    email,
    password,
    role = "customer",
  } = req.body;

  const duplicatePhone = await User.findOne({ phonenumber });

  if (duplicatePhone) {
    return next(new AppError(409, "Phone number already exists."));
  }

  if (email) {
    const duplicateEmail = await User.findOne({ email });

    if (duplicateEmail) {
      return next(new AppError(409, "Email already exists."));
    }
  }

  const user = await User.create({
    firstname,
    lastname,
    phonenumber,
    email,
    password,
    role,
  });

  user.password = undefined;

  res.status(201).json({
    status: "success",
    data: { user },
  });
};

const editUserById = async (req, res, next) => {
  const { userId } = req.params;

  const {
    firstname,
    lastname,
    phonenumber,
    email,
    role,
    isPhonenumberVerified = false,
  } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError(404, `user (id: ${userId}) not found`));
  }

  if (phonenumber) {
    const duplicatePhone = await User.findOne({
      phonenumber,
      _id: { $ne: userId },
    });

    if (duplicatePhone) {
      return next(new AppError(409, "Phone number already exists."));
    }

    user.phonenumber = phonenumber;
  }

  if (email) {
    const duplicateEmail = await User.findOne({
      email,
      _id: { $ne: userId },
    });

    if (duplicateEmail) {
      return next(new AppError(409, "Email already exists."));
    }

    user.email = email;
  }

  if (firstname !== undefined) user.firstname = firstname;
  if (lastname !== undefined) user.lastname = lastname;
  if (role !== undefined) user.role = role;
  if (isPhonenumberVerified !== undefined)
    user.isPhonenumberVerified = isPhonenumberVerified;

  await user.save({ validateModifiedOnly: true });

  user.password = undefined;

  res.status(200).json({
    status: "success",
    data: { user },
  });
};

const deleteUserById = async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    return next(new AppError(404, `user (id: ${userId}) not found`));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
};

const promoteUserToAdmin = async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError(404, `user (id: ${userId}) not found`));
  }

  if (user.role === "admin") {
    return next(new AppError(400, "User is already admin."));
  }

  user.role = "admin";

  await user.save({ validateModifiedOnly: true });

  res.status(200).json({
    status: "success",
    data: {
      message: "Role changed successfully.",
    },
  });
};

module.exports = {
  addUser,
  getAllUsers,
  getUserById,
  editUserById,
  deleteUserById,
  promoteUserToAdmin,
};
