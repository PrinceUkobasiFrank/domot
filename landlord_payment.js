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

function formatCurrency(num) { return '₦' + num.toLocaleString('en-NG'); }

function countUp(el, target, duration, prefix = '') {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start = Math.min(start + step, target);
    el.textContent = prefix + Math.round(start).toLocaleString('en-NG');
    if (start >= target) clearInterval(timer);
  }, 16);
}

function countUpText(el, target, duration, suffix = '') {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start = Math.min(start + step, target);
    el.textContent = Math.round(start) + suffix;
    if (start >= target) clearInterval(timer);
  }, 16);
}

function animateRing(percent) {
  const ring = document.getElementById('collectionRing');
  const circumference = 2 * Math.PI * 25;
  const offset = circumference - (percent / 100) * circumference;
  setTimeout(() => { ring.style.strokeDashoffset = offset; }, 400);
}

function animateBars() {
  setTimeout(() => { document.getElementById('occupancyBar').style.width = '92%'; }, 600);
  setTimeout(() => { document.getElementById('avgTimeBar').style.width = '60%'; }, 800);
  setTimeout(() => { document.getElementById('successBar').style.width = '75%'; }, 1000);
  setTimeout(() => { document.getElementById('pendingBar').style.width = '25%'; }, 1200);
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    countUp(document.getElementById('heroBalance'), 2450000, 1500, '₦');
    countUp(document.getElementById('monthlyCollections'), 650000, 1200, '₦');
    countUp(document.getElementById('collectedVal'), 650000, 1000, '₦');
    countUp(document.getElementById('pendingVal'), 120000, 1000, '₦');
    countUp(document.getElementById('overdueVal'), 65000, 1000, '₦');
    countUp(document.getElementById('upcomingVal'), 780000, 1000, '₦');
    countUp(document.getElementById('occupancyRev'), 2330000, 1200, '₦');
    countUpText(document.getElementById('avgTime'), 3, 1000, ' days');
    countUpText(document.getElementById('successfulCol'), 3, 1000, '');
    countUp(document.getElementById('pendingRec'), 120000, 1000, '₦');
    countUp(document.getElementById('withdrawAmount'), 2450000, 1500, '₦');
    animateRing(98);
    animateBars();
    document.getElementById('collectionRate').textContent='98%';
  }, 300);
});

function openPaymentDrawer(name, property, amountDue, amountPaid, date, receipt, status) {
  AudioEngine.init(); AudioEngine.playTap(); haptic('medium');
  const overlay = document.getElementById('drawerOverlay');
  document.getElementById('drawerTitle').textContent = name;
  document.getElementById('drawerSub').textContent = property;
  const statusColor = status === 'Paid' ? 'green' : status === 'Pending' ? 'warm' : 'red';
  const statusBg = status === 'Paid' ? 'rgba(14,201,127,0.12)' : status === 'Pending' ? 'rgba(240,165,0,0.12)' : 'rgba(240,68,68,0.12)';
  const statusBorder = status === 'Paid' ? 'rgba(14,201,127,0.22)' : status === 'Pending' ? 'rgba(240,165,0,0.22)' : 'rgba(240,68,68,0.22)';
  const statusText = status === 'Paid' ? 'var(--accent-green)' : status === 'Pending' ? 'var(--accent-warm)' : 'var(--accent-red)';

  document.getElementById('drawerContent').innerHTML = `
    <div class="drawer-row"><div class="drawer-key"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M16 12V52M48 12V52M16 16L48 48M16 24H48M16 40H48"/></svg>Amount Due</div><div class="drawer-val">${amountDue}</div></div>
    <div class="drawer-row"><div class="drawer-key"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M16 12V52M48 12V52M16 16L48 48M16 24H48M16 40H48"/></svg>Amount Paid</div><div class="drawer-val ${amountPaid !== '₦0' ? 'green' : ''}">${amountPaid}</div></div>
    <div class="drawer-row"><div class="drawer-key"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>Payment Date</div><div class="drawer-val">${date}</div></div>
    <div class="drawer-row"><div class="drawer-key"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>Receipt Number</div><div class="drawer-val violet">${receipt}</div></div>
    <div class="drawer-row"><div class="drawer-key"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>Payment Status</div><div class="drawer-val" style="color:${statusText};">${status}</div></div>
  `;
  overlay.classList.add('active');
}

function closeDrawer(e) { if (e.target.id === 'drawerOverlay') { document.getElementById('drawerOverlay').classList.remove('active'); } }
function closeDrawerDirect() { document.getElementById('drawerOverlay').classList.remove('active'); }

function openWithdrawModal() {
  AudioEngine.init(); AudioEngine.playSuccess(); haptic('success');
  document.getElementById('withdrawModal').classList.add('active');
}

function closeModal(e) { if (e.target.id === 'withdrawModal') { document.getElementById('withdrawModal').classList.remove('active'); } }
function closeModalDirect() { document.getElementById('withdrawModal').classList.remove('active'); }

function toggleReminder(el) {
  AudioEngine.init(); AudioEngine.playTap(); haptic('light');
  el.classList.toggle('on'); el.classList.toggle('off');
  const icon = el.previousElementSibling.previousElementSibling;
  icon.classList.toggle('on'); icon.classList.toggle('off');
}

function goBack() { AudioEngine.init(); AudioEngine.playTap(); haptic('light'); window.history.back(); }

document.querySelectorAll('.pay-grid-card, .receipt-card').forEach(el => {
  el.addEventListener('click', e => { AudioEngine.init(); createRipple(e, el); });
});
document.addEventListener('click', () => AudioEngine.init(), { once: true });
document.addEventListener('touchstart', () => AudioEngine.init(), { once: true });
