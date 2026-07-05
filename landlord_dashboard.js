const AudioEngine={ctx:null,init(){if(!this.ctx)this.ctx=new(window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')this.ctx.resume();},playTap(){if(!this.ctx)return;const t=this.ctx.currentTime;const osc=this.ctx.createOscillator();const gain=this.ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(1100,t);gain.gain.setValueAtTime(0.012,t);gain.gain.exponentialRampToValueAtTime(0.001,t+0.05);osc.connect(gain);gain.connect(this.ctx.destination);osc.start(t);osc.stop(t+0.05);},playSave(){if(!this.ctx)return;const t=this.ctx.currentTime;const osc=this.ctx.createOscillator();const gain=this.ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(550,t);osc.frequency.exponentialRampToValueAtTime(880,t+0.12);gain.gain.setValueAtTime(0.018,t);gain.gain.exponentialRampToValueAtTime(0.001,t+0.18);osc.connect(gain);gain.connect(this.ctx.destination);osc.start(t);osc.stop(t+0.18);}};
function haptic(type='light'){if(!navigator.vibrate)return;const patterns={light:[8],medium:[15],save:[5,20,5]};navigator.vibrate(patterns[type]||patterns.light);}
function createRipple(e,el){const rect=el.getBoundingClientRect();const r=document.createElement('span');r.className='ripple';const size=Math.max(rect.width,rect.height);r.style.width=r.style.height=size+'px';r.style.left=(e.clientX-rect.left-size/2)+'px';r.style.top=(e.clientY-rect.top-size/2)+'px';el.style.position='relative';el.style.overflow='hidden';el.appendChild(r);setTimeout(()=>r.remove(),550);}

// Greeting time
function updateGreeting(){const hour=new Date().getHours();const el=document.getElementById('greetingTime');if(hour<12)el.textContent='Good Morning';else if(hour<17)el.textContent='Good Afternoon';else el.textContent='Good Evening';}
updateGreeting();

// Count-up animations
function animateCountUp(){const targets=[85000000,1800000,12,3,94,2450000,1800000,500000,650000];const elements=['portfolioValue','revenueValue','applicationsValue','maintenanceValue','trustValue','walletBalance','monthRevenue','monthWithdrawals','monthPending'];const prefixes=['₦','₦','','','','₦','₦','₦','₦'];
elements.forEach((id,i)=>{const el=document.getElementById(id);if(!el)return;let current=0;const increment=targets[i]/50;const timer=setInterval(()=>{current+=increment;if(current>=targets[i]){current=targets[i];clearInterval(timer);}el.textContent=prefixes[i]+Math.round(current).toLocaleString('en-NG');},25);});}
setTimeout(animateCountUp,400);

// Health ring animation
function animateRings(){document.querySelectorAll('.health-ring-fill').forEach(ring=>{const target=parseInt(ring.dataset.target);const circumference=2*Math.PI*26;const offset=circumference-(target/100)*circumference;setTimeout(()=>{ring.style.strokeDashoffset=offset;},300);});}
setTimeout(animateRings,600);

// Tab switching
const navItems=document.querySelectorAll('.nav-item');
const tabContents=document.querySelectorAll('.tab-content');
navItems.forEach(item=>{item.addEventListener('click',()=>{AudioEngine.init();AudioEngine.playTap();haptic('light');const tabId=item.dataset.tab;navItems.forEach(n=>n.classList.remove('active'));item.classList.add('active');tabContents.forEach(t=>t.classList.remove('active'));document.getElementById(tabId).classList.add('active');document.getElementById('dashboardContainer').scrollTop=0;});});

// FAB toggle
const fabBtn=document.getElementById('fabBtn');
const fabMenu=document.getElementById('fabMenu');
const fabOverlay=document.getElementById('fabOverlay');
let fabOpen=false;
function toggleFab(){fabOpen=!fabOpen;fabBtn.classList.toggle('open',fabOpen);fabMenu.classList.toggle('open',fabOpen);fabOverlay.classList.toggle('open',fabOpen);}
fabBtn.addEventListener('click',()=>{AudioEngine.init();AudioEngine.playTap();haptic('light');toggleFab();});
fabOverlay.addEventListener('click',()=>{if(fabOpen)toggleFab();});

// Add Property button
document.getElementById('addPropertyBtn').addEventListener('click',()=>{AudioEngine.init();AudioEngine.playTap();haptic('medium');toggleFab();setTimeout(()=>{window.location.href='property_listing.html';},200);});

// View All Applications
document.getElementById('viewAllAppsBtn').addEventListener('click',()=>{AudioEngine.init();AudioEngine.playTap();haptic('light');navItems.forEach(n=>n.classList.remove('active'));document.querySelector('[data-tab="tab-applications"]').classList.add('active');tabContents.forEach(t=>t.classList.remove('active'));document.getElementById('tab-applications').classList.add('active');document.getElementById('dashboardContainer').scrollTop=0;});

// Open Maintenance Hub
document.getElementById('openMaintHubBtn').addEventListener('click',()=>{AudioEngine.init();AudioEngine.playTap();haptic('light');setTimeout(()=>{window.location.href='maintenance_center.html';},180);});

// App filter buttons
document.querySelectorAll('.app-filter').forEach(btn=>{btn.addEventListener('click',()=>{AudioEngine.init();AudioEngine.playTap();haptic('light');btn.parentElement.querySelectorAll('.app-filter').forEach(b=>b.classList.remove('active'));btn.classList.add('active');});});

// Appearance toggle
document.querySelectorAll('.appearance-option').forEach(btn=>{btn.addEventListener('click',()=>{AudioEngine.init();AudioEngine.playTap();haptic('light');btn.parentElement.querySelectorAll('.appearance-option').forEach(b=>b.classList.remove('selected'));btn.classList.add('selected');const theme=btn.dataset.theme;if(theme==='light')document.body.classList.add('light-mode');else document.body.classList.remove('light-mode');});});

// Card press effects
document.querySelectorAll('.prop-card').forEach(card=>{card.addEventListener('click',(e)=>{AudioEngine.init();AudioEngine.playTap();haptic('light');createRipple(e,card);setTimeout(()=>{window.location.href='property_listing.html';},180);});});
document.querySelectorAll('.app-card, .app-item').forEach(card=>{card.addEventListener('click',(e)=>{AudioEngine.init();AudioEngine.playTap();haptic('light');createRipple(e,card);setTimeout(()=>{window.location.href='application_review.html';},180);});});
document.querySelectorAll('.maint-item').forEach(card=>{card.addEventListener('click',(e)=>{AudioEngine.init();AudioEngine.playTap();haptic('light');createRipple(e,card);setTimeout(()=>{window.location.href='maintenance_center.html';},180);});});
document.querySelectorAll('.hub-card, .txn-item').forEach(card=>{card.addEventListener('click',(e)=>{AudioEngine.init();AudioEngine.playTap();haptic('light');createRipple(e,card);});});;

// Init audio on first interaction
document.addEventListener('click',()=>AudioEngine.init(),{once:true});
document.addEventListener('touchstart',()=>AudioEngine.init(),{once:true});
