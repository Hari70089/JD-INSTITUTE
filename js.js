/* ── HAMBURGER ── */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
function toggleMenu(force) {
  const open = typeof force==='boolean' ? force : !hamburger.classList.contains('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', open);
  if (open) { mobileNav.style.display='flex'; requestAnimationFrame(()=>mobileNav.classList.add('open')); }
  else { mobileNav.classList.remove('open'); setTimeout(()=>{ if(!mobileNav.classList.contains('open')) mobileNav.style.display='none'; },300); }
}
hamburger.addEventListener('click', ()=>toggleMenu());
document.querySelectorAll('.m-link').forEach(a => a.addEventListener('click', ()=>toggleMenu(false)));

/* ── CUSTOM CURSOR (desktop only) ── */
const isTouch = ()=>window.matchMedia('(hover:none)').matches;
if (!isTouch()) {
  const curEl=document.getElementById('cursor'), ringEl=document.getElementById('cursorRing');
  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY});
  (function ac(){curEl.style.cssText+=`;left:${mx}px;top:${my}px`;rx+=(mx-rx)*.12;ry+=(my-ry)*.12;ringEl.style.cssText+=`;left:${rx}px;top:${ry}px`;requestAnimationFrame(ac)})();
  document.querySelectorAll('a,button,.program-card,.faculty-card').forEach(el=>{
    el.addEventListener('mouseenter',()=>{ringEl.style.width='60px';ringEl.style.height='60px';ringEl.style.opacity='.5'});
    el.addEventListener('mouseleave',()=>{ringEl.style.width='36px';ringEl.style.height='36px';ringEl.style.opacity='1'});
  });
}

/* ── THREE.JS 3D ── */
(function(){
  const canvas=document.getElementById('three-canvas');
  let renderer;
  try{ renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'}); }
  catch(e){ canvas.style.display='none'; return; }

  const mobile = window.innerWidth < 768;
  const count  = mobile ? 700 : 1800;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile?1.5:2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,.1,1000);
  camera.position.z=30;

  /* particles */
  const geo=new THREE.BufferGeometry();
  const pos=new Float32Array(count*3);
  for(let i=0;i<count;i++){pos[i*3]=(Math.random()-.5)*120;pos[i*3+1]=(Math.random()-.5)*120;pos[i*3+2]=(Math.random()-.5)*80;}
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const pMat=new THREE.PointsMaterial({color:0xC9A84C,size:.18,transparent:true,opacity:.55,sizeAttenuation:true});
  const pts=new THREE.Points(geo,pMat);
  scene.add(pts);

  /* rings – desktop only */
  const extras=[];
  if(!mobile){
    function ring(r,tube,col,x,y,z){
      const m=new THREE.Mesh(new THREE.TorusGeometry(r,tube,8,80),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.06}));
      m.position.set(x,y,z);scene.add(m);return m;
    }
    extras.push(ring(14,.06,0xC9A84C,-8,4,-10));
    extras.push(ring(9,.04,0xE8CFA0,10,-6,-5));
    extras.push(ring(18,.03,0xC9A84C,2,-2,-20));
    const ico=new THREE.Mesh(new THREE.IcosahedronGeometry(6,1),new THREE.MeshBasicMaterial({color:0xC9A84C,wireframe:true,transparent:true,opacity:.04}));
    ico.position.set(15,5,-12);scene.add(ico);extras.push(ico);
  }

  let mX=0,mY=0;
  document.addEventListener('mousemove',e=>{mX=(e.clientX/innerWidth-.5)*2;mY=(e.clientY/innerHeight-.5)*2});
  document.addEventListener('touchmove',e=>{const t=e.touches[0];mX=(t.clientX/innerWidth-.5)*2;mY=(t.clientY/innerHeight-.5)*2},{passive:true});

  let t=0, vis=true;
  document.addEventListener('visibilitychange',()=>{vis=!document.hidden});
  (function animate(){
    requestAnimationFrame(animate);
    if(!vis)return;
    t+=.003;
    pts.rotation.y=t*.04+mX*.05; pts.rotation.x=mY*.03;
    if(extras[0]){extras[0].rotation.x=t*.3;extras[0].rotation.y=t*.2}
    if(extras[1]){extras[1].rotation.z=t*.15;extras[1].rotation.x=t*.25}
    if(extras[2]){extras[2].rotation.y=t*.1;extras[2].rotation.z=t*.08}
    if(extras[3]){extras[3].rotation.y=t*.2;extras[3].rotation.x=t*.15}
    renderer.render(scene,camera);
  })();

  let rt;
  window.addEventListener('resize',()=>{
    clearTimeout(rt);
    rt=setTimeout(()=>{
      camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
      renderer.setSize(innerWidth,innerHeight);
    },150);
  });
})();

/* ── SCROLL REVEAL ── */
new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')});
},{threshold:.1}).observe || document.querySelectorAll('.reveal').forEach(el=>{
  new IntersectionObserver(([e])=>{if(e.isIntersecting)el.classList.add('visible')},{threshold:.1}).observe(el);
});
// proper way:
const revObs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.1});
document.querySelectorAll('.reveal').forEach(el=>revObs.observe(el));

/* ── COUNTER ANIMATION ── */
function countUp(el,target){
  const suffix=el.querySelector('span')?el.querySelector('span').outerHTML:'';
  const dur=1800; let s=null;
  (function step(ts){
    if(!s)s=ts;
    const p=Math.min((ts-s)/dur,1);
    el.innerHTML=Math.floor(p*target)+suffix;
    if(p<1)requestAnimationFrame(step); else el.innerHTML=target+suffix;
  })(performance.now());
}
const statsEl=document.getElementById('stats');
new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.querySelectorAll('.stat-num[data-target]').forEach(el=>{
        countUp(el,+el.dataset.target);
      });
    }
  });
},{threshold:.4}).observe(statsEl);

/* ── PHONE INPUT: allow only digits, max 10 (all devices) ── */
(function(){
  var ph=document.getElementById('fphone');
  /* Block non-numeric keys on desktop keyboards */
  ph.addEventListener('keydown',function(e){
    if(e.ctrlKey||e.metaKey||e.altKey)return;
    if(['Backspace','Delete','Tab','ArrowLeft','ArrowRight','Home','End'].indexOf(e.key)!==-1)return;
    if(!/^[0-9]$/.test(e.key))e.preventDefault();
    if(/^[0-9]$/.test(e.key)&&this.value.length>=10)e.preventDefault();
  });
  /* Strip non-digits on input (handles paste, autofill, mobile) */
  ph.addEventListener('input',function(){
    this.value=this.value.replace(/[^0-9]/g,'').slice(0,10);
  });
  /* Strip non-digits on paste */
  ph.addEventListener('paste',function(e){
    e.preventDefault();
    var pasted=(e.clipboardData||window.clipboardData).getData('text');
    var digits=pasted.replace(/[^0-9]/g,'');
    var current=this.value;
    var start=this.selectionStart,end=this.selectionEnd;
    var newVal=(current.slice(0,start)+digits+current.slice(end)).replace(/[^0-9]/g,'').slice(0,10);
    this.value=newVal;
  });
})();

/* ── SUBMIT BUTTON ── */
document.querySelector('.submit-btn').addEventListener('click',function(){
  const name=document.getElementById('fname').value.trim();
  if(!name){alert('Please enter your name.');return;}
  const phone=document.getElementById('fphone').value.trim();
  if(phone.length!==10){alert('Please enter a valid 10-digit mobile number.');return;}
  alert('Thank you, '+name+'! Our counsellors will contact you within 24 hours.');
});
