/**
 * form.js
 * ---------------------------------------------------------------
 * Lógica EXCLUSIVA del formulario de contacto.
 * Separada a propósito de main.js: aquí solo vive todo lo
 * relacionado con validar, guardar y enviar el mensaje del
 * formulario. Nada de navbar ni menú aquí.
 *
 * Qué hace al enviar el formulario:
 *   1. Valida que los campos obligatorios estén completos.
 *   2. Genera un archivo .txt con los datos y lo descarga
 *      en el computador de la persona que llena el formulario.
 *   3. Abre WhatsApp (wa.me) con el mensaje ya redactado,
 *      listo para que la persona solo presione "Enviar".
 * ---------------------------------------------------------------
 */

// ⚠️ CONFIGURACIÓN: reemplaza este número por tu número real de WhatsApp.
// Formato: código de país + número, SIN "+", SIN espacios ni guiones.
// Ejemplo Colombia: "573001234567"
const WHATSAPP_NUMBER = '573000000000';

document.addEventListener('DOMContentLoaded', () => {
  initWhatsappDirectLink();
  initContactForm();
});

/**
 * initWhatsappDirectLink
 * Arma el enlace directo de WhatsApp que aparece junto a los
 * datos de contacto (el que dice "+57 300 000 0000"), para que
 * también funcione como botón de contacto rápido, sin formulario.
 */
function initWhatsappDirectLink() {
  const link = document.getElementById('whatsappDirectLink');
  if (!link) return;

  const mensaje = 'Hola Daniel, quiero más información sobre tus servicios de marketing digital.';
  link.href = buildWhatsappUrl(WHATSAPP_NUMBER, mensaje);
  link.target = '_blank';
  link.rel = 'noopener';
}

/**
 * initContactForm
 * Engancha el evento "submit" del formulario y coordina
 * la validación, el archivo .txt y el envío a WhatsApp.
 */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const statusEl = document.getElementById('formStatus');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    // Evitamos que el navegador recargue la página, ya que
    // todo el proceso lo manejamos aquí con JavaScript.
    event.preventDefault();

    const datos = getFormData(form);
    const errores = validateFormData(datos);

    // Si hay errores, los mostramos y detenemos el envío.
    renderFormErrors(form, errores);
    if (Object.keys(errores).length > 0) {
      setStatus(statusEl, 'Por favor revisa los campos marcados.', false);
      return;
    }

    // 1) Generar y descargar el archivo .txt con el resumen del mensaje.
    downloadAsTxt(datos);

    // 2) Abrir WhatsApp con el mensaje ya redactado.
    const mensajeWhatsapp = buildWhatsappMessage(datos);
    const whatsappUrl = buildWhatsappUrl(WHATSAPP_NUMBER, mensajeWhatsapp);
    window.open(whatsappUrl, '_blank', 'noopener');

    // 3) Avisar a la persona que todo salió bien y limpiar el formulario.
    setStatus(statusEl, '¡Listo! Se descargó tu mensaje y se abrió WhatsApp para enviarlo.', true);
    form.reset();
  });
}

/**
 * getFormData
 * Lee los valores actuales del formulario y los devuelve
 * como un objeto simple, ya sin espacios sobrantes.
 */
function getFormData(form) {
  return {
    nombre: form.nombre.value.trim(),
    email: form.email.value.trim(),
    telefono: form.telefono.value.trim(),
    mensaje: form.mensaje.value.trim(),
  };
}

/**
 * validateFormData
 * Revisa cada campo y devuelve un objeto con los mensajes
 * de error encontrados. Si el objeto queda vacío, todo es válido.
 */
function validateFormData(datos) {
  const errores = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const telefonoRegex = /^[0-9+\s()-]{7,20}$/;

  if (!datos.nombre) {
    errores.nombre = 'Escribe tu nombre completo.';
  }

  if (!datos.email) {
    errores.email = 'Escribe tu correo electrónico.';
  } else if (!emailRegex.test(datos.email)) {
    errores.email = 'Ese correo no parece válido.';
  }

  if (!datos.telefono) {
    errores.telefono = 'Escribe tu número de teléfono.';
  } else if (!telefonoRegex.test(datos.telefono)) {
    errores.telefono = 'Ese teléfono no parece válido.';
  }

  if (!datos.mensaje) {
    errores.mensaje = 'Cuéntame brevemente sobre tu proyecto.';
  }

  return errores;
}

/**
 * renderFormErrors
 * Pinta (o limpia) los mensajes de error debajo de cada campo,
 * usando los <span data-error-for="..."> que ya están en el HTML.
 */
function renderFormErrors(form, errores) {
  const campos = ['nombre', 'email', 'telefono', 'mensaje'];

  campos.forEach((campo) => {
    const row = form.querySelector(`#${campo}`)?.closest('.contact-form__row');
    const errorEl = form.querySelector(`[data-error-for="${campo}"]`);
    if (!row || !errorEl) return;

    if (errores[campo]) {
      row.classList.add('has-error');
      errorEl.textContent = errores[campo];
    } else {
      row.classList.remove('has-error');
      errorEl.textContent = '';
    }
  });
}

/**
 * setStatus
 * Muestra un mensaje de estado (éxito o error) debajo del botón
 * de envío, usando aria-live para que también lo anuncien
 * los lectores de pantalla.
 */
function setStatus(statusEl, mensaje, esExito) {
  if (!statusEl) return;
  statusEl.textContent = mensaje;
  statusEl.classList.toggle('is-success', Boolean(esExito));
}

/**
 * buildWhatsappMessage
 * Arma el texto del mensaje de WhatsApp a partir de los datos
 * del formulario, en un formato claro y fácil de leer.
 */
function buildWhatsappMessage(datos) {
  return (
    `Hola Daniel, mi nombre es ${datos.nombre}.\n` +
    `Correo: ${datos.email}\n` +
    `Teléfono: ${datos.telefono}\n` +
    `Mensaje: ${datos.mensaje}`
  );
}

/**
 * buildWhatsappUrl
 * Construye la URL de wa.me con el número y el mensaje
 * codificados correctamente para ir en la URL.
 */
function buildWhatsappUrl(numero, mensaje) {
  const mensajeCodificado = encodeURIComponent(mensaje);
  return `https://wa.me/${numero}?text=${mensajeCodificado}`;
}

/**
 * downloadAsTxt
 * Crea un archivo .txt en memoria (Blob) con los datos del
 * formulario y dispara automáticamente su descarga en el
 * navegador de la persona que llena el formulario.
 *
 * Nota: por seguridad, un sitio web no puede guardar archivos
 * directamente en el servidor sin un backend. Esta función hace
 * lo que sí es posible desde el navegador: generar y descargar
 * el .txt en el equipo del usuario.
 */
function downloadAsTxt(datos) {
  const fecha = new Date().toLocaleString('es-CO');

  const contenido =
    `Nuevo contacto desde el sitio web\n` +
    `----------------------------------\n` +
    `Fecha: ${fecha}\n` +
    `Nombre: ${datos.nombre}\n` +
    `Correo: ${datos.email}\n` +
    `Teléfono: ${datos.telefono}\n` +
    `Mensaje:\n${datos.mensaje}\n`;

  const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  // Creamos un enlace invisible, le damos clic por código y lo eliminamos.
  const link = document.createElement('a');
  link.href = url;
  link.download = `contacto-${datos.nombre.replace(/\s+/g, '-').toLowerCase()}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Liberamos la memoria usada por el archivo temporal.
  URL.revokeObjectURL(url);
}