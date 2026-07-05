// ==================== AUDIO ENGINE ====================
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

            playType(char) {
                if (!this.ctx) return;
                const t = this.ctx.currentTime;

                // Variable pitch based on character — mechanical keyboard-like typing sound
                let baseFreq = 1200;
                if ('aeiou'.includes(char.toLowerCase())) baseFreq = 1100;
                else if ('.,!?'.includes(char)) baseFreq = 1600;
                else if (char === ' ') baseFreq = 800;
                else if (char === char.toUpperCase() && /[A-Z]/.test(char)) baseFreq = 1500;
                else if ('wmxzqj'.includes(char.toLowerCase())) baseFreq = 1300;

                // Create a sharper, more audible click sound
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const filter = this.ctx.createBiquadFilter();

                filter.type = 'bandpass';
                filter.frequency.value = baseFreq;
                filter.Q.value = 8;

                osc.type = 'square';
                osc.frequency.setValueAtTime(baseFreq + Math.random() * 150, t);
                osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, t + 0.02);

                gain.gain.setValueAtTime(0.015, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + 0.05);
            },

            playSelect() {
                if (!this.ctx) return;
                const t = this.ctx.currentTime;

                // Two-tone success chime
                const osc1 = this.ctx.createOscillator();
                const osc2 = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc1.type = 'sine';
                osc1.frequency.setValueAtTime(523, t);
                osc1.frequency.setValueAtTime(659, t + 0.08);

                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(784, t + 0.08);
                osc2.frequency.setValueAtTime(1047, t + 0.16);

                gain.gain.setValueAtTime(0.03, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

                osc1.connect(gain);
                osc2.connect(gain);
                gain.connect(this.ctx.destination);

                osc1.start(t);
                osc1.stop(t + 0.2);
                osc2.start(t + 0.08);
                osc2.stop(t + 0.25);
            },

            playCardAppear() {
                if (!this.ctx) return;
                const t = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440, t);
                osc.frequency.exponentialRampToValueAtTime(660, t + 0.1);
                gain.gain.setValueAtTime(0.015, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + 0.12);
            }
        };

        // ==================== HAPTIC ====================
        function haptic(type = 'light') {
            if (!navigator.vibrate) return;
            const patterns = {
                light: [8],
                medium: [15],
                heavy: [25],
                success: [10, 40, 10],
                cardPop: [5, 30, 5]
            };
            navigator.vibrate(patterns[type] || patterns.light);
        }

        // ==================== PARALLAX TILT (Gyroscope on hero image) ====================
        let tiltX = 0, tiltY = 0;
        let targetTiltX = 0, targetTiltY = 0;
        let parallaxActive = false;
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

        // ==================== CONFETTI BURST ====================
        function spawnConfetti(x, y) {
            const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ff8b94', '#c7ceea'];
            for (let i = 0; i < 12; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = x + 'px';
                confetti.style.top = y + 'px';
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                const angle = (Math.PI * 2 * i) / 12;
                const distance = 40 + Math.random() * 60;
                confetti.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
                confetti.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
                confetti.style.animation = `confettiBurst 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;
                document.body.appendChild(confetti);
                setTimeout(() => confetti.remove(), 600);
            }
        }

        // ==================== VARIABLE SPEED TYPEWRITER ====================
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
                // Variable typing speed — feels human
                if ('.,!?;'.includes(char)) return 350;  // Pause after punctuation
                if (char === ' ') return 80;              // Quick space
                if (char === char.toUpperCase() && /[A-Z]/.test(char)) return 90; // Slower on caps
                if ('aeiou'.includes(char.toLowerCase())) return 45; // Vowels are fast
                if ('wmxzqj'.includes(char.toLowerCase())) return 85; // Awkward letters slower
                return 55 + Math.random() * 25; // Normal variance
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

        // ==========================
        // STAGGERED ENTRANCE SEQUENCE
        // ==========================
        function startEntrance() {
            const title = document.getElementById('typeTitle');
            const subtitle = document.getElementById('typeSubtitle');
            const cards = document.querySelectorAll('.intent-card');
            const footer = document.getElementById('footerNote');

            // Type title with variable speed
            const titleWriter = new Typewriter(title, 'Welcome to Domot!', () => {
                // Brief pause, then subtitle
                setTimeout(() => {
                    const subWriter = new Typewriter(subtitle, 'What would you like to do?', () => {
                        // Cards pop in with stagger sound
                        cards.forEach((card, i) => {
                            setTimeout(() => {
                                card.classList.add('visible');
                                AudioEngine.playCardAppear();
                                haptic('cardPop');
                            }, 150 + i * 120);
                        });

                        // Footer fades in last
                        setTimeout(() => {
                            footer.classList.add('visible');
                        }, 150 + cards.length * 120 + 400);
                    });
                    subWriter.start();
                }, 300);
            });
            titleWriter.start();
        }

        setTimeout(startEntrance, 400);

        // ==========================
        // CARD INTERACTIONS
        // ==========================
        document.querySelectorAll('.intent-card').forEach(card => {
            card.addEventListener('click', function(e) {
                AudioEngine.init();
                AudioEngine.playSelect();
                haptic('success');

                // iOS gyro permission
                if (typeof DeviceOrientationEvent !== 'undefined' && 
                    typeof DeviceOrientationEvent.requestPermission === 'function' && 
                    !parallaxActive) {

                    DeviceOrientationEvent.requestPermission()
                        .then(permissionState => {
                            if (permissionState === 'granted') {
                                startParallax();
                            }
                        })
                        .catch(console.error);
                }

                // Ripple
                const ripple = document.createElement('span');
                ripple.className = 'ripple';
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
                ripple.style.top = (e.clientY - rect.top - size/2) + 'px';

                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);

                // Confetti burst at tap point
                spawnConfetti(e.clientX, e.clientY);

                // Selection with deselect others
                document.querySelectorAll('.intent-card').forEach(c => {
                    c.classList.remove('selected');
                    c.style.opacity = '0.5';
                });

                this.classList.add('selected');
                this.style.opacity = '1';

                // Store intent and navigate
                const intent = this.dataset.intent;
                console.log('Selected intent:', intent);

                if (intent === 'rent') {
                    setTimeout(() => {
                        window.location.href = 'pref.html';
                    }, 500);
                }

                if (intent === 'buy') {
                    setTimeout(() => {
                        window.location.href = 'buyer_dashboard.html';
                    }, 500);
                }

                if (intent === 'list') {
                    setTimeout(() => {
                        window.location.href = 'landlord_dashboard.html';
                    }, 500);
                }
            });
        });
