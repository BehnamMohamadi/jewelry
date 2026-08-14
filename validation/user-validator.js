const Joi = require("joi");

const addUserValidationSchema = Joi.object({
  firstname: Joi.string().min(2).max(30).trim().required(),

  lastname: Joi.string().min(2).max(30).trim().required(),

  phonenumber: Joi.string()
    .pattern(/^09\d{9}$/)
    .required(),

  email: Joi.string().email().optional(),

  password: Joi.string().min(8).max(30).required(),

  role: Joi.string().valid("customer", "admin").default("customer"),
});

const editUserValidationSchema = Joi.object({
  firstname: Joi.string().min(2).max(30).trim(),

  lastname: Joi.string().min(2).max(30).trim(),

  phonenumber: Joi.string().pattern(/^09\d{9}$/),

  email: Joi.string().email(),

  role: Joi.string().valid("customer", "admin"),

  isPhonenumberVerified: Joi.boolean(),
});

module.exports = {
  addUserValidationSchema,
  editUserValidationSchema,
};
