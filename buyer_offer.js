const AudioEngine={ctx:null,init(){if(!this.ctx)this.ctx=new(window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')this.ctx.resume();},playTap(){if(!this.ctx)return;const t=this.ctx.currentTime;const osc=this.ctx.createOscillator();const gain=this.ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(1100,t);gain.gain.setValueAtTime(0.012,t);gain.gain.exponentialRampToValueAtTime(0.001,t+0.05);osc.connect(gain);gain.connect(this.ctx.destination);osc.start(t);osc.stop(t+0.05);},playSave(){if(!this.ctx)return;const t=this.ctx.currentTime;const osc=this.ctx.createOscillator();const gain=this.ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(550,t);osc.frequency.exponentialRampToValueAtTime(880,t+0.12);gain.gain.setValueAtTime(0.018,t);gain.gain.exponentialRampToValueAtTime(0.001,t+0.18);osc.connect(gain);gain.connect(this.ctx.destination);osc.start(t);osc.stop(t+0.18);},playSuccess(){if(!this.ctx)return;const t=this.ctx.currentTime;const notes=[523,659,784,1047];notes.forEach((freq,i)=>{const osc=this.ctx.createOscillator();const gain=this.ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(freq,t+i*0.08);gain.gain.setValueAtTime(0.02,t+i*0.08);gain.gain.exponentialRampToValueAtTime(0.001,t+i*0.08+0.25);osc.connect(gain);gain.connect(this.ctx.destination);osc.start(t+i*0.08);osc.stop(t+i*0.08+0.25);});}};
function haptic(type='light'){if(!navigator.vibrate)return;const patterns={light:[8],medium:[15],success:[10,40,10],save:[5,20,5]};navigator.vibrate(patterns[type]||patterns.light);}

function createRipple(e,el){const rect=el.getBoundingClientRect();const r=document.createElement('span');r.className='ripple';const size=Math.max(rect.width,rect.height);r.style.width=r.style.height=size+'px';r.style.left=(e.clientX-rect.left-size/2)+'px';r.style.top=(e.clientY-rect.top-size/2)+'px';el.style.position='relative';el.style.overflow='hidden';el.appendChild(r);setTimeout(()=>r.remove(),550);}

// ===== CURRENCY FORMATTING =====
const offerInput=document.getElementById('offerInput');
const analysisSection=document.getElementById('analysisSection');
const offerAnalysis=document.getElementById('offerAnalysis');
const analysisIconWrap=document.getElementById('analysisIconWrap');
const analysisValue=document.getElementById('analysisValue');
const analysisSub=document.getElementById('analysisSub');
const summaryAmount=document.getElementById('summaryAmount');

function formatCurrency(value){if(!value)return'';const num=parseInt(value.replace(/\D/g,''))||0;return num.toLocaleString('en-NG');}

function analyzeOffer(rawValue){const num=parseInt(rawValue.replace(/\D/g,''))||0;if(num===0)return null;const asking=65000000;if(num>=asking*0.98)return{strength:'strong',label:'Strong',sub:'At or above asking price — highly competitive',icon:'<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'};if(num>=asking*0.95)return{strength:'competitive',label:'Competitive',sub:'Within market expectations',icon:'<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'};if(num>=62000000)return{strength:'competitive',label:'Competitive',sub:'Within comparable market range',icon:'<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'};return{strength:'below',label:'Below Market Expectations',sub:'Consider adjusting to improve competitiveness',icon:'<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'};}

offerInput.addEventListener('input',(e)=>{const raw=e.target.value.replace(/\D/g,'');if(raw.length>12)return;e.target.value=formatCurrency(raw);const analysis=analyzeOffer(raw);if(analysis){analysisSection.style.display='block';analysisIconWrap.className='analysis-icon-wrap '+analysis.strength;analysisIconWrap.querySelector('svg').innerHTML=analysis.icon;analysisValue.className='analysis-value '+analysis.strength;analysisValue.textContent=analysis.label;analysisSub.textContent=analysis.sub;summaryAmount.textContent='₦'+formatCurrency(raw);}else{analysisSection.style.display='none';summaryAmount.textContent='—';}});

offerInput.addEventListener('focus',()=>{AudioEngine.init();AudioEngine.playTap();});

// ===== TIMELINE SELECTION =====
const timelineOptions=document.querySelectorAll('.timeline-option');
const summaryTimeline=document.getElementById('summaryTimeline');
const timelineLabels={immediate:'Ready Immediately','30days':'Within 30 Days','60days':'Within 60 Days',custom:'Custom Timeline'};
timelineOptions.forEach(btn=>{btn.addEventListener('click',()=>{AudioEngine.init();AudioEngine.playTap();haptic('light');timelineOptions.forEach(b=>b.classList.remove('selected'));btn.classList.add('selected');summaryTimeline.textContent=timelineLabels[btn.dataset.value];});});

// ===== TERMS CHECKBOXES =====
const termsChecks=[document.getElementById('check1'),document.getElementById('check2'),document.getElementById('check3')];
const termsItems=[document.getElementById('term1'),document.getElementById('term2'),document.getElementById('term3')];
const submitBtn=document.getElementById('submitBtn');

function updateSubmitState(){const allChecked=termsChecks.every(c=>c.classList.contains('checked'));submitBtn.disabled=!allChecked;}

termsItems.forEach((item,i)=>{item.addEventListener('click',()=>{AudioEngine.init();AudioEngine.playTap();haptic('light');termsChecks[i].classList.toggle('checked');updateSubmitState();});});

// ===== SAVE DRAFT =====
document.getElementById('saveDraftBtn').addEventListener('click',(e)=>{AudioEngine.init();AudioEngine.playSave();haptic('save');createRipple(e,e.currentTarget);const btn=e.currentTarget;const original=btn.textContent;btn.textContent='Draft Saved';btn.style.color='var(--accent-green)';setTimeout(()=>{btn.textContent=original;btn.style.color='';},2000);});

// ===== SUBMIT OFFER =====
const successModal=document.getElementById('successModal');
const confettiContainer=document.getElementById('confettiContainer');
const trackCard=document.getElementById('trackCard');
const actionBar=document.getElementById('actionBar');

function spawnConfetti(){const colors=['#7c5cfa','#0ec97f','#f0a500','#3b82f6','#f04444'];for(let i=0;i<60;i++){const piece=document.createElement('div');piece.className='confetti-piece';piece.style.left=Math.random()*100+'vw';piece.style.top='-10px';piece.style.width=(Math.random()*8+4)+'px';piece.style.height=(Math.random()*8+4)+'px';piece.style.background=colors[Math.floor(Math.random()*colors.length)];piece.style.borderRadius=Math.random()>0.5?'50%':'2px';piece.style.animationDelay=(Math.random()*0.8)+'s';piece.style.animationDuration=(Math.random()*1.5+1.5)+'s';confettiContainer.appendChild(piece);setTimeout(()=>piece.remove(),3500);}}

submitBtn.addEventListener('click',(e)=>{if(submitBtn.disabled)return;AudioEngine.init();AudioEngine.playSuccess();haptic('success');createRipple(e,e.currentTarget);successModal.classList.add('active');spawnConfetti();actionBar.style.display='none';});

// ===== SUCCESS MODAL ACTIONS =====
document.getElementById('trackOfferBtn').addEventListener('click',()=>{AudioEngine.init();AudioEngine.playTap();haptic('light');successModal.classList.remove('active');trackCard.classList.add('visible');document.getElementById('trackSection').scrollIntoView({behavior:'smooth',block:'start'});const trackSteps=document.querySelectorAll('.track-step');trackSteps.forEach((step,i)=>{setTimeout(()=>step.classList.add('visible'),i*120);});setTimeout(()=>{const existingBtn=document.getElementById('proceedAgreementBtn');if(!existingBtn){const btn=document.createElement('button');btn.id='proceedAgreementBtn';btn.style.cssText='width:calc(100% - 48px);margin:0 24px 24px;height:56px;border-radius:18px;border:none;background:linear-gradient(135deg,#7c5cfa,#5c3fda);color:#fff;font-size:15px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 20px rgba(124,92,250,0.35);';btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M5 12h14M12 5l7 7-7 7"/></svg>Proceed to Agreement';btn.addEventListener('click',()=>{AudioEngine.init();AudioEngine.playTap();haptic('medium');setTimeout(()=>{window.location.href='buyer_agreement.html';},180);});trackCard.after(btn);}},800);});

document.getElementById('returnDashboardBtn').addEventListener('click',()=>{AudioEngine.init();AudioEngine.playTap();haptic('light');window.location.href='buyer_dashboard.html';});

// ===== BACK BUTTON =====
document.getElementById('backBtn').addEventListener('click',()=>{AudioEngine.init();AudioEngine.playTap();haptic('light');window.location.href='buyer_due_diligence.html';});

// ===== NEGOTIATION FLOW REVEAL =====
const negotiationSteps=document.querySelectorAll('.negotiation-step');
const negotiationObserver=new IntersectionObserver((entries)=>{entries.forEach((entry,index)=>{if(entry.isIntersecting){setTimeout(()=>{entry.target.classList.add('visible');},index*120);negotiationObserver.unobserve(entry.target);}});},{threshold:0.3});
negotiationSteps.forEach(step=>negotiationObserver.observe(step));

// ===== INIT =====
document.addEventListener('click',()=>AudioEngine.init(),{once:true});
document.addEventListener('touchstart',()=>AudioEngine.init(),{once:true});
updateSubmitState();
