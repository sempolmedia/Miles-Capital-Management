// ─── GLOBAL ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  const page = document.body.dataset.page;

  initNav();

  if (page === 'home')        initHome();
  if (page === 'performance') initPerformance();
  if (page === 'about')       initAbout();
  if (page === 'contact')     initContact();
  if (page === 'shop')        initShop();
});

// ─── NAV ──────────────────────────────────────────────────────────────────────
function initNav() {
  const nav = document.querySelector('.nav');
  const hamburger = document.querySelector('.nav__hamburger');
  const overlay = document.querySelector('.nav__overlay');
  const overlayLinks = document.querySelectorAll('.nav__overlay a');

  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  if (hamburger && overlay) {
    hamburger.addEventListener('click', () => {
      const isOpen = overlay.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
      const spans = hamburger.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.transform = 'translateY(6px) rotate(45deg)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'translateY(-6px) rotate(-45deg)';
      } else {
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      }
    });

    overlayLinks.forEach(link => {
      link.addEventListener('click', () => {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
        const spans = hamburger.querySelectorAll('span');
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      });
    });
  }
}

// ─── COUNT-UP ──────────────────────────────────────────────────────────────────
function countUp(el, target, duration = 1500, prefix = '', suffix = '') {
  const startTime = performance.now();
  const isFloat = String(target).includes('.');
  const decimals = isFloat ? String(target).split('.')[1].length : 0;
  const startVal = 0;

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = startVal + (target - startVal) * eased;
    el.textContent = prefix + current.toFixed(decimals) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function initCountUps(container = document) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const val = parseFloat(el.dataset.target);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      countUp(el, val, 1500, prefix, suffix);
      observer.unobserve(el);
    });
  }, { threshold: 0.3 });

  container.querySelectorAll('[data-target]').forEach(el => observer.observe(el));
}

// ─── HOME: HERO ANIMATIONS ────────────────────────────────────────────────────
function initHome() {
  initHeroCanvas();
  initHeroAnims();
  initMacbook();
  initStrategyCards();
  initEdgeSection();
  initCountUps();
}

function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, dots;

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
    createDots();
  }

  function createDots() {
    const count = Math.floor((w * h) / 14000);
    dots = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.4 + 0.4,
      a: Math.random() * 0.35 + 0.05,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    dots.forEach(d => {
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0 || d.x > w) d.vx *= -1;
      if (d.y < 0 || d.y > h) d.vy *= -1;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(133,183,235,${d.a})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', resize, { passive: true });
}

function initHeroAnims() {
  if (typeof gsap === 'undefined') return;

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to('.hero__eyebrow',  { opacity: 1, y: 0, duration: 0.7 }, 0)
    .to('.hero__h1',       { opacity: 1, y: 0, duration: 0.7 }, 0.2)
    .to('.hero__h1--sub',  { opacity: 1, y: 0, duration: 0.7 }, 0.35)
    .to('.hero__tagline',  { opacity: 1, y: 0, duration: 0.7 }, 0.5)
    .to('.hero__ctas',     { opacity: 1, y: 0, duration: 0.7 }, 0.65)
    .to('.stats-bar',      { opacity: 1, duration: 0.8 }, 0.85);
}

// ─── HOME: MACBOOK SCROLL ──────────────────────────────────────────────────────
function initMacbook() {
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    // Mobile: just fade in
    const wrap = document.querySelector('.macbook-wrap');
    const terminal = document.querySelector('.terminal');
    if (wrap) { wrap.style.opacity = '1'; wrap.style.transform = 'scale(1)'; }
    if (terminal) terminal.style.opacity = '1';
    return;
  }

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  const wrap = document.querySelector('.macbook-wrap');
  const terminal = document.querySelector('.terminal');
  if (!wrap || !terminal) return;

  gsap.set(wrap, { scale: 0.35, opacity: 0 });

  ScrollTrigger.create({
    trigger: '.macbook-pin',
    start: 'top top',
    end: 'bottom bottom',
    pin: '.macbook-sticky',
    scrub: 1,
    onUpdate: (self) => {
      const p = self.progress;
      if (p < 0.6) {
        const sub = p / 0.6;
        gsap.set(wrap, { scale: 0.35 + (0.65 * sub), opacity: sub });
        gsap.set(terminal, { opacity: 0 });
      } else {
        gsap.set(wrap, { scale: 1, opacity: 1 });
        const sub = (p - 0.6) / 0.4;
        gsap.set(terminal, { opacity: sub });
      }
    }
  });
}

