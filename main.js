document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });

            // Close mobile menu if open
            const menuToggle = document.getElementById('menu-toggle');
            const mainNavigation = document.getElementById('main-navigation');
            if (menuToggle && mainNavigation && mainNavigation.classList.contains('show')) {
                mainNavigation.classList.remove('show');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.querySelector('.fas').classList.remove('fa-times');
                menuToggle.querySelector('.fas').classList.add('fa-bars');
            }
        });
    });

    // Back to top button functionality
    const backToTopButton = document.getElementById('backToTop');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            // Asegurarse de que no haya lecturas de estilo forzadas antes de la escritura
            // window.scrollY es una lectura, pero no fuerza un layout si no es de un elemento DOM modificado.
            if (window.scrollY > 300) {
                backToTopButton.style.display = 'flex';
            } else {
                backToTopButton.style.display = 'none';
            }
        });

        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Cookie Consent
    const cookieConsent = document.getElementById('cookieConsent');
    const acceptCookiesButton = document.querySelector('.accept-cookies');
    const rejectCookiesButton = document.querySelector('.reject-cookies');

    // Check if consent has been given previously
    if (!localStorage.getItem('cookieConsent')) {
        cookieConsent.style.display = 'block';
        // Usar requestAnimationFrame para asegurar que la actualización de aria-hidden se haga después del layout
        requestAnimationFrame(() => {
            cookieConsent.setAttribute('aria-hidden', 'false');
        });
    }

    acceptCookiesButton.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'accepted');
        cookieConsent.setAttribute('aria-hidden', 'true');
        cookieConsent.style.display = 'none';
    });

    rejectCookiesButton.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'rejected');
        cookieConsent.setAttribute('aria-hidden', 'true');
        cookieConsent.style.display = 'none';
    });

    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const mainNavigation = document.getElementById('main-navigation');

    if (menuToggle && mainNavigation) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            mainNavigation.classList.toggle('show');

            // Toggle icon
            const icon = menuToggle.querySelector('.fas');
            if (icon) {
                if (mainNavigation.classList.contains('show')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }

    // Contact Form ReCaptcha
    let recaptchaValidated = false;

    window.recaptchaCallback = function() {
        recaptchaValidated = true;
        document.getElementById('btnEnviar').disabled = false;
        document.getElementById('formStatus').textContent = '';
    };

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            if (!recaptchaValidated) {
                event.preventDefault();
                document.getElementById('formStatus').textContent = 'Por favor, completa el reCAPTCHA.';
                document.getElementById('formStatus').style.color = 'red';
                return false;
            }

            // Client-side validation for GDPR
            const gdprCheckbox = document.getElementById('gdpr');
            if (!gdprCheckbox.checked) {
                event.preventDefault();
                document.getElementById('formStatus').textContent = 'Debes aceptar la política de protección de datos.';
                document.getElementById('formStatus').style.color = 'red';
                return false;
            }

            // All good, form will submit via Formspree
            document.getElementById('formStatus').textContent = 'Enviando...';
            document.getElementById('formStatus').style.color = 'blue';
            document.getElementById('btnEnviar').disabled = true; // Disable button after submission attempt
        });
    }

    // Intersection Observer for section animations
    const sections = document.querySelectorAll('.section-animate');
    const options = {
        root: null, // Use the viewport as the root
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of the item is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Línea 236: Asegurarse de que no haya lecturas de layout justo antes de añadir la clase 'visible'.
                // La clase 'visible' (con opacity/transform) en sí misma no debería forzar un layout inmediatamente
                // a menos que haya una lectura de layout justo después en el mismo frame.
                entry.target.classList.add('visible');
                // observer.unobserve(entry.target); // Uncomment if you want the animation to run only once
            } else {
                // Optional: remove 'visible' class if you want animation to reset when out of view
                // entry.target.classList.remove('visible');
            }
        });
    }, options);

    sections.forEach(section => {
        observer.observe(section);
    });

    // Auto-hide cookie notice on scroll after a delay (if not accepted/rejected)
    let autoHideTimeout;
    if (!localStorage.getItem('cookieConsent')) {
        autoHideTimeout = setTimeout(() => {
            window.addEventListener('scroll', function handleScroll() {
                // Check if the user has scrolled significantly
                if (window.scrollY > 100) { // Arbitrary scroll threshold
                    // Línea 246: Asegurarse de que no haya lecturas de layout justo antes de cambiar 'display'.
                    // window.scrollY no es una lectura del DOM que modificaste, por lo que no es el problema directo.
                    // El reprocesamiento puede ocurrir si algo más lee el layout de cookieConsent justo después.
                    cookieConsent.style.display = 'none';
                    cookieConsent.setAttribute('aria-hidden', 'true');
                    window.removeEventListener('scroll', handleScroll); // Remove listener after hiding
                }
            });
        }, 5000); // Wait 5 seconds before checking for scroll
    } else {
        cookieConsent.style.display = 'none';
        cookieConsent.setAttribute('aria-hidden', 'true');
    }

});