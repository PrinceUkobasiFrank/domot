const AudioEngine={ctx:null,init(){if(!this.ctx)this.ctx=new(window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')this.ctx.resume();},playTap(){if(!this.ctx)return;const t=this.ctx.currentTime;const osc=this.ctx.createOscillator();const gain=this.ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(1100,t);gain.gain.setValueAtTime(0.012,t);gain.gain.exponentialRampToValueAtTime(0.001,t+0.05);osc.connect(gain);gain.connect(this.ctx.destination);osc.start(t);osc.stop(t+0.05);},playSave(){if(!this.ctx)return;const t=this.ctx.currentTime;const osc=this.ctx.createOscillator();const gain=this.ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(550,t);osc.frequency.exponentialRampToValueAtTime(880,t+0.12);gain.gain.setValueAtTime(0.018,t);gain.gain.exponentialRampToValueAtTime(0.001,t+0.18);osc.connect(gain);gain.connect(this.ctx.destination);osc.start(t);osc.stop(t+0.18);}};
function haptic(type='light'){if(!navigator.vibrate)return;const patterns={light:[8],medium:[15],success:[10,40,10],save:[5,20,5]};navigator.vibrate(patterns[type]||patterns.light);}

const track=document.getElementById('galleryTrack');
const slides=track.querySelectorAll('.gallery-slide');
const dots=document.querySelectorAll('.dot');
const counterEl=document.getElementById('currentSlide');
let current=0;
let startX=0;
let isDragging=false;
function goToSlide(n){slides[current].classList.remove('active');dots[current].classList.remove('active');current=(n+slides.length)%slides.length;slides[current].classList.add('active');dots[current].classList.add('active');track.style.transform=`translateX(-${current*100}%)`;counterEl.textContent=current+1;}
track.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;isDragging=true;},{passive:true});
track.addEventListener('touchend',e=>{if(!isDragging)return;isDragging=false;const diff=e.changedTouches[0].clientX-startX;if(Math.abs(diff)>40)goToSlide(diff<0?current+1:current-1);},{passive:true});
track.addEventListener('mousedown',e=>{startX=e.clientX;isDragging=true;});
track.addEventListener('mouseup',e=>{if(!isDragging)return;isDragging=false;const diff=e.clientX-startX;if(Math.abs(diff)>40)goToSlide(diff<0?current+1:current-1);});
track.addEventListener('mouseleave',()=>{isDragging=false;});

const investmentCard=document.getElementById('investmentCard');
const ownershipCard=document.getElementById('ownershipCard');
const observer=new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}});},{threshold:0.2});
if(investmentCard)observer.observe(investmentCard);
if(ownershipCard)observer.observe(ownershipCard);

const descBody=document.getElementById('descBody');
const readMoreBtn=document.getElementById('readMoreBtn');
let expanded=false;
readMoreBtn.addEventListener('click',()=>{expanded=!expanded;descBody.classList.toggle('expanded',expanded);readMoreBtn.textContent=expanded?'Read less':'Read more';AudioEngine.init();AudioEngine.playTap();});

const saveBtn=document.getElementById('saveBtn');
let saved=false;
saveBtn.addEventListener('click',()=>{AudioEngine.init();saved=!saved;saveBtn.classList.toggle('saved',saved);if(saved){saveBtn.classList.add('just-saved');AudioEngine.playSave();haptic('save');setTimeout(()=>saveBtn.classList.remove('just-saved'),450);}else{haptic('light');}});

function createRipple(e,el){const rect=el.getBoundingClientRect();const r=document.createElement('span');r.className='ripple';const size=Math.max(rect.width,rect.height);r.style.width=r.style.height=size+'px';r.style.left=(e.clientX-rect.left-size/2)+'px';r.style.top=(e.clientY-rect.top-size/2)+'px';el.style.position='relative';el.style.overflow='hidden';el.appendChild(r);setTimeout(()=>r.remove(),550);}

document.getElementById('ddBtn').addEventListener('click',e=>{AudioEngine.init();AudioEngine.playTap();haptic('light');createRipple(e,e.currentTarget);window.location.href='buyer_due_diligence.html';});
document.getElementById('offerBtn').addEventListener('click',e=>{AudioEngine.init();AudioEngine.playTap();haptic('medium');createRipple(e,e.currentTarget);window.location.href='buyer_offer.html';});
document.getElementById('backBtn').addEventListener('click',()=>{AudioEngine.init();AudioEngine.playTap();haptic('light');window.location.href='buyer_dashboard.html';});
document.getElementById('shareBtn').addEventListener('click',()=>{AudioEngine.init();AudioEngine.playTap();haptic('light');});
document.getElementById('ddCard').addEventListener('click',()=>{AudioEngine.init();AudioEngine.playTap();haptic('light');window.location.href='buyer_due_diligence.html';});

document.addEventListener('click',()=>AudioEngine.init(),{once:true});
document.addEventListener('touchstart',()=>AudioEngine.init(),{once:true});
