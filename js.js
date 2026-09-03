/* ============================================
   CONFIG
   ============================================
   Para que el formulario ENVÍE correos de verdad sin backend,
   crea una cuenta gratuita en https://web3forms.com, obtén tu
   "Access Key" y pégala abajo. Mientras esté vacío, el formulario
   abrirá el cliente de correo del usuario como alternativa (mailto).
*/
const WEB3FORMS_ACCESS_KEY = ""; // <-- pega aquí tu access key de Web3Forms
const CONTACT_EMAIL = "hola@mateolondono.com";

document.addEventListener("DOMContentLoaded", () => {
  setFooterYear();
  setupNavToggle();
  setupScrollReveal();
  setupStatCounters();
  setupContactForm();
});

/* ============================================
   AÑO DEL FOOTER
   ============================================ */
function setFooterYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

/* ============================================
   MENÚ MÓVIL
   ============================================ */
function setupNavToggle() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.classList.toggle("is-active", isOpen);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ============================================
   REVELADO AL HACER SCROLL
   ============================================ */
function setupScrollReveal() {
  const targets = document.querySelectorAll(
    ".about, .projects, .experience, .brands, .contact"
  );

  targets.forEach((el) => el.classList.add("reveal"));

  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => observer.observe(el));
}

/* ============================================
   CONTADORES ANIMADOS DEL HERO
   ============================================ */
function setupStatCounters() {
  const nums = document.querySelectorAll(".stat-num");
  if (!nums.length) return;

  const animate = (el) => {
    const target = parseFloat(el.dataset.count || "0");
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const duration = 1200;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = target * eased;
      el.textContent = value.toFixed(decimals);
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  if (!("IntersectionObserver" in window)) {
    nums.forEach(animate);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  nums.forEach((el) => observer.observe(el));
}

/* ============================================
   FORMULARIO DE CONTACTO
   ============================================ */
function setupContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const submitBtn = document.getElementById("submitBtn");
  const status = document.getElementById("formStatus");

  const fields = {
    name: { input: document.getElementById("name"), error: document.getElementById("err-name") },
    email: { input: document.getElementById("email"), error: document.getElementById("err-email") },
    message: { input: document.getElementById("message"), error: document.getElementById("err-message") },
  };

  const validators = {
    name: (v) => v.trim().length >= 2 || "Escribe tu nombre completo.",
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "Escribe un correo válido.",
    message: (v) => v.trim().length >= 10 || "Cuéntame un poco más (mínimo 10 caracteres).",
  };

  const validateField = (key) => {
    const { input, error } = fields[key];
    const result = validators[key](input.value);
    const fieldWrap = input.closest(".field");

    if (result === true) {
      fieldWrap.classList.remove("invalid");
      error.textContent = "";
      return true;
    } else {
      fieldWrap.classList.add("invalid");
      error.textContent = result;
      return false;
    }
  };

  Object.keys(fields).forEach((key) => {
    fields[key].input.addEventListener("blur", () => validateField(key));
    fields[key].input.addEventListener("input", () => {
      if (fields[key].input.closest(".field").classList.contains("invalid")) {
        validateField(key);
      }
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const results = Object.keys(fields).map(validateField);
    if (results.includes(false)) {
      setStatus("Revisa los campos marcados en rojo.", "error");
      return;
    }

    const data = {
      name: fields.name.input.value.trim(),
      email: fields.email.input.value.trim(),
      company: document.getElementById("company").value.trim(),
      message: fields.message.input.value.trim(),
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando…";
    setStatus("", "");

    try {
      if (WEB3FORMS_ACCESS_KEY) {
        await sendWithWeb3Forms(data);
        setStatus("¡Mensaje enviado! Te responderé muy pronto.", "success");
        form.reset();
      } else {
        openMailFallback(data);
        setStatus("Abriendo tu cliente de correo para enviar el mensaje…", "success");
      }
    } catch (err) {
      console.error(err);
      setStatus("No se pudo enviar. Intenta de nuevo o escríbeme directo por correo.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Enviar mensaje";
    }
  });

  function setStatus(text, type) {
    status.textContent = text;
    status.className = "form-status" + (type ? " " + type : "");
  }
}

async function sendWithWeb3Forms(data) {
  const response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: `Nuevo contacto desde la landing — ${data.name}`,
      from_name: data.name,
      name: data.name,
      email: data.email,
      company: data.company,
      message: data.message,
    }),
  });

  const result = await response.json();
  if (!result.success) throw new Error(result.message || "Error al enviar");
  return result;
}

function openMailFallback(data) {
  const subject = encodeURIComponent(`Nuevo contacto — ${data.name}`);
  const body = encodeURIComponent(
    `Nombre: ${data.name}\nCorreo: ${data.email}\nEmpresa: ${data.company || "—"}\n\nMensaje:\n${data.message}`
  );
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}