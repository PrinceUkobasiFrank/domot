// ==================== AUDIO ENGINE (Web Audio API) ====================
        const AudioEngine = {
            ctx: null,
            init() {
                if (!this.ctx) {
                    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
                }
                if (this.ctx.state === 'suspended') {
                    this.ctx.resume();
                }
            },

            playIceCrackle() {
                if (!this.ctx) return;
                const t = this.ctx.currentTime;
                for (let i = 0; i < 8; i++) {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    const filter = this.ctx.createBiquadFilter();
                    filter.type = 'highpass';
                    filter.frequency.value = 2000 + Math.random() * 4000;
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(8000 + Math.random() * 6000, t + i * 0.04);
                    osc.frequency.exponentialRampToValueAtTime(100, t + i * 0.04 + 0.08);
                    gain.gain.setValueAtTime(0.015, t + i * 0.04);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.04 + 0.08);
                    osc.connect(filter);
                    filter.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(t + i * 0.04);
                    osc.stop(t + i * 0.04 + 0.1);
                }
            },

            playChime() {
                if (!this.ctx) return;
                const t = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, t);
                osc.frequency.exponentialRampToValueAtTime(440, t + 0.15);
                gain.gain.setValueAtTime(0.04, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + 0.2);
            },

            playThud() {
                if (!this.ctx) return;
                const t = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(120, t);
                osc.frequency.exponentialRampToValueAtTime(40, t + 0.3);
                gain.gain.setValueAtTime(0.06, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + 0.3);
            }
        };

        // ==================== HAPTIC FEEDBACK ====================
        function haptic(type = 'light') {
            if (!navigator.vibrate) return;
            const patterns = {
                light: [10],
                medium: [20],
                heavy: [30],
                success: [10, 50, 10],
                error: [30, 30, 30]
            };
            navigator.vibrate(patterns[type] || patterns.light);
        }

        // ==================== SPLASH SCREEN ====================
        const splash = document.getElementById('splash');
        const app = document.getElementById('app');
        const bgLayer = document.getElementById('bgLayer');

        const bgImg = new Image();
        bgImg.src = 'bg.png';

        // Dismiss after sweep + footer have played out (~3.2s total feel)
        setTimeout(() => {
            splash.classList.add('hidden');
            app.classList.add('visible');
            AudioEngine.playIceCrackle();
            setTimeout(checkBiometric, 600);
        }, 3200);

        // ==================== PARALLAX TILT (Gyroscope) ====================
        let tiltX = 0, tiltY = 0;
        let targetTiltX = 0, targetTiltY = 0;
        let parallaxActive = false;

        function startParallax() {
            if (parallaxActive) return;
            parallaxActive = true;
            window.addEventListener('deviceorientation', (e) => {
                const gamma = e.gamma || 0;
                const beta = e.beta || 0;
                targetTiltX = Math.max(-20, Math.min(20, gamma)) * 1.5;
                targetTiltY = Math.max(-20, Math.min(20, beta - 45)) * 1.5;
            });
        }

        if (typeof DeviceOrientationEvent !== 'undefined' && 
            typeof DeviceOrientationEvent.requestPermission === 'function') {
            // iOS: permission requested on first user interaction
        } else if (window.DeviceOrientationEvent) {
            startParallax();
        }

        function animateParallax() {
            tiltX += (targetTiltX - tiltX) * 0.08;
            tiltY += (targetTiltY - tiltY) * 0.08;
            bgLayer.style.transform = `translate(${-tiltX}px, ${-tiltY}px) scale(1.05)`;
            requestAnimationFrame(animateParallax);
        }
        animateParallax();

        document.addEventListener('mousemove', (e) => {
            if (window.innerWidth > 768) {
                targetTiltX = (e.clientX / window.innerWidth - 0.5) * 30;
                targetTiltY = (e.clientY / window.innerHeight - 0.5) * 30;
            }
        });

        // ==================== AMBIENT PARTICLES ====================
        const ambient = document.getElementById('ambient');
        for (let i = 0; i < 12; i++) {
            const dot = document.createElement('div');
            dot.className = 'ambient-dot';
            dot.style.left = Math.random() * 100 + '%';
            dot.style.top = Math.random() * 100 + '%';
            dot.style.animationDelay = Math.random() * 20 + 's';
            dot.style.animationDuration = (15 + Math.random() * 10) + 's';
            dot.style.width = (2 + Math.random() * 3) + 'px';
            dot.style.height = dot.style.width;
            ambient.appendChild(dot);
        }

        // ==================== BIOMETRIC AUTH ====================
        const bioPrompt = document.getElementById('bioPrompt');
        const bioYes = document.getElementById('bioYes');
        const bioNo = document.getElementById('bioNo');

        async function checkBiometric() {
            if (window.PublicKeyCredential && 
                typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
                try {
                    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
                    if (available) {
                        bioPrompt.classList.add('active');
                        haptic('medium');
                    }
                } catch (e) {
                    console.log('Biometric not available');
                }
            }
        }

        bioYes.addEventListener('click', async () => {
            AudioEngine.init();
            AudioEngine.playChime();
            haptic('success');
            bioPrompt.classList.remove('active');
            setTimeout(() => {
                window.location.href = 'onboard.html';
            }, 300);
        });

        bioNo.addEventListener('click', () => {
            AudioEngine.init();
            AudioEngine.playThud();
            haptic('light');
            bioPrompt.classList.remove('active');
            setTimeout(() => {
                window.location.href = 'onboard.html';
            }, 300);
        });

        // ==================== BUTTON INTERACTIONS ====================
        document.querySelectorAll('.btn-glass').forEach(btn => {
            btn.addEventListener('click', function(e) {
                AudioEngine.init();
                AudioEngine.playChime();
                haptic('light');

                // Request gyro permission on iOS
                if (typeof DeviceOrientationEvent !== 'undefined' && 
                    typeof DeviceOrientationEvent.requestPermission === 'function' && 
                    !parallaxActive) {
                    DeviceOrientationEvent.requestPermission()
                        .then(permissionState => {
                            if (permissionState === 'granted') startParallax();
                        })
                        .catch(console.error);
                }

                // Ripple effect
                const ripple = document.createElement('span');
                ripple.className = 'ripple';
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
                ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), 500);

                // Skeleton loading state then navigate
                const provider = this.dataset.provider;
                this.classList.add('loading');
                setTimeout(() => {
                    window.location.href = 'onboard.html';
                }, 1200);
            });
        });

        // Login link
        document.getElementById('loginLink').addEventListener('click', (e) => {
            e.preventDefault();
            AudioEngine.init();
            AudioEngine.playChime();
            haptic('light');
            setTimeout(() => {
                window.location.href = 'onboard.html';
            }, 200);
        });
