/* ====================================== Toggle Style Switcher ========================================== */

const styleSwitcher = document.querySelector(".style-switcher");
const styleSwitcherToggle = document.querySelector(".style-switcher-toggler");
styleSwitcherToggle.addEventListener("click", () => {
  styleSwitcher.classList.toggle("open");
});
// Hide style switcher on scroll

window.addEventListener("scroll", () => {
  if (styleSwitcher.classList.contains("open")) {
    styleSwitcher.classList.remove("open");
  }
});

styleSwitcher.addEventListener("mouseleave", () => {
  styleSwitcher.classList.remove("open");
});

document.addEventListener("click", (event) => {
  if (!styleSwitcher.contains(event.target)) {
    styleSwitcher.classList.remove("open");
  }
});

/* ====================================== Theme Colors ========================================== */
const alternateStyles = document.querySelectorAll(".alternate-style");
const defaultThemeColor = "color-4";

function setActiveStyle(color) {
  alternateStyles.forEach((style) => {
    if (color === style.getAttribute("title")) {
      style.removeAttribute("disabled");
    } else {
      style.setAttribute("disabled", "true");
    }
  });
  localStorage.setItem("theme-color", color);
  document.documentElement.setAttribute("data-theme-color", color);
}

/* ====================================== Theme Light and Dark Mode ========================================== */
const dayNight = document.querySelector(".day-night");
dayNight.addEventListener("click", () => {
  dayNight.querySelector("i").classList.toggle("fa-sun");
  dayNight.querySelector("i").classList.toggle("fa-moon");
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme-mode",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
  document.documentElement.setAttribute(
    "data-theme-mode",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
});
window.addEventListener("load", () => {
  const savedThemeColor =
    document.documentElement.getAttribute("data-theme-color") ||
    localStorage.getItem("theme-color") ||
    defaultThemeColor;
  setActiveStyle(savedThemeColor);
  if (localStorage.getItem("theme-mode") === "light") {
    document.documentElement.setAttribute("data-theme-mode", "light");
  } else {
    document.body.classList.add("dark");
    document.documentElement.setAttribute("data-theme-mode", "dark");
  }
  if (document.body.classList.contains("dark")) {
    dayNight.querySelector("i").classList.add("fa-sun");
  } else {
    dayNight.querySelector("i").classList.add("fa-moon");
  }
});
