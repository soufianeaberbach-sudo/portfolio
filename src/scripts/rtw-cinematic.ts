import { gsap } from 'gsap';
import { paintRtwPhoto } from './rtw-photo';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const prototype = document.querySelector<HTMLElement>('[data-rtw-prototype]');
if (prototype) {
  const act = prototype.closest<HTMLElement>('[data-act]')!;
  const camera = prototype.querySelector<HTMLElement>('[data-rtw-camera]')!;
  const stage = prototype.querySelector<HTMLElement>('[data-rtw-stage]')!;
  const actors = Object.fromEntries([...stage.querySelectorAll<HTMLElement>('[data-rtw-actor]')].map(a => [a.dataset.rtwActor!, a]));
  const title = stage.querySelector<HTMLElement>('[data-rtw-title]')!;
  const running = prototype.querySelector<HTMLElement>('[data-rtw-running]')!;
  const side = stage.querySelector<HTMLElement>('[data-rtw-side]')!;
  const payoff = stage.querySelector<HTMLElement>('[data-rtw-payoff]')!;
  const signal = stage.querySelector<HTMLElement>('[data-rtw-signal]')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 767px), (max-width: 1023px) and (orientation: portrait)');
  let scene: gsap.core.Timeline | null = null;
  let handoff: gsap.core.Timeline | null = null;
  let frame = 0;

  // The window travels across the unchanged source. Both complete resting views
  // are centred inside the same aperture; the clip trims only empty studio space.
  const paintPhotos = (scope: ParentNode = document) => {
    for (const photo of scope.querySelectorAll<HTMLElement>('[data-rtw-photo]')) {
      if(photo.closest('[data-rtw-reader][hidden]')) continue;
      const actor=photo.closest<HTMLElement>('[data-rtw-actor]');
      if(actor && Number(gsap.getProperty(actor,'opacity'))<.01) delete photo.dataset.returnView;
      const view=Number(photo.dataset.returnView ?? gsap.getProperty(photo,'--view'))||0;
      if(photo.dataset.returnView) photo.style.setProperty('--view',String(view));
      paintRtwPhoto(photo,view);
    }
  };
  const schedulePhotos = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(()=>paintPhotos()); };
  const floorState = () => {
    const box = prototype.getBoundingClientRect();
    act.toggleAttribute('data-rtw-floor', box.top < innerHeight * .4 && box.bottom > innerHeight * .4);
  };
  act.addEventListener('scroll', floorState, { passive: true });

  const build = () => {
    scene?.scrollTrigger?.kill(); scene?.kill(); handoff?.scrollTrigger?.kill(); handoff?.kill();
    prototype.toggleAttribute('data-static', reduced.matches);
    for(const [role,actor] of Object.entries(actors)) {
      const visible=reduced.matches || role==='anchor';
      actor.tabIndex=visible?0:-1;actor.setAttribute('aria-hidden',String(!visible));actor.style.pointerEvents=visible?'auto':'none';
    }
    gsap.set(Object.values(actors), { clearProps: 'transform,opacity,visibility,left,top' });
    gsap.set([title,running,side,payoff,signal], { clearProps: 'transform,opacity' });
    gsap.set([...stage.querySelectorAll('[data-rtw-photo]')], {'--view':0});
    running.textContent='01 / READY-TO-WEAR';
    if (reduced.matches) { paintPhotos(); floorState(); return; }
    const w = () => stage.clientWidth;
    const h = () => stage.clientHeight;
    const position = (role: string, cx: number, depth: number, floor = .97, opacity = 1) => ({
      x: () => cx * w() - actors[role].offsetWidth / 2,
      y: () => floor * h() - actors[role].offsetHeight,
      scale: depth, opacity, left: 0, top: 0, xPercent: 0, yPercent: 0, force3D: true,
    });
    const move = (role: string, cx: number, depth: number, floor: number, at: number, duration: number, opacity = 1) => {
      scene!.to(actors[role], { ...position(role,cx,depth,floor,opacity), duration, ease: 'power1.inOut' }, at);
    };
    gsap.set(actors.anchor,position('anchor', mobile.matches ? .60 : .64, mobile.matches ? .80 : .89,.97));
    for (const role of ['arrival','distance','near','interruption','resolve']) gsap.set(actors[role],position(role,1.4,.6,.97,0));
    scene = gsap.timeline({scrollTrigger:{trigger:camera,scroller:act,start:'top top',end:'bottom bottom',scrub:.18,invalidateOnRefresh:true}, onUpdate:()=>{
      paintPhotos(stage);
      const time = scene!.time();
      side.textContent = (time>6.7?actors.interruption:actors.anchor).querySelector<HTMLElement>('[data-rtw-photo]')!.dataset.side==='back'?'BACK':'FRONT';
      stage.dataset.beat = time < .65 ? 'threshold' : time < 1.45 ? 'approach' : time < 2.5 ? 'turn' : time < 4 ? 'arrival' : time < 6.7 ? 'traverse' : time < 8.1 ? 'silence' : 'payoff';
      for (const actor of Object.values(actors)) {
        const rect = actor.getBoundingClientRect();
        const visible = Number(gsap.getProperty(actor,'opacity')) > .5 && rect.right > 15 && rect.left < w() - 15;
        actor.tabIndex = visible ? 0 : -1;
        actor.style.pointerEvents = visible ? 'auto' : 'none';
        actor.setAttribute('aria-hidden',String(!visible));
      }
    }});
    // 01–03: the subject remains the subject while the camera approaches and turns.
    move('anchor',mobile.matches ? .52 : .59,1,.97,.15,1.05);
    scene.to(title,{opacity:0,y:-24,duration:.55,ease:'power2.in'},.50)
      .to(running,{opacity:1,duration:.45},.9)
      .to(actors.anchor.querySelector('[data-rtw-photo]'),{'--view':1,duration:.8,ease:'power3.inOut'},1.5)
      .to(side,{opacity:1,duration:.15},1.5).to(side,{opacity:0,duration:.2},2.35);
    // 04: rust is the arrival, pink remains distant, satin is the established anchor.
    move('anchor',mobile.matches ? -.15 : .17,.64,.94,2.55,.75);
    move('arrival',mobile.matches ? .56 : .65,.92,.97,2.65,.8);
    move('distance',mobile.matches ? 1.16 : .90,.48,.84,3.2,.7);
    // 05: one authored world, traversed by a common camera displacement.
    if (!mobile.matches) {
      const world: Record<string,[number,number,number]> = {anchor:[.17,.64,.94],arrival:[.65,.92,.97],distance:[1.14,.48,.83],near:[1.65,1.03,.99],interruption:[2.18,.72,.89],resolve:[2.74,.83,.97]};
      for (const [role,[cx,depth,floor]] of Object.entries(world)) {
        if (['near','interruption','resolve'].includes(role)) gsap.set(actors[role],position(role,cx,depth,floor,0));
        const destination = position(role,cx-2.15,depth,floor);
        delete (destination as Partial<typeof destination>).opacity;
        scene.to(actors[role],{...destination,duration:2.65,ease:'power1.inOut'},4);
      }
      scene.set([actors.near,actors.interruption,actors.resolve],{opacity:1},4);
    } else {
      // A mobile viewpoint replaces the wide world: enter, pass, leave, resolve.
      move('arrival',-.6,.78,.97,4,.65);
      move('distance',.5,.93,.97,4,.65);
      move('distance',-.6,.76,.97,4.85,.65);
      move('near',.5,1,.97,4.85,.65);
      move('near',-.6,.78,.97,5.7,.65);
      move('resolve',.5,.95,.97,5.7,.65);
    }
    // 06: movement empties into one large striped silhouette.
    for (const role of ['anchor','arrival','distance','near','resolve']) scene.to(actors[role],{opacity:0,duration:.3},6.65);
    move('interruption',mobile.matches ? .5 : .58,1.02,.98,6.65,.55);
    scene.to(signal,{opacity:1,scaleY:1,duration:.25},7.05)
      .to(actors.interruption.querySelector('[data-rtw-photo]'),{'--view':1,duration:.55,ease:'power3.inOut'},7.15)
      .to(signal,{opacity:0,duration:.25},7.8);
    // 07: reunion. Desktop resolves all six, mobile reads two successive casts of three.
    scene.to([...stage.querySelectorAll('[data-rtw-photo]')],{'--view':0,duration:.4},8.1);
    if (!mobile.matches) {
      const reunion: Record<string,[number,number,number]> = {anchor:[.09,.61,.84],arrival:[.255,.76,.95],distance:[.414,.52,.76],near:[.575,.88,.97],interruption:[.745,.64,.87],resolve:[.91,.69,.93]};
      for(const [role,[cx,depth,floor]] of Object.entries(reunion)) move(role,cx,depth,floor,8.15,.85);
    } else {
      const first: Record<string,[number,number,number]> = {anchor:[.16,w()>500?.58:.44,.80],arrival:[.51,w()>500?.73:.55,.86],distance:[.84,w()>500?.52:.40,.78]};
      scene.to([actors.near,actors.interruption,actors.resolve],{opacity:0,duration:.2},8.1);
      for(const [role,[cx,depth,floor]] of Object.entries(first)) move(role,cx,depth,floor,8.15,.55);
      for(const role of ['anchor','arrival','distance']) move(role,-.6,.45,.90,9.15,.55);
      const second: Record<string,[number,number,number]> = {near:[.17,w()>500?.58:.44,.81],interruption:[.51,w()>500?.73:.56,.86],resolve:[.85,w()>500?.52:.4,.78]};
      for(const [role,[cx,depth,floor]] of Object.entries(second)) move(role,cx,depth,floor,9.15,.55);
    }
    scene.to(payoff,{opacity:1,duration:.3},8.55).to({}, {duration:.65},9.7);
    const ending = prototype.querySelector<HTMLElement>('[data-rtw-handoff]')!;
    handoff = gsap.timeline({scrollTrigger:{trigger:ending,scroller:act,start:'top 65%',end:'bottom bottom',scrub:.15,invalidateOnRefresh:true},onUpdate:()=>{running.textContent=handoff!.progress()>.65?'02 / ACTIVEWEAR':'01 / READY-TO-WEAR';}})
      .to(ending.querySelector('.rtw-last'),{x:()=>w()*.23,duration:1,ease:'power1.inOut'},0)
      .to(ending.querySelector('.rtw-handoff-line'),{scaleX:1,duration:.5},.35)
      .to(ending.querySelector('[data-rtw-next]'),{opacity:1,duration:.4},.65);
    paintPhotos(); floorState(); ScrollTrigger.refresh();
  };
  const floorParts=[...act.querySelector<HTMLElement>('[data-screen="index"]')!.children].filter(e=>!e.classList.contains('pf-rd')) as HTMLElement[];
  const floorInert=(enabled:boolean)=>floorParts.forEach(e=>e.inert=enabled);
  // Readers use the same front/back aperture; no category gesture enters RTW.
  for (const reader of document.querySelectorAll<HTMLElement>('[data-rtw-reader]')) {
    const photo = reader.querySelector<HTMLElement>('[data-rtw-photo]')!;
    const image = reader.querySelector<HTMLElement>('[data-rtw-target]')!;
    const inspect = reader.querySelector<HTMLButtonElement>('[data-rd-inspect]')!;
    let panX=0, panY=0;
    const drawZoom = () => gsap.set(photo,{scale:reader.hasAttribute('data-inspect') ? 2.2 : 1,x:panX,y:panY,transformOrigin:'center center'});
    const setView = (view: number, animate = true) => {
      gsap.to(photo,{'--view':view,duration:reduced.matches || !animate ? 0 : .48,ease:'power3.inOut',onUpdate:()=>paintRtwPhoto(photo,Number(gsap.getProperty(photo,'--view'))||0)});
      reader.querySelectorAll<HTMLButtonElement>('[data-rtw-view]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.rtwView)===view)));
    };
    reader.querySelectorAll<HTMLButtonElement>('[data-rtw-view]').forEach(b=>b.addEventListener('click',()=>setView(Number(b.dataset.rtwView))));
    const reset = () => { reader.removeAttribute('data-inspect'); inspect.setAttribute('aria-pressed','false'); panX=panY=0; drawZoom(); };
    inspect.addEventListener('click',()=>{ reader.toggleAttribute('data-inspect'); inspect.setAttribute('aria-pressed',String(reader.hasAttribute('data-inspect'))); panX=panY=0; gsap.to(photo,{scale:reader.hasAttribute('data-inspect')?2.2:1,x:0,y:0,duration:reduced.matches?0:.25,ease:'power2.out'}); });
    image.addEventListener('pointermove',event=>{
      if(!reader.hasAttribute('data-inspect') || event.pointerType==='touch')return;
      const rect=image.getBoundingClientRect();
      panX=(.5-(event.clientX-rect.left)/rect.width)*rect.width*.9;
      panY=(.5-(event.clientY-rect.top)/rect.height)*rect.height*.9; drawZoom();
    });
    let drag: {x:number;y:number;px:number;py:number}|null=null;
    image.addEventListener('pointerdown',event=>{if(!reader.hasAttribute('data-inspect'))return;drag={x:event.clientX,y:event.clientY,px:panX,py:panY};image.setPointerCapture(event.pointerId);});
    image.addEventListener('pointermove',event=>{if(!drag)return;panX=Math.max(-photo.offsetWidth*.6,Math.min(photo.offsetWidth*.6,drag.px+event.clientX-drag.x));panY=Math.max(-photo.offsetHeight*.6,Math.min(photo.offsetHeight*.6,drag.py+event.clientY-drag.y));drawZoom();});
    image.addEventListener('pointerup',()=>drag=null); image.addEventListener('pointercancel',()=>drag=null);
    reader.addEventListener('keydown',event=>{
      if(!reader.hasAttribute('data-inspect') || !event.key.startsWith('Arrow'))return;
      event.preventDefault();panX=Math.max(-photo.offsetWidth*.6,Math.min(photo.offsetWidth*.6,panX+(event.key==='ArrowLeft'?35:event.key==='ArrowRight'?-35:0)));panY=Math.max(-photo.offsetHeight*.6,Math.min(photo.offsetHeight*.6,panY+(event.key==='ArrowUp'?35:event.key==='ArrowDown'?-35:0)));drawZoom();
    });
    reader.addEventListener('pf:subject-open',()=>{reset(); setView(0,false);floorInert(true);});
    reader.addEventListener('pf:subject-return',()=>floorInert(false));
    reader.addEventListener('pf:subject-reset',()=>{reset();floorInert(false);});
  }
  new MutationObserver(()=>{if(act.hasAttribute('data-open')) requestAnimationFrame(()=>ScrollTrigger.refresh());}).observe(act,{attributes:true,attributeFilter:['data-open']});
  build(); reduced.addEventListener('change',build); mobile.addEventListener('change',build);
  const resizeObserver=new ResizeObserver(()=>{schedulePhotos(); ScrollTrigger.refresh();}); resizeObserver.observe(stage);
  document.fonts.ready.then(()=>{schedulePhotos();ScrollTrigger.refresh();});
  window.addEventListener('resize',()=>{schedulePhotos();floorState();});
  document.querySelectorAll('[data-rtw-photo] img').forEach(image=>image.addEventListener('load',schedulePhotos));
}
