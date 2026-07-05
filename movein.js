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
        welcome() {
            // Warm ascending chime
            if (!this.ctx) return;
            const t = this.ctx.currentTime;
            const freqs = [330, 392, 494, 523, 659, 784, 1047];
            freqs.forEach((f, i) => {
                const o = this.ctx.createOscillator(), g = this.ctx.createGain();
                o.type = 'sine';
                o.frequency.setValueAtTime(f, t + i * .1);
                g.gain.setValueAtTime(.012, t + i * .1);
                g.gain.exponentialRampToValueAtTime(.001, t + i * .1 + .4);
                o.connect(g); g.connect(this.ctx.destination);
                o.start(t + i * .1); o.stop(t + i * .1 + .45);
            });
        }
    };
    function haptic(p) { if (navigator.vibrate) navigator.vibrate(p || [8]); }
    document.addEventListener('click', () => Audio.init(), { once: true });
    document.addEventListener('touchstart', () => Audio.init(), { once: true });

    // ── CHECKLIST TOGGLE ──────────────────────────────────
    function toggleCheck(el) {
        Audio.tap(); haptic([8]);
        el.classList.toggle('checked');
    }

    // ── CONTACT ACTIONS ───────────────────────────────────
    function contactAction(type) {
        Audio.tap(); haptic([8]);
        if (type === 'call') {
            alert('Calling Mr. Emmanuel Okon...');
        } else if (type === 'message') {
            alert('Opening message thread with property manager...');
        } else if (type === 'directions') {
            alert('Opening directions to Shelter Afrique Estate...');
        }
    }

    // ── VIEW DOCUMENT ─────────────────────────────────────
    function viewDoc(type) {
        Audio.tap(); haptic([8]);
        alert('Opening ' + type + ' document...');
    }

    // ── REPORT ISSUE ──────────────────────────────────────
    function reportIssue(type) {
        Audio.tap(); haptic([8]);
        const issues = {
            described: 'Property Not As Described',
            keys: 'Keys Not Available',
            unreachable: 'Landlord Unreachable',
            payment: 'Payment Dispute'
        };
        alert('Reporting issue: ' + issues[type] + '\n\nDomot! will notify the property manager and begin resolution tracking.');
    }

    // ── CONFIRM KEYS ──────────────────────────────────────
    function confirmKeys() {
        Audio.init(); haptic([10, 60, 10, 60, 30, 60, 20]);
        const btn = document.querySelector('.pay-btn');
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Confirming...`;
        btn.disabled = true;
        btn.style.opacity = '.75';

        setTimeout(() => {
            Audio.welcome();
            haptic([15, 40, 15, 40, 15, 80, 40]);
            document.getElementById('welcomeOverlay').classList.add('active');
        }, 1400);
    }

    // ── WELCOME ACTIONS ───────────────────────────────────
    function goToDashboard() {
        Audio.tap(); haptic([8, 30]);
        setTimeout(() => { window.location.href = 'tenancy.html'; }, 180);
    }
    function saveWelcome() {
        Audio.tap(); haptic([8]);
        const btn = event.target;
        btn.textContent = 'Saved ✓';
        btn.style.color = 'var(--green)';
        setTimeout(() => { btn.textContent = 'Save Move-In Details'; btn.style.color = ''; }, 2200);
    }

    // ── NAV ───────────────────────────────────────────────
    function goBack() { Audio.tap(); haptic([8]); window.location.href = 'payment.html'; }
