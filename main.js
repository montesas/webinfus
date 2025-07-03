// Fecha de última actualización: 2025-05-08 07:38:11
// Autor: montesas

// Variables globales y utilidades generales
let isScrolling;
const header = document.querySelector('header');
const backToTopButton = document.getElementById('backToTop');
const sections = document.querySelectorAll('.section-animate');

// Debug inicial
console.log('Elementos con clase section-animate encontrados:', sections.length);

// Asegurar que la página siempre cargue al principio
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}
window.onbeforeunload = function() {
    window.scrollTo(0, 0);
};

// Función para validar el email
function esEmailValido(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Función para validar si el formulario está completo
function validarFormulario() {
    const nombreInput = document.getElementById('nombre');
    const emailInput = document.getElementById('email');
    const mensajeInput = document.getElementById('mensaje');
    const gdprCheckbox = document.getElementById('gdpr');
    const enviarBtn = document.querySelector('.contact-form button');
    if (!nombreInput || !emailInput || !mensajeInput || !gdprCheckbox || !enviarBtn) return;
    const nombreValido = nombreInput.value.trim() !== '';
    const emailValido = esEmailValido(emailInput.value.trim());
    const mensajeValido = mensajeInput.value.trim() !== '';
    const gdprAceptado = gdprCheckbox.checked;
    enviarBtn.disabled = !(nombreValido && emailValido && mensajeValido && gdprAceptado);
}

// Gestión de Cookies
function showCookieConsent() {
    const cookieNotice = document.querySelector('.cookie-notice');
    if (!cookieNotice) {
        console.error('No se encontró el elemento .cookie-notice');
        return;
    }
    const cookieConsent = localStorage.getItem('cookieConsent');
    cookieNotice.style.display = !cookieConsent ? 'block' : 'none';
}

function acceptCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    document.querySelector('.cookie-notice').style.display = 'none';
    console.info('Cookies aceptadas');
}
function rejectCookies() {
    localStorage.setItem('cookieConsent', 'rejected');
    document.querySelector('.cookie-notice').style.display = 'none';
    console.info('Cookies rechazadas');
}

// FUSIÓN PRINCIPAL DE INICIALIZACIONES
document.addEventListener('DOMContentLoaded', function() {
    // 1. Debug inicial
    console.info('Iniciando aplicación...');

    // 2. Forzar scroll al inicio
    window.scrollTo(0, 0);

    // 3. Mostrar el aviso de cookies
    showCookieConsent();

    // 4. Activar animaciones de las secciones visibles inicialmente
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.75 && rect.bottom > 0) {
            section.classList.add('visible');
        }
    });

    // 5. Comprobar modo oscuro
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
    }

    // 6. Ajuste de margin-top dinámico al alto real del header
    if(header) {
        const main = document.querySelector('main.container');
        if(main) main.style.marginTop = header.offsetHeight + "px";
    }

    // 7. Back to Top (botón)
    if (backToTopButton) {
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 8. Scroll + mostrar botón Back to Top + animaciones de sección
    window.addEventListener('scroll', function() {
        clearTimeout(isScrolling);
        if (backToTopButton) backToTopButton.style.display = window.scrollY > 300 ? 'flex' : 'none';
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.75 && rect.bottom > 0) {
                section.classList.add('visible');
            }
        });
        isScrolling = setTimeout(function() {}, 66);
    });

    // 9. Enlaces del menú con scroll ajustado y cierre menú hamburguesa
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(href);
                if (targetSection) {
                    const headerHeight = header ? header.offsetHeight : 0;
                    const additionalOffset = 20;
                    const targetPosition = Math.round(
                        targetSection.getBoundingClientRect().top + window.scrollY - headerHeight - additionalOffset
                    );
                    if (Math.abs(window.scrollY - targetPosition) >= 1) {
                        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                    }
                }
            }
            // Cierre menú hamburguesa si está activo
            const navList = document.querySelector('.header-bottom nav ul');
            if (navList && navList.classList.contains('show')) {
                navList.classList.remove('show');
            }
        });
    });

    // 10. Menú hamburguesa responsive
    var toggle = document.getElementById("menu-toggle");
    var navList = document.querySelector(".header-bottom nav ul");
    if (toggle && navList) {
        toggle.addEventListener("click", function() {
            navList.classList.toggle("show");
        });
    }

    // 11. Validación de formulario contacto en tiempo real
    const nombreInput = document.getElementById('nombre');
    const emailInput = document.getElementById('email');
    const mensajeInput = document.getElementById('mensaje');
    const gdprCheckbox = document.getElementById('gdpr');
    const enviarBtn = document.querySelector('.contact-form button');
    [nombreInput, emailInput, mensajeInput, gdprCheckbox].forEach(campo => {
        if (campo) campo.addEventListener('input', validarFormulario);
    });
    validarFormulario();

    // 12. Botón de descarga de software
    const downloadBtn = document.querySelector('.download-button');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function (event) {
            event.preventDefault();
            const link = document.createElement('a');
            link.href = '/sites/default/files/Soporte%20Infus.exe';
            link.download = 'Soporte_Infus.exe';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            alert('El software ha sido descargado. Para ejecutarlo, busque el archivo "software-remoto.exe" en su carpeta de descargas y haga doble clic para abrirlo.');
        });
    }

    // 13. Lazy loading para imágenes .lazy
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    document.querySelectorAll('img.lazy').forEach(img => {
        imageObserver.observe(img);
    });
});

// Manejo de la visibilidad de la página (fuera de DOMContentLoaded)
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        document.title = '¡Vuelve pronto! - Tu Servicio Técnico';
    } else {
        document.title = 'Tu Servicio Técnico - Reparación de Dispositivos';
    }
});