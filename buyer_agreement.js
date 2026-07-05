const AudioEngine={ctx:null,init(){if(!this.ctx)this.ctx=new(window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')this.ctx.resume();},playTap(){if(!this.ctx)return;const t=this.ctx.currentTime;const osc=this.ctx.createOscillator();const gain=this.ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(1100,t);gain.gain.setValueAtTime(0.012,t);gain.gain.exponentialRampToValueAtTime(0.001,t+0.05);osc.connect(gain);gain.connect(this.ctx.destination);osc.start(t);osc.stop(t+0.05);},playSave(){if(!this.ctx)return;const t=this.ctx.currentTime;const osc=this.ctx.createOscillator();const gain=this.ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(550,t);osc.frequency.exponentialRampToValueAtTime(880,t+0.12);gain.gain.setValueAtTime(0.018,t);gain.gain.exponentialRampToValueAtTime(0.001,t+0.18);osc.connect(gain);gain.connect(this.ctx.destination);osc.start(t);osc.stop(t+0.18);},playSuccess(){if(!this.ctx)return;const t=this.ctx.currentTime;const notes=[523,659,784,1047];notes.forEach((freq,i)=>{const osc=this.ctx.createOscillator();const gain=this.ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(freq,t+i*0.08);gain.gain.setValueAtTime(0.02,t+i*0.08);gain.gain.exponentialRampToValueAtTime(0.001,t+i*0.08+0.25);osc.connect(gain);gain.connect(this.ctx.destination);osc.start(t+i*0.08);osc.stop(t+i*0.08+0.25);});}};
function haptic(type='light'){if(!navigator.vibrate)return;const patterns={light:[8],medium:[15],success:[10,40,10],save:[5,20,5]};navigator.vibrate(patterns[type]||patterns.light);}

function createRipple(e,el){const rect=el.getBoundingClientRect();const r=document.createElement('span');r.className='ripple';const size=Math.max(rect.width,rect.height);r.style.width=r.style.height=size+'px';r.style.left=(e.clientX-rect.left-size/2)+'px';r.style.top=(e.clientY-rect.top-size/2)+'px';el.style.position='relative';el.style.overflow='hidden';el.appendChild(r);setTimeout(()=>r.remove(),550);}

// ===== ACCORDION =====
document.querySelectorAll('.preview-section-header').forEach(header=>{
header.addEventListener('click',()=>{
AudioEngine.init();AudioEngine.playTap();haptic('light');
const body=document.getElementById(header.dataset.section+'Body');
const arrow=header.querySelector('.preview-section-arrow');
body.classList.toggle('open');
arrow.classList.toggle('open');
});
});

// ===== TERMS CHECKBOXES =====
const termsChecks=[document.getElementById('check1'),document.getElementById('check2'),document.getElementById('check3')];
const termsItems=[document.getElementById('term1'),document.getElementById('term2'),document.getElementById('term3')];
const signBtn=document.getElementById('signBtn');

function updateSignState(){const allChecked=termsChecks.every(c=>c.classList.contains('checked'));const isSigned=document.getElementById('signatureStatus').classList.contains('visible');signBtn.disabled=!(allChecked&&isSigned);}

termsItems.forEach((item,i)=>{item.addEventListener('click',()=>{AudioEngine.init();AudioEngine.playTap();haptic('light');termsChecks[i].classList.toggle('checked');updateSignState();});});

// ===== SIGNATURE METHODS =====
const sigMethods=document.querySelectorAll('.sig-method');
sigMethods.forEach(btn=>{
btn.addEventListener('click',()=>{AudioEngine.init();AudioEngine.playTap();haptic('light');sigMethods.forEach(b=>b.classList.remove('selected'));btn.classList.add('selected');});
});

// ===== CANVAS SIGNATURE =====
const canvas=document.getElementById('sigCanvas');
const ctx=canvas.getContext('2d');
const pad=document.getElementById('signaturePad');
const placeholder=document.getElementById('sigPlaceholder');
const status=document.getElementById('signatureStatus');
const timestamp=document.getElementById('sigTimestamp');
let drawing=false;
let hasDrawn=false;

function resizeCanvas(){const rect=pad.getBoundingClientRect();canvas.width=rect.width*2;canvas.height=rect.height*2;ctx.scale(2,2);ctx.strokeStyle='rgba(124,92,250,0.9)';ctx.lineWidth=2.5;ctx.lineCap='round';ctx.lineJoin='round';}
resizeCanvas();
window.addEventListener('resize',resizeCanvas);

function getPos(e){const rect=canvas.getBoundingClientRect();const clientX=e.touches?e.touches[0].clientX:e.clientX;const clientY=e.touches?e.touches[0].clientY:e.clientY;return{x:clientX-rect.left,y:clientY-rect.top};}

pad.addEventListener('mousedown',e=>{drawing=true;const pos=getPos(e);ctx.beginPath();ctx.moveTo(pos.x,pos.y);});
pad.addEventListener('mousemove',e=>{if(!drawing)return;const pos=getPos(e);ctx.lineTo(pos.x,pos.y);ctx.stroke();if(!hasDrawn){hasDrawn=true;placeholder.classList.add('hidden');}});
pad.addEventListener('mouseup',()=>{drawing=false;ctx.beginPath();if(hasDrawn){const now=new Date();timestamp.textContent=now.toLocaleTimeString('en-NG',{hour:'2-digit',minute:'2-digit'})+' WAT';status.classList.add('visible');updateSignState();AudioEngine.init();AudioEngine.playTap();haptic('light');}});
pad.addEventListener('mouseleave',()=>{drawing=false;ctx.beginPath();});

pad.addEventListener('touchstart',e=>{e.preventDefault();drawing=true;const pos=getPos(e);ctx.beginPath();ctx.moveTo(pos.x,pos.y);},{passive:false});
pad.addEventListener('touchmove',e=>{e.preventDefault();if(!drawing)return;const pos=getPos(e);ctx.lineTo(pos.x,pos.y);ctx.stroke();if(!hasDrawn){hasDrawn=true;placeholder.classList.add('hidden');}},{passive:false});
pad.addEventListener('touchend',e=>{e.preventDefault();drawing=false;ctx.beginPath();if(hasDrawn){const now=new Date();timestamp.textContent=now.toLocaleTimeString('en-NG',{hour:'2-digit',minute:'2-digit'})+' WAT';status.classList.add('visible');updateSignState();AudioEngine.init();AudioEngine.playTap();haptic('light');}},{passive:false});

// ===== SAVE AGREEMENT =====
document.getElementById('saveBtn').addEventListener('click',(e)=>{AudioEngine.init();AudioEngine.playSave();haptic('save');createRipple(e,e.currentTarget);const btn=e.currentTarget;const original=btn.textContent;btn.textContent='Saved';btn.style.color='var(--accent-green)';setTimeout(()=>{btn.textContent=original;btn.style.color='';},2000);});

// ===== SIGN & CONTINUE =====
const successModal=document.getElementById('successModal');
const actionBar=document.getElementById('actionBar');

signBtn.addEventListener('click',(e)=>{if(signBtn.disabled)return;AudioEngine.init();AudioEngine.playSuccess();haptic('success');createRipple(e,e.currentTarget);successModal.classList.add('active');actionBar.style.display='none';});

// ===== CONTINUE TO PAYMENT =====
document.getElementById('continueBtn').addEventListener('click',()=>{AudioEngine.init();AudioEngine.playTap();haptic('light');window.location.href='buyer_payment.html';});

// ===== BACK =====
document.getElementById('backBtn').addEventListener('click',()=>{AudioEngine.init();AudioEngine.playTap();haptic('light');window.location.href='buyer_offer.html';});

// ===== TIMELINE REVEAL =====
const timelineSteps=document.querySelectorAll('.timeline-step');
const timelineObserver=new IntersectionObserver((entries)=>{entries.forEach((entry,index)=>{if(entry.isIntersecting){setTimeout(()=>{entry.target.classList.add('visible');},index*120);timelineObserver.unobserve(entry.target);}});},{threshold:0.3});
timelineSteps.forEach(step=>timelineObserver.observe(step));

// ===== INIT =====
document.addEventListener('click',()=>AudioEngine.init(),{once:true});
document.addEventListener('touchstart',()=>AudioEngine.init(),{once:true});
updateSignState();
