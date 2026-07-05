const AudioEngine={ctx:null,init(){if(!this.ctx)this.ctx=new(window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')this.ctx.resume();},playTap(){if(!this.ctx)return;const t=this.ctx.currentTime;const osc=this.ctx.createOscillator();const gain=this.ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(1100,t);gain.gain.setValueAtTime(0.012,t);gain.gain.exponentialRampToValueAtTime(0.001,t+0.05);osc.connect(gain);gain.connect(this.ctx.destination);osc.start(t);osc.stop(t+0.05);},playSave(){if(!this.ctx)return;const t=this.ctx.currentTime;const osc=this.ctx.createOscillator();const gain=this.ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(550,t);osc.frequency.exponentialRampToValueAtTime(880,t+0.12);gain.gain.setValueAtTime(0.018,t);gain.gain.exponentialRampToValueAtTime(0.001,t+0.18);osc.connect(gain);gain.connect(this.ctx.destination);osc.start(t);osc.stop(t+0.18);}};
function haptic(type='light'){if(!navigator.vibrate)return;const patterns={light:[8],medium:[15],save:[5,20,5]};navigator.vibrate(patterns[type]||patterns.light);}
function createRipple(e,el){const rect=el.getBoundingClientRect();const r=document.createElement('span');r.className='ripple';const size=Math.max(rect.width,rect.height);r.style.width=r.style.height=size+'px';r.style.left=(e.clientX-rect.left-size/2)+'px';r.style.top=(e.clientY-rect.top-size/2)+'px';el.style.position='relative';el.style.overflow='hidden';el.appendChild(r);setTimeout(()=>r.remove(),550);}

let currentStep=1;
let selectedType=null;
document.addEventListener('DOMContentLoaded',function(){const pb=document.getElementById('publishBtn');if(pb)pb.disabled=true;});
let selectedPurpose=null;
let uploadedPhotos=[];
let coverIndex=0;
let docStates={ownership:'pending',survey:'pending',coo:'pending',approval:'pending',tax:'pending'};
let trustScore=42;

function updateProgress(){const steps=document.querySelectorAll('.progress-step');const connectors=document.querySelectorAll('.progress-connector-fill');steps.forEach((step,i)=>{const dot=step.querySelector('.progress-dot');if(i+1<currentStep){step.classList.remove('active');step.classList.add('done');dot.classList.remove('pending','active');dot.classList.add('done');dot.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';}else if(i+1===currentStep){step.classList.remove('done');step.classList.add('active');dot.classList.remove('pending','done');dot.classList.add('active');dot.textContent=i+1;}else{step.classList.remove('active','done');dot.classList.remove('active','done');dot.classList.add('pending');dot.textContent=i+1;}});for(let i=0;i<connectors.length;i++){connectors[i].style.width=i+1<currentStep?'100%':'0%';}}

function showStep(n){document.querySelectorAll('.step-content').forEach(s=>s.classList.remove('active'));document.getElementById('step'+n).classList.add('active');document.getElementById('pageContainer').scrollTop=0;currentStep=n;updateProgress();const publishBtn=document.getElementById('publishBtn');if(publishBtn){publishBtn.disabled=(n!==5);}}

function nextStep(){AudioEngine.init();AudioEngine.playTap();haptic('light');if(currentStep<5)showStep(currentStep+1);}
function prevStep(){AudioEngine.init();AudioEngine.playTap();haptic('light');if(currentStep>1)showStep(currentStep-1);}

function selectType(el){AudioEngine.init();AudioEngine.playTap();haptic('light');document.querySelectorAll('.select-card').forEach(c=>c.classList.remove('selected'));el.classList.add('selected');selectedType=el.dataset.type;}

function selectPurpose(el){AudioEngine.init();AudioEngine.playTap();haptic('light');document.querySelectorAll('.purpose-card').forEach(c=>c.classList.remove('selected'));el.classList.add('selected');selectedPurpose=el.dataset.purpose;const rentGroup=document.getElementById('rentPriceGroup');const saleGroup=document.getElementById('salePriceGroup');if(selectedPurpose==='rent'){rentGroup.style.display='block';saleGroup.style.display='none';}else if(selectedPurpose==='sell'){rentGroup.style.display='none';saleGroup.style.display='block';}else{rentGroup.style.display='block';saleGroup.style.display='block';}}

function toggleAmenity(el){AudioEngine.init();AudioEngine.playTap();haptic('light');el.classList.toggle('selected');}

function handlePhotos(e){const files=e.target.files;if(!files.length)return;for(let i=0;i<files.length;i++){const reader=new FileReader();reader.onload=function(evt){uploadedPhotos.push(evt.target.result);renderPhotos();};reader.readAsDataURL(files[i]);}}

function renderPhotos(){const grid=document.getElementById('photoGrid');const section=document.getElementById('photoPreviewSection');const hint=document.getElementById('coverHint');grid.innerHTML='';uploadedPhotos.forEach((src,i)=>{const card=document.createElement('div');card.className='photo-card';card.innerHTML='<img src="'+src+'" alt="Photo"><div class="photo-overlay"><span class="photo-label">Photo '+(i+1)+'</span><div class="photo-actions"><button class="photo-btn '+ (i===coverIndex?'cover':'') +'" onclick="setCover('+i+',event)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></button><button class="photo-btn" onclick="removePhoto('+i+',event)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button></div></div>'+(i===coverIndex?'<div class="cover-badge">Cover</div>':'');grid.appendChild(card);});section.style.display='block';hint.style.display='inline-flex';}

function setCover(idx,e){e.stopPropagation();AudioEngine.init();AudioEngine.playTap();haptic('light');coverIndex=idx;renderPhotos();}
function removePhoto(idx,e){e.stopPropagation();AudioEngine.init();AudioEngine.playTap();haptic('light');uploadedPhotos.splice(idx,1);if(coverIndex>=uploadedPhotos.length)coverIndex=0;renderPhotos();if(!uploadedPhotos.length){document.getElementById('photoPreviewSection').style.display='none';document.getElementById('coverHint').style.display='none';}}

function uploadDoc(el,key){AudioEngine.init();AudioEngine.playTap();haptic('light');const states=['pending','uploaded','verified'];const current=docStates[key];let next;if(current==='pending')next='uploaded';else if(current==='uploaded')next='verified';else next='pending';docStates[key]=next;const statusEl=document.getElementById('status-'+key);const btnEl=document.getElementById('btn-'+key);statusEl.className='doc-status '+next;statusEl.textContent=next==='pending'?'Pending upload':next==='uploaded'?'Uploaded':'Verified';btnEl.textContent=next==='pending'?'Upload':next==='uploaded'?'Verify':'Remove';updateTrustScore();}

function updateTrustScore(){let score=42;Object.values(docStates).forEach(s=>{if(s==='uploaded')score+=10;if(s==='verified')score+=15;});if(uploadedPhotos.length>=3)score+=10;if(uploadedPhotos.length>=5)score+=5;trustScore=Math.min(score,100);document.getElementById('trustScore').innerHTML=trustScore+'<span style="font-size:20px;color:var(--text-muted);">/100</span>';}

function toggleSwitch(el){AudioEngine.init();AudioEngine.playTap();haptic('light');el.classList.toggle('active');}

function saveDraft(){AudioEngine.init();AudioEngine.playSave();haptic('save');}

function publishListing(){AudioEngine.init();AudioEngine.playSave();haptic('save');document.getElementById('stickyBar').classList.add('hidden');document.getElementById('successScreen').classList.add('active');document.getElementById('successTrust').textContent=trustScore;const id='DOM-LST-'+new Date().getFullYear()+'-'+String(Math.floor(Math.random()*900)+100).padStart(3,'0');document.getElementById('successId').textContent=id;}

function viewListing(){AudioEngine.init();AudioEngine.playTap();haptic('light');window.location.href='property_listing.html';}
function manageProperty(){AudioEngine.init();AudioEngine.playTap();haptic('light');window.location.href='landlord_dashboard.html';}
function goBack(){AudioEngine.init();AudioEngine.playTap();haptic('light');window.history.back();}

const uploadZone=document.getElementById('uploadZone');
['dragenter','dragover','dragleave','drop'].forEach(eventName=>{uploadZone.addEventListener(eventName,preventDefaults,false);});
function preventDefaults(e){e.preventDefault();e.stopPropagation();}
['dragenter','dragover'].forEach(eventName=>{uploadZone.addEventListener(eventName,()=>uploadZone.classList.add('dragover'),false);});
['dragleave','drop'].forEach(eventName=>{uploadZone.addEventListener(eventName,()=>uploadZone.classList.remove('dragover'),false);});
uploadZone.addEventListener('drop',handleDrop,false);
function handleDrop(e){const dt=e.dataTransfer;const files=dt.files;document.getElementById('photoInput').files=files;handlePhotos({target:{files:files}});}

document.querySelectorAll('.select-card, .purpose-card, .form-card, .doc-card, .amenity-chip, .upload-zone').forEach(el=>{el.addEventListener('click',(e)=>{AudioEngine.init();AudioEngine.playTap();haptic('light');createRipple(e,el);});});

document.addEventListener('click',()=>AudioEngine.init(),{once:true});
document.addEventListener('touchstart',()=>AudioEngine.init(),{once:true});
