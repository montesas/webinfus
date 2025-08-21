// Fecha de última actualización: 2025-07-25 18:00:00
// Autor: montesas

// --- Variables globales y utilidades generales ---
const header = document.querySelector('header');
const main = document.querySelector('main');
const backToTopButton = document.getElementById('backToTop');
const sections = document.querySelectorAll('.section-animate');
const menuToggle = document.getElementById('menu-toggle');
const navList = document.querySelector('#main-navigation ul');

// Debug inicial
console.log('Elementos con clase section-animate encontrados:', sections.length);

// --- Funciones para el Menú Hamburguesa ---
function setupHamburgerMenu() {
    if (!menuToggle || !navList) {
        console.warn('Elementos del menú hamburguesa no encontrados (menu-toggle o #main-navigation ul).');
        return;
    }

    menuToggle.addEventListener('click', function() {
        const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !expanded);
        navList.classList.toggle('show');

        if (!expanded) {
            navList.querySelector('a')?.focus();
        } else {
            menuToggle.focus();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
            menuToggle.click();
        }
    });
}

// --- Funciones para la Gestión de Cookies (CORREGIDA) ---
function setupCookieConsent() {
    const cookieNotice = document.getElementById('cookieConsent');
    if (!cookieNotice) {
        console.warn('Elementos del aviso de cookies no encontrados (cookieConsent).');
        return;
    }

    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
        // Muestra el aviso añadiendo la clase 'show' para activar la animación CSS
        cookieNotice.classList.add('show');
    }

    const acceptBtn = cookieNotice.querySelector('.accept-cookies');
    const rejectBtn = cookieNotice.querySelector('.reject-cookies');

    if (acceptBtn) {
        acceptBtn.addEventListener('click', function() {
            localStorage.setItem('cookieConsent', 'accepted');
            cookieNotice.classList.remove('show');
            cookieNotice.setAttribute('aria-hidden', 'true');
            console.info('Cookies aceptadas.');
        });
    }

    if (rejectBtn) {
        rejectBtn.addEventListener('click', function() {
            localStorage.setItem('cookieConsent', 'rejected');
            cookieNotice.classList.remove('show');
            cookieNotice.setAttribute('aria-hidden', 'true');
            console.info('Cookies rechazadas.');
        });
    }
}

// --- Funciones para el Formulario de Contacto ---

// Función para la carga diferida de reCAPTCHA
let recaptchaLoaded = false;
function loadRecaptchaScript() {
    if (recaptchaLoaded) return;
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=TU_CLAVE_DE_RECAPTCHA&onload=recaptchaCallback';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    recaptchaLoaded = true;
}

function esEmailValido(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validarFormulario() {
    const nombreInput = document.getElementById('nombre');
    const emailInput = document.getElementById('email');
    const mensajeInput = document.getElementById('mensaje');
    const gdprCheckbox = document.getElementById('gdpr');
    const enviarBtn = document.getElementById('btnEnviar');

    if (!nombreInput || !emailInput || !mensajeInput || !gdprCheckbox || !enviarBtn) {
        console.warn('Uno o más elementos del formulario de contacto no se encontraron.');
        return;
    }

    const nombreValido = nombreInput.value.trim() !== '';
    const emailValido = esEmailValido(emailInput.value.trim());
    const mensajeValido = mensajeInput.value.trim() !== '';
    const gdprAceptado = gdprCheckbox.checked;

    const captchaOk = typeof grecaptcha !== "undefined" &&
                      grecaptcha.getResponse &&
                      grecaptcha.getResponse().length > 0;

    enviarBtn.disabled = !(nombreValido && emailValido && mensajeValido && gdprAceptado && captchaOk);
}

window.recaptchaCallback = validarFormulario;

function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    const btnEnviar = document.getElementById('btnEnviar');
    const gdprCheckbox = document.getElementById('gdpr');

    if (!contactForm || !btnEnviar || !gdprCheckbox) {
        return;
    }

    const formFields = [
        document.getElementById('nombre'),
        document.getElementById('email'),
        document.getElementById('mensaje')
    ];

    formFields.forEach(field => {
        if (field) field.addEventListener('input', validarFormulario);
    });
    gdprCheckbox.addEventListener('change', validarFormulario);

    contactForm.addEventListener('reset', function() {
        setTimeout(() => {
            btnEnviar.disabled = true;
            if (typeof grecaptcha !== 'undefined' && grecaptcha.reset) {
                grecaptcha.reset();
            }
        }, 0);
    });

    contactForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const status = document.getElementById("formStatus");
        if (!status) {
            console.error('Elemento formStatus no encontrado.');
            return;
        }
        status.textContent = "";

        btnEnviar.disabled = true;
        btnEnviar.textContent = 'Enviando...';

        const recaptchaResponse = typeof grecaptcha !== "undefined" && grecaptcha.getResponse ? grecaptcha.getResponse() : null;
        if (!recaptchaResponse) {
            status.textContent = "Por favor, marque que no es un robot.";
            status.style.color = "red";
            btnEnviar.disabled = false;
            btnEnviar.textContent = 'Enviar Mensaje';
            return;
        }

        const formData = new FormData(contactForm);
        formData.append("g-recaptcha-response", recaptchaResponse);

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
                    grecaptcha.reset();
                }
                btnEnviar.disabled = true;
            } else {
                const data = await response.json();
                if (data.errors) {
                    status.textContent = data.errors.map(err => err.message).join(', ');
                } else {
                    status.textContent = "Ocurrió un error al enviar el formulario. Inténtelo más tarde.";
                }
                status.style.color = "red";
            }
        } catch (err) {
            console.error('Error al enviar el formulario:', err);
            status.textContent = "No se pudo conectar con el servidor. Inténtelo más tarde.";
            status.style.color = "red";
        } finally {
            btnEnviar.textContent = 'Enviar Mensaje';
            validarFormulario();
        }
    });
}

