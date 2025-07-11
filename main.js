// Fecha de última actualización: 2025-07-10 12:07:07
// Autor: montesas

// --- Variables globales y utilidades generales ---
const header = document.querySelector('header');
const backToTopButton = document.getElementById('backToTop');
const sections = document.querySelectorAll('.section-animate');

// Debug inicial
console.log('Elementos con clase section-animate encontrados:', sections.length);

// Asegurar que la página siempre cargue al principio
// Es mejor manejar el scroll al inicio una vez en DOMContentLoaded para evitar posibles flashes.
// history.scrollRestoration = 'manual' y window.onbeforeunload pueden ser problemáticos
// y a menudo no son la mejor experiencia de usuario.
// El scroll al inicio ya está en DOMContentLoaded.

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

        // Asegurar que el focus se mueve al primer elemento de la lista si el menú se abre
        if (!expanded) {
            navList.querySelector('a')?.focus();
        } else {
            // Si el menú se cierra, devolver el foco al botón del menú
            menuToggle.focus();
        }
    });

    // Cerrar el menú con ESC y mejorar el foco en móviles
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
            menuToggle.click(); // Simula un click para cerrar
        }
    });
}

// --- Funciones para la Gestión de Cookies ---
// Se recomienda manejar los event listeners de los botones de cookies aquí en JavaScript
// en lugar de usar `onclick` en el HTML, para una mejor separación de preocupaciones y rendimiento.
function setupCookieConsent() {
    const cookieNotice = document.getElementById('cookieConsent');
    if (!cookieNotice) {
        console.warn('No se encontró el elemento #cookieConsent.');
        return;
    }

    const acceptBtn = cookieNotice.querySelector('.accept-cookies'); // Asume que tienes un botón con esta clase
    const rejectBtn = cookieNotice.querySelector('.reject-cookies'); // Asume que tienes un botón con esta clase

    // Mostrar u ocultar el aviso según el localStorage
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
        cookieNotice.style.display = 'block';
        cookieNotice.setAttribute('aria-hidden', 'false');
    } else {
        cookieNotice.style.display = 'none';
        cookieNotice.setAttribute('aria-hidden', 'true');
    }

    // Añadir event listeners si los botones existen
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
            // Aquí podrías añadir lógica para bloquear scripts si se rechazan las cookies
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

    // Comprobar que todos los elementos existan antes de continuar
    if (!nombreInput || !emailInput || !mensajeInput || !gdprCheckbox || !enviarBtn) {
        console.warn('Uno o más elementos del formulario de contacto no se encontraron para validarFormulario.');
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
// Es crucial que esta función esté disponible globalmente si reCAPTCHA la llama directamente.
window.recaptchaCallback = validarFormulario;

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
        // Retrasar el reseteo del botón y reCAPTCHA un poco
        // para asegurar que el DOM se ha reseteado
        setTimeout(() => {
            btnEnviar.disabled = true;
            if (typeof grecaptcha !== 'undefined' && grecaptcha.reset) {
                grecaptcha.reset();
            }
        }, 0);
    });

    // Envío del formulario
    contactForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const status = document.getElementById("formStatus");
        if (!status) {
            console.error('Elemento formStatus no encontrado.');
            return;
        }
        status.textContent = ""; // Limpiar mensaje de estado previo

        // Deshabilitar botón para evitar múltiples envíos
        btnEnviar.disabled = true;
        btnEnviar.textContent = 'Enviando...'; // Opcional: mostrar un estado de carga

        // Verifica que el captcha esté resuelto
        const recaptchaResponse = typeof grecaptcha !== "undefined" && grecaptcha.getResponse ? grecaptcha.getResponse() : null;
        if (!recaptchaResponse) {
            status.textContent = "Por favor, marque que no es un robot.";
            status.style.color = "red";
            btnEnviar.disabled = false; // Habilitar botón de nuevo
            btnEnviar.textContent = 'Enviar Mensaje'; // Restaurar texto original
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
                // El botón ya está deshabilitado por el reset, pero lo aseguramos
                btnEnviar.disabled = true;
            } else {
                // Si la respuesta no es OK pero aún viene de Formspree (ej. errores de validación)
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
            // Asegúrate de restaurar el texto del botón en cualquier caso
            btnEnviar.textContent = 'Enviar Mensaje';
            // Validar formulario de nuevo para ajustar el estado del botón si es necesario (ej. si el envío falla)
            validarFormulario();
        }
    });
}


