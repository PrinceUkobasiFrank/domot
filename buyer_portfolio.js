const AudioEngine={ctx:null,init(){if(!this.ctx)this.ctx=new(window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')this.ctx.resume();},playTap(){if(!this.ctx)return;const t=this.ctx.currentTime;const osc=this.ctx.createOscillator();const gain=this.ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(1100,t);gain.gain.setValueAtTime(0.012,t);gain.gain.exponentialRampToValueAtTime(0.001,t+0.05);osc.connect(gain);gain.connect(this.ctx.destination);osc.start(t);osc.stop(t+0.05);},playSave(){if(!this.ctx)return;const t=this.ctx.currentTime;const osc=this.ctx.createOscillator();const gain=this.ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(550,t);osc.frequency.exponentialRampToValueAtTime(880,t+0.12);gain.gain.setValueAtTime(0.018,t);gain.gain.exponentialRampToValueAtTime(0.001,t+0.18);osc.connect(gain);gain.connect(this.ctx.destination);osc.start(t);osc.stop(t+0.18);},playSuccess(){if(!this.ctx)return;const t=this.ctx.currentTime;const notes=[523,659,784,1047];notes.forEach((freq,i)=>{const osc=this.ctx.createOscillator();const gain=this.ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(freq,t+i*0.08);gain.gain.setValueAtTime(0.02,t+i*0.08);gain.gain.exponentialRampToValueAtTime(0.001,t+i*0.08+0.25);osc.connect(gain);gain.connect(this.ctx.destination);osc.start(t+i*0.08);osc.stop(t+i*0.08+0.25);});}};
function haptic(type='light'){if(!navigator.vibrate)return;const patterns={light:[8],medium:[15],success:[10,40,10],save:[5,20,5]};navigator.vibrate(patterns[type]||patterns.light);}

function createRipple(e,el){const rect=el.getBoundingClientRect();const r=document.createElement('span');r.className='ripple';const size=Math.max(rect.width,rect.height);r.style.width=r.style.height=size+'px';r.style.left=(e.clientX-rect.left-size/2)+'px';r.style.top=(e.clientY-rect.top-size/2)+'px';el.style.position='relative';el.style.overflow='hidden';el.appendChild(r);setTimeout(()=>r.remove(),550);}

// ===== GREETING TIME =====
function updateGreeting(){const hour=new Date().getHours();const el=document.getElementById('greetingTime');if(hour<12)el.textContent='Good Morning';else if(hour<17)el.textContent='Good Afternoon';else el.textContent='Good Evening';}
updateGreeting();

// ===== COUNT-UP ANIMATIONS =====
function animateCountUp(){const portfolioEl=document.getElementById('portfolioValue');const acquisitionEl=document.getElementById('acquisitionPrice');const estimateEl=document.getElementById('currentEstimate');const healthEl=document.getElementById('healthScore');const countEl=document.getElementById('propertyCount');

const targets=[65000000,65000000,68500000,96,1];
const elements=[portfolioEl,acquisitionEl,estimateEl,healthEl,countEl];
const prefixes=['₦','₦','₦','',''];
const suffixes=['','','','<span>/100</span>',''];

elements.forEach((el,i)=>{if(!el)return;let current=0;const increment=targets[i]/50;const timer=setInterval(()=>{current+=increment;if(current>=targets[i]){current=targets[i];clearInterval(timer);if(i===3){el.innerHTML=Math.round(current)+suffixes[i];}else if(i===4){el.textContent=Math.round(current);}else{el.textContent=prefixes[i]+Math.round(current).toLocaleString('en-NG');}}else{if(i===3){el.innerHTML=Math.round(current)+suffixes[i];}else if(i===4){el.textContent=Math.round(current);}else{el.textContent=prefixes[i]+Math.round(current).toLocaleString('en-NG');}}},25);});}

// ===== GROWTH CALCULATION =====
function updateGrowth(){const acquisition=65000000;const estimate=68500000;const growth=((estimate-acquisition)/acquisition*100).toFixed(1);document.getElementById('growthValue').textContent='+'+growth+'%';}
updateGrowth();

// ===== TIMELINE REVEAL =====
const timelineSteps=document.querySelectorAll('.timeline-step');
const timelineObserver=new IntersectionObserver((entries)=>{entries.forEach((entry,index)=>{if(entry.isIntersecting){setTimeout(()=>{entry.target.classList.add('visible');},index*150);timelineObserver.unobserve(entry.target);}});},{threshold:0.3});
timelineSteps.forEach(step=>timelineObserver.observe(step));

// ===== CARD PRESS EFFECTS =====
document.querySelectorAll('.owned-card, .vault-card, .quick-card, .opp-card, .doc-item-row').forEach(card=>{
card.addEventListener('click',(e)=>{AudioEngine.init();AudioEngine.playTap();haptic('light');createRipple(e,card);});
});

// ===== DOWNLOAD RECORDS =====
document.getElementById('downloadBtn').addEventListener('click',(e)=>{AudioEngine.init();AudioEngine.playSave();haptic('save');createRipple(e,e.currentTarget);const btn=e.currentTarget;const original=btn.textContent;btn.textContent='Downloaded';btn.style.color='var(--accent-green)';setTimeout(()=>{btn.textContent=original;btn.style.color='';},2000);});

// ===== VIEW ASSET DETAILS =====
document.getElementById('viewAssetBtn').addEventListener('click',(e)=>{AudioEngine.init();AudioEngine.playTap();haptic('medium');createRipple(e,e.currentTarget);});

// ===== BACK BUTTON =====
document.getElementById('backBtn').addEventListener('click',()=>{AudioEngine.init();AudioEngine.playTap();haptic('light');window.location.href='ownership_transfer.html';});

// ===== DOCUMENT ACTIONS =====
document.querySelectorAll('.doc-action').forEach(btn=>{
btn.addEventListener('click',(e)=>{e.stopPropagation();AudioEngine.init();AudioEngine.playTap();haptic('light');const original=btn.textContent;btn.textContent=original==='Preview'?'Opening...':'Downloading...';setTimeout(()=>{btn.textContent=original;},1500);});
});

// ===== INIT =====
document.addEventListener('click',()=>AudioEngine.init(),{once:true});
document.addEventListener('touchstart',()=>AudioEngine.init(),{once:true});

// Trigger count-up after a short delay
setTimeout(animateCountUp,400);
