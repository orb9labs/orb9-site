const header = document.querySelector("#header");
const toggle = document.querySelector("#navToggle");
const nav = document.querySelector("#nav");

const closeMenu = () => {
  nav.classList.remove("open");
  toggle.classList.remove("open");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Abrir menu");
};

window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 8), { passive: true });
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
});
nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMenu(); });

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if ("IntersectionObserver" in window && !reducedMotion) {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
  }), { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((item) => observer.observe(item));
} else {
  document.querySelectorAll(".reveal").forEach((item) => item.classList.add("visible"));
}

document.querySelector("#year").textContent = new Date().getFullYear();
