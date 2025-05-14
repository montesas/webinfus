// Fecha de última actualización: 2025-05-08 07:38:11
// Autor: montesas

// Variables globales
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

// Función para manejar el scroll
window.addEventListener('scroll', function() {
    // Limpiar el timeout anterior
    clearTimeout(isScrolling);

    // Mostrar/ocultar botón back to top
    if (window.scrollY > 300) {
        backToTopButton.style.display = 'flex';
    } else {
        backToTopButton.style.display = 'none';
    }

    // Animación de secciones al hacer scroll
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        console.log('Posición de sección:', rect.top, 'Viewport:', window.innerHeight * 0.75);
        if (rect.top < window.innerHeight * 0.75 && rect.bottom > 0) {
            section.classList.add('visible');
            console.log('Sección visible añadida');
        }
    });

    // Establecer un timeout
    isScrolling = setTimeout(function() {
        // Se ha terminado el scroll
    }, 66);
});

// Botón Back to Top
backToTopButton.addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Gestión de Modales
function showModal(type) {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modalContent');
    const content = {
        cookies: `
            <h2>Política de Cookies</h2>
            <div class="modal-text">
                <p>Este sitio web utiliza cookies para mejorar su experiencia. Las cookies utilizadas son:</p>
                <ul>
                    <li>Cookies técnicas: Necesarias para el funcionamiento del sitio</li>
                    <li>Cookies analíticas: Para análisis de uso y tráfico web</li>
                    <li>Cookies de preferencias: Guardan sus preferencias de navegación</li>
                </ul>
                <p>Tipos de cookies según su finalidad:</p>
                <ul>
                    <li><strong>Cookies técnicas:</strong> Son aquellas que permiten al usuario la navegación a través de una página web, plataforma o aplicación y la utilización de las diferentes opciones o servicios que en ella existan.</li>
                    <li><strong>Cookies analíticas:</strong> Son aquellas que permiten al responsable de las mismas el seguimiento y análisis del comportamiento de los usuarios de los sitios web a los que están vinculadas.</li>
                    <li><strong>Cookies de preferencias:</strong> Son aquellas que permiten recordar información para que el usuario acceda al servicio con determinadas características que pueden diferenciar su experiencia de la de otros usuarios.</li>
                </ul>
                <p>Puede configurar su navegador para rechazar el uso de cookies, pero esto podría afectar a la funcionalidad del sitio web.</p>
            </div>
        `,
        privacy: `
            <h2>Política de Privacidad</h2>
            <div class="modal-text">
                <p>Su privacidad es importante para nosotros. Esta política explica cómo recopilamos y tratamos sus datos personales.</p>
                <h3>Datos que recopilamos</h3>
                <ul>
                    <li>Información de contacto (nombre, email, teléfono)</li>
                    <li>Datos de uso del sitio web</li>
                    <li>Información del dispositivo</li>
                </ul>
                <h3>Uso de sus datos</h3>
                <p>Utilizamos sus datos para:</p>
                <ul>
                    <li>Proporcionar y mejorar nuestros servicios</li>
                    <li>Comunicarnos con usted</li>
                    <li>Cumplir con obligaciones legales</li>
                </ul>
                <h3>Sus derechos</h3>
                <p>Tiene derecho a:</p>
                <ul>
                    <li>Acceder a sus datos</li>
                    <li>Rectificar sus datos</li>
                    <li>Suprimir sus datos</li>
                    <li>Oponerse al tratamiento</li>
                </ul>
            </div>
        `,
        terms: `
            <h2>Términos y Condiciones</h2>
            <div class="modal-text">
                <p>Al utilizar nuestro sitio web, acepta estos términos y condiciones en su totalidad.</p>
                <h3>Uso del sitio</h3>
                <ul>
                    <li>El contenido es solo para información general</li>
                    <li>No garantizamos la precisión del contenido</li>
                    <li>El uso del sitio es bajo su propio riesgo</li>
                </ul>
                <h3>Propiedad intelectual</h3>
                <p>Todo el contenido del sitio está protegido por derechos de autor.</p>
                <h3>Limitación de responsabilidad</h3>
                <p>No seremos responsables de ningún daño derivado del uso del sitio.</p>
                <h3>Modificaciones</h3>
                <p>Nos reservamos el derecho de modificar estos términos en cualquier momento.</p>
            </div>
        `
    };

    modalContent.innerHTML = content[type];
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Cerrar modal
document.querySelector('.close').addEventListener('click', function() {
    document.getElementById('modal').style.display = 'none';
    document.body.style.overflow = 'auto';
});

// Cerrar modal al hacer clic fuera
window.addEventListener('click', function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Gestión de Cookies
function showCookieConsent() {
    const cookieNotice = document.querySelector('.cookie-notice');
    if (!cookieNotice) {
        console.error('No se encontró el elemento .cookie-notice');
        return;
    }

    // Comprobar si ya se aceptaron o rechazaron las cookies
    const cookieConsent = localStorage.getItem('cookieConsent');
    
    if (!cookieConsent) {
        // Solo mostrar si no hay decisión previa
        cookieNotice.style.display = 'block';
        console.log('Mostrando aviso de cookies - no hay decisión previa');
    } else {
        // Ocultar si ya hay una decisión
        cookieNotice.style.display = 'none';
        console.log('Ocultando aviso de cookies - decisión previa:', cookieConsent);
    }
}

function acceptCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    document.querySelector('.cookie-notice').style.display = 'none';
    console.log('Cookies aceptadas');
}

function rejectCookies() {
    localStorage.setItem('cookieConsent', 'rejected');
    document.querySelector('.cookie-notice').style.display = 'none';
    console.log('Cookies rechazadas');
}

// Gestión de enlaces del footer para modales
document.addEventListener('DOMContentLoaded', function() {
    // Seleccionar todos los enlaces que abren modales en el footer
    const legalLinks = document.querySelectorAll('footer a[data-modal]');
    
    legalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Prevenir el comportamiento predeterminado del enlace
            e.preventDefault();
            
            // Obtener el tipo de modal a mostrar desde el atributo data-modal
            const modalType = this.getAttribute('data-modal');
            if (modalType) {
                showModal(modalType);
            }
        });
    });

    // Configurar el botón "más información" en el aviso de cookies
    const moreInfoButton = document.querySelector('.cookie-notice .more-info');
    if (moreInfoButton) {
        moreInfoButton.addEventListener('click', function(e) {
            e.preventDefault();
            showModal('cookies');
        });
    }
    
    // Mostrar el aviso de cookies
    console.log('DOM cargado, mostrando aviso de cookies...');
    showCookieConsent();
});

