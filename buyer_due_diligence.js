const AudioEngine={ctx:null,init(){if(!this.ctx)this.ctx=new(window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')this.ctx.resume();},playTap(){if(!this.ctx)return;const t=this.ctx.currentTime;const osc=this.ctx.createOscillator();const gain=this.ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(1100,t);gain.gain.setValueAtTime(0.012,t);gain.gain.exponentialRampToValueAtTime(0.001,t+0.05);osc.connect(gain);gain.connect(this.ctx.destination);osc.start(t);osc.stop(t+0.05);},playSave(){if(!this.ctx)return;const t=this.ctx.currentTime;const osc=this.ctx.createOscillator();const gain=this.ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(550,t);osc.frequency.exponentialRampToValueAtTime(880,t+0.12);gain.gain.setValueAtTime(0.018,t);gain.gain.exponentialRampToValueAtTime(0.001,t+0.18);osc.connect(gain);gain.connect(this.ctx.destination);osc.start(t);osc.stop(t+0.18);}};
function haptic(type='light'){if(!navigator.vibrate)return;const patterns={light:[8],medium:[15],success:[10,40,10],save:[5,20,5]};navigator.vibrate(patterns[type]||patterns.light);}

// Count-up animation for confidence score
function animateCountUp(){const el=document.getElementById('confidenceNum');const target=94;const duration=1200;const start=performance.now();function update(now){const elapsed=now-start;const progress=Math.min(elapsed/duration,1);const eased=1-Math.pow(1-progress,3);const current=Math.round(eased*target);el.textContent=current;if(progress<1)requestAnimationFrame(update);}requestAnimationFrame(update);}

// Timeline reveal
const timelineItems=document.querySelectorAll('.timeline-item');
const timelineObserver=new IntersectionObserver((entries)=>{entries.forEach((entry,index)=>{if(entry.isIntersecting){setTimeout(()=>{entry.target.classList.add('visible');},index*150);timelineObserver.unobserve(entry.target);}});},{threshold:0.3});
timelineItems.forEach(item=>timelineObserver.observe(item));

// Modal
document.querySelectorAll('[data-doc]').forEach(item=>{item.addEventListener('click',()=>{AudioEngine.init();AudioEngine.playTap();haptic('light');const docType=item.getAttribute('data-doc');const titles={survey:'Survey Plan',coo:'Certificate of Occupancy',building:'Building Approval',tax:'Property Tax Status',deed:'Deed Status',title:'Title Documents',report:'Verification Report',history:'Ownership History'};document.getElementById('modalTitle').textContent=titles[docType]||'Document Preview';document.getElementById('modalOverlay').classList.add('active');});});
document.getElementById('modalClose').addEventListener('click',()=>{document.getElementById('modalOverlay').classList.remove('active');});
document.getElementById('modalOverlay').addEventListener('click',(e)=>{if(e.target===e.currentTarget)document.getElementById('modalOverlay').classList.remove('active');});

// Question checkboxes
document.querySelectorAll('.question-check').forEach(check=>{check.addEventListener('click',()=>{AudioEngine.init();AudioEngine.playTap();haptic('light');check.classList.toggle('checked');const svg=check.querySelector('svg');svg.style.display=check.classList.contains('checked')?'block':'none';});});

// Back
document.getElementById('backBtn').addEventListener('click',()=>{AudioEngine.init();AudioEngine.playTap();haptic('light');window.location.href='bpd.html';});

// Save
document.getElementById('saveBtn').addEventListener('click',(e)=>{AudioEngine.init();AudioEngine.playSave();haptic('save');createRipple(e,e.currentTarget);});

// Share
document.getElementById('shareBtn').addEventListener('click',()=>{AudioEngine.init();AudioEngine.playTap();haptic('light');});

// Make Offer
document.getElementById('offerBtn').addEventListener('click',(e)=>{AudioEngine.init();AudioEngine.playTap();haptic('medium');createRipple(e,e.currentTarget);window.location.href='buyer_offer.html';});

function createRipple(e,el){const rect=el.getBoundingClientRect();const r=document.createElement('span');r.className='ripple';const size=Math.max(rect.width,rect.height);r.style.width=r.style.height=size+'px';r.style.left=(e.clientX-rect.left-size/2)+'px';r.style.top=(e.clientY-rect.top-size/2)+'px';el.style.position='relative';el.style.overflow='hidden';el.appendChild(r);setTimeout(()=>r.remove(),550);}

// Trigger count-up when confidence hero is visible
const confidenceHero=document.querySelector('.confidence-hero');
const confidenceObserver=new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(entry.isIntersecting){animateCountUp();confidenceObserver.unobserve(entry.target);}});},{threshold:0.5});
if(confidenceHero)confidenceObserver.observe(confidenceHero);

document.addEventListener('click',()=>AudioEngine.init(),{once:true});
document.addEventListener('DOMContentLoaded',()=>{ setTimeout(animateCountUp, 500); });
document.addEventListener('touchstart',()=>AudioEngine.init(),{once:true});
