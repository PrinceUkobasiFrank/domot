// ── AUDIO ──────────────────────────────────────────────
    const Audio = {
        ctx: null,
        init() {
            if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            if (this.ctx.state === 'suspended') this.ctx.resume();
        },
        tap() {
            if (!this.ctx) return;
            const t = this.ctx.currentTime;
            const o = this.ctx.createOscillator(), g = this.ctx.createGain();
            o.type = 'sine'; o.frequency.setValueAtTime(1100, t);
            g.gain.setValueAtTime(.011, t); g.gain.exponentialRampToValueAtTime(.001, t+.05);
            o.connect(g); g.connect(this.ctx.destination);
            o.start(t); o.stop(t+.05);
        },
        secure() {
            // Ascending vault lock sound
            if (!this.ctx) return;
            const t = this.ctx.currentTime;
            const freqs = [220, 277, 330, 440, 554, 659, 880];
            freqs.forEach((f, i) => {
                const o = this.ctx.createOscillator(), g = this.ctx.createGain();
                o.type = i < 4 ? 'sine' : 'triangle';
                o.frequency.setValueAtTime(f, t + i * .08);
                g.gain.setValueAtTime(.008, t + i * .08);
                g.gain.exponentialRampToValueAtTime(.001, t + i * .08 + .3);
                o.connect(g); g.connect(this.ctx.destination);
                o.start(t + i * .08); o.stop(t + i * .08 + .35);
            });
            // Final vault thud
            setTimeout(() => {
                if (!this.ctx) return;
                const t2 = this.ctx.currentTime;
                const o2 = this.ctx.createOscillator(), g2 = this.ctx.createGain();
                o2.type = 'sawtooth'; o2.frequency.setValueAtTime(80, t2);
                o2.frequency.exponentialRampToValueAtTime(40, t2 + .12);
                g2.gain.setValueAtTime(.04, t2); g2.gain.exponentialRampToValueAtTime(.001, t2 + .2);
                o2.connect(g2); g2.connect(this.ctx.destination);
                o2.start(t2); o2.stop(t2 + .25);
            }, freqs.length * 80 + 100);
        }
    };
    function haptic(p) { if (navigator.vibrate) navigator.vibrate(p || [8]); }
    document.addEventListener('click', () => Audio.init(), { once: true });
    document.addEventListener('touchstart', () => Audio.init(), { once: true });

    // ── BREAKDOWN TOGGLE ───────────────────────────────────
    function toggleBreakdown() {
        Audio.tap(); haptic([8]);
        const d = document.getElementById('breakdownDetail');
        const t = document.getElementById('breakdownToggle');
        const open = d.classList.toggle('open');
        t.classList.toggle('open', open);
        t.lastChild.textContent = open ? ' Hide Breakdown' : ' View Full Breakdown';
    }

    // ── METHOD SELECTION ──────────────────────────────────
    function selectMethod(el) {
        Audio.tap(); haptic([8]);
        document.querySelectorAll('.method-row').forEach(r => r.classList.remove('selected'));
        el.classList.add('selected');
        const opayDetail = document.getElementById('opayDetail');
        if (el.dataset.method === 'opay') {
            opayDetail.classList.add('visible');
        } else {
            opayDetail.classList.remove('visible');
        }
    }

    // ── WHY OVERLAY ───────────────────────────────────────
    function openWhyOverlay() {
        Audio.tap(); haptic([8]);
        document.getElementById('whyOverlay').classList.add('open');
    }
    function closeWhyOverlay() {
        Audio.tap(); haptic([8]);
        document.getElementById('whyOverlay').classList.remove('open');
    }

    // ── PAYMENT ───────────────────────────────────────────
    function initiatePayment() {
        Audio.init(); haptic([10, 60, 10, 60, 30, 60, 20]);
        const btn = document.querySelector('.pay-btn');
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Processing…`;
        btn.disabled = true;
        btn.style.opacity = '.75';

        // Set receipt date
        const now = new Date();
        document.getElementById('receiptDate').textContent =
            now.toLocaleDateString('en-NG', { day:'numeric', month:'long', year:'numeric' }) +
            ' · ' + now.toLocaleTimeString('en-NG', { hour:'2-digit', minute:'2-digit' });

        setTimeout(() => {
            Audio.secure();
            haptic([15, 40, 15, 40, 15, 80, 40]);
            buildBarcode();
            document.getElementById('successOverlay').classList.add('active');
        }, 1400);
    }

    function buildBarcode() {
        const bc = document.getElementById('bcLines');
        bc.innerHTML = '';
        const widths = [3,1,2,4,1,3,2,1,4,2,1,3,2,4,1,2,3,1,4,2,1,3,2,1,4,2,3,1,2,4];
        widths.forEach(w => {
            const l = document.createElement('div');
            l.className = 'bcl';
            l.style.width = w + 'px';
            l.style.height = (Math.random() > .3 ? 28 : 20) + 'px';
            bc.appendChild(l);
        });
    }

    // ── NAV ───────────────────────────────────────────────
    function goBack() { Audio.tap(); haptic([8]); window.location.href = 'agreement.html'; }
    function goToMoveIn() { Audio.tap(); haptic([8,30]); setTimeout(() => { window.location.href = "movein.html"; }, 180); }
    function saveReceipt() {
        Audio.tap(); haptic([8]);
        const btn = event.target;
        btn.textContent = 'Receipt Saved ✓';
        btn.style.color = 'var(--green)';
        setTimeout(() => { btn.textContent = 'Save Receipt'; btn.style.color = ''; }, 2200);
    }
