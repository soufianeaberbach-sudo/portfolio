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
  const details = Object.fromEntries([...stage.querySelectorAll<HTMLElement>('[data-rtw-detail]')].map(a => [a.dataset.rtwDetail!, a]));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 767px), (max-width: 1023px) and (orientation: portrait)');
  let scene: gsap.core.Timeline | null = null;
  let handoff: gsap.core.Timeline | null = null;
  let frame = 0;
  let stageSize = '';

  // The window travels across the unchanged source. Both complete resting views
  // are centred inside the same aperture; the clip trims only empty studio space.
  const paintPhotos = (scope: ParentNode = document) => {
    for (const photo of scope.querySelectorAll<HTMLElement>('[data-rtw-photo]')) {
      if(photo.closest('[data-rtw-reader][hidden]')) continue;
      const actor=photo.closest<HTMLElement>('[data-rtw-actor]');
      if(actor && Number(gsap.getProperty(actor,'opacity'))<.01) { delete photo.dataset.returnView; continue; }
      const detail=photo.closest<HTMLElement>('[data-rtw-detail]');
      if(detail && Number(gsap.getProperty(detail,'opacity'))<.01) continue;
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
    stageSize = `${stage.clientWidth}:${stage.clientHeight}`;
    for(const [role,actor] of Object.entries(actors)) {
      const visible=reduced.matches || role==='anchor';
      actor.tabIndex=visible?0:-1;actor.setAttribute('aria-hidden',String(!visible));actor.style.pointerEvents=visible?'auto':'none';
    }
    gsap.set([...Object.values(actors),...Object.values(details)], { clearProps: 'transform,opacity,visibility,left,top' });
    gsap.set([title,running,side,payoff], { clearProps: 'transform,opacity' });
    gsap.set(prototype.querySelectorAll('[data-rtw-outgoing],[data-rtw-incoming],[data-rtw-next]'), {clearProps:'transform,opacity'});
    gsap.set([...stage.querySelectorAll('[data-rtw-photo]')], {'--view':0});
    running.textContent='01 / READY-TO-WEAR';
    if (reduced.matches) { paintPhotos(); floorState(); return; }
    const w = () => stage.clientWidth;
    const h = () => stage.clientHeight;
    const position = (role: string, cx: number, depth: number, floor = .97, opacity = 1, detail = false) => ({
      x: () => cx * w() - (detail ? details : actors)[role].offsetWidth / 2,
      y: () => floor * h() - (detail ? details : actors)[role].offsetHeight,
      scale: depth, opacity, left: 0, top: 0, xPercent: 0, yPercent: 0, force3D: true,
    });
    const move = (role: string, cx: number, depth: number, floor: number, at: number, duration: number, opacity = 1) => {
      // Arrival is an opaque photograph entering the frame, not a dissolve.
      scene!.set(actors[role],{opacity:1},at)
        .to(actors[role], { ...position(role,cx,depth,floor,1), duration, ease: 'power1.inOut' }, at);
      if(!opacity) scene!.set(actors[role],{opacity:0},at+duration);
    };
    gsap.set(actors.anchor,position('anchor', mobile.matches ? .60 : .64, mobile.matches ? .80 : .89,.97));
    for (const role of ['arrival','near','interruption','resolve']) gsap.set(actors[role],position(role,1.4,.6,.97,0));
    for (const role of Object.keys(details)) gsap.set(details[role],position(role,1.6,2.8,2.3,0,true));
    scene = gsap.timeline({scrollTrigger:{trigger:camera,scroller:act,start:'top top',end:'bottom bottom',scrub:.18,invalidateOnRefresh:true}, onUpdate:()=>{
      paintPhotos(stage);
      const time = scene!.time();
      side.textContent = (time>6.7?actors.interruption:actors.anchor).querySelector<HTMLElement>('[data-rtw-photo]')!.dataset.side==='back'?'BACK':'FRONT';
      stage.dataset.beat = time < .65 ? 'threshold' : time < 1.45 ? 'approach' : time < 2.5 ? 'turn' : time < 4 ? 'arrival' : time < 6.7 ? 'traverse' : time < 8.1 ? 'silence' : 'payoff';
      for (const actor of Object.values(actors)) {
        const rect = actor.getBoundingClientRect();
        const visible = Number(gsap.getProperty(actor,'opacity')) > .5 && Number(gsap.getProperty(actor,'scaleX')) < 1.4 && rect.right > 15 && rect.left < w() - 15;
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
    // Each shot has a real close foreground and a complete silhouette. A push
    // into the full photograph hands it to the decorative detail plane at the
    // identical transform; this avoids manufacturing tiny "distant" people.
    const compact = mobile.matches;
    const phone = w() < 500;
    const closeScale = compact ? 2 : 2.55;
    const closeFloor = compact ? 1.55 : 1.94;
    // Frame the photographed torso against the edge, not a fraction of screen
    // width: portrait tablets otherwise lose the entire garment to the crop.
    const leftDetail = phone ? -.20 : .43 - .105 * closeScale * .92 * h() / w();
    const rightDetail = phone ? 1.08 : 1 - leftDetail;
    gsap.set(details.anchor,position('anchor',compact ? -1.5 : -.8,closeScale,closeFloor,0,true));
    const focusRight = .68;
    const focusLeft = phone ? .23 : .32;
    const fullScale = compact ? .94 : 1.02;
    const detailMove = (role: string, cx: number, zoom: number, floor: number, at: number, duration: number, opacity = 1) => {
      scene!.set(details[role],{opacity:1},at)
        .to(details[role],{...position(role,cx,zoom,floor,1,true),duration,ease:'power1.inOut'},at);
      if(!opacity) scene!.set(details[role],{opacity:0},at+duration);
    };
    const detailView = (role: string, view: number, at: number) =>
      scene!.set(details[role].querySelector('[data-rtw-photo]'),{'--view':view},at);
    const pushToDetail = (role: string, cx: number, view: number, at: number, duration: number) => {
      move(role,cx,closeScale,closeFloor,at,duration);
      scene!.to(actors[role].querySelector('[data-rtw-photo]'),{'--view':view,duration:duration*.7,ease:'power3.inOut'},at);
      detailView(role,view,at);
      scene!.set(details[role],position(role,cx,closeScale,closeFloor,1,true),at+duration)
        .set(actors[role],{opacity:0},at+duration);
    };
    // 03: low back and satin drape, shown close and whole. The original turn
    // stays intact; the close view arrives only after the crossover resolves.
    detailView('anchor',1,0);
    if(!compact) detailMove('anchor',leftDetail,closeScale,closeFloor,1.95,.3);
    move('anchor',compact ? .5 : focusRight,compact ? 1.03 : fullScale,.98,1.5,.8);
    // 04: warm satin in the foreground, a rust halter in the same white world.
    // Only two looks share a shot; the archive carries the broader discovery.
    move('anchor',compact ? -1 : 1.35,fullScale,.98,2.6,.55,0);
    move('arrival',phone ? .53 : focusRight,fullScale,.98,compact ? 2.65 : 3.05,compact ? .75 : .65);
    // 05 opening → midpoint → destination. Push into the rust tie-back, then
    // cross the frame toward the cropped shirt's waist; full looks remain legible.
    if(!compact) detailMove('anchor',-.8,closeScale,closeFloor,4,.65,0);
    pushToDetail('arrival',rightDetail,phone ? 0 : 1,4,.9);
    gsap.set(actors.near,position('near',-.45,fullScale,.98,0));
    move('near',focusLeft,fullScale,.98,4.25,.65);
    detailMove('arrival',compact ? 2.5 : 1.8,closeScale,closeFloor,5.45,.8,0);
    pushToDetail('near',leftDetail,0,5.45,.95);
    move('resolve',focusRight,fullScale,.98,5.7,.7);
    // 06: one garment, two truthful scales. No decorative red punctuation.
    detailMove('near',compact ? -1.5 : -.8,closeScale,closeFloor,6.65,.45,0);
    move('resolve',1.45,fullScale,.98,6.65,.45,0);
    move('interruption',compact ? .5 : focusLeft,compact ? 1.03 : fullScale,.98,6.8,.45);
    if(!compact) {
      detailView('interruption',0,6.8);
      detailMove('interruption',rightDetail,closeScale,closeFloor,6.9,.45);
    }
    scene.to(actors.interruption.querySelector('[data-rtw-photo]'),{'--view':1,duration:.55,ease:'power3.inOut'},7.15);
    // 07: two campaign views, not a reunion row. Satin neckline/pink
    // shirting resolves the neutral passage; rust/print closes the colour arc.
    move('interruption',compact ? -1 : -.45,fullScale,.98,8.1,.55,0);
    if(!compact) detailMove('interruption',1.8,closeScale,closeFloor,8.1,.55,0);
    detailView('anchor',0,8.1);
    detailMove('anchor',leftDetail,closeScale,closeFloor,8.15,.6);
    scene.set(actors.near,position('near',1.4,fullScale,.98,0),8.1)
      .set(actors.near.querySelector('[data-rtw-photo]'),{'--view':0},8.1);
    move('near',focusRight,fullScale,.98,8.15,.6);
    detailMove('anchor',compact ? -1.5 : -.8,closeScale,closeFloor,9.15,.65,0);
    move('near',compact ? -1 : -.45,fullScale,.98,9.15,.65,0);
    detailView('arrival',phone ? 0 : 1,9.15);
    gsap.set(details.arrival,position('arrival',compact ? 2.5 : 1.8,closeScale,closeFloor,0,true));
    detailMove('arrival',rightDetail,closeScale,closeFloor,9.15,.65);
    move('resolve',focusLeft,fullScale,.98,9.15,.65);
    scene.to(payoff,{opacity:1,duration:.3},8.55).to({}, {duration:.55},9.8);
    // 12 is the archive's closing sentence, not another empty stage or look.
    const ending = prototype.querySelector<HTMLElement>('[data-rtw-handoff]')!;
    const outgoing = ending.querySelector('[data-rtw-outgoing]')!;
    const incoming = ending.querySelector('[data-rtw-incoming]')!;
    const next = ending.querySelector('[data-rtw-next]')!;
    gsap.set(outgoing,{yPercent:0,opacity:1});
    gsap.set(incoming,{yPercent:110,opacity:0});
    gsap.set(next,{opacity:0});
    handoff = gsap.timeline({scrollTrigger:{trigger:ending,scroller:act,start:'top 85%',end:'bottom 85%',scrub:.15,invalidateOnRefresh:true},onUpdate:()=>{running.textContent=handoff!.progress()>.65?'02 / ACTIVEWEAR':'01 / READY-TO-WEAR';}})
      .to(outgoing,{yPercent:-110,opacity:0,duration:1,ease:'power2.inOut'},0)
      .to(incoming,{yPercent:0,opacity:1,duration:1,ease:'power2.inOut'},0)
      .to(next,{opacity:1,duration:.3},.7);
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
  const resizeObserver=new ResizeObserver(()=>{
    const size=`${stage.clientWidth}:${stage.clientHeight}`;
    if(size!==stageSize) build();
    else { schedulePhotos(); ScrollTrigger.refresh(); }
  }); resizeObserver.observe(stage);
  document.fonts.ready.then(()=>{schedulePhotos();ScrollTrigger.refresh();});
  window.addEventListener('resize',()=>{schedulePhotos();floorState();});
  document.querySelectorAll('[data-rtw-photo] img').forEach(image=>image.addEventListener('load',schedulePhotos));
}
