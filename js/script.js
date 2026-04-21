/* ====================================== Typing Animation ========================================== */
var typed = new Typed(".typing", {
  strings: [
    "Software Developer",
    "Web Developer",
    "Full Stack Developer",
    "Front End Developer",
    "Back End Developer",
  ],
  typeSpeed: 100,
  backSpeed: 60,
  loop: true,
});

/* ====================================== Aside ========================================== */
const nav = document.querySelector(".nav"),
  navList = nav.querySelectorAll("li"),
  totalNavList = navList.length,
  allSection = document.querySelectorAll(".section"),
  totalSection = allSection.length,
  mainContent = document.querySelector(".main-content");
const activeSectionStorageKey = "site-active-section";

function persistActiveSection(targetId) {
  if (!targetId) return;
  try {
    sessionStorage.setItem(activeSectionStorageKey, targetId);
  } catch (error) {}
}

function releasePreloadAfterPaint() {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      releasePreload();
    });
  });
}

function releasePreload() {
  if (
    document.documentElement.classList.contains("dark-mode-preload") ||
    document.documentElement.getAttribute("data-theme-mode") === "dark"
  ) {
    document.body.classList.add("dark");
  }
  document.documentElement.classList.remove("dark-mode-preload");
  document.body.classList.remove("preload");
}

function updateSectionHash(targetId) {
  if (!targetId) return;
  const nextHash = "#" + targetId;
  if (window.location.hash === nextHash) return;
  history.replaceState(null, "", nextHash);
}

function setActiveNavById(targetId) {
  for (let i = 0; i < totalNavList; i++) {
    const link = navList[i].querySelector("a");
    const sectionId = link.getAttribute("href").split("#")[1];
    link.classList.toggle("active", sectionId === targetId);
  }
}

function scrollToSection(targetId) {
  const targetSection = document.querySelector("#" + targetId);
  if (!targetSection) return;

  targetSection.scrollIntoView({ behavior: "smooth", block: "start" });

  allSection.forEach((section) => {
    section.classList.toggle("active", section.id === targetId);
  });

  setActiveNavById(targetId);
  updateSectionHash(targetId);
  persistActiveSection(targetId);
}

function syncActiveSectionFromScroll() {
  let activeSection = allSection[0];
  let smallestDistance = Infinity;
  const probeLine = window.innerHeight * 0.35;

  allSection.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const overlapsProbeLine = rect.top <= probeLine && rect.bottom >= probeLine;
    const distanceToProbeLine = Math.abs(rect.top - probeLine);

    if (overlapsProbeLine) {
      activeSection = section;
      smallestDistance = -1;
      return;
    }

    if (smallestDistance !== -1 && distanceToProbeLine < smallestDistance) {
      smallestDistance = distanceToProbeLine;
      activeSection = section;
    }
  });

  allSection.forEach((section) => {
    section.classList.toggle("active", section === activeSection);
  });
  setActiveNavById(activeSection.id);
  updateSectionHash(activeSection.id);
  persistActiveSection(activeSection.id);
  releasePreloadAfterPaint();
}

function syncSectionFromHash() {
  const hash = window.location.hash.replace("#", "");
  if (!hash) {
    syncActiveSectionFromScroll();
    return;
  }

  const targetSection = document.getElementById(hash);
  if (!targetSection) {
    syncActiveSectionFromScroll();
    return;
  }

  window.scrollTo(0, targetSection.offsetTop);

  allSection.forEach((section) => {
    section.classList.toggle("active", section.id === hash);
  });
  setActiveNavById(hash);
  persistActiveSection(hash);
  releasePreloadAfterPaint();
}

for (let i = 0; i < totalNavList; i++) {
  const a = navList[i].querySelector("a");
  a.addEventListener("click", function () {
    const target = this.getAttribute("href").split("#")[1];
    scrollToSection(target);
    if (window.innerWidth < 1200) {
      asideSelectionTogglerBtn();
    }
  });
}
function removeBackSection() {
  for (let i = 0; i < totalSection; i++) {
    allSection[i].classList.remove("back-section");
  }
}
function addBackSection(num) {
  allSection[num].classList.add("back-section");
}
function showSection(element) {
  const target = element.getAttribute("href").split("#")[1];
  scrollToSection(target);
}
function updateNav(element) {
  const target = element.getAttribute("href").split("#")[1];
  setActiveNavById(target);
}
document.querySelector(".hire-me").addEventListener("click", function () {
  showSection(this);
  updateNav(this);
});
const navTogglerBtn = document.querySelector(".nav-toggler"),
  aside = document.querySelector(".aside");
navTogglerBtn.addEventListener("click", () => {
  asideSelectionTogglerBtn();
});
function asideSelectionTogglerBtn() {
  aside.classList.toggle("open");
  navTogglerBtn.classList.toggle("open");
  mainContent.classList.toggle("open");
}

/* ====================================== Contact Form ========================================== */
const contactForm = document.getElementById("contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formStatus = document.getElementById("form-status");
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    formStatus.textContent = "";

    const data = {
      name: document.getElementById("contact-name").value,
      email: document.getElementById("contact-email").value,
      subject: document.getElementById("contact-subject").value,
      message: document.getElementById("contact-message").value,
    };

    try {
      const res = await fetch("http://localhost:3000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        formStatus.textContent = "Message sent successfully!";
        formStatus.style.color = "#28a745";
        contactForm.reset();
      } else {
        formStatus.textContent = "Failed to send message. Please try again.";
        formStatus.style.color = "#dc3545";
      }
    } catch (error) {
      formStatus.textContent = "Failed to send message. Please try again.";
      formStatus.style.color = "#dc3545";
    }

    submitBtn.disabled = false;
    submitBtn.textContent = "Send Message";
  });
}

document.addEventListener("DOMContentLoaded", syncSectionFromHash);
window.addEventListener("load", syncSectionFromHash);
window.addEventListener("pageshow", syncSectionFromHash);
window.addEventListener("scroll", syncActiveSectionFromScroll, { passive: true });
window.addEventListener("resize", syncActiveSectionFromScroll);
