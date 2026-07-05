// ==================== AUDIO ENGINE ====================
        const AudioEngine = {
            ctx: null,
            init() {
                if (!this.ctx) {
                    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
                }
                if (this.ctx.state === 'suspended') this.ctx.resume();
            },

            playType(char) {
                if (!this.ctx) return;
                const t = this.ctx.currentTime;
                let baseFreq = 1200;
                if ('aeiou'.includes(char.toLowerCase())) baseFreq = 1100;
                else if ('.,!?'.includes(char)) baseFreq = 1600;
                else if (char === ' ') baseFreq = 800;
                else if (char === char.toUpperCase() && /[A-Z]/.test(char)) baseFreq = 1500;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const filter = this.ctx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.value = baseFreq;
                filter.Q.value = 8;
                osc.type = 'square';
                osc.frequency.setValueAtTime(baseFreq + Math.random() * 150, t);
                osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, t + 0.02);
                gain.gain.setValueAtTime(0.012, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
                osc.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
                osc.start(t); osc.stop(t + 0.05);
            },

            playChipSelect() {
                if (!this.ctx) return;
                const t = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, t);
                osc.frequency.exponentialRampToValueAtTime(900, t + 0.08);
                gain.gain.setValueAtTime(0.025, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
                osc.connect(gain); gain.connect(this.ctx.destination);
                osc.start(t); osc.stop(t + 0.15);
            },

            playChipAppear() {
                if (!this.ctx) return;
                const t = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, t);
                osc.frequency.exponentialRampToValueAtTime(600, t + 0.08);
                gain.gain.setValueAtTime(0.01, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
                osc.connect(gain); gain.connect(this.ctx.destination);
                osc.start(t); osc.stop(t + 0.1);
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
                osc.connect(gain); gain.connect(this.ctx.destination);
                osc.start(t); osc.stop(t + 0.2);
            }
        };

        // ==================== HAPTIC ====================
        function haptic(type = 'light') {
            if (!navigator.vibrate) return;
            const patterns = { light: [8], medium: [15], success: [10, 40, 10], cardPop: [5, 30, 5] };
            navigator.vibrate(patterns[type] || patterns.light);
        }

        // ==================== PARALLAX ====================
        let tiltX = 0, tiltY = 0, targetTiltX = 0, targetTiltY = 0, parallaxActive = false;
        const bgLayer = document.getElementById('bgLayer');

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
            // iOS — request on interaction
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
        for (let i = 0; i < 10; i++) {
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

        // ==================== TYPEWRITER ====================
        class Typewriter {
            constructor(element, text, onComplete = null) {
                this.element = element;
                this.text = text;
                this.onComplete = onComplete;
                this.index = 0;
                this.cursor = document.createElement('span');
                this.cursor.className = 'typewriter-cursor';
            }

            getDelay(char) {
                if ('.,!?;'.includes(char)) return 320;
                if (char === ' ') return 75;
                if (char === char.toUpperCase() && /[A-Z]/.test(char)) return 90;
                if ('aeiou'.includes(char.toLowerCase())) return 45;
                return 55 + Math.random() * 25;
            }

            start() {
                this.element.innerHTML = '';
                this.element.appendChild(this.cursor);
                this.type();
            }

            type() {
                if (this.index < this.text.length) {
                    const char = this.text.charAt(this.index);
                    this.cursor.before(char);
                    this.index++;
                    AudioEngine.playType(char);
                    setTimeout(() => this.type(), this.getDelay(char));
                } else {
                    this.cursor.classList.add('done');
                    setTimeout(() => this.cursor.remove(), 500);
                    if (this.onComplete) this.onComplete();
                }
            }
        }

        // ==================== CONFETTI ====================
        function spawnConfetti(x, y) {
            const colors = ['#a78bfa', '#8b5cf6', '#c4b5fd', '#ffffff', '#ddd6fe'];
            for (let i = 0; i < 10; i++) {
                const c = document.createElement('div');
                c.className = 'confetti';
                c.style.left = x + 'px';
                c.style.top = y + 'px';
                c.style.background = colors[Math.floor(Math.random() * colors.length)];
                const angle = (Math.PI * 2 * i) / 10;
                const dist = 35 + Math.random() * 50;
                c.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
                c.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
                c.style.animation = 'confettiBurst 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
                document.body.appendChild(c);
                setTimeout(() => c.remove(), 600);
            }
        }

        // ==================== ENTRANCE SEQUENCE ====================
        function startEntrance() {
            const title = document.getElementById('typeTitle');
            const subtitle = document.getElementById('typeSubtitle');
            const chips = document.querySelectorAll('.chip');
            const ctaWrapper = document.getElementById('ctaWrapper');
            const footer = document.getElementById('footerNote');

            const titleWriter = new Typewriter(title, 'What are you looking for?', () => {
                setTimeout(() => {
                    const subWriter = new Typewriter(subtitle, 'Pick all that apply.', () => {
                        // Stagger chips in
                        chips.forEach((chip, i) => {
                            setTimeout(() => {
                                chip.classList.add('visible');
                                AudioEngine.playChipAppear();
                                haptic('cardPop');
                            }, 100 + i * 80);
                        });

                        // CTA and footer after all chips
                        const allChipsDelay = 100 + chips.length * 80 + 300;
                        setTimeout(() => {
                            ctaWrapper.classList.add('visible');
                        }, allChipsDelay);
                        setTimeout(() => {
                            footer.classList.add('visible');
                        }, allChipsDelay + 200);
                    });
                    subWriter.start();
                }, 250);
            });
            titleWriter.start();
        }

        setTimeout(startEntrance, 400);

        // ==================== CHIP INTERACTIONS ====================
        let selectedChips = new Set();
        const ctaBtn = document.getElementById('ctaBtn');

        document.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', function(e) {
                AudioEngine.init();
                AudioEngine.playChipSelect();
                haptic('light');

                if (typeof DeviceOrientationEvent !== 'undefined' &&
                    typeof DeviceOrientationEvent.requestPermission === 'function' &&
                    !parallaxActive) {
                    DeviceOrientationEvent.requestPermission()
                        .then(p => { if (p === 'granted') startParallax(); })
                        .catch(console.error);
                }

                // Ripple
                const ripple = document.createElement('span');
                ripple.className = 'ripple';
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
                ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);

                const val = this.dataset.value;
                if (this.classList.contains('selected')) {
                    this.classList.remove('selected');
                    selectedChips.delete(val);
                } else {
                    this.classList.add('selected');
                    selectedChips.add(val);
                    spawnConfetti(e.clientX, e.clientY);
                }

                // Update CTA state
                ctaBtn.disabled = selectedChips.size === 0;

                // Update progress bar
                const fill = document.getElementById('progressFill');
                const progress = Math.min(33 + (selectedChips.size * 8), 66);
                fill.style.width = progress + '%';
            });
        });

        // ==================== CTA BUTTON ====================
        ctaBtn.addEventListener('click', function() {
            if (this.disabled) return;
            AudioEngine.init();
            AudioEngine.playChime();
            haptic('success');
            setTimeout(() => {
                window.location.href = 'waylf.html';
            }, 300);
            // Navigate forward
            // window.location.href = 'waylf.html';
        });
