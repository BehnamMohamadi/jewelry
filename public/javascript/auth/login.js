const API_BASE = "http://localhost:8000/api/auth";

const loginForm = document.getElementById("loginForm");
const messageBox = document.getElementById("message");
const submitButton = document.getElementById("loginSubmit");

const phoneInput = document.getElementById("loginPhone");
const passwordInput = document.getElementById("loginPassword");

const phoneError = document.getElementById("loginPhoneError");
const passwordError = document.getElementById("loginPasswordError");

/* =====================================================
   HELPERS
===================================================== */

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
  clearFieldError(phoneInput, phoneError);
  clearFieldError(passwordInput, passwordError);

  clearMessage();
}

/* =====================================================
   PHONE VALIDATION
===================================================== */

function isValidIranianMobile(phone) {
  return /^09\d{9}$/.test(phone);
}

/* =====================================================
   LOGIN VALIDATION
===================================================== */

function validateLoginForm() {
  let isValid = true;

  clearAllErrors();

  const phone = phoneInput.value.trim();
  const password = passwordInput.value;

  // PHONE

  if (!phone) {
    setFieldError(phoneInput, phoneError, "شماره موبایل را وارد کنید.");

    isValid = false;
  } else if (!isValidIranianMobile(phone)) {
    setFieldError(phoneInput, phoneError, "شماره موبایل معتبر نیست.");

    isValid = false;
  }

  // PASSWORD

  if (!password) {
    setFieldError(passwordInput, passwordError, "رمز عبور را وارد کنید.");

    isValid = false;
  } else if (password.length < 8) {
    setFieldError(passwordInput, passwordError, "رمز عبور باید حداقل ۸ کاراکتر باشد.");

    isValid = false;
  }

  return isValid;
}

/* =====================================================
   PASSWORD TOGGLE
===================================================== */

document.querySelectorAll(".password-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.target);

    if (input.type === "password") {
      input.type = "text";

      button.textContent = "◉";
    } else {
      input.type = "password";

      button.textContent = "◉";
    }
  });
});

/* =====================================================
   CLEAR ERROR WHILE USER TYPES
===================================================== */

phoneInput.addEventListener("input", () => {
  phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 11);

  clearFieldError(phoneInput, phoneError);

  clearMessage();
});

passwordInput.addEventListener("input", () => {
  clearFieldError(passwordInput, passwordError);

  clearMessage();
});

/* =====================================================
   SUBMIT
===================================================== */

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  clearAllErrors();

  // IMPORTANT:
  // هیچ Requestای قبل از این Validation ارسال نمی‌شود.

  const valid = validateLoginForm();

  if (!valid) {
    return;
  }

  const phonenumber = phoneInput.value.trim();
  const password = passwordInput.value;

  try {
    submitButton.disabled = true;

    submitButton.classList.add("loading");

    submitButton.querySelector(".btn-text").textContent = "در حال ورود...";

    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      credentials: "include",

      body: JSON.stringify({
        phonenumber,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "شماره موبایل یا رمز عبور اشتباه است.");
    }

    showMessage("ورود با موفقیت انجام شد.", "success");

    setTimeout(() => {
      window.location.href = "/home";
    }, 500);
  } catch (error) {
    showMessage(error.message || "خطایی در ورود رخ داد.");
  } finally {
    submitButton.disabled = false;

    submitButton.classList.remove("loading");

    submitButton.querySelector(".btn-text").textContent = "ورود";
  }
});
