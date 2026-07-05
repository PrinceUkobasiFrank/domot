const Audio = {
        ctx: null,
        init() {
            if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            if (this.ctx.state === 'suspended') this.ctx.resume();
        },
        tap() {
            if (!this.ctx) return;
            const t = this.ctx.currentTime;
            const o = this.ctx.createOscillator(), g = this.ctx.createGain();
            o.type = 'sine'; o.frequency.setValueAtTime(1100, t);
            g.gain.setValueAtTime(.011, t); g.gain.exponentialRampToValueAtTime(.001, t+.05);
            o.connect(g); g.connect(this.ctx.destination);
            o.start(t); o.stop(t+.05);
        },
        success() {
            if (!this.ctx) return;
            const t = this.ctx.currentTime;
            const freqs = [440, 554, 659, 880];
            freqs.forEach((f, i) => {
                const o = this.ctx.createOscillator(), g = this.ctx.createGain();
                o.type = 'sine'; o.frequency.setValueAtTime(f, t + i * .09);
                g.gain.setValueAtTime(.013, t + i * .09);
                g.gain.exponentialRampToValueAtTime(.001, t + i * .09 + .35);
                o.connect(g); g.connect(this.ctx.destination);
                o.start(t + i * .09); o.stop(t + i * .09 + .4);
            });
        }
    };

    function haptic(p) { if (navigator.vibrate) navigator.vibrate(p || [8]); }
    document.addEventListener('click', () => Audio.init(), { once: true });
    document.addEventListener('touchstart', () => Audio.init(), { once: true });

    function createRipple(e, el) {
        const r = document.createElement('div');
        r.className = 'ripple-el';
        const rect = el.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
        r.style.left = x + 'px'; r.style.top = y + 'px';
        el.appendChild(r);
        setTimeout(() => r.remove(), 600);
    }

    function showSection() {
        const hash = window.location.hash.replace('#', '') || 'maintenance';
        const allSections = document.querySelectorAll('.section-wrap');
        allSections.forEach(s => {
            s.style.display = 'none';
            s.classList.remove('active');
        });
        const target = document.getElementById('section-' + hash);
        if (target) {
            target.style.display = 'block';
            target.classList.add('active');
            document.querySelector('.scroll-root').scrollTop = 0;
        } else {
            document.getElementById('section-maintenance').style.display = 'block';
            document.getElementById('section-maintenance').classList.add('active');
        }
    }
    window.addEventListener('hashchange', showSection);
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showSection);
    } else {
        showSection();
    }

    let selectedCat = null;
    let selectedPriority = 'high';
    let selectedContact = 'app';
    let photoCount = 0;
    let reportPhotoCount = 0;
    let anonSubmit = false;
    const catLabels = {
        plumbing: 'Plumbing', electrical: 'Electrical',
        structural: 'Structural', pest: 'Pest Control',
        ac: 'AC / Fixtures', other: 'Other'
    };
    const etaMap = {
        urgent: 'Within 4 hours',
        high: 'Within 24 hours',
        medium: 'Within 3 days',
        low: 'Within 7 days'
    };

    function selectCat(el, event) {
        Audio.init(); Audio.tap(); haptic([8]);
        createRipple(event, el);
        document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('selected'));
        el.classList.add('selected');
        selectedCat = el.dataset.cat;
    }

    function selectPriority(el) {
        Audio.init(); Audio.tap(); haptic([8]);
        document.querySelectorAll('.priority-pill').forEach(p => p.classList.remove('selected'));
        el.classList.add('selected');
        selectedPriority = el.dataset.p;
    }

    function selectContact(el, event) {
        Audio.init(); Audio.tap(); haptic([8]);
        createRipple(event, el);
        document.querySelectorAll('.contact-option').forEach(c => c.classList.remove('selected'));
        el.classList.add('selected');
        selectedContact = el.dataset.co;
    }

    const descArea = document.getElementById('descArea');
    const descBox = document.getElementById('descBox');
    const charCount = document.getElementById('charCount');
    if (descArea) {
        descArea.addEventListener('focus', () => descBox.classList.add('focused'));
        descArea.addEventListener('blur', () => descBox.classList.remove('focused'));
        descArea.addEventListener('input', () => {
            const n = descArea.value.length;
            charCount.textContent = n + ' / 500';
            charCount.style.color = n > 420 ? 'var(--warm)' : 'var(--t4)';
        });
    }

    const photoColors = [
        'linear-gradient(135deg,#1a1a2e,#2a1a3e)',
        'linear-gradient(135deg,#1a2e1a,#1a3e2a)',
        'linear-gradient(135deg,#2e1a1a,#3e1a1a)',
        'linear-gradient(135deg,#1a2a3e,#2a1a4e)',
        'linear-gradient(135deg,#2e2a1a,#3e2a1a)'
    ];

    function addPhoto(event) {
        if (photoCount >= 5) { haptic([20, 40, 20]); return; }
        Audio.init(); Audio.tap(); haptic([8]);
        createRipple(event, event.currentTarget);
        photoCount++;
        const scroll = document.getElementById('photoScroll');
        const thumb = document.createElement('div');
        thumb.className = 'photo-thumb';
        const idx = photoCount - 1;
        thumb.innerHTML = `
            <div class="photo-thumb-placeholder" style="background:${photoColors[idx]}">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                </svg>
            </div>
            <div class="photo-remove" onclick="removePhoto(this)">
                <svg viewBox="0 0 14 14"><line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/></svg>
            </div>
        `;
        scroll.insertBefore(thumb, scroll.firstChild.nextSibling || scroll.firstChild);
        if (photoCount >= 5) {
            scroll.querySelector('.photo-add').style.opacity = '.3';
            scroll.querySelector('.photo-add').style.pointerEvents = 'none';
        }
    }

    function removePhoto(btn) {
        Audio.init(); Audio.tap(); haptic([6]);
        btn.parentElement.remove();
        photoCount--;
        const addBtn = document.querySelector('.photo-add');
        addBtn.style.opacity = '1';
        addBtn.style.pointerEvents = 'auto';
    }

    function selectReportType(el, type) {
        Audio.init(); Audio.tap(); haptic([8]);
        createRipple(event, el);
        document.querySelectorAll('.report-card').forEach(c => c.style.boxShadow = '');
        el.style.boxShadow = 'inset 0 0 0 1.5px var(--border-hi)';
    }

    function toggleAnon() {
        Audio.init(); Audio.tap(); haptic([8]);
        anonSubmit = !anonSubmit;
        document.getElementById('anonCheck').classList.toggle('checked', anonSubmit);
    }

    function addReportPhoto(event) {
        if (reportPhotoCount >= 5) { haptic([20, 40, 20]); return; }
        Audio.init(); Audio.tap(); haptic([8]);
        createRipple(event, event.currentTarget);
        reportPhotoCount++;
        const scroll = document.getElementById('reportPhotoScroll');
        const thumb = document.createElement('div');
        thumb.className = 'photo-thumb';
        const idx = reportPhotoCount - 1;
        thumb.innerHTML = `
            <div class="photo-thumb-placeholder" style="background:${photoColors[idx]}">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                </svg>
            </div>
            <div class="photo-remove" onclick="removeReportPhoto(this)">
                <svg viewBox="0 0 14 14"><line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/></svg>
            </div>
        `;
        scroll.insertBefore(thumb, scroll.firstChild.nextSibling || scroll.firstChild);
        if (reportPhotoCount >= 5) {
            scroll.querySelector('.photo-add').style.opacity = '.3';
            scroll.querySelector('.photo-add').style.pointerEvents = 'none';
        }
    }

    function removeReportPhoto(btn) {
        Audio.init(); Audio.tap(); haptic([6]);
        btn.parentElement.remove();
        reportPhotoCount--;
        const addBtn = document.querySelector('#reportPhotoScroll .photo-add');
        addBtn.style.opacity = '1';
        addBtn.style.pointerEvents = 'auto';
    }

    function submitRequest(event) {
        Audio.init(); haptic([10, 40, 10, 80, 20]);
        if (!selectedCat) {
            const grid = document.getElementById('catGrid');
            grid.style.transform = 'translateX(6px)';
            setTimeout(() => { grid.style.transform = 'translateX(-6px)'; setTimeout(() => { grid.style.transform = ''; }, 80); }, 80);
            haptic([20, 40, 20]);
            return;
        }
        const submitBtn = event.currentTarget;
        submitBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            Submitting...
        `;
        submitBtn.style.opacity = '.75';
        submitBtn.style.pointerEvents = 'none';

        setTimeout(() => {
            Audio.success(); haptic([15, 40, 15, 40, 15, 80, 40]);
            const ticketNum = 'DMT-' + (Math.floor(Math.random() * 90000) + 10000);
            document.getElementById('ticketId').textContent = 'TICKET #' + ticketNum;
            document.getElementById('ticketCat').textContent = catLabels[selectedCat] || selectedCat;
            document.getElementById('ticketEta').textContent = etaMap[selectedPriority] || 'Within 24 hours';
            const now = new Date();
            document.getElementById('ticketTime').textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) + ', Today';
            document.getElementById('confirmTitle').textContent = 'Request Submitted';
            document.getElementById('confirmSub').textContent = 'Your property manager has been notified. You'll receive an update shortly.';
            document.getElementById('confirmOverlay').classList.add('active');
        }, 1400);
    }

    function submitReport(event) {
        Audio.init(); haptic([10, 40, 10, 80, 20]);
        const submitBtn = event.currentTarget;
        submitBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            Submitting...
        `;
        submitBtn.style.opacity = '.75';
        submitBtn.style.pointerEvents = 'none';

        setTimeout(() => {
            Audio.success(); haptic([15, 40, 15, 40, 15, 80, 40]);
            const ticketNum = 'RPT-' + (Math.floor(Math.random() * 90000) + 10000);
            document.getElementById('ticketId').textContent = 'REPORT #' + ticketNum;
            document.getElementById('ticketCat').textContent = 'Issue Report';
            document.getElementById('ticketEta').textContent = 'Within 24 hours';
            const now = new Date();
            document.getElementById('ticketTime').textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) + ', Today';
            document.getElementById('confirmTitle').textContent = 'Report Submitted';
            document.getElementById('confirmSub').textContent = 'Domot! has received your report. Our team will review it and contact you if needed.';
            document.getElementById('confirmOverlay').classList.add('active');
        }, 1400);
    }

    function trackRequest() {
        Audio.init(); Audio.tap(); haptic([8, 30]);
        closeConfirm();
    }

    function closeConfirm() {
        Audio.init(); Audio.tap(); haptic([8]);
        document.getElementById('confirmOverlay').classList.remove('active');
        window.location.href = 'tenancy.html';
    }

    function goBack() {
        Audio.init(); Audio.tap(); haptic([8]);
        window.location.href = 'tenancy.html';
    }
    function openHelp() {
        Audio.init(); Audio.tap(); haptic([8]);
    }
