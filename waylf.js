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

       // ==================== ENTRANCE SEQUENCE ====================
       function startEntrance() {
           const title = document.getElementById('typeTitle');
           const subtitle = document.getElementById('typeSubtitle');
           const chips = document.querySelectorAll('.location-chip');
           const ctaWrapper = document.getElementById('ctaWrapper');
           const footer = document.getElementById('footerNote');
           const sectionLabel = document.getElementById('sectionLabel');

           const titleWriter = new Typewriter(title, 'Where would you like to live?', () => {
               setTimeout(() => {
                   const subWriter = new Typewriter(subtitle, 'Choose one or more locations.', () => {
                       // Stagger chips in
                       chips.forEach((chip, i) => {
                           setTimeout(() => {
                               chip.classList.add('visible');
                               AudioEngine.playChipAppear();
                               haptic('cardPop');
                           }, 100 + i * 80);
                       });

                       // Section label after chips
                       const allChipsDelay = 100 + chips.length * 80 + 200;
                       setTimeout(() => {
                           sectionLabel.classList.add('visible');
                       }, allChipsDelay - 300);

                       // CTA and footer after all chips
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

       // ==================== SEARCH FUNCTIONALITY ====================
       const searchInput = document.getElementById('searchInput');
       const searchClear = document.getElementById('searchClear');
       const searchResults = document.getElementById('searchResults');
       const searchResultsContainer = document.getElementById('searchResultsContainer');
       const noResults = document.getElementById('noResults');
       const sectionLabel = document.getElementById('sectionLabel');
       const locationsContainer = document.getElementById('locationsContainer');

       const allLocations = [
           { value: 'uyo', label: 'Uyo', icon: 'city' },
           { value: 'shelter-afrique', label: 'Shelter Afrique', icon: 'home' },
           { value: 'ewet-housing', label: 'Ewet Housing', icon: 'home' },
           { value: 'osongama', label: 'Osongama', icon: 'home' },
           { value: 'lagos', label: 'Lagos', icon: 'city' },
           { value: 'lagos-island', label: 'Lagos Island', icon: 'home' },
           { value: 'lekki', label: 'Lekki', icon: 'home' },
           { value: 'yaba', label: 'Yaba', icon: 'home' },
           { value: 'gra', label: 'GRA', icon: 'home' },
           { value: 'abuja', label: 'Abuja', icon: 'city' },
           { value: 'ikeja', label: 'Ikeja', icon: 'home' },
           { value: 'vi', label: 'Victoria Island', icon: 'home' },
           { value: 'ikoyi', label: 'Ikoyi', icon: 'home' },
           { value: 'uniuyo', label: 'UniUyo Area', icon: 'home' },
           { value: 'ibom-leisure', label: 'Ibom Leisure', icon: 'home' }
       ];

       function createLocationChip(location, isSearchResult = false) {
           const chip = document.createElement('button');
           chip.className = 'location-chip';
           chip.dataset.value = location.value;
           if (selectedLocations.has(location.value)) {
               chip.classList.add('selected');
           }
           
           const iconSvg = location.icon === 'city' 
                              ? '<svg class="location-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"></path><path d="M5 21V7l8-4 8 4v14"></path><path d="M9 21v-6h6v6"></path></svg>'
                : '<svg class="location-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>';
            
            chip.innerHTML = `
                ${iconSvg}
                <span class="chip-check">
                    <svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg>
                </span>
                ${location.label}
            `;
            
            chip.addEventListener('click', function(e) {
                handleChipClick(this, e);
            });
            
            return chip;
        }

        function handleSearch(query) {
            const normalizedQuery = query.toLowerCase().trim();
            
            if (normalizedQuery.length === 0) {
                searchResults.classList.remove('visible');
                sectionLabel.style.display = 'block';
                locationsContainer.style.display = 'flex';
                searchClear.classList.remove('visible');
                return;
            }
            
            searchClear.classList.add('visible');
            const matches = allLocations.filter(loc => 
                loc.label.toLowerCase().includes(normalizedQuery) ||
                loc.value.includes(normalizedQuery)
            );
            
            searchResultsContainer.innerHTML = '';
            
            if (matches.length > 0) {
                noResults.classList.remove('visible');
                matches.forEach(location => {
                    searchResultsContainer.appendChild(createLocationChip(location, true));
                });
                sectionLabel.style.display = 'none';
                locationsContainer.style.display = 'none';
                searchResults.classList.add('visible');
            } else {
                noResults.classList.add('visible');
                searchResults.classList.add('visible');
            }
        }

        searchInput.addEventListener('input', (e) => {
            handleSearch(e.target.value);
        });

        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            searchInput.focus();
            handleSearch('');
            haptic('light');
        });

        // ==================== CHIP INTERACTIONS ====================
        let selectedLocations = new Set();
        const ctaBtn = document.getElementById('ctaBtn');

        function handleChipClick(chip, e) {
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
            const rect = chip.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            chip.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);

            const val = chip.dataset.value;
            if (chip.classList.contains('selected')) {
                chip.classList.remove('selected');
                selectedLocations.delete(val);
            } else {
                chip.classList.add('selected');
                selectedLocations.add(val);
                spawnConfetti(e.clientX, e.clientY);
            }

            // Update CTA state
            ctaBtn.disabled = selectedLocations.size === 0;

            // Update progress bar
            const fill = document.getElementById('progressFill');
            const progress = Math.min(66 + (selectedLocations.size * 5), 85);
            fill.style.width = progress + '%';
        }

        document.querySelectorAll('.location-chip').forEach(chip => {
            chip.addEventListener('click', function(e) {
                handleChipClick(this, e);
            });
        });

        // ==================== CTA BUTTON ====================
        ctaBtn.addEventListener('click', function() {
            if (this.disabled) return;
            AudioEngine.init();
            AudioEngine.playChime();
            haptic('success');
            setTimeout(() => {
                window.location.href = 'budget.html';
            }, 300);
            // Navigate to budget screen
            // window.location.href = 'budget.html';
        });
