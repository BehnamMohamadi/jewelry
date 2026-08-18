const API_BASE = "http://localhost:8000/api/auth";

const signupForm = document.getElementById("signupForm");
const messageBox = document.getElementById("message");
const submitButton = document.getElementById("signupSubmit");

const firstnameInput = document.getElementById("signupFirstname");
const lastnameInput = document.getElementById("signupLastname");
const phoneInput = document.getElementById("signupPhone");
const emailInput = document.getElementById("signupEmail");
const passwordInput = document.getElementById("signupPassword");

const firstnameError = document.getElementById("firstnameError");
const lastnameError = document.getElementById("lastnameError");
const phoneError = document.getElementById("phoneError");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");

/* =========================================
   HELPERS
========================================= */

function showMessage(message, type = "error") {
  messageBox.textContent = message;
  messageBox.className = `message ${type}`;
}

function clearMessage() {
  messageBox.textContent = "";
  messageBox.className = "message";
}

function setFieldError(input, errorElement, message) {
  input.classList.add("input-error");

  errorElement.textContent = message;
  errorElement.classList.add("show");
}

function clearFieldError(input, errorElement) {
  input.classList.remove("input-error");

  errorElement.textContent = "";
  errorElement.classList.remove("show");
}

function clearAllErrors() {
  clearFieldError(firstnameInput, firstnameError);
  clearFieldError(lastnameInput, lastnameError);
  clearFieldError(phoneInput, phoneError);
  clearFieldError(emailInput, emailError);
  clearFieldError(passwordInput, passwordError);

  clearMessage();
}

/* =========================================
   VALIDATORS
========================================= */

function isValidIranianMobile(phone) {
  return /^09\d{9}$/.test(phone);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* =========================================
   SIGNUP VALIDATION
========================================= */

function validateSignupForm() {
  let isValid = true;

  clearAllErrors();

  const firstname = firstnameInput.value.trim();
  const lastname = lastnameInput.value.trim();
  const phone = phoneInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // نام

  if (!firstname) {
    setFieldError(firstnameInput, firstnameError, "نام را وارد کنید.");

    isValid = false;
  } else if (firstname.length > 30) {
    setFieldError(
      firstnameInput,
      firstnameError,
      "نام نمی‌تواند بیشتر از ۳۰ کاراکتر باشد.",
    );

    isValid = false;
  }

  // نام خانوادگی

  if (!lastname) {
    setFieldError(lastnameInput, lastnameError, "نام خانوادگی را وارد کنید.");

    isValid = false;
  } else if (lastname.length > 30) {
    setFieldError(
      lastnameInput,
      lastnameError,
      "نام خانوادگی نمی‌تواند بیشتر از ۳۰ کاراکتر باشد.",
    );

    isValid = false;
  }

  // موبایل

  if (!phone) {
    setFieldError(phoneInput, phoneError, "شماره موبایل را وارد کنید.");

    isValid = false;
  } else if (!isValidIranianMobile(phone)) {
    setFieldError(phoneInput, phoneError, "شماره موبایل معتبر نیست. مثال: 09121234567");

    isValid = false;
  }

  // ایمیل - اختیاری

  if (email && !isValidEmail(email)) {
    setFieldError(emailInput, emailError, "ایمیل وارد شده معتبر نیست.");

    isValid = false;
  }

  // رمز عبور

  if (!password) {
    setFieldError(passwordInput, passwordError, "رمز عبور را وارد کنید.");

    isValid = false;
  } else if (password.length < 8) {
    setFieldError(passwordInput, passwordError, "رمز عبور باید حداقل ۸ کاراکتر باشد.");

    isValid = false;
  }

  return isValid;
}

/* =========================================
   PASSWORD TOGGLE
========================================= */

document.querySelectorAll(".password-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.target);

    input.type = input.type === "password" ? "text" : "password";
  });
});

/* =========================================
   INPUT EVENTS
========================================= */

firstnameInput.addEventListener("input", () => {
  clearFieldError(firstnameInput, firstnameError);
  clearMessage();
});

lastnameInput.addEventListener("input", () => {
  clearFieldError(lastnameInput, lastnameError);
  clearMessage();
});

phoneInput.addEventListener("input", () => {
  phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 11);

  clearFieldError(phoneInput, phoneError);
  clearMessage();
});

emailInput.addEventListener("input", () => {
  clearFieldError(emailInput, emailError);
  clearMessage();
});

passwordInput.addEventListener("input", () => {
  clearFieldError(passwordInput, passwordError);
  clearMessage();
});

/* =========================================
   FORM SUBMIT
========================================= */

signupForm.addEventListener("submit", async (event) => {
  // جلوگیری از رفرش صفحه
  event.preventDefault();

  clearAllErrors();

  // اول Validation
  const isValid = validateSignupForm();

  // اگر Validation شکست خورد:
  // اصلاً Request ارسال نمی‌کنیم
  if (!isValid) {
    return;
  }

  const firstname = firstnameInput.value.trim();
  const lastname = lastnameInput.value.trim();
  const phonenumber = phoneInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  try {
    submitButton.disabled = true;
    submitButton.classList.add("loading");

    submitButton.querySelector(".btn-text").textContent = "در حال ساخت حساب...";

    const response = await fetch(`${API_BASE}/signup`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      credentials: "include",

      body: JSON.stringify({
        firstname,
        lastname,
        phonenumber,
        email: email || undefined,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "ثبت‌نام ناموفق بود.");
    }

    showMessage("حساب شما با موفقیت ساخته شد.", "success");

    setTimeout(() => {
      window.location.href = "/";
    }, 500);
  } catch (error) {
    showMessage(error.message || "خطایی در ثبت‌نام رخ داد.");
  } finally {
    submitButton.disabled = false;

    submitButton.classList.remove("loading");

    submitButton.querySelector(".btn-text").textContent = "ساخت حساب";
  }
});