// ─── HOME: STRATEGY CARDS ──────────────────────────────────────────────────────
function initStrategyCards() {
  if (typeof gsap === 'undefined') return;

  const cards = document.querySelectorAll('.card');
  if (!cards.length) return;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power3.out',
      });
      observer.disconnect();
    }
  }, { threshold: 0.15 });

  observer.observe(cards[0]);
}

// ─── HOME: EDGE SECTION ────────────────────────────────────────────────────────
function initEdgeSection() {
  if (typeof gsap === 'undefined') return;

  const text = document.querySelector('.edge-text');
  const svg  = document.querySelector('.edge-svg');
  if (!text || !svg) return;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      gsap.to(text, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' });
      gsap.to(svg,  { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', delay: 0.15 });
      observer.disconnect();
    }
  }, { threshold: 0.2 });

  observer.observe(text);
}

// ─── PERFORMANCE: TABS ────────────────────────────────────────────────────────
function initPerformance() {
  initTabs();
  initCharts();
  initCountUps();
}

function initTabs() {
  const btns = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.tab);
      if (target) {
        if (typeof gsap !== 'undefined') {
          gsap.fromTo(target, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' });
        }
        target.classList.add('active');
        // Re-run count-ups for newly visible panel
        initCountUps(target);
        // Re-render charts for this panel
        renderChartsForPanel(btn.dataset.tab);
      }
    });
  });
}

// ─── PERFORMANCE: CHARTS ──────────────────────────────────────────────────────
const chartInstances = {};

const chartData = {
  'tab-flagship': {
    equity: {
      labels: ['Jan 1','Jan 15','Feb 1','Feb 15','Mar 1','Mar 15','Apr 1','Apr 15','May 1','May 15','Jun 1'],
      values: [50000, 52400, 57800, 59200, 65100, 68400, 66800, 72300, 75600, 78900, 82144],
    },
    monthly: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun'],
      values: [4.8, 10.4, 8.6, 7.2, 6.6, 13.2],
    },
    drawdown: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun'],
      values: [0, -0.6, -1.1, -2.8, -1.4, -0.3],
    },
  },
  'tab-risk-on': {
    equity: {
      labels: ['Jan','Jan mid','Feb','Feb mid','Mar','Mar mid','Apr','Apr mid','May','May mid','Jun'],
      values: [50000, 53100, 54200, 58000, 60100, 53400, 65800, 68200, 70200, 74500, 77928],
    },
    monthly: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun'],
      values: [8.4, 11.6, 9.4, -3.2, 8.7, 10.8],
    },
    drawdown: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun'],
      values: [0, -2.1, -4.8, -11.3, -6.2, -1.4],
    },
  },
  'tab-risk-off': {
    equity: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun'],
      values: [50000, 52100, 55400, 58200, 61800, 64650],
    },
    monthly: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun'],
      values: [4.2, 6.6, 5.6, 4.1, 5.8, 3.0],
    },
    drawdown: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun'],
      values: [0, -0.9, -1.8, -4.7, -2.1, -0.6],
    },
  },
};

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#0A3D6B',
      borderColor: 'rgba(133,183,235,0.15)',
      borderWidth: 1,
      titleColor: '#FFFFFF',
      bodyColor: '#E6F1FB',
      titleFont: { family: 'DM Sans', size: 12 },
      bodyFont: { family: 'JetBrains Mono', size: 12 },
      padding: 12,
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(133,183,235,0.06)', drawBorder: false },
      ticks: { color: '#aaaaaa', font: { family: 'DM Sans', size: 11 } },
    },
    y: {
      grid: { color: 'rgba(133,183,235,0.06)', drawBorder: false },
      ticks: { color: '#aaaaaa', font: { family: 'DM Sans', size: 11 } },
    },
  },
};

function initCharts() {
  renderChartsForPanel('tab-flagship');

  // Observe for animation trigger
  const section = document.querySelector('.charts-grid');
  if (!section) return;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) observer.disconnect();
  }, { threshold: 0.1 });
  observer.observe(section);
}