// --- Funciones para animaciones de sección con IntersectionObserver ---
function setupSectionAnimations() {
    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px 0px -100px 0px' });

    sections.forEach(section => {
        sectionObserver.observe(section);
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
            section.classList.add('visible');
            sectionObserver.unobserve(section);
        }
    });
}

// --- Función para la Carga Diferida del Mapa (Corregida) ---
function setupMapLazyLoad() {
    const mapIframe = document.querySelector('#ubicacion .map iframe');
    if (!mapIframe || !mapIframe.dataset.src) {
        console.warn('Mapa: No se encontró el iframe del mapa con data-src.');
        return;
    }
    
    const mapObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                mapIframe.src = mapIframe.dataset.src;
                observer.unobserve(mapIframe);
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    });

    mapObserver.observe(mapIframe);
}

// --- Lógica Principal al cargar la página ---
document.addEventListener('DOMContentLoaded', function() {
    console.info('Iniciando aplicación...');

    // Ajuste de margin-top dinámico al alto real del header
    if (header && main) {
        requestAnimationFrame(() => {
            main.style.marginTop = header.offsetHeight + "px";
        });
    }

    // Inicializar el aviso de cookies
    setupCookieConsent();
    
    // Inicializar el menú hamburguesa
    setupHamburgerMenu();

    // Inicializar y validar formulario de contacto
    setupContactForm();
    validarFormulario();

    // Inicializar animaciones de sección
    setupSectionAnimations();

    // Botón de volver arriba
    if (backToTopButton) {
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    window.addEventListener('scroll', function() {
        if (backToTopButton) {
            const currentDisplay = backToTopButton.style.display;
            const newDisplay = window.scrollY > 300 ? 'flex' : 'none';
            if (currentDisplay !== newDisplay) {
                requestAnimationFrame(() => {
                    backToTopButton.style.display = newDisplay;
                });
            }
        }
    }, { passive: true });

    // Enlaces del menú con scroll ajustado
    document.querySelectorAll('nav a').forEach(anchor => {
        const href = anchor.getAttribute('href');
        if (href && href.startsWith('#')) {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetSection = document.querySelector(href);
                if (targetSection) {
                    const headerHeight = header ? header.offsetHeight : 0;
                    const additionalOffset = 20;
                    const targetPosition = Math.round(
                        targetSection.getBoundingClientRect().top + window.scrollY - headerHeight - additionalOffset
                    );
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                }
                if (menuToggle && getComputedStyle(menuToggle).display !== 'none' && navList && navList.classList.contains('show')) {
                    menuToggle.click();
                }
            });
        }
    });
    
    // Carga diferida de reCAPTCHA
    const contactSection = document.getElementById('contacto');
    if (contactSection) {
        const recaptchaObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    loadRecaptchaScript();
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -100px 0px' });
        recaptchaObserver.observe(contactSection);

        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('focusin', loadRecaptchaScript, { once: true });
        }
    }

    // Botón de descarga de software
    const downloadBtn = document.querySelector('.download-button');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function (event) {
            event.preventDefault();
            const link = document.createElement('a');
            link.href = '/descargas/Soporte%20Infus.exe';
            link.download = 'Soporte_Infus.exe';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            alert('El software ha sido descargado. Para ejecutarlo, busque el archivo "Soporte_Infus.exe" en su carpeta de descargas y haga doble clic para abrirlo.');
        });
    }
    
    // Carga diferida del mapa
    setupMapLazyLoad();
});

// Nota: La carga de gtag.js a través de JS no es necesaria si ya está en el HTML.
// Esto evita llamadas redundantes.
// La comprobación del modo oscuro es un buen extra.
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (event.matches) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
});