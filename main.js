// Fecha de última actualización: 2025-07-25 18:00:00
// Autor: montesas

// --- Variables globales y utilidades generales ---
const header = document.querySelector('header');
const backToTopButton = document.getElementById('backToTop');
const sections = document.querySelectorAll('.section-animate');

// Debug inicial
console.log('Elementos con clase section-animate encontrados:', sections.length);

// --- Funciones para el Menú Hamburguesa ---
function setupHamburgerMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const navList = document.querySelector('#main-navigation ul');

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

// --- Funciones para la Gestión de Cookies ---
function setupCookieConsent() {
    const cookieNotice = document.getElementById('cookieConsent');
    if (!cookieNotice) {
        console.warn('No se encontró el elemento #cookieConsent.');
        return;
    }

    const acceptBtn = cookieNotice.querySelector('.accept-cookies');
    const rejectBtn = cookieNotice.querySelector('.reject-cookies');
    const moreInfoBtn = cookieNotice.querySelector('.more-info');

    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
        cookieNotice.style.display = 'block';
        cookieNotice.setAttribute('aria-hidden', 'false');
    } else {
        cookieNotice.style.display = 'none';
        cookieNotice.setAttribute('aria-hidden', 'true');
    }

    if (acceptBtn) {
        acceptBtn.addEventListener('click', function() {
            localStorage.setItem('cookieConsent', 'accepted');
            cookieNotice.style.display = 'none';
            cookieNotice.setAttribute('aria-hidden', 'true');
            console.info('Cookies aceptadas.');
        });
    }

    if (rejectBtn) {
        rejectBtn.addEventListener('click', function() {
            localStorage.setItem('cookieConsent', 'rejected');
            cookieNotice.style.display = 'none';
            cookieNotice.setAttribute('aria-hidden', 'true');
            console.info('Cookies rechazadas.');
        });
    }

    if (moreInfoBtn) {
        moreInfoBtn.addEventListener('click', function() {
            window.location.href = 'cookies.html';
        });
    }
}

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
    const enviarBtn = document.getElementById('btnEnviar');

    if (!nombreInput || !emailInput || !mensajeInput || !gdprCheckbox || !enviarBtn) {
        console.warn('Uno o más elementos del formulario de contacto no se encontraron para validarFormulario.');
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

// Esta función debe estar disponible globalmente para que reCAPTCHA pueda llamarla.
window.recaptchaCallback = validarFormulario;

function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    const btnEnviar = document.getElementById('btnEnviar');
    const gdprCheckbox = document.getElementById('gdpr');

    if (!contactForm || !btnEnviar || !gdprCheckbox) {
        console.warn('Elementos del formulario de contacto no encontrados para setupContactForm.');
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
                observer.unobserve(entry.target); // Dejar de observar una vez visible
            }
        });
    }, { rootMargin: '0px 0px -100px 0px' }); // Ajusta el rootMargin para que se active antes o después

    sections.forEach(section => {
        // Observa la sección para animar cuando entre en el viewport
        sectionObserver.observe(section);
        // También verifica si ya está visible en la carga inicial
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
            section.classList.add('visible');
            sectionObserver.unobserve(section); // Si ya es visible, deja de observarla
        }
    });
}

// --- Carga Diferida de Scripts de Terceros ---
// Variable para controlar si reCAPTCHA ya se ha cargado
let recaptchaLoaded = false;
// Función para cargar el script de reCAPTCHA
function loadRecaptchaScript() {
    if (recaptchaLoaded) return; // Si ya está cargado, no hacer nada

    const script = document.createElement('script');
    script.src = "https://www.google.com/recaptcha/api.js";
    script.async = true;
    script.defer = true; // Mantener defer para no bloquear el renderizado
    document.head.appendChild(script);
    recaptchaLoaded = true;
    console.log('Script de reCAPTCHA cargado dinámicamente.');
}

