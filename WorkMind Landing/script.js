"use strict";

function applyBrandTypography(root = document.body) {
  const textNodes = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      if (parent.closest("script, style, textarea, select, option, .skip-typography, .faq-section")) {
        return NodeFilter.FILTER_REJECT;
      }
      return /WorkMind/i.test(node.nodeValue)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    }
  });

  while (walker.nextNode()) textNodes.push(walker.currentNode);

  textNodes.forEach((node) => {
    const parts = node.nodeValue.split(/(WorkMind)/gi);
    const fragment = document.createDocumentFragment();

    parts.forEach((part) => {
      if (!part) return;
      if (/^WorkMind$/i.test(part)) {
        const span = document.createElement("span");
        span.className = "workmind-word";
        span.textContent = part;
        fragment.appendChild(span);
      } else {
        fragment.appendChild(document.createTextNode(part));
      }
    });

    node.replaceWith(fragment);
  });
}

applyBrandTypography();

const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".main-nav");
const backToTop = document.querySelector(".back-to-top");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  navigation.classList.remove("open");
  document.body.classList.remove("menu-open");
  menuButton.querySelector(".sr-only").textContent = "Abrir menu";
}

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  navigation.classList.toggle("open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
  menuButton.querySelector(".sr-only").textContent = isOpen ? "Abrir menu" : "Fechar menu";
});

navigation.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (targetId === "#" || !document.querySelector(targetId)) return;
    event.preventDefault();
    document.querySelector(targetId).scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start"
    });
  });
});

function updateScrollState() {
  header.classList.toggle("scrolled", window.scrollY > 8);
  backToTop.classList.toggle("visible", window.scrollY > 650);
}

window.addEventListener("scroll", updateScrollState, { passive: true });
updateScrollState();

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
});

document.querySelectorAll(".faq-item button").forEach((button) => {
  button.addEventListener("click", () => {
    const panel = document.getElementById(button.getAttribute("aria-controls"));
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    panel.hidden = expanded;
  });
});

const revealElements = document.querySelectorAll(".reveal");
if (reduceMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -35px" });
  revealElements.forEach((element) => revealObserver.observe(element));
}

const phoneInput = document.getElementById("phone");
const cnpjInput = document.getElementById("cnpj");

phoneInput.addEventListener("input", () => {
  let digits = phoneInput.value.replace(/\D/g, "").slice(0, 11);
  if (digits.length > 10) {
    digits = digits.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3");
  } else if (digits.length > 6) {
    digits = digits.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
  } else if (digits.length > 2) {
    digits = digits.replace(/^(\d{2})(\d*)/, "($1) $2");
  } else if (digits.length) {
    digits = digits.replace(/^(\d*)/, "($1");
  }
  phoneInput.value = digits;
});

cnpjInput.addEventListener("input", () => {
  const digits = cnpjInput.value.replace(/\D/g, "").slice(0, 14);
  cnpjInput.value = digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
});

const form = document.getElementById("lead-form");
const submitButton = form.querySelector(".submit-button");
const successMessage = form.querySelector(".form-success");

function setError(field, message) {
  const wrapper = field.closest(".field");
  if (!wrapper) return;
  wrapper.classList.toggle("invalid", Boolean(message));
  wrapper.querySelector(".error").textContent = message;
  field.setAttribute("aria-invalid", String(Boolean(message)));
}

function validateField(field) {
  if (field.disabled) return true;
  const value = field.type === "checkbox" ? field.checked : field.value.trim();
  let message = "";

  if (field.required && !value) {
    message = field.type === "checkbox"
      ? "É necessário autorizar o contato para enviar."
      : "Preencha este campo.";
  } else if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    message = "Informe um e-mail válido.";
  } else if (field.id === "phone" && value.replace(/\D/g, "").length < 10) {
    message = "Informe um telefone com DDD.";
  } else if (field.id === "cnpj" && value && value.replace(/\D/g, "").length !== 14) {
    message = "Informe os 14 dígitos do CNPJ.";
  }

  setError(field, message);
  return !message;
}

form.querySelectorAll("input, select, textarea").forEach((field) => {
  field.addEventListener("blur", () => validateField(field));
  field.addEventListener("change", () => {
    if (field.getAttribute("aria-invalid") === "true") validateField(field);
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  successMessage.hidden = true;

  const fields = [...form.querySelectorAll("input, select, textarea")];
  const valid = fields.map(validateField).every(Boolean);

  if (!valid) {
    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    firstInvalid?.focus();
    return;
  }

  submitButton.disabled = true;
  submitButton.classList.add("loading");
  submitButton.querySelector("span").textContent = "Enviando...";

  /*
   * Integração futura:
   * substitua o temporizador abaixo por uma chamada fetch() para sua API,
   * Formspree, HubSpot, RD Station ou outro CRM.
   */
  window.setTimeout(() => {
    submitButton.disabled = false;
    submitButton.classList.remove("loading");
    submitButton.querySelector("span").textContent = "Enviar solicitação";
    successMessage.hidden = false;
    successMessage.focus();
    form.reset();
    form.querySelectorAll(".field").forEach((field) => field.classList.remove("invalid"));
    form.querySelectorAll("[aria-invalid]").forEach((field) => field.setAttribute("aria-invalid", "false"));
  }, 900);
});
