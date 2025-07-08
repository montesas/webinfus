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

// --- Funciones para el Menú Hamburguesa ---
function setupHamburgerMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const navList = document.querySelector('#main-navigation ul'); // Asegura que sea el UL dentro del NAV con el ID

    if (menuToggle && navList) {
        menuToggle.addEventListener('click', function() {
            const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !expanded);
            navList.classList.toggle('show');
        });

        // Opcional: cerrar el menú con ESC y mejorar el foco en móviles
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
                menuToggle.click(); // Simula un click para cerrar
                menuToggle.focus(); // Devuelve el foco al botón del menú
            }
        });
    } else {
        console.warn('Elementos del menú hamburguesa no encontrados (menu-toggle o #main-navigation ul).');
    }
}

// --- Funciones para la Gestión de Cookies ---
function showCookieConsent() {
    const cookieNotice = document.getElementById('cookieConsent'); // Usa el ID para mayor precisión
    if (!cookieNotice) {
        console.error('No se encontró el elemento .cookie-notice (ID cookieConsent)');
        return;
    }
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
        cookieNotice.style.display = 'block';
        cookieNotice.setAttribute('aria-hidden', 'false');
    } else {
        cookieNotice.style.display = 'none';
        cookieNotice.setAttribute('aria-hidden', 'true');
    }
}

function acceptCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    const cookieNotice = document.getElementById('cookieConsent');
    if (cookieNotice) {
        cookieNotice.style.display = 'none';
        cookieNotice.setAttribute('aria-hidden', 'true');
    }
    console.info('Cookies aceptadas');
}

function rejectCookies() {
    localStorage.setItem('cookieConsent', 'rejected');
    const cookieNotice = document.getElementById('cookieConsent');
    if (cookieNotice) {
        cookieNotice.style.display = 'none';
        cookieNotice.setAttribute('aria-hidden', 'true');
    }
    console.info('Cookies rechazadas');
}

// Asegurarse de que estas funciones sean accesibles globalmente (si se llaman desde onclick en HTML)
window.acceptCookies = acceptCookies;
window.rejectCookies = rejectCookies;


// --- Funciones para el Formulario de Contacto ---
function esEmailValido(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validarFormulario() {
    const nombreInput = document.getElementById('nombre');
    const emailInput = document.getElementById('email');
    const mensajeInput = document.getElementById('mensaje');
    const gdprCheckbox = document.getElementById('gdpr');
    const enviarBtn = document.getElementById('btnEnviar'); // Usa el ID del botón

    if (!nombreInput || !emailInput || !mensajeInput || !gdprCheckbox || !enviarBtn) {
        console.warn('Uno o más elementos del formulario de contacto no se encontraron.');
        return;
    }

    const nombreValido = nombreInput.value.trim() !== '';
    const emailValido = esEmailValido(emailInput.value.trim());
    const mensajeValido = mensajeInput.value.trim() !== '';
    const gdprAceptado = gdprCheckbox.checked;

    // Asegurarse de que grecaptcha exista y la respuesta del captcha sea válida
    const captchaOk = typeof grecaptcha !== "undefined" &&
                      grecaptcha.getResponse &&
                      grecaptcha.getResponse().length > 0;

    enviarBtn.disabled = !(nombreValido && emailValido && mensajeValido && gdprAceptado && captchaOk);
}

// Función para ser llamada por reCAPTCHA al resolverlo
window.recaptchaCallback = function() {
    validarFormulario();
};

function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    const btnEnviar = document.getElementById('btnEnviar');
    const gdprCheckbox = document.getElementById('gdpr');

    if (!contactForm || !btnEnviar || !gdprCheckbox) {
        console.warn('Elementos del formulario de contacto no encontrados para setupContactForm.');
        return;
    }

    // Escucha cambios en los campos para habilitar/deshabilitar el botón
    const formFields = [
        document.getElementById('nombre'),
        document.getElementById('email'),
        document.getElementById('mensaje')
    ];

    formFields.forEach(field => {
        if (field) field.addEventListener('input', validarFormulario);
    });
    gdprCheckbox.addEventListener('change', validarFormulario);

    // Reset del formulario (incluyendo reCAPTCHA)
    contactForm.addEventListener('reset', function() {
        btnEnviar.disabled = true;
        if (typeof grecaptcha !== 'undefined' && grecaptcha.reset) {
            grecaptcha.reset();
        }
    });

    // Envío del formulario
    contactForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const status = document.getElementById("formStatus");
        if (!status) {
            console.error('Elemento formStatus no encontrado.');
            return;
        }
        status.textContent = "";

        // Verifica que el captcha esté resuelto
        const recaptchaResponse = typeof grecaptcha !== "undefined" && grecaptcha.getResponse ? grecaptcha.getResponse() : null;
        if (!recaptchaResponse) {
            status.textContent = "Por favor, marque que no es un robot.";
            status.style.color = "red";
            return;
        }

        // Prepara los datos del formulario
        const formData = new FormData(contactForm);
        formData.append("g-recaptcha-response", recaptchaResponse);

        // Envía los datos a Formspree
        try {
            const response = await fetch(contactForm.action, {
                method: "POST",
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                status.textContent = "¡Mensaje enviado correctamente!";
                status.style.color = "green";
                contactForm.reset();
                if (typeof grecaptcha !== 'undefined' && grecaptcha.reset) {
                    grecaptcha.reset(); // Restablece el reCAPTCHA
                }
                btnEnviar.disabled = true; // Volver a deshabilitar el botón
            } else {
                status.textContent = "Ocurrió un error al enviar el formulario. Inténtelo más tarde.";
                status.style.color = "red";
            }
        } catch (err) {
            status.textContent = "No se pudo conectar con el servidor. Inténtelo más tarde.";
            status.style.color = "red";
        }
    });
}


