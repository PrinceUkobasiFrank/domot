// ==================== HAPTIC ====================
        function haptic(type = 'light') {
            if (!navigator.vibrate) return;
            const patterns = { light: [8], medium: [15], success: [10,40,10] };
            navigator.vibrate(patterns[type] || [8]);
        }

        // ==================== RIPPLE ====================
        function createRipple(e, el) {
            const rect = el.getBoundingClientRect();
            const r = document.createElement('span');
            r.className = 'ripple';
            const size = Math.max(rect.width, rect.height);
            r.style.width = r.style.height = size + 'px';
            r.style.left = (e.clientX - rect.left - size / 2) + 'px';
            r.style.top = (e.clientY - rect.top - size / 2) + 'px';
            el.appendChild(r);
            setTimeout(() => r.remove(), 550);
        }

        // ==================== TABS ====================
        const tabs = ['home', 'trust', 'wallet', 'hub'];
        let currentTab = 'home';

        function switchTab(tab) {
            if (tab === currentTab) return;
            haptic('light');

            document.querySelector('.tab-panel.active')?.classList.remove('active');
            document.querySelector('.nav-item.active')?.classList.remove('active');

            currentTab = tab;
            const panel = document.getElementById('tab-' + tab);
            panel.classList.add('active');
            document.querySelector(`.nav-item[data-tab="${tab}"]`).classList.add('active');

            // FAB: only on Home
            const fab = document.getElementById('fab');
            const fabMenu = document.getElementById('fabMenu');
            if (tab === 'home') {
                fab.style.display = 'flex';
            } else {
                fab.style.display = 'none';
                fab.classList.remove('open');
                fabMenu.classList.remove('open');
            }

            // Trigger animations when switching to a tab
            if (tab === 'trust') animateTrust();
            if (tab === 'wallet') animateWallet();

            // Scroll to top
            panel.scrollTop = 0;
        }

        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function(e) {
                createRipple(e, this);
                switchTab(this.dataset.tab);
            });
        });

        // ==================== FAB ====================
        const fab = document.getElementById('fab');
        const fabMenu = document.getElementById('fabMenu');
        let fabOpen = false;

        fab.addEventListener('click', () => {
            fabOpen = !fabOpen;
            haptic(fabOpen ? 'medium' : 'light');
            fab.classList.toggle('open', fabOpen);
            fabMenu.classList.toggle('open', fabOpen);
        });

        // Close fab menu on outside tap
        document.addEventListener('click', (e) => {
            if (fabOpen && !fab.contains(e.target) && !fabMenu.contains(e.target)) {
                fabOpen = false;
                fab.classList.remove('open');
                fabMenu.classList.remove('open');
            }
        });

        // ==================== HOME ANIMATIONS ====================
        function animateHome() {
            // Health ring
            const ring = document.querySelector('.health-score-ring');
            if (ring && !ring.dataset.animated) {
                ring.dataset.animated = 'true';
                setTimeout(() => ring.classList.add('animated'), 300);
            }
            // Countdown ring
            const cr = document.getElementById('countdownRing');
            const cb = document.getElementById('countdownBar');
            if (cr && !cr.dataset.animated) {
                cr.dataset.animated = 'true';
                setTimeout(() => {
                    cr.classList.add('animated');
                    cb.classList.add('animated');
                }, 400);
            }
            // Timeline reveal
            revealTimeline('#timeline');
        }

        function revealTimeline(selector) {
            const items = document.querySelectorAll(selector + ' .timeline-item');
            items.forEach((item, i) => {
                if (!item.dataset.revealed) {
                    item.dataset.revealed = 'true';
                    setTimeout(() => item.classList.add('revealed'), 500 + i * 120);
                }
            });
        }

        // ==================== TRUST ANIMATIONS ====================
        function animateTrust() {
            const big = document.getElementById('trustScoreBig');
            const bar = document.getElementById('trustScoreBar');
            if (big && !big.dataset.animated) {
                big.dataset.animated = 'true';
                setTimeout(() => {
                    big.classList.add('animated');
                    bar.classList.add('animated');
                }, 100);
            }
            revealTimeline('#trustTimeline');
        }

        // ==================== WALLET ANIMATIONS ====================
        function animateWallet() {
            const wa = document.getElementById('walletAmount');
            if (wa && !wa.dataset.animated) {
                wa.dataset.animated = 'true';
                setTimeout(() => wa.classList.add('animated'), 100);
            }
            // Spending bars
            ['sbar1','sbar2','sbar3'].forEach((id, i) => {
                const el = document.getElementById(id);
                if (el && !el.dataset.animated) {
                    el.dataset.animated = 'true';
                    setTimeout(() => el.classList.add('animated'), 300 + i * 100);
                }
            });
        }

        // ==================== INIT ====================
        // Run home animations on load
        setTimeout(animateHome, 200);
