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
                osc.frequency.setValueAtTime(f, t + i * 0.08);
                gain.gain.setValueAtTime(0.012, t + i * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.28);
                osc.connect(gain); gain.connect(this.ctx.destination);
                osc.start(t + i * 0.08); osc.stop(t + i * 0.08 + 0.3);
            });
        }
    };

    function haptic(type = 'light') {
        if (!navigator.vibrate) return;
        const patterns = { light: [8], success: [10, 40, 10, 40, 20] };
        navigator.vibrate(patterns[type] || patterns.light);
    }

    // ==================== CELEBRATION PARTICLES ====================
    const canvas = document.getElementById('particleCanvas');
    const ctx2d = canvas.getContext('2d');
    let particles = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function spawnParticles() {
        const colors = ['#0ec97f', '#3df5ad', '#7c5cfa', '#f0a500', '#fff'];
        for (let i = 0; i < 55; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: -10 - Math.random() * 60,
                vx: (Math.random() - 0.5) * 2.5,
                vy: 1.5 + Math.random() * 3,
                size: 3 + Math.random() * 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                rotation: Math.random() * Math.PI * 2,
                spin: (Math.random() - 0.5) * 0.18,
                shape: Math.random() > 0.5 ? 'circle' : 'rect'
            });
        }
    }

    function animateParticles() {
        ctx2d.clearRect(0, 0, canvas.width, canvas.height);
        particles = particles.filter(p => p.alpha > 0.02);
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.spin;
            p.alpha -= 0.008;
            ctx2d.globalAlpha = p.alpha;
            ctx2d.fillStyle = p.color;
            ctx2d.save();
            ctx2d.translate(p.x, p.y);
            ctx2d.rotate(p.rotation);
            if (p.shape === 'circle') {
                ctx2d.beginPath();
                ctx2d.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                ctx2d.fill();
            } else {
                ctx2d.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.55);
            }
            ctx2d.restore();
        });
        ctx2d.globalAlpha = 1;
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // Fire celebration on load
    setTimeout(() => {
        AudioEngine.init();
        AudioEngine.playSuccess();
        haptic('success');
        spawnParticles();
        setTimeout(spawnParticles, 400);
        setTimeout(spawnParticles, 750);
    }, 600);

    // ==================== NAV ====================
    function goBack() {
        AudioEngine.init(); AudioEngine.playTap(); haptic('light');
        setTimeout(() => { window.history.back(); }, 180);
    }

    function goToAgreement() {
        AudioEngine.init(); AudioEngine.playSuccess(); haptic('success');
        const btn = document.querySelector('.btn-agreement');
        btn.textContent = 'Opening…';
        btn.style.opacity = '0.75';
        setTimeout(() => {
            window.location.href = 'agreement.html';
        }, 500);
    }

    document.addEventListener('click', () => AudioEngine.init(), { once: true });
    document.addEventListener('touchstart', () => AudioEngine.init(), { once: true });
