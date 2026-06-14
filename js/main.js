// ════════════════════════════════════════════════════
//  main.js — UI interactions + forms
//  Newsletter and contact data are saved to Firestore.
// ════════════════════════════════════════════════════

// ── NAVBAR SCROLL ─────────────────────────────────────
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 40);
  setActiveNav();
});

// ── HAMBURGER ─────────────────────────────────────────
const hamburger = document.querySelector('.hamburger');
const navLinks  = document.querySelector('.nav-links');
hamburger?.addEventListener('click', () => navLinks.classList.toggle('open'));
document.addEventListener('click', e => {
  if (!navbar?.contains(e.target)) navLinks?.classList.remove('open');
});

// ── ACTIVE NAV LINK ───────────────────────────────────
function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    a.classList.toggle('active', href === path || (path === '' && href === 'index.html'));
  });
}
setActiveNav();

// ── TICKER (duplicate for seamless loop) ──────────────
const tickerScroll = document.querySelector('.ticker-scroll');
if (tickerScroll) tickerScroll.innerHTML += tickerScroll.innerHTML;

// ── NEWSLETTER FORM ───────────────────────────────────
document.querySelectorAll('.newsletter-form').forEach(form => {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const email = input?.value.trim();
    if (!email) return;

    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.textContent = 'Subscribing...';
    btn.disabled = true;

    try {
      const added = await dbAddSubscriber(email);
      showToast(added
        ? '🎉 Subscribed! Welcome to the community.'
        : '✅ You\'re already subscribed. Thank you!');
      input.value = '';
    } catch (err) {
      console.error(err);
      showToast('⚠️ Something went wrong. Please try again.');
    } finally {
      btn.textContent = orig;
      btn.disabled = false;
    }
  });
});

// ── CONTACT FORM ──────────────────────────────────────
const contactForm = document.getElementById('contact-form');
contactForm?.addEventListener('submit', async e => {
  e.preventDefault();
  const data    = Object.fromEntries(new FormData(contactForm));
  const btn     = contactForm.querySelector('button[type="submit"]');
  const orig    = btn.innerHTML;
  btn.innerHTML = 'Sending...';
  btn.disabled  = true;

  try {
    await dbAddMessage(data);
    showToast('✅ Message sent! I\'ll get back to you shortly.');
    contactForm.reset();
  } catch (err) {
    console.error(err);
    showToast('⚠️ Failed to send. Please try WhatsApp instead.');
  } finally {
    btn.innerHTML = orig;
    btn.disabled  = false;
  }
});

// ── TOAST ─────────────────────────────────────────────
function showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  Object.assign(t.style, {
    position: 'fixed',
    bottom: '5.5rem', right: '2rem',
    background: '#1A1E2E', color: '#fff',
    padding: '0.85rem 1.5rem',
    borderRadius: '12px',
    fontSize: '0.9rem', fontWeight: '600',
    boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
    zIndex: '9999',
    animation: 'fadeUp 0.35s both',
    borderLeft: '4px solid #F5C518',
    maxWidth: '320px',
    fontFamily: 'Inter, sans-serif',
  });
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 4200);
}

// ── ANIMATE ON SCROLL ─────────────────────────────────
const io = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      en.target.style.opacity = '1';
      en.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.cat-card, .credential, .contact-item').forEach(el => {
  el.style.cssText += 'opacity:0;transform:translateY(24px);transition:opacity 0.5s ease,transform 0.5s ease';
  io.observe(el);
});
