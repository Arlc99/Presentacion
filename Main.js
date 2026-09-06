/**
 * main.js
 * ---------------------------------------------------------------
 * Lógica GENERAL de interfaz (frontend), SIN relación con el
 * formulario de contacto. El formulario vive en form.js.
 *
 * Responsabilidades de este archivo:
 *   1. Cambiar el estilo del navbar al hacer scroll.
 *   2. Abrir / cerrar el menú de navegación en móvil.
 *   3. Cerrar el menú móvil al hacer clic en un enlace.
 *   4. Escribir el año actual en el footer.
 * ---------------------------------------------------------------
 */

// Se ejecuta solo cuando el HTML ya está completamente cargado
document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initMobileMenu();
  setCurrentYear();
});

/**
 * initNavbarScroll
 * Agrega la clase "is-scrolled" al navbar cuando el usuario
 * baja más de 10px, para darle fondo sólido y sombra.
 * Sin esto, el navbar se queda transparente sobre el hero.
 */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const SCROLL_THRESHOLD = 10; // px que hay que bajar para activar el cambio

  const handleScroll = () => {
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }
  };

  // Revisamos el estado inicial (por si la página carga ya con scroll)
  handleScroll();

  window.addEventListener('scroll', handleScroll, { passive: true });
}

/**
 * initMobileMenu
 * Controla el botón "hamburguesa" que muestra/oculta el menú
 * de navegación en pantallas pequeñas.
 */
function initMobileMenu() {
  const toggleBtn = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  if (!toggleBtn || !menu) return;

  // Alterna el menú al hacer clic en el botón
  toggleBtn.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
  });

  // Si el usuario hace clic en cualquier enlace del menú,
  // lo cerramos automáticamente (mejor experiencia en móvil).
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/**
 * setCurrentYear
 * Coloca el año actual dentro del <span id="year"> del footer,
 * para no tener que actualizar el copyright a mano cada año.
 */
function setCurrentYear() {
  const yearEl = document.getElementById('year');
  if (!yearEl) return;
  yearEl.textContent = new Date().getFullYear();
}