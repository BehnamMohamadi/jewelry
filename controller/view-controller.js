const renderHomePage = (req, res) => {
  res.render("home/home", {
    title: "pawear | قدرت در هر قدم",
  });
};

const renderLoginPage = (req, res) => {
  if (res.locals.user) {
    return res.redirect("/");
  }

  res.render("auth/login", {
    title: "ورود | pawear",
  });
};

const renderSignUpPage = (req, res) => {
  if (res.locals.user) {
    return res.redirect("/");
  }

  res.render("auth/signup", {
    title: "ثبت‌نام | pawear",
  });
};

// =========================
// PRODUCTS
// =========================

const renderProductsPage = (req, res) => {
  res.render("products/products", {
    title: "محصولات | pawear",
  });
};

const renderMenPage = (req, res) => {
  res.render("products/men", {
    title: "جوراب مردانه | pawear",
  });
};

const renderWomenPage = (req, res) => {
  res.render("products/women", {
    title: "جوراب زنانه | pawear",
  });
};

const renderBoxPage = (req, res) => {
  res.render("products/box", {
    title: "جوراب باکسی | pawear",
  });
};

// =========================
// OTHER
// =========================

const renderMagazinePage = (req, res) => {
  res.render("magazine/magazine", {
    title: "مجله | pawear",
  });
};

const renderAboutPage = (req, res) => {
  res.render("about/about", {
    title: "درباره ما | pawear",
  });
};

// =========================
// USER
// =========================

const renderProfilePage = (req, res) => {
  res.render("profile/profile", {
    title: "پروفایل | pawear",
    user: res.locals.user,
  });
};

// =========================
// CART
// =========================

const renderCartPage = (req, res) => {
  if (!res.locals.user) {
    return res.redirect("/login");
  }

  res.render("cart/cart", {
    title: "سبد خرید | pawear",
    user: res.locals.user,
  });
};

module.exports = {
  renderHomePage,

  renderLoginPage,
  renderSignUpPage,

  renderProductsPage,
  renderMenPage,
  renderWomenPage,
  renderBoxPage,

  renderMagazinePage,
  renderAboutPage,

  renderProfilePage,
  renderCartPage,
};
