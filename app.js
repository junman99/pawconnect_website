/* PawConnect product story. Native scrolling; no scroll interception. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 1000px) and (min-height: 700px)');
  const root = document.documentElement;
  const motionButton = document.querySelector('.motion-toggle');
  let paused = false;
  const motionAllowed = () => !reduced.matches && !paused;
  function updateMotion() {
    root.classList.toggle('motion-enabled', motionAllowed());
    root.classList.toggle('motion-paused', !motionAllowed());
    motionButton.setAttribute('aria-pressed', String(!motionAllowed()));
    motionButton.setAttribute('aria-label', motionAllowed() ? 'Pause motion' : 'Resume motion');
    motionButton.textContent = motionAllowed() ? 'Ⅱ' : '▷';
    motionButton.disabled = reduced.matches;
    motionButton.title = reduced.matches ? 'Motion reduced by your device preference' : motionButton.getAttribute('aria-label');
    if (!motionAllowed()) document.querySelectorAll('.pending').forEach(el => el.classList.remove('pending'));
    startCat(); onScroll();
  }
  motionButton.addEventListener('click', () => { paused = !paused; updateMotion(); });
  reduced.addEventListener('change', updateMotion);
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  function closeMenu(focus = false) { nav.classList.remove('open'); menu.setAttribute('aria-expanded','false'); menu.setAttribute('aria-label','Open navigation'); if(focus) menu.focus(); }
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation'); });
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>closeMenu()));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open'))closeMenu(true);});
  document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu();});
  matchMedia('(min-width:801px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.remove('pending');revealObserver.unobserve(entry.target);}}),{threshold:.08});
    document.querySelectorAll('.reveal').forEach(el=>{if(!reduced.matches&&el.getBoundingClientRect().top>innerHeight)el.classList.add('pending');revealObserver.observe(el);});
  }
  const journey = document.querySelector('.care-journey');
  const stage = document.querySelector('.journey-stage');
  const screens = [...document.querySelectorAll('[data-screen]')];
  const steps = [...document.querySelectorAll('[data-step]')];
  const careButtons = [...document.querySelectorAll('[data-care]')];
  const progressBars = [...document.querySelectorAll('.journey-progress span')];
  let active = 0, manual = false, scrollFrame = 0;
  function selectCare(index) {
    active = index;
    screens.forEach((el,i)=>{el.hidden=i!==index;});steps.forEach((el,i)=>{el.hidden=i!==index;});
    careButtons.forEach((el,i)=>{el.classList.toggle('active',i===index);el.setAttribute('aria-pressed',String(i===index));});
    progressBars.forEach((el,i)=>el.classList.toggle('active',i===index));
  }
  careButtons.forEach(el=>el.addEventListener('click',()=>{manual=true;selectCare(Number(el.dataset.care));}));
  function onScroll() {
    if(scrollFrame)return;
    scrollFrame=requestAnimationFrame(()=>{
      scrollFrame=0;
      if(desktop.matches&&!reduced.matches&&!manual){
        const available=journey.offsetHeight-stage.offsetHeight;
        const progress=Math.max(0,Math.min(.999,(-journey.getBoundingClientRect().top+68)/Math.max(1,available)));
        const index=Math.min(2,Math.floor(progress*3));if(index!==active)selectCare(index);
      }
      const deck=document.querySelector('.hero-deck');
      if(motionAllowed()&&desktop.matches){
        const hero=document.querySelector('.hero');
        const p=Math.max(0,Math.min(1,(scrollY-140)/hero.offsetHeight));
        deck.style.setProperty('--spread',`${310+p*70}px`);deck.style.setProperty('--rise',`${-p*55}px`);
      } else {deck.style.removeProperty('--spread');deck.style.removeProperty('--rise');}
    });
  }
  window.addEventListener('scroll',()=>{manual=false;onScroll();},{passive:true});
  desktop.addEventListener('change',()=>{selectCare(0);onScroll();});
  selectCare(0);
  // Native coral cat artwork. Matching source rig layout, gently animated on canvas.
  const canvas = document.querySelector('#coral-cat');
  const context = canvas.getContext('2d');
  const parts = {};
  let catReady = false, catVisible = false, catFrame = 0, catTime = 0, previousTime = 0;
  function part(key, x, y, w, h, rotation = 0, ax = .5, ay = .5) {
    context.save(); context.translate(x + w * (ax - .5), y + h * (ay - .5)); context.rotate(rotation * Math.PI / 180);
    context.drawImage(parts[key], -w * ax, -h * ay, w, h); context.restore();
  }
  function drawCat(time = 0) {
    context.clearRect(0, 0, 450, 450);
    context.save(); context.translate(225,225);
    const breath = motionAllowed() ? Math.sin(time * 1.35) : 0;
    const blink = motionAllowed() && time % 6.8 > 6.55;
    context.fillStyle = '#a26e5520';context.beginPath();context.ellipse(-15,174,105,10,0,0,Math.PI*2);context.fill();
    part('tail',109.5,62,119,182,motionAllowed()?Math.sin(time*.8)*3:0,.15,.934);
    context.save();context.translate(-15,153);context.scale(1+breath*.006,1+breath*.012);
    part('body',0,-66,216,140);part('pawL',-38,-32,66,96);part('pawR',43,-32,66,96);context.restore();
    context.save();context.translate(-15,21+breath*1.5);
    context.rotate((motionAllowed()?Math.sin(time*.5)*1.1:0)*Math.PI/180);
    part('earL',-97,-153.5,96,111);part('earR',97,-153.5,96,111);part('head',0,-66,284,196);
    part(blink?'closedL':'eyeL',-60,blink?-60:-69,blink?29:24,blink?12:40);
    part(blink?'closedR':'eyeR',55,blink?-60:-69,blink?29:24,blink?12:40);
    part('mouth',0,-39.5,50,35);context.restore();context.restore();
  }
  function tick(timestamp) {
    catFrame = 0;
    if (!catReady || !catVisible || document.hidden || !motionAllowed()) { previousTime = 0; return; }
    if (previousTime) catTime += Math.min(.05,(timestamp-previousTime)/1000);
    previousTime = timestamp; drawCat(catTime);catFrame=requestAnimationFrame(tick);
  }
  function startCat() {
    if (!catReady) return;
    if (catFrame) cancelAnimationFrame(catFrame);
    catFrame=0;previousTime=0;drawCat(catTime);
    if (catVisible && !document.hidden && motionAllowed()) catFrame=requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { catVisible = entries[0].isIntersecting; startCat(); }).observe(canvas);
  document.addEventListener('visibilitychange', startCat);
  Promise.all(['head','earL','earR','body','pawL','pawR','tail','eyeL','eyeR','closedL','closedR','mouth'].map(key => new Promise((resolve,reject) => {
    const image = new Image();image.onload=()=>{parts[key]=image;resolve();};image.onerror=reject;image.src=`assets/cat-rig/${key}.png`;
  }))).then(() => { catReady=true;startCat(); }).catch(() => {
    const fallback = new Image();fallback.onload=()=>context.drawImage(fallback,0,0,450,450);fallback.src='assets/coral-cat.png';
  });
  updateMotion();
})();
