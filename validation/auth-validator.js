const Joi = require("joi");

const loginValidationSchema = Joi.object({
  phonenumber: Joi.string()
    .pattern(/^09\d{9}$/)
    .required(),

  password: Joi.string().min(8).max(30).required(),
});
const signupValidationSchema = Joi.object({
  firstname: Joi.string().min(3).max(30).trim().required(),

  lastname: Joi.string().min(3).max(30).trim().required(),

  phonenumber: Joi.string()
    .pattern(/^09\d{9}$/)
    .required(),

  password: Joi.string().min(8).max(30).required(),

  email: Joi.string().email().optional(),
});

module.exports = {
  loginValidationSchema,
  signupValidationSchema,
};