// Formulario de contacto
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validación del formulario
        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        const mensaje = document.getElementById('mensaje').value;
        const acepta = document.getElementById('acepta').checked;
        
        if (!nombre || !email || !mensaje || !acepta) {
            alert('Por favor, rellene todos los campos y acepte la política de privacidad.');
            return;
        }
        
        if (!validateEmail(email)) {
            alert('Por favor, introduzca un email válido.');
            return;
        }
        
        // Aquí iría el código para enviar el formulario
        alert('Mensaje enviado correctamente. Nos pondremos en contacto con usted lo antes posible.');
        this.reset();
    });
}

// Función para validar email
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// Animación suave para los enlaces del menú
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Gestión de la navegación responsive
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('nav');

if (menuToggle) {
    menuToggle.addEventListener('click', function() {
        nav.classList.toggle('active');
        this.classList.toggle('active');
    });
}

// Cierra el menú móvil al hacer clic en un enlace
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function() {
        if (menuToggle && menuToggle.classList.contains('active')) {
            nav.classList.remove('active');
            menuToggle.classList.remove('active');
        }
    });
});

// Observer para lazy loading de imágenes
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

// Aplicar lazy loading a las imágenes
document.querySelectorAll('img.lazy').forEach(img => {
    imageObserver.observe(img);
});

// Manejo de la visibilidad de la página
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        document.title = '¡Vuelve pronto! - Tu Servicio Técnico';
    } else {
        document.title = 'Tu Servicio Técnico - Reparación de Dispositivos';
    }
});

// Inicialización cuando el DOM está cargado
document.addEventListener('DOMContentLoaded', function() {
    console.log('Iniciando aplicación...');
    
    // Forzar scroll al inicio
    window.scrollTo(0, 0);
    
    // Mostrar el aviso de cookies
    showCookieConsent();
    
    // Activar animaciones de las secciones visibles inicialmente
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.75 && rect.bottom > 0) {
            section.classList.add('visible');
            console.log('Sección visible añadida en la inicialización');
        }
    });
    
    // Comprobar modo oscuro
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
    }
});
