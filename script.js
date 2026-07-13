// ============================
// LANGUAGE SYSTEM
// ============================
let currentLang = 'fr';
let currentPersons = 4;

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
    updatePriceDisplay();
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
  updatePriceDisplay();
  if (typeof updateSelectionUI === 'function') updateSelectionUI();
});

// ============================
// PERSONS SELECTOR
// ============================
document.querySelectorAll('.persons-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.persons-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentPersons = parseInt(btn.dataset.persons);
    updatePriceDisplay();
    if (typeof updateSelectionUI === 'function') updateSelectionUI();
  });
});

function updatePriceDisplay() {
  const key = `p${currentPersons}`;
  document.querySelectorAll('.price[data-p1]').forEach(el => {
    const num = el.querySelector('.price-num');
    if (num) num.textContent = el.dataset[key];
  });
  document.querySelectorAll('[data-per1-fr]').forEach(el => {
    const frVal = el.dataset[`per${currentPersons}Fr`];
    const enVal = el.dataset[`per${currentPersons}En`];
    if (frVal) el.dataset.fr = frVal;
    if (enVal) el.dataset.en = enVal;
    el.textContent = currentLang === 'fr' ? frVal : enVal;
  });
}

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

const PLAN_DATA = {
  4: {
    weekly: [
      { maxDishes: 1, valueFr: '1 Plat Familial – 65 $ CAD/sem',   valueEn: '1 Family Dish – $65 CAD/wk',   labelFr: '1 Plat Familial (1 plat/sem)',       labelEn: '1 Family Dish (1 dish/wk)' },
      { maxDishes: 3, valueFr: 'Menu 3 Plats – 144 $ CAD/sem',     valueEn: '3-Dish Menu – $144 CAD/wk',    labelFr: 'Menu 3 Plats (3 plats/sem)',          labelEn: '3-Dish Menu (3 dishes/wk)' },
      { maxDishes: 4, valueFr: 'Menu 4 Plats – 188 $ CAD/sem',     valueEn: '4-Dish Menu – $188 CAD/wk',    labelFr: 'Menu 4 Plats (4 plats/sem)',          labelEn: '4-Dish Menu (4 dishes/wk)' },
      { maxDishes: 5, valueFr: 'Menu 5 Plats – 230 $ CAD/sem',     valueEn: '5-Dish Menu – $230 CAD/wk',    labelFr: 'Menu 5 Plats (5 plats/sem)',          labelEn: '5-Dish Menu (5 dishes/wk)' },
    ],
    monthly: [
      { maxDishes: 1, valueFr: '1 Plat Familial – 247 $ CAD/mois', valueEn: '1 Family Dish – $247 CAD/mo',  labelFr: '1 Plat Familial · 247 $/mois (-5%)', labelEn: '1 Family Dish · $247/mo (-5%)' },
      { maxDishes: 3, valueFr: 'Menu 3 Plats – 547 $ CAD/mois',    valueEn: '3-Dish Menu – $547 CAD/mo',    labelFr: 'Menu 3 Plats · 547 $/mois (-5%)',    labelEn: '3-Dish Menu · $547/mo (-5%)' },
      { maxDishes: 4, valueFr: 'Menu 4 Plats – 714 $ CAD/mois',    valueEn: '4-Dish Menu – $714 CAD/mo',    labelFr: 'Menu 4 Plats · 714 $/mois (-5%)',    labelEn: '4-Dish Menu · $714/mo (-5%)' },
      { maxDishes: 5, valueFr: 'Menu 5 Plats – 874 $ CAD/mois',    valueEn: '5-Dish Menu – $874 CAD/mo',    labelFr: 'Menu 5 Plats · 874 $/mois (-5%)',    labelEn: '5-Dish Menu · $874/mo (-5%)' },
    ],
  },
  2: {
    weekly: [
      { maxDishes: 1, valueFr: '1 Plat – 32,50 $ CAD/sem (2 pers.)',   valueEn: '1 Dish – $32.50 CAD/wk (2 people)',   labelFr: '1 Plat · 32,50 $/sem · 2 pers.',   labelEn: '1 Dish · $32.50/wk · 2 people' },
      { maxDishes: 3, valueFr: 'Menu 3 Plats – 78 $ CAD/sem (2 pers.)', valueEn: '3-Dish Menu – $78 CAD/wk (2 people)', labelFr: 'Menu 3 Plats · 78 $/sem · 2 pers.',  labelEn: '3-Dish Menu · $78/wk · 2 people' },
      { maxDishes: 4, valueFr: 'Menu 4 Plats – 96 $ CAD/sem (2 pers.)', valueEn: '4-Dish Menu – $96 CAD/wk (2 people)', labelFr: 'Menu 4 Plats · 96 $/sem · 2 pers.',  labelEn: '4-Dish Menu · $96/wk · 2 people' },
      { maxDishes: 5, valueFr: 'Menu 5 Plats – 120 $ CAD/sem (2 pers.)', valueEn: '5-Dish Menu – $120 CAD/wk (2 people)', labelFr: 'Menu 5 Plats · 120 $/sem · 2 pers.', labelEn: '5-Dish Menu · $120/wk · 2 people' },
    ],
    monthly: [
      { maxDishes: 1, valueFr: '1 Plat – 124 $ CAD/mois (2 pers.)',   valueEn: '1 Dish – $124 CAD/mo (2 people)',   labelFr: '1 Plat · 124 $/mois (-5%) · 2 pers.',   labelEn: '1 Dish · $124/mo (-5%) · 2 people' },
      { maxDishes: 3, valueFr: 'Menu 3 Plats – 296 $ CAD/mois (2 pers.)', valueEn: '3-Dish Menu – $296 CAD/mo (2 people)', labelFr: 'Menu 3 Plats · 296 $/mois (-5%) · 2 pers.', labelEn: '3-Dish Menu · $296/mo (-5%) · 2 people' },
      { maxDishes: 4, valueFr: 'Menu 4 Plats – 365 $ CAD/mois (2 pers.)', valueEn: '4-Dish Menu – $365 CAD/mo (2 people)', labelFr: 'Menu 4 Plats · 365 $/mois (-5%) · 2 pers.', labelEn: '4-Dish Menu · $365/mo (-5%) · 2 people' },
      { maxDishes: 5, valueFr: 'Menu 5 Plats – 456 $ CAD/mois (2 pers.)', valueEn: '5-Dish Menu – $456 CAD/mo (2 people)', labelFr: 'Menu 5 Plats · 456 $/mois (-5%) · 2 pers.', labelEn: '5-Dish Menu · $456/mo (-5%) · 2 people' },
    ],
  },
  1: {
    weekly: [
      { maxDishes: 1, valueFr: '1 Plat – 16,25 $ CAD/sem (1 pers.)',  valueEn: '1 Dish – $16.25 CAD/wk (1 person)',  labelFr: '1 Plat · 16,25 $/sem · 1 pers.',  labelEn: '1 Dish · $16.25/wk · 1 person' },
      { maxDishes: 3, valueFr: 'Menu 3 Plats – 39 $ CAD/sem (1 pers.)', valueEn: '3-Dish Menu – $39 CAD/wk (1 person)', labelFr: 'Menu 3 Plats · 39 $/sem · 1 pers.',  labelEn: '3-Dish Menu · $39/wk · 1 person' },
      { maxDishes: 4, valueFr: 'Menu 4 Plats – 48 $ CAD/sem (1 pers.)', valueEn: '4-Dish Menu – $48 CAD/wk (1 person)', labelFr: 'Menu 4 Plats · 48 $/sem · 1 pers.',  labelEn: '4-Dish Menu · $48/wk · 1 person' },
      { maxDishes: 5, valueFr: 'Menu 5 Plats – 60 $ CAD/sem (1 pers.)', valueEn: '5-Dish Menu – $60 CAD/wk (1 person)', labelFr: 'Menu 5 Plats · 60 $/sem · 1 pers.', labelEn: '5-Dish Menu · $60/wk · 1 person' },
    ],
    monthly: [
      { maxDishes: 1, valueFr: '1 Plat – 62 $ CAD/mois (1 pers.)',  valueEn: '1 Dish – $62 CAD/mo (1 person)',  labelFr: '1 Plat · 62 $/mois (-5%) · 1 pers.',  labelEn: '1 Dish · $62/mo (-5%) · 1 person' },
      { maxDishes: 3, valueFr: 'Menu 3 Plats – 148 $ CAD/mois (1 pers.)', valueEn: '3-Dish Menu – $148 CAD/mo (1 person)', labelFr: 'Menu 3 Plats · 148 $/mois (-5%) · 1 pers.', labelEn: '3-Dish Menu · $148/mo (-5%) · 1 person' },
      { maxDishes: 4, valueFr: 'Menu 4 Plats – 182 $ CAD/mois (1 pers.)', valueEn: '4-Dish Menu – $182 CAD/mo (1 person)', labelFr: 'Menu 4 Plats · 182 $/mois (-5%) · 1 pers.', labelEn: '4-Dish Menu · $182/mo (-5%) · 1 person' },
      { maxDishes: 5, valueFr: 'Menu 5 Plats – 228 $ CAD/mois (1 pers.)', valueEn: '5-Dish Menu – $228 CAD/mo (1 person)', labelFr: 'Menu 5 Plats · 228 $/mois (-5%) · 1 pers.', labelEn: '5-Dish Menu · $228/mo (-5%) · 1 person' },
    ],
  },
};

