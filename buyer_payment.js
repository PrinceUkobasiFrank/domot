const AudioEngine={ctx:null,init(){if(!this.ctx)this.ctx=new(window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')this.ctx.resume();},playTap(){if(!this.ctx)return;const t=this.ctx.currentTime;const osc=this.ctx.createOscillator();const gain=this.ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(1100,t);gain.gain.setValueAtTime(0.012,t);gain.gain.exponentialRampToValueAtTime(0.001,t+0.05);osc.connect(gain);gain.connect(this.ctx.destination);osc.start(t);osc.stop(t+0.05);},playSave(){if(!this.ctx)return;const t=this.ctx.currentTime;const osc=this.ctx.createOscillator();const gain=this.ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(550,t);osc.frequency.exponentialRampToValueAtTime(880,t+0.12);gain.gain.setValueAtTime(0.018,t);gain.gain.exponentialRampToValueAtTime(0.001,t+0.18);osc.connect(gain);gain.connect(this.ctx.destination);osc.start(t);osc.stop(t+0.18);},playSuccess(){if(!this.ctx)return;const t=this.ctx.currentTime;const notes=[523,659,784,1047];notes.forEach((freq,i)=>{const osc=this.ctx.createOscillator();const gain=this.ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(freq,t+i*0.08);gain.gain.setValueAtTime(0.02,t+i*0.08);gain.gain.exponentialRampToValueAtTime(0.001,t+i*0.08+0.25);osc.connect(gain);gain.connect(this.ctx.destination);osc.start(t+i*0.08);osc.stop(t+i*0.08+0.25);});}};
function haptic(type='light'){if(!navigator.vibrate)return;const patterns={light:[8],medium:[15],success:[10,40,10],save:[5,20,5]};navigator.vibrate(patterns[type]||patterns.light);}

function createRipple(e,el){const rect=el.getBoundingClientRect();const r=document.createElement('span');r.className='ripple';const size=Math.max(rect.width,rect.height);r.style.width=r.style.height=size+'px';r.style.left=(e.clientX-rect.left-size/2)+'px';r.style.top=(e.clientY-rect.top-size/2)+'px';el.style.position='relative';el.style.overflow='hidden';el.appendChild(r);setTimeout(()=>r.remove(),550);}

// ===== PAYMENT METHOD SELECTION =====
const methodCards=document.querySelectorAll('.method-card');
const summaryMethod=document.getElementById('summaryMethod');

methodCards.forEach(card=>{
card.addEventListener('click',()=>{AudioEngine.init();AudioEngine.playTap();haptic('light');methodCards.forEach(c=>c.classList.remove('selected'));card.classList.add('selected');const names={opay:'OPay',bank:'Bank Transfer',card:'Debit Card'};summaryMethod.textContent=names[card.dataset.method];});
});

// ===== TERMS CHECKBOXES =====
const termsChecks=[document.getElementById('check1'),document.getElementById('check2'),document.getElementById('check3')];
const termsItems=[document.getElementById('term1'),document.getElementById('term2'),document.getElementById('term3')];
const fundBtn=document.getElementById('fundBtn');

function updateFundState(){const allChecked=termsChecks.every(c=>c.classList.contains('checked'));fundBtn.disabled=!allChecked;}

termsItems.forEach((item,i)=>{item.addEventListener('click',()=>{AudioEngine.init();AudioEngine.playTap();haptic('light');termsChecks[i].classList.toggle('checked');updateFundState();});});

// ===== SAVE TRANSACTION =====
document.getElementById('saveBtn').addEventListener('click',(e)=>{AudioEngine.init();AudioEngine.playSave();haptic('save');createRipple(e,e.currentTarget);const btn=e.currentTarget;const original=btn.textContent;btn.textContent='Saved';btn.style.color='var(--accent-green)';setTimeout(()=>{btn.textContent=original;btn.style.color='';},2000);});

// ===== FUND ESCROW =====
const fundingOverlay=document.getElementById('fundingOverlay');
const successOverlay=document.getElementById('successOverlay');
const actionBar=document.getElementById('actionBar');

fundBtn.addEventListener('click',(e)=>{if(fundBtn.disabled)return;AudioEngine.init();AudioEngine.playTap();haptic('medium');createRipple(e,e.currentTarget);actionBar.style.display='none';fundingOverlay.classList.add('active');setTimeout(()=>{fundingOverlay.classList.remove('active');successOverlay.classList.add('active');AudioEngine.playSuccess();haptic('success');},2800);});

// ===== CONTINUE =====
document.getElementById('continueBtn').addEventListener('click',()=>{AudioEngine.init();AudioEngine.playTap();haptic('light');window.location.href='ownership_transfer.html';});

// ===== BACK =====
document.getElementById('backBtn').addEventListener('click',()=>{AudioEngine.init();AudioEngine.playTap();haptic('light');window.location.href='buyer_agreement.html';});

// ===== TIMELINE REVEAL =====
const timelineSteps=document.querySelectorAll('.timeline-step');
const timelineObserver=new IntersectionObserver((entries)=>{entries.forEach((entry,index)=>{if(entry.isIntersecting){setTimeout(()=>{entry.target.classList.add('visible');},index*120);timelineObserver.unobserve(entry.target);}});},{threshold:0.3});
timelineSteps.forEach(step=>timelineObserver.observe(step));

// ===== COUNT-UP ANIMATION =====
function animateCountUp(){const priceEl=document.getElementById('priceValue');const depositEl=document.getElementById('depositValue');const dueEl=document.getElementById('dueValue');const targets=[65000000,6500000,6500000];const elements=[priceEl,depositEl,dueEl];const prefixes=['₦','₦','₦'];elements.forEach((el,i)=>{let current=0;const increment=targets[i]/40;const timer=setInterval(()=>{current+=increment;if(current>=targets[i]){current=targets[i];clearInterval(timer);}el.textContent=prefixes[i]+current.toLocaleString('en-NG');},30);});}

const breakdownCard=document.querySelector('.breakdown-card');
const countObserver=new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(entry.isIntersecting){animateCountUp();countObserver.unobserve(entry.target);}});},{threshold:0.5});
if(breakdownCard)countObserver.observe(breakdownCard);

// ===== INIT =====
document.addEventListener('click',()=>AudioEngine.init(),{once:true});
document.addEventListener('touchstart',()=>AudioEngine.init(),{once:true});
updateFundState();
