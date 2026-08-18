const router = require("express").Router();

const {
  renderHomePage,
  renderLoginPage,
  renderSignUpPage,
} = require("../controller/view-controller");

const { setViewUser } = require("../middleware/view-auth");

// ===============================
// VIEW AUTH
// ===============================

// وضعیت کاربر را برای تمام View ها مشخص می‌کند
// مهمان هم اجازه عبور دارد
router.use(setViewUser);

// ===============================
// HOME
// ===============================

router.get("/", renderHomePage);

// ===============================
// AUTH PAGES
// ===============================

router.get("/login", renderLoginPage);

router.get("/signup", renderSignUpPage);

module.exports = router;
