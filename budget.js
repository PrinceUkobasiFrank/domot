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

            playCardSelect() {
                if (!this.ctx) return;
                const t = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(500, t);
                osc.frequency.exponentialRampToValueAtTime(800, t + 0.1);
                gain.gain.setValueAtTime(0.025, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
                osc.connect(gain); gain.connect(this.ctx.destination);
                osc.start(t); osc.stop(t + 0.18);
            },

            playCardAppear() {
                if (!this.ctx) return;
                const t = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(350, t);
                osc.frequency.exponentialRampToValueAtTime(550, t + 0.08);
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
        const colors = ['#a78bfa', '#7c5cfa', '#c4b5fd', '#ffffff', '#ddd6fe'];
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

    // ==================== RIPPLE ====================
    function createRipple(e, element) {
        const rect = element.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        element.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }

    // ==================== ENTRANCE SEQUENCE ====================
    function startEntrance() {
        const title = document.getElementById('typeTitle');
        const subtitle = document.getElementById('typeSubtitle');
        const cards = document.querySelectorAll('.budget-card');
        const customWrapper = document.getElementById('customBudgetWrapper');
        const ctaWrapper = document.getElementById('ctaWrapper');
        const footer = document.getElementById('footerNote');

        const titleWriter = new Typewriter(title, "What's your expected budget?", () => {
            setTimeout(() => {
                const subWriter = new Typewriter(subtitle, "We'll use this to find properties that match your plans.", () => {
                    // Stagger cards in
                    cards.forEach((card, i) => {
                        setTimeout(() => {
                            card.classList.add('visible');
                            AudioEngine.playCardAppear();
                            haptic('cardPop');
                        }, 100 + i * 100);
                    });

                    // Custom budget after cards
                    const allCardsDelay = 100 + cards.length * 100 + 200;
                    setTimeout(() => {
                        customWrapper.classList.add('visible');
                    }, allCardsDelay);

                    // CTA and footer
                    setTimeout(() => {
                        ctaWrapper.classList.add('visible');
                    }, allCardsDelay + 200);
                    setTimeout(() => {
                        footer.classList.add('visible');
                    }, allCardsDelay + 400);
                });
                subWriter.start();
            }, 250);
        });
        titleWriter.start();
    }

    setTimeout(startEntrance, 400);

    // ==================== BUDGET CARD SELECTION ====================
    let selectedBudget = null;
    const budgetCards = document.querySelectorAll('.budget-card');
    const ctaBtn = document.getElementById('ctaBtn');
    const summaryPanel = document.getElementById('summaryPanel');
    const summaryBudget = document.getElementById('summaryBudget');
    const summaryBudgetItem = document.getElementById('summaryBudgetItem');
    const customPanel = document.getElementById('customPanel');

    // Mock data from previous screens (replace with actual session data)
    const sessionData = {
        type: 'Self Contain',
        location: 'Uyo'
    };

    // Populate summary from session
    document.getElementById('summaryType').textContent = sessionData.type;
    document.getElementById('summaryLocation').textContent = sessionData.location;

    budgetCards.forEach(card => {
        card.addEventListener('click', (e) => {
            AudioEngine.init();
            createRipple(e, card);

            // Deselect all
            budgetCards.forEach(c => c.classList.remove('selected'));

            // Select clicked
            card.classList.add('selected');
            selectedBudget = {
                value: card.dataset.value,
                min: parseInt(card.dataset.min),
                max: parseInt(card.dataset.max),
                label: card.querySelector('.range').textContent
            };

            AudioEngine.playCardSelect();
            haptic('medium');
            spawnConfetti(e.clientX, e.clientY);

            // Close custom panel if open
            customPanel.classList.remove('visible');

            // Update summary
            summaryBudget.textContent = selectedBudget.label;
            summaryPanel.classList.add('visible');

            // Enable CTA
            ctaBtn.disabled = false;
        });
    });

    // ==================== CUSTOM BUDGET ====================
    const customBudgetBtn = document.getElementById('customBudgetBtn');
    const customMin = document.getElementById('customMin');
    const customMax = document.getElementById('customMax');
    const sliderTrack = document.getElementById('sliderTrack');
    const sliderFill = document.getElementById('sliderFill');
    const sliderThumb = document.getElementById('sliderThumb');
    const sliderValue = document.getElementById('sliderValue');

    let isDragging = false;
    let sliderPercent = 50;

    customBudgetBtn.addEventListener('click', (e) => {
        AudioEngine.init();
        const isVisible = customPanel.classList.contains('visible');
        
        if (isVisible) {
            customPanel.classList.remove('visible');
        } else {
            customPanel.classList.add('visible');
            // Deselect preset cards
            budgetCards.forEach(c => c.classList.remove('selected'));
            AudioEngine.playCardSelect();
            haptic('medium');
        }
    });

    // Format currency
    function formatCurrency(value) {
        if (value >= 1000000) {
            return '&#8358;' + (value / 1000000).toFixed(1).replace('.0', '') + 'm';
        } else if (value >= 1000) {
            return '&#8358;' + (value / 1000).toFixed(0) + 'k';
        }
        return '&#8358;' + value;
    }

    // Slider interaction
    function updateSlider(clientX) {
        const rect = sliderTrack.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        sliderPercent = (x / rect.width) * 100;
        sliderFill.style.width = sliderPercent + '%';
        sliderThumb.style.left = sliderPercent + '%';
        
        const maxVal = 20000000;
        const currentVal = Math.round((sliderPercent / 100) * maxVal);
        sliderValue.innerHTML = 'Up to ' + formatCurrency(currentVal);
        
        // Update custom inputs
        customMax.value = formatCurrency(currentVal).replace('&#8358;', '');
        
        // Update selection
        selectedBudget = {
            value: 'custom',
            min: 0,
            max: currentVal,
            label: 'Up to ' + formatCurrency(currentVal)
        };
        
        summaryBudget.innerHTML = selectedBudget.label;
        summaryPanel.classList.add('visible');
        ctaBtn.disabled = false;
    }

    sliderThumb.addEventListener('mousedown', (e) => {
        isDragging = true;
        AudioEngine.init();
        haptic('light');
    });

    sliderTrack.addEventListener('mousedown', (e) => {
        isDragging = true;
        updateSlider(e.clientX);
        AudioEngine.init();
        haptic('light');
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            updateSlider(e.clientX);
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            AudioEngine.playCardSelect();
            haptic('medium');
        }
    });

    // Touch support for slider
    sliderThumb.addEventListener('touchstart', (e) => {
        isDragging = true;
        AudioEngine.init();
        haptic('light');
    }, { passive: true });

    sliderTrack.addEventListener('touchstart', (e) => {
        isDragging = true;
        updateSlider(e.touches[0].clientX);
        AudioEngine.init();
        haptic('light');
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (isDragging) {
            updateSlider(e.touches[0].clientX);
        }
    }, { passive: true });

    document.addEventListener('touchend', () => {
        if (isDragging) {
            isDragging = false;
            AudioEngine.playCardSelect();
            haptic('medium');
        }
    });

    // Custom input handlers
    function handleCustomInput() {
        const minVal = parseInt(customMin.value.replace(/[^0-9]/g, '')) || 0;
        const maxVal = parseInt(customMax.value.replace(/[^0-9]/g, '')) || 0;
        
        if (minVal > 0 || maxVal > 0) {
            const minLabel = minVal > 0 ? formatCurrency(minVal) : '&#8358;0';
            const maxLabel = maxVal > 0 ? formatCurrency(maxVal) : 'No limit';
            
            selectedBudget = {
                value: 'custom',
                min: minVal,
                max: maxVal || 999999999,
                label: minLabel + ' &mdash; ' + maxLabel
            };
            
            summaryBudget.innerHTML = selectedBudget.label;
            summaryPanel.classList.add('visible');
            ctaBtn.disabled = false;
            
            // Deselect preset cards
            budgetCards.forEach(c => c.classList.remove('selected'));
        }
    }

    customMin.addEventListener('input', handleCustomInput);
    customMax.addEventListener('input', handleCustomInput);

    // ==================== CTA ====================
    ctaBtn.addEventListener('click', (e) => {
        if (selectedBudget) {
            AudioEngine.playChime();
            haptic('success');
            spawnConfetti(e.clientX, e.clientY);
            
            // Store selection and navigate
            console.log('Budget selected:', selectedBudget);
            
            // Simulate navigation to personalized home feed
            setTimeout(() => {
                window.location.href = 'thf.html';
            }, 300);
            // Navigate 
        }
    });

    // ==================== AUDIO INIT ON INTERACTION ====================
    document.addEventListener('click', () => AudioEngine.init(), { once: true });
    document.addEventListener('touchstart', () => AudioEngine.init(), { once: true });
