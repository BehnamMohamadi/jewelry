const User = require("../models/user-model");
const { asyncHandler } = require("./async-handler");

const addAdmin = asyncHandler(async () => {
  const isAdminExists = await User.findOne({ role: "admin" });
  if (isAdminExists) {
    return console.info("[i] admin already exists");
  }

  await User.create({
    firstname: process.env.ADMIN_FIRSTNAME,
    lastname: process.env.ADMIN_LASTNAME,
    phonenumber: process.env.ADMIN_PHONENUMBER,
    password: process.env.ADMIN_PASSWORD,
    role: "admin",
  });

  return console.log("[+] admin added successfully");
});

module.exports = { addAdmin };
