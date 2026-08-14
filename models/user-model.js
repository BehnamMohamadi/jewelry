const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const { isEmail, isMobilePhone } = require("validator");

const UserSchema = new Schema(
  {
    phonenumber: {
      type: String,
      required: [true, "Phonenumber number is required"],
      unique: true,
      trim: true,
      validate: {
        validator: (value) => isMobilePhone(value, "fa-IR"),
        message: "Invalid Phonenumber ",
      },
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value) => !value || isEmail(value),
        message: "Invalid email",
      },
    },

    firstname: {
      type: String,
      trim: true,
      default: "",
      maxlength: 30,
    },

    lastname: {
      type: String,
      trim: true,
      default: "",
      maxlength: 30,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
    },

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },

    isPhonenumberVerified: {
      type: Boolean,
      default: false,
    },

    passwordChangedAt: Date,
  },
  {
    timestamps: true,
  },
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);

  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }
});

UserSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};
UserSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (!this.passwordChangedAt) return false;

  const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

  return JWTTimestamp < changedTimestamp;
};

module.exports = model("User", UserSchema);
