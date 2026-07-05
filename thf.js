// ==================== THEME ENGINE ====================
        const ThemeEngine = {
            currentTheme: 'system',
            init() {
                const saved = localStorage.getItem('domot-theme');
                if (saved) {
                    this.currentTheme = saved;
                } else {
                    this.currentTheme = 'system';
                }
                this.apply(this.currentTheme);
                this.updateUI();
            },
            apply(theme) {
                const root = document.documentElement;
                if (theme === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    root.removeAttribute('data-theme');
                    if (!prefersDark) {
                        root.setAttribute('data-theme', 'light');
                    }
                } else if (theme === 'light') {
                    root.setAttribute('data-theme', 'light');
                } else {
                    root.removeAttribute('data-theme');
                }
            },
            save(theme) {
                this.currentTheme = theme;
                localStorage.setItem('domot-theme', theme);
                this.apply(theme);
                this.updateUI();
            },
            updateUI() {
                document.querySelectorAll('.theme-radio').forEach(r => r.classList.remove('selected'));
                const activeRadio = document.getElementById('radio-' + this.currentTheme);
                if (activeRadio) activeRadio.classList.add('selected');
            }
        };

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (ThemeEngine.currentTheme === 'system') {
                ThemeEngine.apply('system');
            }
        });

        function selectTheme(theme) {
            AudioEngine.init(); AudioEngine.playTap(); haptic('light');
            ThemeEngine.save(theme);
        }

        // ==================== TAB NAVIGATION ====================
        let currentTab = 'discover';
        let previousTab = null;
        let subPageStack = [];

        function switchTab(tabName) {
            if (tabName === currentTab && subPageStack.length === 0) return;

            // Hide all tabs and subpages
            document.querySelectorAll('.tab-view').forEach(view => {
                view.classList.remove('active');
            });

            // Show target tab
            const target = document.getElementById('tab-' + tabName);
            if (target) {
                target.classList.add('active');
                // Reset scroll
                target.scrollTop = 0;
            }

            // Update nav
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.tab === tabName) {
                    item.classList.add('active');
                }
            });

            previousTab = currentTab;
            currentTab = tabName;
            subPageStack = [];

            // Trigger animations for newly visible tab
            setTimeout(() => {
                target.querySelectorAll('.animate-in, .scale-in').forEach(el => {
                    el.style.animation = 'none';
                    el.offsetHeight; // trigger reflow
                    el.style.animation = '';
                });
            }, 50);
        }

        function showSubPage(pageName) {
            AudioEngine.init(); AudioEngine.playTap(); haptic('light');

            // Hide current view
            document.querySelectorAll('.tab-view').forEach(view => {
                view.classList.remove('active');
            });

            // Show subpage
            const subpage = document.getElementById('subpage-' + pageName);
            if (subpage) {
                subpage.classList.add('active');
                subpage.scrollTop = 0;
            }

            subPageStack.push(pageName);

            // Trigger animations
            setTimeout(() => {
                subpage.querySelectorAll('.animate-in, .scale-in').forEach(el => {
                    el.style.animation = 'none';
                    el.offsetHeight;
                    el.style.animation = '';
                });
            }, 50);
        }

        function hideSubPage() {
            AudioEngine.init(); AudioEngine.playTap(); haptic('light');
            subPageStack.pop();

            document.querySelectorAll('.tab-view').forEach(view => {
                view.classList.remove('active');
            });

            if (subPageStack.length > 0) {
                const prevSub = document.getElementById('subpage-' + subPageStack[subPageStack.length - 1]);
                if (prevSub) prevSub.classList.add('active');
            } else {
                const current = document.getElementById('tab-' + currentTab);
                if (current) current.classList.add('active');
            }
        }

        // ==================== AUDIO ENGINE ====================
        const AudioEngine = {
            ctx: null,
            init() {
                if (!this.ctx) {
                    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
                }
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
            playSave() {
                if (!this.ctx) return;
                const t = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(550, t);
                osc.frequency.exponentialRampToValueAtTime(880, t + 0.12);
                gain.gain.setValueAtTime(0.018, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
                osc.connect(gain); gain.connect(this.ctx.destination);
                osc.start(t); osc.stop(t + 0.18);
            },
            playUnsave() {
                if (!this.ctx) return;
                const t = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440, t);
                osc.frequency.exponentialRampToValueAtTime(280, t + 0.1);
                gain.gain.setValueAtTime(0.012, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
                osc.connect(gain); gain.connect(this.ctx.destination);
                osc.start(t); osc.stop(t + 0.12);
            }
        };

        // ==================== HAPTIC ====================
        function haptic(type = 'light') {
            if (!navigator.vibrate) return;
            const patterns = { light: [8], medium: [15], success: [10, 40, 10], save: [5, 20, 5] };
            navigator.vibrate(patterns[type] || patterns.light);
        }

        // ==================== PULL TO REFRESH ====================
        const feedContainer = document.getElementById('feedContainer');
        const ptrIndicator = document.getElementById('ptrIndicator');
        let ptrStartY = 0, ptrPulling = false;

        if (feedContainer) {
            feedContainer.addEventListener('touchstart', (e) => {
                if (feedContainer.scrollTop <= 0) { ptrStartY = e.touches[0].clientY; ptrPulling = true; }
            }, { passive: true });

            feedContainer.addEventListener('touchmove', (e) => {
                if (!ptrPulling) return;
                const diff = e.touches[0].clientY - ptrStartY;
                if (diff > 0 && diff < 100) {
                    ptrIndicator.style.transform = `translateY(${diff * 0.5}px)`;
                    ptrIndicator.classList.add('visible');
                }
            }, { passive: true });

            feedContainer.addEventListener('touchend', () => {
                if (!ptrPulling) return;
                ptrPulling = false;
                ptrIndicator.style.transform = '';
                ptrIndicator.classList.remove('visible');
                setTimeout(() => loadProperties(), 500);
            });
        }

        // ==================== FILTER PILLS ====================
        document.querySelectorAll('.filter-pill').forEach(pill => {
            pill.addEventListener('click', function() {
                AudioEngine.init(); AudioEngine.playTap(); haptic('light');
                if (this.classList.contains('active')) {
                    this.classList.remove('active');
                } else {
                    this.classList.add('active');
                }
            });
        });

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
            setTimeout(() => ripple.remove(), 550);
        }

        // ==================== SAVE BUTTON ====================
        function toggleSave(btn, e) {
            e.stopPropagation();
            AudioEngine.init();
            const isSaved = btn.classList.contains('saved');
            if (isSaved) {
                btn.classList.remove('saved');
                AudioEngine.playUnsave();
                haptic('light');
            } else {
                btn.classList.add('saved', 'just-saved');
                AudioEngine.playSave();
                haptic('save');
                setTimeout(() => btn.classList.remove('just-saved'), 450);
            }
        }

        // ==================== TOGGLE SWITCH ====================
        function toggleSwitch(el) {
            AudioEngine.init(); AudioEngine.playTap(); haptic('light');
            el.classList.toggle('on');
        }

        // ==================== PROPERTY DATA ====================
        const bestMatches = [
            {
                id: 1,
                image: 'h2.jpg',
                type: 'Self Contain',
                location: 'Shelter Afrique, Uyo',
                trustScore: 92,
                price: '₦450,000/yr',
                indicators: [
                    { label: 'Reliable Electricity', positive: true },
                    { label: 'Low Flood Risk', positive: true }
                ],
                saved: false
            },
            {
                id: 2,
                image: 'h3.jpg',
                type: '1 Bedroom',
                location: 'Ewet Housing, Uyo',
                trustScore: 88,
                price: '₦650,000/yr',
                indicators: [
                    { label: 'Verified Landlord', positive: true },
                    { label: 'Water Supply', positive: true }
                ],
                saved: true
            },
            {
                id: 3,
                image: 'h4.jpg',
                type: 'Self Contain',
                location: 'Osongama Estate, Uyo',
                trustScore: 95,
                price: '₦380,000/yr',
                indicators: [
                    { label: '24/7 Security', positive: true },
                    { label: 'Furnished', positive: true }
                ],
                saved: false
            }
        ];

        const newlyVerified = [
            {
                id: 4,
                image: 'h5.jpg',
                title: 'Modern Self Contain',
                location: 'UniUyo Area, Uyo',
                time: 'Verified today',
                trustScore: 91,
                price: '₦420,000/yr'
            },
            {
                id: 5,
                image: 'h6.jpg',
                title: '2 Bedroom Flat',
                location: 'GRA, Uyo',
                time: 'Verified 2 days ago',
                trustScore: 87,
                price: '₦1,200,000/yr'
            },
            {
                id: 6,
                image: 'h7.jpg',
                title: 'Student Lodge',
                location: 'Ibom Leisure, Uyo',
                time: 'Verified 1 week ago',
                trustScore: 89,
                price: '₦250,000/yr'
            }
        ];

        const savedProperties = [
            {
                id: 7,
                image: 'h3.jpg',
                title: '1 Bedroom Flat',
                location: 'Ewet Housing, Uyo',
                time: 'Saved 2 days ago',
                trustScore: 88,
                price: '₦650,000/yr'
            },
            {
                id: 8,
                image: 'h4.jpg',
                title: 'Self Contain',
                location: 'Osongama Estate, Uyo',
                time: 'Saved 1 week ago',
                trustScore: 95,
                price: '₦380,000/yr'
            }
        ];

        // ==================== RENDER PROPERTY CARD ====================
        function renderPropertyCard(property) {
            const card = document.createElement('div');
            card.className = 'property-card animate-in';
            card.innerHTML = `
                <div class="property-image-wrap">
                    <img src="${property.image}" alt="${property.type}" class="property-image" loading="lazy" onerror="this.parentElement.style.background='linear-gradient(135deg,#161624,#2a2044)'">
                    <div class="verified-badge">
                        <svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg>
                        <span>Verified</span>
                    </div>
                    <button class="save-btn ${property.saved ? 'saved' : ''}" data-id="${property.id}">
                        <svg viewBox="0 0 24 24" fill="${property.saved ? '#f04444' : 'none'}" stroke="${property.saved ? '#f04444' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                    <div class="price-overlay">${property.price}</div>
                </div>
                <div class="property-info">
                    <div class="property-type-location">
                        <div class="property-type">${property.type}</div>
                        <div class="property-location">${property.location}</div>
                    </div>
                    <div class="property-trust-badge">
                        <svg class="ts-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                        <span class="ts-num">${property.trustScore}</span>
                        <span class="ts-label">Trust</span>
                    </div>
                    <div class="property-indicators">
                        ${property.indicators.map(ind => `
                            <div class="indicator-pill positive">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                ${ind.label}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            card.addEventListener('click', (e) => {
                if (e.target.closest('.save-btn')) return;
                createRipple(e, card);
                AudioEngine.init(); AudioEngine.playTap(); haptic('light');
                setTimeout(() => { window.location.href = 'property_detail.html'; }, 180);
            });

            card.querySelector('.save-btn').addEventListener('click', (e) => toggleSave(card.querySelector('.save-btn'), e));

            return card;
        }

        // ==================== RENDER VERIFIED CARD ====================
        function renderVerifiedCard(property) {
            const card = document.createElement('div');
            card.className = 'verified-card animate-in';
            card.innerHTML = `
                <img src="${property.image}" alt="${property.title}" class="verified-thumb" loading="lazy" onerror="this.style.background='linear-gradient(135deg,#161624,#2a2044)'">
                <div class="verified-info">
                    <div class="verified-top">
                        <div class="verified-header">
                            <h4>${property.title}</h4>
                            <span class="fresh-badge">NEW</span>
                        </div>
                        <div class="verified-location">${property.location}</div>
                    </div>
                    <div class="verified-bottom">
                        <div class="verified-trust-pill">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                            </svg>
                            <span>${property.trustScore}</span>
                        </div>
                        <div class="verified-price">${property.price}</div>
                    </div>
                </div>
            `;

            card.addEventListener('click', (e) => {
                createRipple(e, card);
                AudioEngine.init(); AudioEngine.playTap(); haptic('light');
                setTimeout(() => { window.location.href = 'property_detail.html'; }, 180);
            });

            return card;
        }

        // ==================== LOAD ====================
        function loadProperties() {
            const scrollContainer = document.getElementById('bestMatchesScroll');
            if (!scrollContainer) return;
            document.querySelectorAll('.skeleton-card').forEach(s => s.style.display = 'block');

            setTimeout(() => {
                document.querySelectorAll('.skeleton-card').forEach(s => s.style.display = 'none');
                scrollContainer.querySelectorAll('.property-card').forEach(c => c.remove());
                bestMatches.forEach((prop, i) => {
                    const card = renderPropertyCard(prop);
                    card.style.animationDelay = `${i * 0.1}s`;
                    scrollContainer.appendChild(card);
                });
            }, 1000);
        }

        function loadVerified() {
            const container = document.getElementById('verifiedList');
            if (!container) return;
            container.querySelectorAll('.verified-card').forEach(c => c.remove());
            newlyVerified.forEach((prop, i) => {
                const card = renderVerifiedCard(prop);
                card.style.animationDelay = `${0.5 + i * 0.1}s`;
                container.appendChild(card);
            });
        }

        function loadSaved() {
            const container = document.getElementById('savedList');
            if (!container) return;
            container.querySelectorAll('.verified-card').forEach(c => c.remove());
            savedProperties.forEach((prop, i) => {
                const card = renderVerifiedCard(prop);
                card.style.animationDelay = `${i * 0.1}s`;
                container.appendChild(card);
            });
        }

        // ==================== HERO CARD ====================
        const heroCard = document.getElementById('heroCard');
        if (heroCard) {
            heroCard.addEventListener('click', (e) => {
                createRipple(e, heroCard);
                AudioEngine.init(); AudioEngine.playTap(); haptic('medium');
            });
        }

        // ==================== TRUST METER ====================
        const trustMeter = document.getElementById('trustMeter');
        if (trustMeter) {
            trustMeter.addEventListener('click', (e) => {
                createRipple(e, trustMeter);
                AudioEngine.init(); AudioEngine.playTap(); haptic('light');
                switchTab('trust');
            });
        }

        // ==================== BOTTOM NAV ====================
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function() {
                AudioEngine.init(); AudioEngine.playTap(); haptic('light');
                const tab = this.dataset.tab;
                switchTab(tab);
            });
        });

        // ==================== SEARCH ====================
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('focus', () => {
                AudioEngine.init();
            });
        }

        // ==================== LOGOUT ====================
        function handleLogout() {
            AudioEngine.init(); AudioEngine.playTap(); haptic('medium');
            if (confirm('Are you sure you want to log out?')) {
                alert('Logged out successfully');
            }
        }

        // ==================== TRUST SCORE ANIMATION ====================
        function animateTrustScore() {
            const el = document.getElementById('trustScoreNum');
            if (!el) return;
            let current = 0;
            const target = 92;
            const duration = 1200;
            const start = performance.now();

            function update(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                current = Math.round(eased * target);
                el.textContent = current;
                if (progress < 1) requestAnimationFrame(update);
            }
            requestAnimationFrame(update);
        }

        // ==================== INIT ====================
        document.addEventListener('DOMContentLoaded', () => {
            ThemeEngine.init();
            loadProperties();
            loadVerified();
            loadSaved();

            // Animate trust score when trust tab is first visited
            let trustAnimated = false;
            const trustTab = document.getElementById('tab-trust');
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.target.classList.contains('active') && !trustAnimated) {
                        trustAnimated = true;
                        setTimeout(animateTrustScore, 300);
                    }
                });
            });
            if (trustTab) {
                observer.observe(trustTab, { attributes: true, attributeFilter: ['class'] });
            }
        });

        document.addEventListener('click', () => AudioEngine.init(), { once: true });
        document.addEventListener('touchstart', () => AudioEngine.init(), { once: true });
    
        // ==================== AMOUNT POPUP ====================
        function showAmountPopup(label, value, isViolet) {
            AudioEngine.init(); AudioEngine.playTap(); haptic('medium');
            document.getElementById('popupLabel').textContent = label;
            document.getElementById('popupValue').textContent = value;
            const valueEl = document.getElementById('popupValue');
            valueEl.classList.toggle('violet', isViolet);
            document.getElementById('amountPopupOverlay').classList.add('show');
        }

        function hideAmountPopup(e) {
            if (e && e.target !== e.currentTarget) return;
            AudioEngine.init(); AudioEngine.playTap(); haptic('light');
            document.getElementById('amountPopupOverlay').classList.remove('show');
        }
