const header = document.querySelector("#header");
const toggle = document.querySelector("#navToggle");
const nav = document.querySelector("#nav");
const progress = document.querySelector(".scroll-progress");
const heroContent = document.querySelector(".hero-content");
const heroVisual = document.querySelector(".orb-visual");

const closeMenu = () => {
  if (!nav || !toggle) return;
  nav.classList.remove("open");
  toggle.classList.remove("open");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Abrir menu");
};

let scrollFrame;
const updateScrollEffects = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const pageProgress = scrollable > 0 ? window.scrollY / scrollable : 0;
  if (progress) progress.style.transform = `scaleX(${Math.min(1, Math.max(0, pageProgress))})`;
  if (header) header.classList.toggle("scrolled", window.scrollY > 8);

  if (!reducedMotion) {
    const heroProgress = Math.min(1, window.scrollY / Math.max(1, window.innerHeight * 0.8));
    if (heroContent) {
      heroContent.style.setProperty("--hero-shift", `${heroProgress * 22}px`);
      heroContent.style.setProperty("--hero-opacity", String(1 - heroProgress * 0.16));
    }
    if (heroVisual) heroVisual.style.setProperty("--hero-visual-shift", `${heroProgress * -8}px`);
  }
  scrollFrame = undefined;
};

window.addEventListener("scroll", () => {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollEffects);
}, { passive: true });
window.addEventListener("resize", () => {
  closeMenu();
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollEffects);
}, { passive: true });
toggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
});
nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMenu(); });

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.querySelectorAll(".product-grid, .feature-grid, .partnership-models").forEach((grid) => {
  [...grid.children].forEach((item, index) => item.style.setProperty("--reveal-delay", `${index * 70}ms`));
});

if ("IntersectionObserver" in window && !reducedMotion) {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
  }), { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((item) => observer.observe(item));
} else {
  document.querySelectorAll(".reveal").forEach((item) => item.classList.add("visible"));
}

updateScrollEffects();
const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();
