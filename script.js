// ============================
// LANGUAGE SYSTEM
// ============================
let currentLang = 'fr';

function applyLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;

  // Swap text content
  document.querySelectorAll('[data-fr][data-en]').forEach(el => {
    const val = el.dataset[lang];
    if (val !== undefined) el.textContent = val;
  });

  // Swap placeholders
  document.querySelectorAll('[data-placeholder-fr][data-placeholder-en]').forEach(el => {
    el.placeholder = el.dataset[`placeholder${lang.charAt(0).toUpperCase() + lang.slice(1)}`] || '';
  });

  // Swap select options
  document.querySelectorAll('select option[data-fr][data-en]').forEach(opt => {
    opt.textContent = opt.dataset[lang] || '';
  });

  // Update lang buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    applyLanguage(btn.dataset.lang);
    // Refresh meal selection text in new language
    if (typeof updateSelectionUI === 'function') updateSelectionUI();
  });
});

// ============================
// NAVBAR SCROLL + FLOATING
// ============================
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ============================
// BURGER / MOBILE MENU
// ============================
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileClose');

function openMenu() {
  mobileMenu.classList.add('open');
  mobileMenu.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  // Animate burger lines to X
  const spans = burger.querySelectorAll('span');
  spans[0].style.transform = 'translateY(6px) rotate(45deg)';
  spans[1].style.transform = 'translateY(-0.5px) rotate(-45deg)';
}

function closeMenu() {
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  const spans = burger.querySelectorAll('span');
  spans[0].style.transform = '';
  spans[1].style.transform = '';
}

burger.addEventListener('click', openMenu);
mobileClose.addEventListener('click', closeMenu);
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});

// ============================
// WEEKLY / MONTHLY TOGGLE
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
// SCROLL REVEAL
// ============================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ============================
// COUNTER ANIMATION
// ============================
function animateCounter(el, target, suffix) {
  const duration = 1400;
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stat-num').forEach(num => {
          const target = parseInt(num.dataset.target);
          const suffix = num.dataset.suffix || '';
          if (!isNaN(target)) animateCounter(num, target, suffix);
        });
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counterObserver.observe(heroStats);
}

// ============================
// MENU TABS
// ============================
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const target = btn.dataset.tab;
    document.querySelectorAll('.menu-panel').forEach(panel => {
      panel.classList.toggle('hidden', panel.id !== `tab-${target}`);
    });
  });
});

// ============================
// MEAL SELECTION
// ============================
const selectedItems = new Set(); // stores DOM elements

const selectionBar   = document.getElementById('selectionBar');
const selectionCount = document.getElementById('selectionCount');
const selectionPlan  = document.getElementById('selectionPlan');
const selectionClear = document.getElementById('selectionClear');

const PLAN_MAP = [
  { max: 5,  valueFr: 'Starter Box – 70 $ CAD/sem',      valueEn: 'Starter Box – $70 CAD/wk',       labelFr: 'Starter Box (5 repas/sem)',      labelEn: 'Starter Box (5 meals/wk)' },
  { max: 10, valueFr: 'Balance Box – 130 $ CAD/sem',     valueEn: 'Balance Box – $130 CAD/wk',      labelFr: 'Balance Box (10 repas/sem)',     labelEn: 'Balance Box (10 meals/wk)' },
  { max: 15, valueFr: 'Premium Box – 187.50 $ CAD/sem',  valueEn: 'Premium Box – $187.50 CAD/wk',   labelFr: 'Premium Box (15 repas/sem)',     labelEn: 'Premium Box (15 meals/wk)' },
];

function getMealName(el) {
  const span = el.querySelector('span[data-fr]');
  if (!span) return el.textContent.trim();
  return span.dataset[currentLang] || span.dataset.fr || span.textContent.trim();
}

function getPlanForCount(count) {
  return PLAN_MAP.find(p => count <= p.max) || PLAN_MAP[PLAN_MAP.length - 1];
}

function updateSelectionUI() {
  const dishes = selectedItems.size;
  const portions = dishes * 4;

  selectionCount.textContent = portions;

  // Animate the badge
  selectionCount.style.transform = 'scale(1.3)';
  setTimeout(() => selectionCount.style.transform = '', 200);

  // Show/hide bar
  selectionBar.classList.toggle('visible', dishes > 0);

  if (dishes === 0) {
    document.getElementById('f-message').value = '';
    document.getElementById('f-formule').value = '';
    selectionPlan.textContent = '';
    return;
  }

  // Determine plan based on total portions
  const plan = getPlanForCount(portions);

  // Update plan select
  document.getElementById('f-formule').value = plan.valueFr;

  // Update plan label in bar
  const planLabel = currentLang === 'fr' ? plan.labelFr : plan.labelEn;
  selectionPlan.textContent = `→ ${planLabel}`;

  // Build textarea content
  const names = Array.from(selectedItems).map(el => `• ${getMealName(el)}`).join('\n');
  const header = currentLang === 'fr'
    ? `${dishes} plat${dishes > 1 ? 's' : ''} sélectionné${dishes > 1 ? 's' : ''} (${portions} repas au total, 4 pers./plat) :\n`
    : `${dishes} dish${dishes > 1 ? 'es' : ''} selected (${portions} meals total, 4 people/dish):\n`;
  document.getElementById('f-message').value = header + names;
}

document.querySelectorAll('.menu-item').forEach(item => {
  item.addEventListener('click', () => {
    if (selectedItems.has(item)) {
      selectedItems.delete(item);
      item.classList.remove('selected');
    } else {
      selectedItems.add(item);
      item.classList.add('selected');
    }
    updateSelectionUI();
  });
});

selectionClear.addEventListener('click', () => {
  selectedItems.forEach(el => el.classList.remove('selected'));
  selectedItems.clear();
  updateSelectionUI();
});


// ============================
// SMOOTH SCROLL
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
// CONTACT FORM → API
// ============================
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');

const toast = document.createElement('div');
toast.className = 'toast';
document.body.appendChild(toast);

let toastTimer;
function showToast(msg, isError = false) {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.className = 'toast' + (isError ? ' error' : '');
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 5000);
}

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  const submitSpan = submitBtn.querySelector('span[data-fr]');
  if (submitSpan) {
    submitSpan.dataset.fr = 'Envoi en cours…';
    submitSpan.dataset.en = 'Sending…';
    submitSpan.textContent = currentLang === 'fr' ? 'Envoi en cours…' : 'Sending…';
  }

  const data = {
    prenom:        document.getElementById('f-prenom').value.trim(),
    email:         document.getElementById('f-email').value.trim(),
    formule:       document.getElementById('f-formule').value,
    jourLivraison: document.getElementById('f-jour').value,
    message:       document.getElementById('f-message').value.trim(),
  };

  try {
    const res = await fetch('/api/commande', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      showToast(currentLang === 'fr'
        ? '✓ Commande reçue — on te confirme sous 24h'
        : '✓ Order received — we\'ll confirm within 24h');
      contactForm.reset();
    } else {
      showToast((json.error || (currentLang === 'fr' ? 'Une erreur est survenue.' : 'An error occurred.')), true);
    }
  } catch {
    showToast(currentLang === 'fr'
      ? 'Impossible de joindre le serveur. Réessaie plus tard.'
      : 'Could not reach the server. Please try again later.', true);
  } finally {
    submitBtn.disabled = false;
    if (submitSpan) {
      submitSpan.dataset.fr = 'Envoyer ma commande';
      submitSpan.dataset.en = 'Send my order';
      submitSpan.textContent = currentLang === 'fr' ? 'Envoyer ma commande' : 'Send my order';
    }
  }
});
