// Modern UI JS - Shared Utilities, Animations, Interactions

class UI {
  static init() {
    this.initTheme();
    this.initLoader();
    this.initSearch();
    this.initModals();
    this.initMobileNav();
    this.initToasts();
    document.dispatchEvent(new CustomEvent('ui-ready'));
  }

  static initTheme() {
    const toggle = document.querySelector('.theme-toggle-input');
    if (toggle) {
      toggle.addEventListener('change', (e) => {
        document.documentElement.setAttribute('data-theme', e.target.checked ? 'dark' : 'light');
        localStorage.setItem('examguard-theme', e.target.checked ? 'dark' : 'light');
        document.dispatchEvent(new CustomEvent('examguard-theme-change'));
      });
      
      // Init from localStorage
      const saved = localStorage.getItem('examguard-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      toggle.checked = saved === 'dark';
      document.documentElement.setAttribute('data-theme', saved);
    }
  }

  static initLoader() {
    window.addEventListener('load', () => {
      setTimeout(() => document.querySelector('.loader')?.classList.add('hidden'), 800);
    });
  }

  static initSearch() {
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        // Debounced API search (placeholder)
        clearTimeout(window.searchTimeout);
        window.searchTimeout = setTimeout(() => {
          UI.showToast(`Searching "${e.target.value}"...`, 'info');
          // TODO: Integrate with API
        }, 300);
      });
    }
  }

  static initModals() {
    document.addEventListener('click', (e) => {
      if (e.target.dataset.modalTrigger) {
        UI.openModal(e.target.dataset.modalTrigger);
      }
      if (e.target.closest('.modal-overlay') || e.target.dataset.closeModal) {
        UI.closeModal();
      }
    });
  }

  static openModal(modalId) {
    const modal = document.getElementById(modalId) || document.getElementById('global-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  static closeModal() {
    document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
    document.body.style.overflow = '';
  }

  static initMobileNav() {
    const sidebar = document.querySelector('.sidebar');
    if (window.innerWidth < 1024 && sidebar) {
      document.addEventListener('click', (e) => {
        if (e.target.matches('.menu-toggle')) sidebar.classList.toggle('open');
      });
    }
  }

  static showToast(message, type = 'success', duration = 4000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => toast.remove(), duration);
  }

  // Confetti celebration
  static confetti() {
    // Simple canvas confetti
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;z-index:9999;width:100%;height:100%;pointer-events:none';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const confetti = [];
    for (let i = 0; i < 100; i++) {
      confetti.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 6 + 2,
        d: Math.random() * 100 + 50,
        color: `hsl(${Math.random() * 60 + 200}, 70%, 60%)`,
        tilt: Math.random() * 10,
        tiltAngle: 0
      });
    }
    
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confetti.forEach((c, i) => {
        c.tiltAngle += 0.1;
        c.y += (Math.cos(c.d * 0.01) + 3) * 2;
        c.tilt = Math.sin(c.tiltAngle) * 15;
        
        if (c.y > canvas.height) confetti.splice(i, 1);
        
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.tilt * Math.PI / 180);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.r, -c.r / 2, c.r * 2, c.r);
        ctx.restore();
      });
      
      if (confetti.length) requestAnimationFrame(draw);
      else canvas.remove();
    }
    draw();
  }

  // Intersection Observer for animations
  static animateOnScroll() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
  }
}

// Charts helper (Chart.js wrapper)
class Charts {
  static init(containerSelector) {
    if (typeof Chart === 'undefined') return;
    
    const containers = document.querySelectorAll(containerSelector);
    containers.forEach(container => {
      const ctx = container.querySelector('canvas');
      if (ctx) {
        new Chart(ctx, {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' } },
          scales: {
            x: { grid: { color: 'transparent' } },
            y: { beginAtZero: true }
          }
        });
      }
    });
  }
}

// Realtime updates
class Realtime {
  static init(endpoint, selector, interval = 5000) {
    const update = async () => {
      try {
        const res = await fetch(endpoint);
        const data = await res.json();
        const container = document.querySelector(selector);
        if (container) {
          // Update DOM with data (generic)
          container.innerHTML = JSON.stringify(data, null, 2);
        }
      } catch (e) {
        console.error('Realtime error:', e);
      }
    };
    update();
    return setInterval(update, interval);
  }
}

// Init on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => UI.init());
} else {
  UI.init();
}

// Expose globally
window.UI = UI;
window.Charts = Charts;
window.Realtime = Realtime;

