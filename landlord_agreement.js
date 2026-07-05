const AudioEngine = {
  ctx: null,
  init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); if (this.ctx.state === 'suspended') this.ctx.resume(); },
  playTap() { if (!this.ctx) return; const t = this.ctx.currentTime; const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain(); osc.type = 'sine'; osc.frequency.setValueAtTime(1100, t); gain.gain.setValueAtTime(0.012, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05); osc.connect(gain); gain.connect(this.ctx.destination); osc.start(t); osc.stop(t + 0.05); },
  playSuccess() { if (!this.ctx) return; const t = this.ctx.currentTime; [0, 0.1, 0.22].forEach((d, i) => { const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain(); osc.type = 'sine'; osc.frequency.setValueAtTime([550, 700, 880][i], t + d); gain.gain.setValueAtTime(0.015, t + d); gain.gain.exponentialRampToValueAtTime(0.001, t + d + 0.15); osc.connect(gain); gain.connect(this.ctx.destination); osc.start(t + d); osc.stop(t + d + 0.15); }); },
  playChime() { if (!this.ctx) return; const t = this.ctx.currentTime; [0,0.08,0.18,0.3].forEach((d,i)=>{ const osc=this.ctx.createOscillator(); const g=this.ctx.createGain(); osc.type='sine'; osc.frequency.setValueAtTime([660,880,1100,1320][i],t+d); g.gain.setValueAtTime(0.012,t+d); g.gain.exponentialRampToValueAtTime(0.001,t+d+0.2); osc.connect(g); g.connect(this.ctx.destination); osc.start(t+d); osc.stop(t+d+0.2); }); }
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
    countUp(document.getElementById('healthDisplay'), 95, 1800);
  }, 400);
});

function toggleSection(card) {
  AudioEngine.init(); AudioEngine.playTap(); haptic('light');
  const body = card.querySelector('.agree-sec-body');
  const arrow = card.querySelector('.agree-sec-arrow');
  body.classList.toggle('open');
  arrow.classList.toggle('open');
}

function saveDraft() {
  AudioEngine.init(); AudioEngine.playTap(); haptic('light');
}

function sendForSignature() {
  AudioEngine.init(); AudioEngine.playTap(); haptic('medium');
}

// Signature canvas
let currentSignTarget = null;
let isDrawing = false;
let lastX = 0, lastY = 0;
const canvas = document.getElementById('signCanvas');
const ctx2d = canvas.getContext('2d');

function setupCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * window.devicePixelRatio;
  canvas.height = rect.height * window.devicePixelRatio;
  ctx2d.scale(window.devicePixelRatio, window.devicePixelRatio);
  ctx2d.strokeStyle = 'rgba(124,92,250,0.9)';
  ctx2d.lineWidth = 2;
  ctx2d.lineCap = 'round';
  ctx2d.lineJoin = 'round';
}

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches ? e.touches[0] : e;
  return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
}

canvas.addEventListener('mousedown', e => { isDrawing = true; const p = getPos(e); lastX = p.x; lastY = p.y; ctx2d.beginPath(); ctx2d.moveTo(lastX, lastY); });
canvas.addEventListener('mousemove', e => { if (!isDrawing) return; const p = getPos(e); ctx2d.lineTo(p.x, p.y); ctx2d.stroke(); lastX = p.x; lastY = p.y; });
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('touchstart', e => { e.preventDefault(); isDrawing = true; const p = getPos(e); lastX = p.x; lastY = p.y; ctx2d.beginPath(); ctx2d.moveTo(lastX, lastY); }, { passive: false });
canvas.addEventListener('touchmove', e => { e.preventDefault(); if (!isDrawing) return; const p = getPos(e); ctx2d.lineTo(p.x, p.y); ctx2d.stroke(); lastX = p.x; lastY = p.y; }, { passive: false });
canvas.addEventListener('touchend', () => isDrawing = false);

function clearCanvas() {
  AudioEngine.init(); AudioEngine.playTap(); haptic('light');
  const rect = canvas.getBoundingClientRect();
  ctx2d.clearRect(0, 0, rect.width, rect.height);
}

let tenantSigned = false;

function openSignModal(target) {
  AudioEngine.init(); AudioEngine.playTap(); haptic('medium');
  currentSignTarget = target;
  document.getElementById('signModalTitle').textContent = target === 'landlord' ? 'Landlord Signature' : 'Tenant Signature';
  document.getElementById('signModal').classList.add('active');
  setTimeout(setupCanvas, 100);
}

