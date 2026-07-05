// ==================== AUDIO ====================
    const AudioEngine = {
        ctx: null,
        init() {
            if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            if (this.ctx.state === 'suspended') this.ctx.resume();
        },
        playTap() {
            if (!this.ctx) return;
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1100, t);
            gain.gain.setValueAtTime(0.012, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
            osc.connect(gain); gain.connect(this.ctx.destination);
            osc.start(t); osc.stop(t + 0.05);
        },
        playSuccess() {
            if (!this.ctx) return;
            const t = this.ctx.currentTime;
            const freqs = [523, 659, 784, 1046];
            freqs.forEach((f, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, t + i * 0.07);
                gain.gain.setValueAtTime(0.01, t + i * 0.07);
                gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.25);
                osc.connect(gain); gain.connect(this.ctx.destination);
                osc.start(t + i * 0.07); osc.stop(t + i * 0.07 + 0.3);
            });
        }
    };

    function haptic(type = 'light') {
        if (!navigator.vibrate) return;
        const patterns = { light: [8], success: [10, 40, 10, 40, 20] };
        navigator.vibrate(patterns[type] || patterns.light);
    }

    // ==================== EXPAND AGREEMENT ====================
    function toggleAgreement() {
        AudioEngine.init(); AudioEngine.playTap(); haptic('light');
        const panel = document.getElementById('fullAgreement');
        const btn = document.getElementById('expandBtn');
        const isOpen = panel.classList.contains('open');
        panel.classList.toggle('open', !isOpen);
        btn.classList.toggle('open', !isOpen);
        btn.innerHTML = isOpen
            ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg> Read Full Agreement`
            : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg> Hide Full Agreement`;
    }

    // ==================== SIGNATURE PAD ====================
    const canvas = document.getElementById('sigCanvas');
    const ctx = canvas.getContext('2d');
    const pad = document.getElementById('sigPad');
    const placeholder = document.getElementById('sigPlaceholder');
    let isDrawing = false;
    let hasSigned = false;

    function resizeCanvas() {
        const rect = pad.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function startDraw(e) {
        e.preventDefault();
        isDrawing = true;
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        placeholder.style.opacity = '0';
    }

    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        const pos = getPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        hasSigned = true;
    }

    function endDraw() {
        isDrawing = false;
        ctx.beginPath();
    }

    pad.addEventListener('mousedown', startDraw);
    pad.addEventListener('mousemove', draw);
    pad.addEventListener('mouseup', endDraw);
    pad.addEventListener('mouseleave', endDraw);
    pad.addEventListener('touchstart', startDraw, { passive: false });
    pad.addEventListener('touchmove', draw, { passive: false });
    pad.addEventListener('touchend', endDraw);

    function clearSignature() {
        AudioEngine.init(); AudioEngine.playTap(); haptic('light');
        const rect = pad.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, rect.height);
        placeholder.style.opacity = '0.6';
        hasSigned = false;
    }

    function useVerifiedIdentity() {
        AudioEngine.init(); AudioEngine.playTap(); haptic('light');
        const rect = pad.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, rect.height);
        placeholder.style.opacity = '0';
        hasSigned = true;
        ctx.strokeStyle = 'rgba(124, 92, 250, 0.8)';
        ctx.lineWidth = 2;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 8, cy);
        ctx.lineTo(cx - 2, cy + 6);
        ctx.lineTo(cx + 10, cy - 6);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.lineWidth = 2.5;
    }

    // ==================== SIGN AGREEMENT ====================
    function signAgreement() {
        AudioEngine.init();
        if (!hasSigned) {
            AudioEngine.playTap();
            haptic('light');
            pad.style.animation = 'none';
            pad.offsetHeight;
            pad.style.animation = 'shake 0.4s ease';
            setTimeout(() => { pad.style.animation = ''; }, 400);
            return;
        }
        AudioEngine.playSuccess(); haptic('success');
        showOtp();
        return;
    }
    const shakeStyle = document.createElement('style');
    shakeStyle.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-6px); }
            40% { transform: translateX(6px); }
            60% { transform: translateX(-4px); }
            80% { transform: translateX(4px); }
        }
    `;
    document.head.appendChild(shakeStyle);

    // ==================== TOAST NOTIFICATION ====================
    function showToast(icon, title, sub, color = '#0ec97f') {
        const existing = document.getElementById('domotToast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.id = 'domotToast';
        toast.innerHTML = `
            <div style="width:38px;height:38px;border-radius:12px;background:${color}22;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                ${icon}
            </div>
            <div style="flex:1;min-width:0;">
                <div style="font-family:var(--font-display);font-size:13px;font-weight:700;color:#fff;letter-spacing:-0.2px;margin-bottom:2px;">${title}</div>
                <div style="font-size:12px;color:rgba(255,255,255,0.55);line-height:1.4;">${sub}</div>
            </div>`;
        toast.style.cssText = `
            position:fixed; top:max(16px,env(safe-area-inset-top));
            left:16px; right:16px;
            z-index:500;
            display:flex; align-items:center; gap:14px;
            padding:14px 16px;
            border-radius:20px;
            background:rgba(22,22,38,0.96);
            box-shadow:0 8px 40px rgba(0,0,0,0.5), inset 0 0 0 1px ${color}33;
            backdrop-filter:blur(24px);
            -webkit-backdrop-filter:blur(24px);
            transform:translateY(-80px);
            opacity:0;
            transition:transform 0.45s cubic-bezier(0.16,1,0.3,1), opacity 0.35s ease;`;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                toast.style.transform = 'translateY(0)';
                toast.style.opacity = '1';
            });
        });

        setTimeout(() => {
            toast.style.transform = 'translateY(-80px)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 450);
        }, 3800);
    }

    // ==================== OTP ====================
    function showOtp() {
        const overlay = document.getElementById('otpOverlay');
        overlay.style.display = 'flex';
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const sheet = overlay.querySelector('div');
                sheet.style.transform = 'translateY(0)';
                sheet.style.opacity = '1';
            });
        });
        setTimeout(() => {
            const first = overlay.querySelector('input');
            if (first) first.focus();
        }, 350);
    }

    function closeOtp() {
        AudioEngine.init(); AudioEngine.playTap(); haptic('light');
        const overlay = document.getElementById('otpOverlay');
        const sheet = overlay.querySelector('div');
        sheet.style.transform = 'translateY(40px)';
        sheet.style.opacity = '0';
        setTimeout(() => { overlay.style.display = 'none'; }, 300);
        // Clear inputs
        overlay.querySelectorAll('input').forEach(i => i.value = '');
    }

    function otpNext(input, index) {
        AudioEngine.init(); AudioEngine.playTap(); haptic('light');
        const inputs = document.querySelectorAll('#otpInputs input');
        if (input.value.length === 1 && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }
        // Auto-confirm when all 6 filled
        const allFilled = Array.from(inputs).every(i => i.value.length === 1);
        if (allFilled) {
            setTimeout(confirmOtp, 300);
        }
    }

    function confirmOtp() {
        AudioEngine.init(); AudioEngine.playSuccess(); haptic('success');

        const inputs = document.querySelectorAll('#otpInputs input');
        const code = Array.from(inputs).map(i => i.value).join('');
        if (code.length < 6) {
            // Shake the inputs
            const inputRow = document.getElementById('otpInputs');
            inputRow.style.animation = 'none';
            inputRow.offsetHeight;
            inputRow.style.animation = 'shake 0.4s ease';
            setTimeout(() => inputRow.style.animation = '', 400);
            return;
        }

        // Close OTP and execute
        closeOtp();
        setTimeout(_executeSign, 350);
    }

    function _executeSign() {
        haptic('success');
        const btn = document.getElementById('signBtn');
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Executing…`;
        btn.disabled = true;
        btn.style.opacity = '0.7';

        // Update tenant sig status to signed
        const sigStatus = document.getElementById('tenantSigStatus');
        if (sigStatus) {
            sigStatus.className = 'sig-status signed';
            sigStatus.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Signed`;
        }

        setTimeout(() => {
            // Show success toast while transitioning
            showToast(
                `<svg viewBox="0 0 24 24" fill="none" stroke="#0ec97f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>`,
                'Agreement Signed!',
                'Your e-signature has been applied. Both parties have signed.',
                '#0ec97f'
            );

            const agreement = document.getElementById('agreementScreen');
            const success = document.getElementById('successScreen');
            agreement.classList.add('slide-left');
            setTimeout(() => {
                agreement.classList.add('hidden');
                agreement.classList.remove('slide-left');
                success.classList.remove('hidden');
                success.scrollTop = 0;

                btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Sign Agreement`;
                btn.disabled = false;
                btn.style.opacity = '';
            }, 400);
        }, 1100);
    }

    function goBack() {
        AudioEngine.init(); AudioEngine.playTap(); haptic('light');
        window.location.href = 'application_review.html';
    }

    function goToPayment() {
        AudioEngine.init(); AudioEngine.playSuccess(); haptic('success');
        showToast(
            `<svg viewBox="0 0 24 24" fill="none" stroke="#7c5cfa" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
            'Heading to Payment',
            'Rent + fees. Secured by Domot! escrow.',
            '#7c5cfa'
        );
        setTimeout(() => { window.location.href = 'payment.html'; }, 700);
    }

    function downloadAgreement() {
        AudioEngine.init(); AudioEngine.playTap(); haptic('light');
        showToast(
            `<svg viewBox="0 0 24 24" fill="none" stroke="#f0a500" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
            'Agreement PDF Saved',
            'Saved to your downloads folder.',
            '#f0a500'
        );
    }

    document.addEventListener('click', () => AudioEngine.init(), { once: true });
    document.addEventListener('touchstart', () => AudioEngine.init(), { once: true });