function renderChartsForPanel(tabId) {
  const data = chartData[tabId];
  if (!data) return;

  buildEquityChart(tabId, data.equity);
  buildMonthlyChart(tabId, data.monthly);
  buildDrawdownChart(tabId, data.drawdown);
}

function buildEquityChart(tabId, data) {
  const id = `equity-${tabId}`;
  const canvas = document.getElementById(id);
  if (!canvas) return;
  if (chartInstances[id]) { chartInstances[id].destroy(); delete chartInstances[id]; }

  chartInstances[id] = new Chart(canvas, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        data: data.values,
        borderColor: '#85B7EB',
        borderWidth: 2,
        backgroundColor: 'rgba(24,95,165,0.15)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#85B7EB',
      }],
    },
    options: {
      ...chartDefaults,
      animation: { duration: 1200, easing: 'easeInOutQuart' },
      scales: {
        ...chartDefaults.scales,
        y: {
          ...chartDefaults.scales.y,
          ticks: {
            ...chartDefaults.scales.y.ticks,
            callback: v => '$' + v.toLocaleString(),
          },
        },
      },
    },
  });
}

function buildMonthlyChart(tabId, data) {
  const id = `monthly-${tabId}`;
  const canvas = document.getElementById(id);
  if (!canvas) return;
  if (chartInstances[id]) { chartInstances[id].destroy(); delete chartInstances[id]; }

  chartInstances[id] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [{
        data: data.values,
        backgroundColor: data.values.map(v => v >= 0 ? 'rgba(133,183,235,0.7)' : 'rgba(224,85,85,0.7)'),
        borderColor: data.values.map(v => v >= 0 ? '#85B7EB' : '#E05555'),
        borderWidth: 1,
        borderRadius: 2,
      }],
    },
    options: {
      ...chartDefaults,
      animation: { duration: 1200, easing: 'easeInOutQuart' },
      scales: {
        ...chartDefaults.scales,
        y: {
          ...chartDefaults.scales.y,
          ticks: {
            ...chartDefaults.scales.y.ticks,
            callback: v => v + '%',
          },
        },
      },
    },
  });
}

function buildDrawdownChart(tabId, data) {
  const id = `drawdown-${tabId}`;
  const canvas = document.getElementById(id);
  if (!canvas) return;
  if (chartInstances[id]) { chartInstances[id].destroy(); delete chartInstances[id]; }

  chartInstances[id] = new Chart(canvas, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        data: data.values,
        borderColor: '#E05555',
        borderWidth: 2,
        backgroundColor: 'rgba(224,85,85,0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#E05555',
      }],
    },
    options: {
      ...chartDefaults,
      animation: { duration: 1200, easing: 'easeInOutQuart' },
      scales: {
        ...chartDefaults.scales,
        y: {
          ...chartDefaults.scales.y,
          ticks: {
            ...chartDefaults.scales.y.ticks,
            callback: v => v + '%',
          },
        },
      },
    },
  });
}

// ─── ABOUT: TIMELINE ──────────────────────────────────────────────────────────
function initAbout() {
  if (typeof gsap === 'undefined') return;

  const items = document.querySelectorAll('.timeline__item');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      gsap.to(entry.target, {
        opacity: 1,
        x: 0,
        duration: 0.7,
        ease: 'power3.out',
        delay: parseFloat(entry.target.dataset.delay || 0),
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  items.forEach((item, i) => {
    item.dataset.delay = i * 0.15;
    observer.observe(item);
  });
}

// ─── CONTACT: FORM ────────────────────────────────────────────────────────────
function initContact() {
  const form = document.querySelector('.contact-form form');
  if (!form) return;

  const successMsg = document.querySelector('.form-message.success');
  const errorMsg   = document.querySelector('.form-message.error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending…';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' },
      });

      if (res.ok) {
        form.reset();
        successMsg.style.display = 'block';
        errorMsg.style.display = 'none';
        btn.textContent = 'Sent';
      } else {
        throw new Error('Non-OK response');
      }
    } catch {
      successMsg.style.display = 'none';
      errorMsg.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Apply for Access';
    }
  });
}

// ─── SHOP ─────────────────────────────────────────────────────────────────────
function initShop() {
  const form = document.querySelector('.waitlist-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    btn.textContent = 'On the list!';
    btn.disabled = true;
    btn.style.background = 'var(--success)';
  });
}
