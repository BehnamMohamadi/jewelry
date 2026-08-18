const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
const mobileMenuClose = document.getElementById("mobileMenuClose");
const mobileMenuOverlay = document.getElementById("mobileMenuOverlay");

function openMobileMenu() {
  mobileMenu.classList.add("open");
  mobileMenuOverlay.classList.add("open");

  mobileMenu.setAttribute("aria-hidden", "false");
  menuBtn.setAttribute("aria-expanded", "true");

  document.body.classList.add("menu-open");
}

function closeMobileMenu() {
  mobileMenu.classList.remove("open");
  mobileMenuOverlay.classList.remove("open");

  mobileMenu.setAttribute("aria-hidden", "true");
  menuBtn.setAttribute("aria-expanded", "false");

  document.body.classList.remove("menu-open");
}

// باز کردن منو
menuBtn?.addEventListener("click", openMobileMenu);

// بستن با X
mobileMenuClose?.addEventListener("click", closeMobileMenu);

// بستن با کلیک روی Overlay
mobileMenuOverlay?.addEventListener("click", closeMobileMenu);

// بستن با دکمه Escape
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMobileMenu();
  }
});

// وقتی روی یکی از لینک‌های منو کلیک شد
document.querySelectorAll(".mobile-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    closeMobileMenu();
  });
});
