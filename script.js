// ============================
// NAVBAR SCROLL
// ============================
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ============================
// BURGER MENU
// ============================
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ============================
// TOGGLE WEEKLY / MONTHLY
// ============================
const togglePlan = document.getElementById('togglePlan');
const weeklyPrices = document.querySelectorAll('.price.weekly');
const monthlyPrices = document.querySelectorAll('.price.monthly');

togglePlan.addEventListener('change', () => {
  const isMonthly = togglePlan.checked;
  weeklyPrices.forEach(p => p.classList.toggle('hidden', isMonthly));
  monthlyPrices.forEach(p => p.classList.toggle('hidden', !isMonthly));
});

// ============================
// SCROLL ANIMATIONS (AOS-like)
// ============================
const aosElements = document.querySelectorAll('[data-aos]');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('aos-visible');
    }
  });
}, { threshold: 0.12 });

aosElements.forEach(el => observer.observe(el));

// ============================
// CONTACT FORM → API
// ============================
const contactForm = document.getElementById('contactForm');
const toast = document.createElement('div');
toast.className = 'toast';
document.body.appendChild(toast);

function showToast(msg, isError = false) {
  toast.textContent = msg;
  toast.style.background = isError ? '#c62828' : '#2E7D32';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 5000);
}

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const btn = contactForm.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Envoi en cours…';

  const data = {
    prenom:        document.getElementById('f-prenom').value.trim(),
    email:         document.getElementById('f-email').value.trim(),
    formule:       document.getElementById('f-formule').value,
    jourLivraison: document.getElementById('f-jour').value,
    message:       document.getElementById('f-message').value.trim(),
  };

  try {
    const res  = await fetch('/api/commande', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    });
    const json = await res.json();

    if (json.success) {
      showToast('✅ Commande reçue ! On te confirme sous 24h. 💚');
      contactForm.reset();
    } else {
      showToast('❌ ' + (json.error || 'Une erreur est survenue.'), true);
    }
  } catch (err) {
    showToast('❌ Impossible de joindre le serveur. Réessaie plus tard.', true);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Envoyer ma commande 🚀';
  }
});

// ============================
// SMOOTH SCROLL (extra safety)
// ============================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ============================
// COUNTER ANIMATION
// ============================
function animateCounter(el, target, suffix = '') {
  let current = 0;
  const step = Math.ceil(target / 60);
  const interval = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(interval);
    }
    el.textContent = current + suffix;
  }, 25);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const nums = entry.target.querySelectorAll('.stat-num');
      nums.forEach(num => {
        const text = num.textContent;
        if (text.includes('500')) animateCounter(num, 500, '+');
        else if (text.includes('100')) animateCounter(num, 100, '%');
        else if (text.includes('48')) animateCounter(num, 48, 'h');
      });
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) counterObserver.observe(heroStats);
