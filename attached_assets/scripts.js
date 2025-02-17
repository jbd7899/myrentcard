// FAQ Toggle functionality
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const item = question.parentElement;
        item.classList.toggle('active');
    });
});

// Mobile menu functionality
const menuToggle = document.querySelector('.menu-toggle');
const navWrapper = document.querySelector('.nav-wrapper');
const body = document.body;

menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navWrapper.classList.toggle('active');
    body.classList.toggle('menu-open');
});

// Close menu when clicking on a link
document.querySelectorAll('.nav-links a, .header-buttons a').forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navWrapper.classList.remove('active');
        body.classList.remove('menu-open');
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navWrapper.contains(e.target) && !menuToggle.contains(e.target) && navWrapper.classList.contains('active')) {
        menuToggle.classList.remove('active');
        navWrapper.classList.remove('active');
        body.classList.remove('menu-open');
    }
});
