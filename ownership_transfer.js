const AudioEngine={ctx:null,init(){if(!this.ctx)this.ctx=new(window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')this.ctx.resume();},playTap(){if(!this.ctx)return;const t=this.ctx.currentTime;const osc=this.ctx.createOscillator();const gain=this.ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(1100,t);gain.gain.setValueAtTime(0.012,t);gain.gain.exponentialRampToValueAtTime(0.001,t+0.05);osc.connect(gain);gain.connect(this.ctx.destination);osc.start(t);osc.stop(t+0.05);},playSave(){if(!this.ctx)return;const t=this.ctx.currentTime;const osc=this.ctx.createOscillator();const gain=this.ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(550,t);osc.frequency.exponentialRampToValueAtTime(880,t+0.12);gain.gain.setValueAtTime(0.018,t);gain.gain.exponentialRampToValueAtTime(0.001,t+0.18);osc.connect(gain);gain.connect(this.ctx.destination);osc.start(t);osc.stop(t+0.18);},playSuccess(){if(!this.ctx)return;const t=this.ctx.currentTime;const notes=[523,659,784,1047];notes.forEach((freq,i)=>{const osc=this.ctx.createOscillator();const gain=this.ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(freq,t+i*0.08);gain.gain.setValueAtTime(0.02,t+i*0.08);gain.gain.exponentialRampToValueAtTime(0.001,t+i*0.08+0.25);osc.connect(gain);gain.connect(this.ctx.destination);osc.start(t+i*0.08);osc.stop(t+i*0.08+0.25);});}};
function haptic(type='light'){if(!navigator.vibrate)return;const patterns={light:[8],medium:[15],success:[10,40,10],save:[5,20,5]};navigator.vibrate(patterns[type]||patterns.light);}

function createRipple(e,el){const rect=el.getBoundingClientRect();const r=document.createElement('span');r.className='ripple';const size=Math.max(rect.width,rect.height);r.style.width=r.style.height=size+'px';r.style.left=(e.clientX-rect.left-size/2)+'px';r.style.top=(e.clientY-rect.top-size/2)+'px';el.style.position='relative';el.style.overflow='hidden';el.appendChild(r);setTimeout(()=>r.remove(),550);}

// ===== TRANSFER PROGRESS ANIMATION =====
const progressRing=document.getElementById('progressRing');
const progressPercent=document.getElementById('progressPercent');
let currentProgress=60;

function animateProgress(){const circumference=377;const offset=circumference-(currentProgress/100)*circumference;progressRing.style.strokeDashoffset=offset;let current=0;const increment=currentProgress/40;const timer=setInterval(()=>{current+=increment;if(current>=currentProgress){current=currentProgress;clearInterval(timer);}progressPercent.textContent=Math.round(current)+'%';},30);}

const progressCard=document.querySelector('.progress-card');
const progressObserver=new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(entry.isIntersecting){animateProgress();progressObserver.unobserve(entry.target);}});},{threshold:0.5});
if(progressCard)progressObserver.observe(progressCard);

// ===== CONFIDENCE SCORE COUNT-UP =====
function animateConfidence(){const el=document.getElementById('confidenceNum');const target=96;const duration=1200;const start=performance.now();function update(now){const elapsed=now-start;const progress=Math.min(elapsed/duration,1);const eased=1-Math.pow(1-progress,3);const current=Math.round(eased*target);el.textContent=current;if(progress<1)requestAnimationFrame(update);}requestAnimationFrame(update);}

const confidenceHero=document.querySelector('.confidence-hero');
const confidenceObserver=new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(entry.isIntersecting){animateConfidence();document.querySelectorAll('.conf-break-bar-fill').forEach(bar=>{setTimeout(()=>{bar.style.width=bar.dataset.width;},200);});confidenceObserver.unobserve(entry.target);}});},{threshold:0.3});
if(confidenceHero)confidenceObserver.observe(confidenceHero);

// ===== TIMELINE REVEAL =====
const ownSteps=document.querySelectorAll('.own-step');
const ownObserver=new IntersectionObserver((entries)=>{entries.forEach((entry,index)=>{if(entry.isIntersecting){setTimeout(()=>{entry.target.classList.add('visible');},index*120);ownObserver.unobserve(entry.target);}});},{threshold:0.3});
ownSteps.forEach(step=>ownObserver.observe(step));

// ===== SIMULATE COMPLETION (for demo) =====
const primaryBtn=document.getElementById('primaryBtn');
const secondaryBtn=document.getElementById('secondaryBtn');
const heroProgress=document.getElementById('heroProgress');
const heroSuccess=document.getElementById('heroSuccess');
const certSection=document.getElementById('certSection');
const portfolioSection=document.getElementById('portfolioSection');
const completeTimelineSection=document.getElementById('completeTimelineSection');
const transferCert=document.getElementById('transferCert');
const actionBar=document.getElementById('actionBar');
let isComplete=false;

function showCompletion(){isComplete=true;heroProgress.style.display='none';heroSuccess.style.display='block';certSection.style.display='block';portfolioSection.style.display='block';portfolioSection.classList.add('visible');completeTimelineSection.style.display='block';completeTimelineSection.classList.add('visible');transferCert.classList.remove('locked');transferCert.querySelector('.doc-status').classList.remove('locked');transferCert.querySelector('.doc-status').innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>Available';secondaryBtn.textContent='Download Certificate';primaryBtn.textContent='View Portfolio';AudioEngine.playSuccess();haptic('success');}

primaryBtn.addEventListener('click',(e)=>{AudioEngine.init();AudioEngine.playTap();haptic('medium');createRipple(e,e.currentTarget);if(isComplete){window.location.href='buyer_portfolio.html';}else{showCompletion();}});

secondaryBtn.addEventListener('click',(e)=>{AudioEngine.init();AudioEngine.playSave();haptic('save');createRipple(e,e.currentTarget);const btn=e.currentTarget;const original=btn.textContent;btn.textContent='Downloaded';btn.style.color='var(--accent-green)';setTimeout(()=>{btn.textContent=original;btn.style.color='';},2000);});

// ===== BACK =====
document.getElementById('backBtn').addEventListener('click',()=>{AudioEngine.init();AudioEngine.playTap();haptic('light');window.location.href='buyer_payment.html';});

// ===== INIT =====
document.addEventListener('click',()=>AudioEngine.init(),{once:true});
document.addEventListener('touchstart',()=>AudioEngine.init(),{once:true});
