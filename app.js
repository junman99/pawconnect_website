/* PawConnect Website — Interactions */

/* ── Scroll animations ── */
const animEls = document.querySelectorAll('.animate-in');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
}, { threshold: 0.1 });
animEls.forEach(el => observer.observe(el));

/* ── Count-up numbers ── */
function countUp(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1400;
  const start = performance.now();
  const step = now => {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(ease * target).toLocaleString();
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString();
  };
  requestAnimationFrame(step);
}
const countObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.count[data-target]').forEach(countUp);
      countObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.hero-visual, .community-section, .community-stats').forEach(el => countObserver.observe(el));

/* ── Hamburger / mobile nav ── */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');
hamburger?.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', open);
  mobileNav.classList.toggle('open', open);
  mobileNav.setAttribute('aria-hidden', !open);
});
mobileNav?.querySelectorAll('.mobile-nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

/* ── Waitlist modal ── */
const overlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');
const form = document.getElementById('waitlist-form');
const successEl = document.getElementById('modal-success');

function openModal() {
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  document.getElementById('waitlist-email')?.focus();
  // Close mobile nav if open
  hamburger?.classList.remove('open');
  mobileNav?.classList.remove('open');
}
function closeModal() {
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.querySelectorAll('[data-open-waitlist]').forEach(btn => btn.addEventListener('click', openModal));
modalClose?.addEventListener('click', closeModal);
overlay?.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

form?.addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('waitlist-email').value.trim();
  if (!email) return;

  const btnText = form.querySelector('.btn-text');
  const btnLoading = form.querySelector('.btn-loading');
  btnText.hidden = true;
  btnLoading.hidden = false;

  // Save to localStorage as fallback (replace with your backend/Firestore call)
  try {
    const existing = JSON.parse(localStorage.getItem('pawconnect_waitlist') || '[]');
    if (!existing.includes(email)) existing.push(email);
    localStorage.setItem('pawconnect_waitlist', JSON.stringify(existing));
  } catch {}

  // Simulate a short delay then show success
  await new Promise(r => setTimeout(r, 800));

  form.hidden = true;
  successEl.hidden = false;
});

/* ── Tooltip on quick-action items ── */
document.querySelectorAll('[data-tooltip]').forEach(el => {
  el.addEventListener('mouseenter', () => {
    const tip = document.createElement('div');
    tip.className = 'tooltip';
    tip.textContent = el.dataset.tooltip;
    tip.style.cssText = `
      position:absolute; bottom:calc(100% + 6px); left:50%; transform:translateX(-50%);
      background:#1A1A1A; color:#fff; font-size:11px; font-weight:600;
      padding:4px 10px; border-radius:6px; white-space:nowrap; pointer-events:none;
      z-index:50;
    `;
    el.style.position = 'relative';
    el.appendChild(tip);
  });
  el.addEventListener('mouseleave', () => {
    el.querySelector('.tooltip')?.remove();
  });
});
