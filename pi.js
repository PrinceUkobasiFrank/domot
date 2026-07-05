// ==================== AUDIO ENGINE ====================
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
                const osc1 = this.ctx.createOscillator();
                const osc2 = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc1.type = 'sine';
                osc2.type = 'sine';
                osc1.frequency.setValueAtTime(523, t);
                osc1.frequency.exponentialRampToValueAtTime(880, t + 0.15);
                osc2.frequency.setValueAtTime(659, t);
                osc2.frequency.exponentialRampToValueAtTime(1100, t + 0.15);
                gain.gain.setValueAtTime(0.015, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
                osc1.connect(gain);
                osc2.connect(gain);
                gain.connect(this.ctx.destination);
                osc1.start(t); osc1.stop(t + 0.35);
                osc2.start(t); osc2.stop(t + 0.35);
            }
        };

        function haptic(type = 'light') {
            if (!navigator.vibrate) return;
            const patterns = { light: [8], medium: [15], success: [10, 40, 10], save: [5, 20, 5] };
            navigator.vibrate(patterns[type] || patterns.light);
        }

        // ==================== DATE PICKER ====================
        const datePills = document.querySelectorAll('.date-pill');
        let selectedDate = '2026-06-12';
        let selectedDateText = 'Monday, 12 June';

        datePills.forEach(pill => {
            pill.addEventListener('click', function() {
                AudioEngine.init(); AudioEngine.playTap(); haptic('light');
                datePills.forEach(p => p.classList.remove('selected'));
                this.classList.add('selected');
                selectedDate = this.dataset.date;
                const dayName = this.querySelector('.day-name').textContent;
                const dayNum = this.querySelector('.day-num').textContent;
                const month = this.querySelector('.month').textContent;
                selectedDateText = getFullDayName(dayName) + ', ' + dayNum + ' ' + month;
            });
        });

        function getFullDayName(short) {
            const map = { 'Mon': 'Monday', 'Tue': 'Tuesday', 'Wed': 'Wednesday', 'Thu': 'Thursday', 'Fri': 'Friday', 'Sat': 'Saturday', 'Sun': 'Sunday' };
            return map[short] || short;
        }

        // ==================== TIME SLOTS ====================
        const timeSlots = document.querySelectorAll('.time-slot:not(.unavailable)');
        let selectedTime = '15:00';
        let selectedTimeText = '3:00 PM';

        timeSlots.forEach(slot => {
            slot.addEventListener('click', function() {
                if (this.classList.contains('unavailable')) return;
                AudioEngine.init(); AudioEngine.playTap(); haptic('light');
                timeSlots.forEach(s => s.classList.remove('selected'));
                this.classList.add('selected');
                selectedTime = this.dataset.time;
                selectedTimeText = this.querySelector('span').textContent;
            });
        });

        // ==================== INSPECTION TYPE ====================
        const typeOptions = document.querySelectorAll('.type-option');
        let selectedType = 'physical';

        typeOptions.forEach(opt => {
            opt.addEventListener('click', function() {
                AudioEngine.init(); AudioEngine.playTap(); haptic('light');
                typeOptions.forEach(o => o.classList.remove('selected'));
                this.classList.add('selected');
                selectedType = this.dataset.type;
            });
        });

        // ==================== ATTENDEE COUNT ====================
        const attendeePills = document.querySelectorAll('.attendee-pill');
        let selectedAttendees = '1';

        attendeePills.forEach(pill => {
            pill.addEventListener('click', function() {
                AudioEngine.init(); AudioEngine.playTap(); haptic('light');
                attendeePills.forEach(p => p.classList.remove('selected'));
                this.classList.add('selected');
                selectedAttendees = this.dataset.count;
            });
        });

        // ==================== BACK BUTTON ====================
        document.getElementById('backBtn').addEventListener('click', () => {
            AudioEngine.init(); AudioEngine.playTap(); haptic('light');
            window.location.href = 'property_detail.html';
        });

        // ==================== SHARE BUTTON ====================
        document.getElementById('shareBtn').addEventListener('click', () => {
            AudioEngine.init(); AudioEngine.playTap(); haptic('light');
        });

        // ==================== CONFIRM INSPECTION ====================
        document.getElementById('confirmBtn').addEventListener('click', function() {
            AudioEngine.init(); AudioEngine.playSuccess(); haptic('success');
            document.getElementById('passDate').textContent = selectedDateText;
            document.getElementById('passTime').textContent = selectedTimeText;
            document.getElementById('confirmationOverlay').classList.add('active');
        });

        // ==================== CONFIRMATION ACTIONS ====================
        document.getElementById('doneBtn').addEventListener('click', () => {
            AudioEngine.init(); AudioEngine.playTap(); haptic('light');
            window.location.href = 'apply.html';
        });

        document.getElementById('addCalendarBtn').addEventListener('click', () => {
            AudioEngine.init(); AudioEngine.playTap(); haptic('light');
            const btn = document.getElementById('addCalendarBtn');
            btn.textContent = 'Added!';
            btn.style.color = 'var(--accent-green)';
            btn.style.borderColor = 'rgba(14, 201, 127, 0.3)';
            setTimeout(() => {
                btn.textContent = 'Add to Calendar';
                btn.style.color = '';
                btn.style.borderColor = '';
            }, 2000);
        });

        // ==================== GENERATE BARCODE ====================
        function generateBarcode() {
            const container = document.getElementById('barcodeLines');
            const widths = [3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 2, 3, 1];
            widths.forEach(w => {
                const line = document.createElement('div');
                line.className = 'barcode-line';
                line.style.width = w + 'px';
                line.style.height = (Math.random() > 0.3 ? 36 : 28) + 'px';
                container.appendChild(line);
            });
        }
        generateBarcode();

        // ==================== INIT ====================
        document.addEventListener('click', () => AudioEngine.init(), { once: true });
        document.addEventListener('touchstart', () => AudioEngine.init(), { once: true });
