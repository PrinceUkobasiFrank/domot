const AudioEngine = {
  ctx: null,
  init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); if (this.ctx.state === 'suspended') this.ctx.resume(); },
  playTap() { if (!this.ctx) return; const t = this.ctx.currentTime; const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain(); osc.type = 'sine'; osc.frequency.setValueAtTime(1100, t); gain.gain.setValueAtTime(0.012, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05); osc.connect(gain); gain.connect(this.ctx.destination); osc.start(t); osc.stop(t + 0.05); },
  playSuccess() { if (!this.ctx) return; const t = this.ctx.currentTime; [0, 0.1, 0.22].forEach((d, i) => { const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain(); osc.type = 'sine'; osc.frequency.setValueAtTime([550, 700, 880][i], t + d); gain.gain.setValueAtTime(0.015, t + d); gain.gain.exponentialRampToValueAtTime(0.001, t + d + 0.15); osc.connect(gain); gain.connect(this.ctx.destination); osc.start(t + d); osc.stop(t + d + 0.15); }); },
  playDecline() { if (!this.ctx) return; const t = this.ctx.currentTime; const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain(); osc.type = 'sine'; osc.frequency.setValueAtTime(300, t); osc.frequency.exponentialRampToValueAtTime(180, t + 0.25); gain.gain.setValueAtTime(0.015, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25); osc.connect(gain); gain.connect(this.ctx.destination); osc.start(t); osc.stop(t + 0.25); }
};

function haptic(type = 'light') { if (!navigator.vibrate) return; const patterns = { light: [8], medium: [15], success: [10, 50, 10, 50, 20] }; navigator.vibrate(patterns[type] || patterns.light); }
function createRipple(e, el) { const rect = el.getBoundingClientRect(); const r = document.createElement('span'); r.className = 'ripple'; const size = Math.max(rect.width, rect.height); r.style.width = r.style.height = size + 'px'; r.style.left = (e.clientX - rect.left - size / 2) + 'px'; r.style.top = (e.clientY - rect.top - size / 2) + 'px'; el.appendChild(r); setTimeout(() => r.remove(), 550); }

// Count-up animation
function countUp(el, target, duration, suffix) {
  const hasDenom = el.hasAttribute('data-denom');
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start = Math.min(start + step, target);
    const val = Math.round(start);
    if (hasDenom) {
      el.innerHTML = val + '<span style="font-size:14px;color:var(--text-dim);font-family:var(--font-body);font-weight:600;">/100</span>';
    } else {
      el.textContent = val + (suffix || '');
    }
    if (start >= target) clearInterval(timer);
  }, 16);
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    countUp(document.getElementById('scoreDisplay'), 91, 1800);
    ['bd1','bd2','bd3','bd4','bd5'].forEach(id => { document.getElementById(id).setAttribute('data-denom','1'); });
    countUp(document.getElementById('bd1'), 94, 1200);
    countUp(document.getElementById('bd2'), 88, 1200);
    countUp(document.getElementById('bd3'), 92, 1200);
    countUp(document.getElementById('bd4'), 90, 1200);
    countUp(document.getElementById('bd5'), 91, 1200);
    countUp(document.getElementById('matchDisplay'), 94, 1500, '%');
  }, 400);
});

function toggleRef(card) {
  AudioEngine.init(); AudioEngine.playTap(); haptic('light');
  const details = card.querySelector('.ref-details');
  const arrow = card.querySelector('.ref-expand');
  details.classList.toggle('open');
  arrow.classList.toggle('open');
}

function openApproveModal() { AudioEngine.init(); AudioEngine.playTap(); haptic('medium'); document.getElementById('approveModal').classList.add('active'); }
function openDeclineModal() { AudioEngine.init(); AudioEngine.playTap(); haptic('medium'); document.getElementById('declineModal').classList.add('active'); }
function onRequestInfo() { AudioEngine.init(); AudioEngine.playTap(); haptic('light'); document.getElementById('infoModal').classList.add('active'); }
function onSchedule() { AudioEngine.init(); AudioEngine.playTap(); haptic('light'); document.getElementById('scheduleModal').classList.add('active'); }
function closeModal(id) { AudioEngine.init(); AudioEngine.playTap(); haptic('light'); document.getElementById(id).classList.remove('active'); }
function closeModals(e) { if (e.target.classList.contains('modal-overlay')) { e.target.classList.remove('active'); } }

let selectedDeclineReason = null;
function selectReason(el) {
  AudioEngine.init(); AudioEngine.playTap(); haptic('light');
  document.querySelectorAll('.reason-option').forEach(r => r.classList.remove('selected'));
  el.classList.add('selected');
  selectedDeclineReason = el.textContent;
  const btn = document.getElementById('declineConfirmBtn');
  btn.style.opacity = '1'; btn.style.cursor = 'pointer';
}

function confirmDecline() {
  if (!selectedDeclineReason) return;
  AudioEngine.init(); AudioEngine.playDecline(); haptic('medium');
  closeModal('declineModal');
  document.getElementById('stickyBar').style.display = 'none';
}

function generateAgreement() {
  AudioEngine.init(); AudioEngine.playSuccess(); haptic('success');
  closeModal('approveModal');
  document.getElementById('stickyBar').style.display = 'none';
  setTimeout(() => { window.location.href = 'agreement.html'; }, 350);
}

function previewDoc(e) { e.stopPropagation(); AudioEngine.init(); AudioEngine.playTap(); haptic('light'); }
function goBack() { AudioEngine.init(); AudioEngine.playTap(); haptic('light'); window.history.back(); }

document.querySelectorAll('.decision-btn, .ref-card, .doc-card').forEach(el => {
  el.addEventListener('click', (e) => { AudioEngine.init(); createRipple(e, el); });
});
document.addEventListener('click', () => AudioEngine.init(), { once: true });
document.addEventListener('touchstart', () => AudioEngine.init(), { once: true });