// --- FUSIÓN PRINCIPAL DE INICIALIZACIONES (DOMContentLoaded) ---
document.addEventListener('DOMContentLoaded', function() {
    console.info('Iniciando aplicación...');

    // 1. Forzar scroll al inicio (más fiable aquí)
    window.scrollTo(0, 0);

    // 2. Mostrar el aviso de cookies e inicializar botones (ahora con listeners en JS)
    setupCookieConsent();

    // 3. Activar animaciones de las secciones visibles inicialmente (se mantiene)
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        // Umbral ligeramente ajustado para mayor visibilidad
        if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
            section.classList.add('visible');
        }
    });

    // 4. Comprobar modo oscuro (si lo usas - se mantiene)
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
    }

    // 5. Ajuste de margin-top dinámico al alto real del header (se mantiene)
    if(header) {
        const main = document.querySelector('main');
        if(main) main.style.marginTop = header.offsetHeight + "px";
    }

    // 6. Back to Top (botón - se mantiene)
    if (backToTopButton) {
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 7. Scroll + mostrar botón Back to Top + animaciones de sección
    // Se ha eliminado la variable isScrollingTimer ya que no se estaba usando.
    window.addEventListener('scroll', function() {
        if (backToTopButton) {
            // Solo actualiza la visibilidad si el estado cambia para evitar re-pintados innecesarios
            const currentDisplay = backToTopButton.style.display;
            const newDisplay = window.scrollY > 300 ? 'flex' : 'none';
            if (currentDisplay !== newDisplay) {
                backToTopButton.style.display = newDisplay;
            }
        }

        // Optimización: Usar IntersectionObserver para animaciones de sección si hay muchas
        // Para unas pocas, el bucle forEach está bien, pero para muchas puede ser costoso.
        // Como ya tienes un IntersectionObserver para imágenes, podrías considerar
        // usar uno también para las secciones si el rendimiento se ve afectado.
        sections.forEach(section => {
            if (!section.classList.contains('visible')) { // Solo procesar si no es visible ya
                const rect = section.getBoundingClientRect();
                if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
                    section.classList.add('visible');
                }
            }
        });
    }, { passive: true }); // Usar { passive: true } para mejorar el rendimiento del scroll

    // 8. Enlaces del menú con scroll ajustado y cierre menú hamburguesa (ligeros ajustes)
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

                    // Actualiza el hash de la URL sin recargar la página
                    // Se usa `location.hash = href;` que es más directo para los hash
                    // y el `scrollRestoration = 'manual'` ya lo gestiona.
                    // Para `pushState`, la URL completa sería mejor `history.pushState(null, '', location.pathname + href);`
                    // pero para un simple hash, `location.hash` es suficiente.
                    location.hash = href;
                }
            }
            // Cierre menú hamburguesa si está activo (solo para pantallas pequeñas)
            const menuToggle = document.getElementById('menu-toggle');
            const navList = document.querySelector('#main-navigation ul');
            // Comprueba si el toggle es visible (modo móvil) y el menú está abierto
            if (menuToggle && getComputedStyle(menuToggle).display !== 'none' && navList && navList.classList.contains('show')) {
                menuToggle.click(); // Simula un click para cerrar el menú y actualizar aria-expanded
            }
        });
    });

    // 9. Inicializar el menú hamburguesa
    setupHamburgerMenu();

    // 10. Inicializar y validar formulario de contacto
    setupContactForm();
    // Llamar validarFormulario() una vez al inicio para establecer el estado inicial del botón
    validarFormulario();

    // 11. Botón de descarga de software (se mantiene)
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

    // 12. Lazy loading para imágenes .lazy (se mantiene y mejora levemente)
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const imgSrc = img.dataset.src; // Preferir data-src para lazy loading
                if (imgSrc) {
                    img.src = imgSrc;
                    img.removeAttribute('data-src'); // Limpiar data-src una vez cargada
                }
                img.classList.remove('lazy'); // Asegurarse de quitar la clase
                observer.unobserve(img);
            }
        });
    }, { rootMargin: '0px 0px 50px 0px' }); // Opcional: Cargar 50px antes de entrar en el viewport
    document.querySelectorAll('img.lazy').forEach(img => {
        imageObserver.observe(img);
    });
});

// Manejo de la visibilidad de la página (fuera de DOMContentLoaded)
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        document.title = '¡Vuelve pronto! - Tu Servicio Técnico';
    } else {
        document.title = 'Infus - Servicio Técnico Informático en A Coruña';
    }
});