// Variable para controlar si gtag.js ya se ha cargado
let gtmLoaded = false;
function loadGtagScript() {
    if (gtmLoaded) return;

    const script = document.createElement('script');
    script.src = "https://www.googletagmanager.com/gtag/js?id=G-15548643";
    script.async = true;
    document.head.appendChild(script);

    // Inicialización de gtag.js una vez que el script se ha añadido
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-15548643');

    gtmLoaded = true;
    console.log('Script de gtag.js cargado dinámicamente.');
}

// --- Nueva Función para la Carga Diferida del Mapa ---
function setupMapLazyLoad() {
    const mapIframe = document.querySelector('#ubicacion .map iframe');

    if (mapIframe && mapIframe.dataset.src) {
        console.log('Mapa: iframe con data-src encontrado. Configurando IntersectionObserver.');
        const mapObserverOptions = {
            root: null, // viewport
            rootMargin: '0px', // Cargar tan pronto como sea visible
            threshold: 0.1 // Cargar cuando el 10% del iframe esté visible
        };

        const mapObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    console.log('Mapa: iframe visible. Cargando src desde data-src.');
                    mapIframe.src = mapIframe.dataset.src;
                    observer.unobserve(mapIframe); // Deja de observar una vez cargado
                }
            });
        }, mapObserverOptions);

        mapObserver.observe(mapIframe);
    } else {
        console.warn('Mapa: No se encontró el iframe del mapa con data-src o data-src está vacío.');
    }
}


// --- FUSIÓN PRINCIPAL DE Inicializaciones (DOMContentLoaded) ---
document.addEventListener('DOMContentLoaded', function() {
    console.info('Iniciando aplicación...');

    // 1. Forzar scroll al inicio
    window.scrollTo(0, 0);

    // 2. Mostrar el aviso de cookies e inicializar botones
    setupCookieConsent();

    // 3. Ajuste de margin-top dinámico al alto real del header
    if (header) {
        const main = document.querySelector('main');
        if (main) {
            requestAnimationFrame(() => {
                main.style.marginTop = header.offsetHeight + "px";
            });
        }
    }

    // 4. Back to Top (botón) - Gestionado en el scroll event, solo se inicializa aquí
    if (backToTopButton) {
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 5. Scroll + mostrar botón Back to Top (solo para el botón, animaciones con Observer)
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

    // 6. Enlaces del menú con scroll ajustado y cierre menú hamburguesa
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
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                }
            }
            const menuToggle = document.getElementById('menu-toggle');
            const navList = document.querySelector('#main-navigation ul');

            if (menuToggle && getComputedStyle(menuToggle).display !== 'none' && navList && navList.classList.contains('show')) {
                menuToggle.click();
            }
        });
    });

    // 7. Inicializar el menú hamburguesa
    setupHamburgerMenu();

    // 8. Inicializar y validar formulario de contacto
    setupContactForm();
    validarFormulario();

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

    // 9. Botón de descarga de software
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
    
    // 10. Inicializar animaciones de sección con IntersectionObserver
    setupSectionAnimations();

    // 11. Lazy loading para imágenes con 'loading="lazy"' en HTML (simplificación si usas el atributo nativo)
    const lazyImages = document.querySelectorAll('img.lazy[data-src]');
    if (lazyImages.length > 0) {
        console.warn('Hay imágenes con la clase .lazy y data-src. Se recomienda usar el atributo loading="lazy" nativo en su lugar.');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const imgSrc = img.dataset.src;
                    if (imgSrc) {
                        img.src = imgSrc;
                        img.removeAttribute('data-src');
                    }
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: '0px 0px 50px 0px' });
        lazyImages.forEach(img => imageObserver.observe(img));
    }

    // 12. **¡NUEVO! Carga diferida del mapa**
    setupMapLazyLoad();

    // Carga diferida de gtag.js
    const delayLoadGtag = setTimeout(loadGtagScript, 5000);

    ['scroll', 'mousemove', 'click', 'keydown', 'touchstart'].forEach(eventType => {
        document.addEventListener(eventType, () => {
            clearTimeout(delayLoadGtag);
            loadGtagScript();
        }, { once: true, passive: true });
    });
});

// Nota: La comprobación del modo oscuro no requiere un listener constante, se hace una vez al cargar.
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (event.matches) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
});