function confirmSignature() {
  AudioEngine.init(); AudioEngine.playSuccess(); haptic('success');
  closeModal('signModal');

  // Update the signing party's card in the background
  if (currentSignTarget === 'landlord') {
    // Already shown as signed by default, but ensure
  } else if (currentSignTarget === 'tenant') {
    tenantSigned = true;
    const tenantCard = document.querySelector('.sig-card.tenant');
    const sigSvg = tenantCard.querySelector('.sig-svg');
    sigSvg.innerHTML = `
      <path d="M10 32 C18 22 22 30 32 24 C42 18 44 30 54 26 C64 22 66 34 76 28 C86 22 90 30 110 26" stroke="rgba(14,201,127,0.7)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M10 35 C18 25 22 33 32 27 C42 21 44 33 54 29 C64 25 66 37 76 31 C86 25 90 33 110 29" stroke="rgba(14,201,127,0.3)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    `;
    document.getElementById('tenantSigStatus').className = 'sig-status signed';
    document.getElementById('tenantSigStatus').innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      Signed
    `;
  }

  // Always show the signed confirmation screen after signing
  setTimeout(() => {
    AudioEngine.init(); AudioEngine.playChime(); haptic('success');
    showSignedScreen();
  }, 400);
}

function showSignedScreen() {
  const screen = document.getElementById('signedScreen');
  screen.classList.add('active');
  document.getElementById('pageContainer').style.overflow = 'hidden';
  startConfetti();
  // Stop confetti after 3.5s
  setTimeout(stopConfetti, 3500);
}

// ── CONFETTI ──
let confettiAnim = null;
let confettiParticles = [];

function startConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const colors = ['#7c5cfa','#0ec97f','#f0a500','#3b82f6','#fff','#f04444'];
  confettiParticles = Array.from({length: 80}, () => ({
    x: Math.random() * canvas.width,
    y: -10 - Math.random() * 100,
    r: 4 + Math.random() * 5,
    d: Math.random() * 80,
    color: colors[Math.floor(Math.random() * colors.length)],
    tilt: Math.floor(Math.random() * 10) - 10,
    tiltAngle: 0,
    tiltAngleInc: (Math.random() * 0.07) + 0.05
  }));
  let angle = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    angle += 0.01;
    confettiParticles.forEach((p, i) => {
      p.tiltAngle += p.tiltAngleInc;
      p.y += (Math.cos(angle + p.d) + 2 + p.r / 4) * 0.8;
      p.x += Math.sin(angle);
      p.tilt = Math.sin(p.tiltAngle) * 12;
      ctx.beginPath();
      ctx.lineWidth = p.r / 2;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
      ctx.stroke();
      if (p.y > canvas.height + 10) {
        confettiParticles[i] = { ...p, y: -10, x: Math.random() * canvas.width };
      }
    });
    confettiAnim = requestAnimationFrame(draw);
  }
  draw();
}

function stopConfetti() {
  if (confettiAnim) { cancelAnimationFrame(confettiAnim); confettiAnim = null; }
  const canvas = document.getElementById('confettiCanvas');
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

function downloadAgreement() {
  AudioEngine.init(); AudioEngine.playTap(); haptic('light');
  // Simulate download — in production this would fetch a real PDF
  const a = document.createElement('a');
  a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent('AGR-2026-001 — Tenancy Agreement\nLandlord: Prince Frank\nTenant: Michael Johnson\nProperty: 2 Bedroom Apartment, Shelter Afrique, Uyo\nAnnual Rent: ₦650,000\nLease: 15 Aug 2026 – 14 Aug 2027\nSigned: 5 Jun 2026');
  a.download = 'AGR-2026-001-Agreement.txt';
  a.click();
}

function shareAgreement() {
  AudioEngine.init(); AudioEngine.playTap(); haptic('light');
  if (navigator.share) {
    navigator.share({ title: 'Tenancy Agreement AGR-2026-001', text: 'Your signed tenancy agreement is ready. Ref: AGR-2026-001', url: window.location.href });
  }
}

function activationComplete() {
  AudioEngine.init(); AudioEngine.playTap(); haptic('light');
  closeModal('activationModal');
  showSignedScreen();
}

function goToPayment() {
  AudioEngine.init(); AudioEngine.playTap(); haptic('light');
  window.location.href = 'landlord_payment.html';
}

function goBack() { AudioEngine.init(); AudioEngine.playTap(); haptic('light'); window.history.back(); }
function closeModal(id) { AudioEngine.init(); AudioEngine.playTap(); haptic('light'); document.getElementById(id).classList.remove('active'); }
function closeModals(e) { if (e.target.classList.contains('modal-overlay')) { e.target.classList.remove('active'); } }

document.querySelectorAll('.agree-section, .vault-card, .sig-card').forEach(el => {
  el.addEventListener('click', e => { AudioEngine.init(); createRipple(e, el); });
});
document.addEventListener('click', () => AudioEngine.init(), { once: true });
document.addEventListener('touchstart', () => AudioEngine.init(), { once: true });