// FUSIÓN PRINCIPAL DE INICIALIZACIONES
document.addEventListener('DOMContentLoaded', function() {
    // 1. Debug inicial
    console.info('Iniciando aplicación...');

    // 2. Forzar scroll al inicio
    window.scrollTo(0, 0);

    // 3. Mostrar el aviso de cookies e inicializar botones
    showCookieConsent();
    // Los event listeners de acceptCookies y rejectCookies se manejan directamente en el HTML con onclick.

    // 4. Activar animaciones de las secciones visibles inicialmente
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.75 && rect.bottom > 0) {
            section.classList.add('visible');
        }
    });

    // 5. Comprobar modo oscuro (si lo usas)
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
    }

    // 6. Ajuste de margin-top dinámico al alto real del header
    if(header) {
        const main = document.querySelector('main'); // Quita .container si no es específico de main
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
                    if (Math.abs(window.scrollY - targetPosition) >= 1) { // Pequeña corrección para evitar scroll si ya está en posición
                        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                    }
                    // Actualiza el hash de la URL sin recargar la página
                    history.pushState(null, '', href);
                }
            }
            // Cierre menú hamburguesa si está activo (solo para pantallas pequeñas)
            const menuToggle = document.getElementById('menu-toggle');
            const navList = document.querySelector('#main-navigation ul');
            if (menuToggle && menuToggle.offsetParent !== null && navList && navList.classList.contains('show')) { // Comprueba si el toggle es visible (modo móvil)
                 menuToggle.click(); // Simula un click para cerrar el menú y actualizar aria-expanded
            }
        });
    });

    // 10. Inicializar el menú hamburguesa
    setupHamburgerMenu();

    // 11. Inicializar y validar formulario de contacto
    setupContactForm();
    // Llamar validarFormulario() una vez al inicio para establecer el estado inicial del botón
    validarFormulario();

    // 12. Botón de descarga de software
    const downloadBtn = document.querySelector('.download-button');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function (event) {
            event.preventDefault();
            const link = document.createElement('a');
            link.href = '/sites/default/files/Soporte%20Infus.exe'; // Asegúrate de que esta URL es correcta y accesible
            link.download = 'Soporte_Infus.exe';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            alert('El software ha sido descargado. Para ejecutarlo, busque el archivo "Soporte_Infus.exe" en su carpeta de descargas y haga doble clic para abrirlo.');
        });
    }

    // 13. Lazy loading para imágenes .lazy
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const imgSrc = img.dataset.src || img.getAttribute('src'); // Usa dataset.src o src si dataset.src no existe
                if (imgSrc) {
                    img.src = imgSrc;
                    img.removeAttribute('data-src'); // Limpiar data-src una vez cargada
                }
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
        document.title = 'Infus - Servicio Técnico Informático en A Coruña'; // Usar el título original
    }
});