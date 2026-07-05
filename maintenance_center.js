const AudioEngine = {
  ctx: null,
  init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); if (this.ctx.state === 'suspended') this.ctx.resume(); },
  playTap() { if (!this.ctx) return; const t = this.ctx.currentTime; const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain(); osc.type = 'sine'; osc.frequency.setValueAtTime(1100, t); gain.gain.setValueAtTime(0.012, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05); osc.connect(gain); gain.connect(this.ctx.destination); osc.start(t); osc.stop(t + 0.05); },
  playSuccess() { if (!this.ctx) return; const t = this.ctx.currentTime; [0, 0.1, 0.22].forEach((d, i) => { const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain(); osc.type = 'sine'; osc.frequency.setValueAtTime([550, 700, 880][i], t + d); gain.gain.setValueAtTime(0.015, t + d); gain.gain.exponentialRampToValueAtTime(0.001, t + d + 0.15); osc.connect(gain); gain.connect(this.ctx.destination); osc.start(t + d); osc.stop(t + d + 0.15); }); }
};

function haptic(type = 'light') { if (!navigator.vibrate) return; const patterns = { light: [8], medium: [15], success: [10, 50, 10, 50, 20] }; navigator.vibrate(patterns[type] || patterns.light); }

function createRipple(e, el) {
  const rect = el.getBoundingClientRect();
  const r = document.createElement('span');
  r.className = 'ripple';
  const size = Math.max(rect.width, rect.height);
  r.style.width = r.style.height = size + 'px';
  r.style.left = (e.clientX - rect.left - size / 2) + 'px';
  r.style.top = (e.clientY - rect.top - size / 2) + 'px';
  el.appendChild(r);
  setTimeout(() => r.remove(), 550);
}

function countUp(el, target, duration) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start = Math.min(start + step, target);
    el.textContent = Math.round(start);
    if (start >= target) clearInterval(timer);
  }, 16);
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    countUp(document.getElementById('openCount'), 3, 1200);
    countUp(document.getElementById('progressCount'), 2, 1200);
    countUp(document.getElementById('resolvedCount'), 12, 1200);
    countUp(document.getElementById('healthDisplay'), 94, 1800);
  }, 400);
});

function filterRequests(btn, filter) {
  AudioEngine.init(); AudioEngine.playTap(); haptic('light');
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  const cards = document.querySelectorAll('.request-card');
  cards.forEach(card => {
    if (filter === 'all' || card.dataset.status === filter) {
      card.style.display = '';
      card.style.animation = 'animIn 0.4s cubic-bezier(0.16,1,0.3,1) both';
    } else {
      card.style.display = 'none';
    }
  });
}

function openIssueDrawer(title, location, desc, date, priority, status, assigned, expected) {
  AudioEngine.init(); AudioEngine.playTap(); haptic('medium');
  const overlay = document.getElementById('drawerOverlay');
  document.getElementById('drawerTitle').textContent = title;
  document.getElementById('drawerSub').textContent = location;
  const pColor = priority === 'Urgent' ? 'red' : priority === 'High' ? 'red' : priority === 'Medium' ? 'warm' : '';
  const sColor = status === 'Resolved' ? 'green' : status === 'In Progress' ? 'warm' : 'red';
  document.getElementById('drawerContent').innerHTML = `
    <div class="drawer-row"><div class="drawer-key"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>Description</div><div class="drawer-val" style="font-size:12px;max-width:180px;line-height:1.5;">${desc}</div></div>
    <div class="drawer-row"><div class="drawer-key"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>Date Reported</div><div class="drawer-val">${date}</div></div>
    <div class="drawer-row"><div class="drawer-key"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>Priority</div><div class="drawer-val ${pColor}">${priority}</div></div>
    <div class="drawer-row"><div class="drawer-key"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>Assigned Team</div><div class="drawer-val">${assigned}</div></div>
    <div class="drawer-row"><div class="drawer-key"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>Expected Resolution</div><div class="drawer-val ${sColor}">${expected}</div></div>
    <div class="drawer-row"><div class="drawer-key"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>Status</div><div class="drawer-val ${sColor}">${status}</div></div>
  `;
  overlay.classList.add('active');
}

function closeDrawer(e) { if (e.target.id === 'drawerOverlay') { document.getElementById('drawerOverlay').classList.remove('active'); } }
function closeDrawerDirect() { document.getElementById('drawerOverlay').classList.remove('active'); }

function setPriority(btn, level) {
  AudioEngine.init(); AudioEngine.playTap(); haptic('light');
  document.querySelectorAll('.priority-chip').forEach(c => {
    c.classList.remove('active', 'low', 'medium', 'high', 'urgent');
    c.classList.add(level);
  });
  btn.classList.add('active');
}

function submitRequest() {
  AudioEngine.init(); AudioEngine.playSuccess(); haptic('success');
  document.getElementById('successModal').classList.add('active');
  document.querySelectorAll('.report-input, .report-textarea').forEach(el => el.value = '');
}

function closeModal(e) { if (e.target.id === 'successModal') { document.getElementById('successModal').classList.remove('active'); } }
function closeModalDirect() { document.getElementById('successModal').classList.remove('active'); }

function scrollToReport() {
  AudioEngine.init(); AudioEngine.playTap(); haptic('light');
  const reportCard = document.querySelector('.report-card');
  if (reportCard) reportCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function goBack() { AudioEngine.init(); AudioEngine.playTap(); haptic('light'); window.history.back(); }

document.querySelectorAll('.request-card').forEach(el => {
  el.addEventListener('click', e => { AudioEngine.init(); createRipple(e, el); });
});
document.addEventListener('click', () => AudioEngine.init(), { once: true });
document.addEventListener('touchstart', () => AudioEngine.init(), { once: true });
