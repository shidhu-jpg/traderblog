// ════════════════════════════════════════════════════
//  animations.js — Premium animations
//  Page loader · Stars · Typewriter · Counters
//  Scroll reveal · 3D card tilt · Parallax
// ════════════════════════════════════════════════════

// ── PAGE LOADER ───────────────────────────────────
window.addEventListener('load', () => {
  const loader = document.getElementById('page-loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 1200);
    setTimeout(() => loader.remove(), 1900);
  }
});

// ── GENERATE STARFIELD ────────────────────────────
function generateStars() {
  const container = document.querySelector('.stars');
  if (!container) return;
  const count = 80;
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.classList.add('star');
    const size = Math.random() * 2.5 + 0.5;
    s.style.cssText = `
      width:${size}px; height:${size}px;
      top:${Math.random()*100}%;
      left:${Math.random()*100}%;
      --dur:${Math.random()*4+2}s;
      --delay:-${Math.random()*6}s;
    `;
    container.appendChild(s);
  }
}

// ── TYPEWRITER EFFECT ─────────────────────────────
function typewriter(el, lines, speed = 40) {
  if (!el) return;
  let lineIdx = 0, charIdx = 0;
  el.textContent = '';

  // Add cursor
  const cursor = document.createElement('span');
  cursor.className = 'typewriter-cursor';
  el.parentNode.insertBefore(cursor, el.nextSibling);

  const text = lines.join(' ');
  function type() {
    if (charIdx < text.length) {
      el.textContent += text[charIdx++];
      setTimeout(type, speed + Math.random() * 20);
    } else {
      cursor.style.animationDuration = '0.9s';
    }
  }
  setTimeout(type, 800);
}

// ── ANIMATED NUMBER COUNTER ───────────────────────
function animateCounter(el, target, duration = 1800, suffix = '') {
  if (!el) return;
  const start = performance.now();
  const isFloat = target % 1 !== 0;

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = eased * target;
    el.textContent = (isFloat ? current.toFixed(1) : Math.floor(current)) + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target + suffix;
  }
  requestAnimationFrame(update);
}

// ── SCROLL REVEAL ─────────────────────────────────
function initScrollReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('visible');
        io.unobserve(en.target);

        // Trigger counters inside this element
        en.target.querySelectorAll('[data-count]').forEach(el => {
          const target = parseFloat(el.dataset.count);
          const suffix = el.dataset.suffix || '';
          animateCounter(el, target, 1800, suffix);
        });
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stagger-children')
    .forEach(el => io.observe(el));

  // Also trigger counters in hero immediately
  document.querySelectorAll('.hero [data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    setTimeout(() => animateCounter(el, target, 2000, suffix), 1400);
  });
}

// ── 3D CARD TILT ──────────────────────────────────
function initCardTilt() {
  document.querySelectorAll('.blog-card, .cat-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `translateY(-8px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ── PARALLAX HERO ─────────────────────────────────
function initParallax() {
  const orbs = document.querySelectorAll('.orb');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    orbs.forEach((orb, i) => {
      const speed = 0.08 + i * 0.04;
      orb.style.transform = `translateY(${y * speed}px)`;
    });
  }, { passive: true });
}

// ── MAGNETIC BUTTONS ──────────────────────────────
function initMagneticBtns() {
  document.querySelectorAll('.btn-primary, .btn-green').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
      const y = (e.clientY - rect.top  - rect.height / 2) * 0.25;
      btn.style.transform = `translateY(-2px) translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

// ── SMOOTH ACTIVE NAV ─────────────────────────────
function initSmoothNav() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ── BLOG CARD DATA-CAT ATTRIBUTE ──────────────────
// Adds category attribute for CSS border coloring
function tagBlogCards() {
  document.querySelectorAll('.blog-card').forEach(card => {
    const tag = card.querySelector('.tag');
    if (!tag) return;
    const cls = [...tag.classList].find(c => c.startsWith('tag-') && c !== 'tag');
    if (cls) card.dataset.cat = cls.replace('tag-', '');
  });
}

// ── INIT ALL ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  generateStars();
  initScrollReveal();
  initParallax();
  initMagneticBtns();
  initSmoothNav();

  // Typewriter for hero subtitle (only on homepage)
  const subtitleEl = document.getElementById('hero-typewriter');
  if (subtitleEl) {
    typewriter(subtitleEl, [
      "I'm Manjunathswamy Hiremath — a trader, agriculture research scholar, and former banking professional sharing real insights on markets, books I love, places I wander, and food I cook."
    ], 35);
  }

  // Blog card tilt (after blog.js renders cards)
  setTimeout(() => {
    initCardTilt();
    tagBlogCards();
  }, 2000);

  // Re-init tilt when new cards are rendered
  const gridObserver = new MutationObserver(() => {
    initCardTilt();
    tagBlogCards();
  });
  document.querySelectorAll('#recent-posts, #posts-grid, #trading-posts, #all-posts-grid')
    .forEach(el => { if (el) gridObserver.observe(el, { childList: true }); });
});
