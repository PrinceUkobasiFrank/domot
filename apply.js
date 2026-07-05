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

    // ==================== OPTION GROUPS ====================
    document.querySelectorAll('[data-group]').forEach(card => {
        card.addEventListener('click', function() {
            AudioEngine.init(); AudioEngine.playTap(); haptic('light');
            const group = this.dataset.group;
            document.querySelectorAll(`[data-group="${group}"]`).forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    // ==================== LEASE PILLS ====================
    document.querySelectorAll('.lease-pill').forEach(pill => {
        pill.addEventListener('click', function() {
            AudioEngine.init(); AudioEngine.playTap(); haptic('light');
            document.querySelectorAll('.lease-pill').forEach(p => p.classList.remove('selected'));
            this.classList.add('selected');
            const map = { '1': '1 Year', '2': '2 Years', '3': '3 Years+' };
            document.getElementById('summaryLease').textContent = map[this.dataset.lease] || this.textContent;
        });
    });

    // ==================== CALENDAR ====================
    const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa'];
    let calYear = 2026, calMonth = 7; // 0-indexed: August = 7
    let selectedDay = null;
    const now = new Date();

    function renderCalendar() {
        const grid = document.getElementById('calGrid');
        document.getElementById('monthLabel').textContent = MONTHS[calMonth] + ' ' + calYear;
        grid.innerHTML = '';

        // Day name headers
        DAY_NAMES.forEach(d => {
            const el = document.createElement('div');
            el.className = 'cal-day-name';
            el.textContent = d;
            grid.appendChild(el);
        });

        const firstDay = new Date(calYear, calMonth, 1).getDay();
        const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement('div');
            empty.className = 'cal-day empty';
            grid.appendChild(empty);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const el = document.createElement('div');
            el.className = 'cal-day';
            el.textContent = d;

            const thisDate = new Date(calYear, calMonth, d);
            const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            if (thisDate < todayDate) {
                el.classList.add('past');
            } else {
                if (thisDate.getTime() === todayDate.getTime()) el.classList.add('today');
                if (selectedDay && selectedDay.d === d && selectedDay.m === calMonth && selectedDay.y === calYear) {
                    el.classList.add('selected');
                }
                el.addEventListener('click', function() {
                    AudioEngine.init(); AudioEngine.playTap(); haptic('light');
                    selectedDay = { d, m: calMonth, y: calYear };
                    const moveText = MONTHS[calMonth] + ' ' + d + ', ' + calYear;
                    document.getElementById('summaryMovein').textContent = moveText;
                    renderCalendar();
                });
            }
            grid.appendChild(el);
        }
    }

    function changeMonth(dir) {
        AudioEngine.init(); AudioEngine.playTap(); haptic('light');
        calMonth += dir;
        if (calMonth > 11) { calMonth = 0; calYear++; }
        if (calMonth < 0) { calMonth = 11; calYear--; }
        renderCalendar();
    }

    renderCalendar();

    // ==================== SUBMIT ====================
    function submitApplication() {
        AudioEngine.init(); AudioEngine.playSuccess(); haptic('success');
        const btn = document.getElementById('submitBtn');
        btn.textContent = 'Submitting…';
        btn.style.opacity = '0.7';
        btn.disabled = true;

        setTimeout(() => {
            const apply = document.getElementById('applyScreen');
            const status = document.getElementById('statusScreen');
            apply.classList.add('slide-left');
            setTimeout(() => {
                apply.classList.add('hidden');
                apply.classList.remove('slide-left');
                status.classList.remove('hidden');
                status.scrollTop = 0;
                btn.textContent = 'Submit Application';
                btn.style.opacity = '';
                btn.disabled = false;
            }, 400);
        }, 900);
    }

    function goBack() {
        AudioEngine.init(); AudioEngine.playTap(); haptic('light');
        window.location.href = 'pi.html';
    }
    function goToReview() {
        AudioEngine.init(); AudioEngine.playTap(); haptic('light');
        setTimeout(() => { window.location.href = 'application_reviewt.html'; }, 180);
    }

    function goToApply() {
        AudioEngine.init(); AudioEngine.playTap(); haptic('light');
        const apply = document.getElementById('applyScreen');
        const status = document.getElementById('statusScreen');
        status.classList.add('slide-left');
        setTimeout(() => {
            status.classList.add('hidden');
            status.classList.remove('slide-left');
            apply.classList.remove('hidden');
            apply.scrollTop = 0;
        }, 400);
    }

    document.addEventListener('click', () => AudioEngine.init(), { once: true });
    document.addEventListener('touchstart', () => AudioEngine.init(), { once: true });