function getMealName(el) {
  const span = el.querySelector('span[data-fr]');
  if (!span) return el.textContent.trim();
  return span.dataset[currentLang] || span.dataset.fr || span.textContent.trim();
}

function getPlanForCount(dishes) {
  const period = togglePlan.checked ? 'monthly' : 'weekly';
  const map = PLAN_DATA[currentPersons][period];
  return map.find(p => dishes <= p.maxDishes) || map[map.length - 1];
}

function updateSelectionUI() {
  const dishes = selectedItems.size;
  const portions = dishes * currentPersons;

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

  // Determine plan based on dish count
  const plan = getPlanForCount(dishes);

  // Update plan select
  document.getElementById('f-formule').value = plan.valueFr;

  // Update plan label in bar
  const planLabel = currentLang === 'fr' ? plan.labelFr : plan.labelEn;
  selectionPlan.textContent = `→ ${planLabel}`;

  // Build textarea content
  const isMonthly = togglePlan.checked;
  const names = Array.from(selectedItems).map(el => `• ${getMealName(el)}`).join('\n');
  const subscriptionNote = isMonthly
    ? (currentLang === 'fr' ? ' — Abonnement mensuel (-5%)' : ' — Monthly subscription (-5%)')
    : '';
  const header = currentLang === 'fr'
    ? `${dishes} plat${dishes > 1 ? 's' : ''} sélectionné${dishes > 1 ? 's' : ''} (${portions} repas au total, ${currentPersons} pers./plat)${subscriptionNote} :\n`
    : `${dishes} dish${dishes > 1 ? 'es' : ''} selected (${portions} meals total, ${currentPersons} people/dish)${subscriptionNote}:\n`;
  document.getElementById('f-message').value = header + names;
}

// Inject dish preview images
document.querySelectorAll('.menu-item[data-img]').forEach(item => {
  const preview = document.createElement('div');
  preview.className = 'dish-preview';
  const img = document.createElement('img');
  img.src = item.dataset.img;
  img.alt = item.querySelector('span[data-fr]')?.dataset.fr || '';
  img.loading = 'lazy';
  img.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!selectedItems.has(item)) {
      selectedItems.add(item);
      item.classList.add('selected');
      updateSelectionUI();
    }
  });
  preview.appendChild(img);
  item.appendChild(preview);
});

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
    telephone:     document.getElementById('f-telephone').value.trim(),
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
