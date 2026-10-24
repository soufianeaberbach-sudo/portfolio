import{paintMenswear}from'./menswear-film';
import{preparePhotograph,sameLoadedPhotograph}from'./garment-photo';
import{menswearDirections}from'../data/menswear-direction';
import type{MenswearCategory}from'../data/menswear-collection';
import{gsap}from'gsap';

/** Scoped media/controller adapter. It never pushes history or opens/closes router layers. */
export function initMenswear(root:HTMLElement){
 const world=root.querySelector<HTMLElement>('[data-mw-world]');if(!world)return null;
 const exhibition=world.querySelector<HTMLElement>('.mw-exhibition')!,films=[...world.querySelectorAll<HTMLElement>('[data-mw-film]')];
 for(const f of films)f.removeAttribute('id');
 const reduce=matchMedia('(prefers-reduced-motion:reduce)'),menu=world.querySelector<HTMLElement>('[data-mw-worlds]')!,toggle=world.querySelector<HTMLButtonElement>('[data-mw-worlds-toggle]')!;
 const presentButton=world.querySelector<HTMLButtonElement>('[data-mw-present]')!,fullscreen=world.querySelector<HTMLButtonElement>('[data-mw-fullscreen]')!;
 let category:MenswearCategory='m-streetwear',film=films[0],experience=world.querySelector<HTMLElement>('[data-mw-scroll]')!,position=0,requested=0,present=false,active:HTMLElement|null=null;
 let archive=false,heldActor:number|undefined;
 let motion:gsap.core.Tween|null=null,raf=0,epoch=0,cutCancel:(()=>void)|null=null,returnFinish:(()=>void)|null=null;
 const readerStates=new Map<HTMLElement,{select:(n:number,immediate?:boolean)=>void;reset:()=>void;draw:()=>void;view:()=>number}>();
 const clamp=(n:number,a=0,b=4)=>Math.max(a,Math.min(b,n));
 const start=(f=film)=>experience.scrollTop+f.getBoundingClientRect().top-experience.getBoundingClientRect().top;
 const range=()=>Math.max(1,film.querySelector<HTMLElement>('.mw-walkway')!.offsetHeight-film.querySelector<HTMLElement>('[data-mw-frame]')!.offsetHeight);
 const menuState=(on:boolean,focus=false)=>{menu.hidden=!on;toggle.setAttribute('aria-expanded',String(on));if(focus)(on?menu.querySelector<HTMLElement>('[aria-current=page]')??menu.querySelector<HTMLElement>('a'):toggle)?.focus({preventScroll:true});};
 const paint=()=>{
  const current=Math.round(position),direction=menswearDirections[category];
  paintMenswear(film.querySelector<HTMLElement>('[data-mw-frame]')!,position,reduce.matches,heldActor);
  world.querySelectorAll<HTMLElement>('[data-mw-scene]').forEach(b=>{b.setAttribute('aria-pressed',String(Number(b.dataset.mwScene)===current));b.setAttribute('aria-label',`${Number(b.dataset.mwScene)+1}: ${direction.scenes[Number(b.dataset.mwScene)]}`);});
  film.querySelector<HTMLElement>('[data-mw-scene-caption]')!.textContent=direction.scenes[current];
 };
 const stop=()=>{motion?.kill();motion=null;cancelAnimationFrame(raf);};
 const scene=(n:number,immediate=false)=>{
  stop();archive=false;heldActor=undefined;requested=clamp(n);const target=requested;
  const done=()=>{motion=null;world.querySelector<HTMLElement>('[data-mw-live]')!.textContent=`${menswearDirections[category].name}. ${menswearDirections[category].scenes[target]}`;};
  if(immediate||reduce.matches){position=target;experience.scrollTop=start()+range()*target/4;paint();done();return;}
  // The film renderer owns shot easing/holds. A second ease rushed its central comparisons.
  const state={p:position};motion=gsap.to(state,{p:target,duration:Math.abs(target-position)>.99?.95:.65,ease:'none',onUpdate:()=>{position=state.p;experience.scrollTop=start()+range()*position/4;paint();},onComplete:done});
 };
 const setPresent=(on:boolean)=>{
  present=on;world.toggleAttribute('data-present',on);presentButton.setAttribute('aria-pressed',String(on));presentButton.textContent=on?'Exit presentation':'Present';fullscreen.hidden=!on;
  if(on){scene(Math.round(position),true);experience.focus({preventScroll:true});}
  else if(document.fullscreenElement===world)void document.exitFullscreen().catch(()=>{});
 };
 // All films remain in one native flow. Selection follows the viewport, not hidden panels.
 const selectWorld=(next:HTMLElement)=>{
  if(film===next&&next.hasAttribute('data-current')&&(!world.hasAttribute('data-open')||next.hasAttribute('data-prepared')))return;

  film=next;category=film.dataset.mwFilm as MenswearCategory;
  films.forEach(f=>{f.toggleAttribute('data-current',f===film);f.querySelector<HTMLElement>('[data-mw-frame]')!.inert=f!==film;});
  world.querySelectorAll<HTMLElement>('[data-mw-world-link]').forEach(a=>{if(a.dataset.mwWorldLink===category)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  if(world.hasAttribute('data-open'))film.setAttribute('data-prepared','');
  if(world.hasAttribute('data-open'))for(const[at,image]of [...film.querySelectorAll<HTMLImageElement>('[data-mw-actor] img')].entries()){
   if(at===0)image.fetchPriority='high';image.loading='eager';void image.decode().catch(()=>{image.closest('a')?.setAttribute('data-unavailable','');});
  }
 };
 const follow=()=>{
  if(active||motion||present)return;
  const line=experience.getBoundingClientRect().top+Math.min(90,experience.clientHeight*.16);
  const next=films.find(f=>{const b=f.getBoundingClientRect();return b.top<=line&&b.bottom>line;})??(experience.scrollTop<1?films[0]:films.at(-1)!);
  selectWorld(next);heldActor=undefined;archive=experience.scrollTop>start()+range()+1;
  position=clamp(4*(experience.scrollTop-start())/range());requested=Math.round(position);paint();
  // Scroll changes orientation without generating Back-button entries. Reader routes stay router-owned.
  if(world.hasAttribute('data-open')&&location.hash.startsWith('#menswear')&&location.hash.split('/').length<3){
   const hash=`#menswear/${category}`;if(location.hash!==hash&&!(location.hash==='#menswear'&&category==='m-streetwear'))world.dispatchEvent(new CustomEvent('pf:menswear-orientation',{bubbles:true,detail:hash}));
  }
 };
 const activate=(next:string|null)=>{
  stop();cancel();archive=false;heldActor=undefined;menuState(false);
  const id=next&&next in menswearDirections?next as MenswearCategory:'m-streetwear';
  selectWorld(films.find(f=>f.dataset.mwFilm===id)!);position=requested=0;
  experience.scrollTop=start();paint();
 };
 experience.addEventListener('scroll',()=>{if(active||motion||present)return;cancelAnimationFrame(raf);raf=requestAnimationFrame(follow);},{passive:true});
 experience.addEventListener('wheel',()=>{if(!present&&!active)stop();},{passive:true});
 experience.addEventListener('touchstart',()=>{if(!present&&!active)stop();},{passive:true});
 const step=(delta:number)=>{
  const n=requested+delta,index=films.indexOf(film);
  if(n<0&&index>0){world.querySelector<HTMLAnchorElement>(`[data-mw-world-link="${films[index-1].dataset.mwFilm}"]`)!.click();scene(4,true);}
  else if(n>4&&index<films.length-1){world.querySelector<HTMLAnchorElement>(`[data-mw-world-link="${films[index+1].dataset.mwFilm}"]`)!.click();scene(0,true);}
  else scene(n);
 };
 experience.addEventListener('keydown',e=>{
  if(e.defaultPrevented||active||!menu.hidden||(e.target as HTMLElement).closest('a,button,input,select,textarea,summary,.mw-rail,[contenteditable=true]'))return;
  // In Explore, vertical keys retain native scrolling. Presentation remotes use arrows/Page/Space.
  const forward=present?['ArrowRight','ArrowDown','PageDown',' ']:['ArrowRight'],back=present?['ArrowLeft','ArrowUp','PageUp']:['ArrowLeft'];
  // Endpoints are direct seeks, not playback through every skipped composition.
  if(present&&(e.key==='Home'||e.key==='End')){e.preventDefault();scene(e.key==='Home'?0:4,true);}
  else if(forward.includes(e.key)||back.includes(e.key)){e.preventDefault();step((back.includes(e.key)||(e.key===' '&&e.shiftKey))?-1:1);}
 });
 // A deliberate continued native gesture after the final archive hands off to Development.
 let endDelta=0,touchEndY:number|null=null;
 const atEnd=()=>experience.scrollTop+experience.clientHeight>=experience.scrollHeight-3;
 const handoff=()=>{endDelta=0;world.dispatchEvent(new CustomEvent('pf:world-handoff',{bubbles:true,detail:'#3d-simulation'}));};
 experience.addEventListener('wheel',e=>{if(!active&&!present&&world.hasAttribute('data-open')&&atEnd()&&e.deltaY>0){endDelta+=e.deltaY;if(endDelta>380)handoff();}else endDelta=0;},{passive:true});
 experience.addEventListener('touchstart',e=>{touchEndY=atEnd()?e.touches[0]?.clientY??null:null;},{passive:true});
 experience.addEventListener('touchmove',e=>{if(touchEndY!==null&&!active&&!present&&touchEndY-(e.touches[0]?.clientY??touchEndY)>85){touchEndY=null;handoff();}},{passive:true});
 for(const f of films){
  for(const im of f.querySelectorAll<HTMLImageElement>('[data-mw-actor] img'))for(const event of ['load','error'])im.addEventListener(event,()=>{if(f===film)paint();});
  const rail=f.querySelector<HTMLElement>('.mw-rail')!;
  rail.addEventListener('keydown',e=>{if(e.target!==rail||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();rail.scrollTo({left:e.key==='Home'?0:e.key==='End'?rail.scrollWidth:rail.scrollLeft+(e.key==='ArrowRight'?1:-1)*rail.clientWidth*.7,behavior:reduce.matches?'instant':'smooth'});});
  rail.addEventListener('scroll',()=>{const hint=f.querySelector<HTMLElement>('[data-mw-rail-hint]')!;hint.textContent=rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-3?'End of edit':'Explore →';},{passive:true});
 }
 toggle.addEventListener('click',()=>menuState(menu.hidden,true));
 world.querySelectorAll('[data-mw-world-link]').forEach(a=>a.addEventListener('click',()=>menuState(false)));
 presentButton.addEventListener('click',()=>setPresent(!present));
 fullscreen.addEventListener('click',async()=>{try{if(document.fullscreenElement===world)await document.exitFullscreen();else await world.requestFullscreen();}catch{world.querySelector<HTMLElement>('[data-mw-live]')!.textContent='Fullscreen is unavailable. In-page presentation remains available.';} });
 world.querySelectorAll<HTMLButtonElement>('[data-mw-scene]').forEach(b=>b.addEventListener('click',()=>scene(Number(b.dataset.mwScene))));
 world.querySelector('[data-mw-prev]')!.addEventListener('click',()=>step(-1));world.querySelector('[data-mw-next]')!.addEventListener('click',()=>step(1));
 world.querySelector('[data-mw-archive-open]')!.addEventListener('click',()=>{stop();archive=true;heldActor=undefined;if(present)setPresent(false);menuState(false);experience.scrollTo({top:start()+range()+experience.clientHeight,behavior:'instant'});film.querySelector<HTMLElement>('.mw-rail')!.focus({preventScroll:true});});
 document.addEventListener('pointerdown',e=>{if(!menu.hidden&&!(e.target as HTMLElement).closest('[data-mw-worlds],[data-mw-worlds-toggle]'))menuState(false);});
 document.addEventListener('keydown',e=>{
  if(e.key!=='Escape'||!world.hasAttribute('data-open')||active)return;
  if(!menu.hidden){e.preventDefault();e.stopImmediatePropagation();menuState(false,true);}
  else if(present){e.preventDefault();e.stopImmediatePropagation();setPresent(false);presentButton.focus({preventScroll:true});}
 },true);
 // Measured source-coordinate match cut; a narrow exhibition aperture never stretches the original image.
 const match=(reader:HTMLElement,source:HTMLElement|null,enter:boolean,instant:boolean,done:()=>void)=>{
  cutCancel?.();if(!source||instant||reduce.matches){done();return;}
  const target=reader.querySelector<HTMLElement>('[data-mw-view-panel]:not([hidden]) [data-mw-photo]')!;
  const from=enter?source:target,to=enter?target:source,im=from.querySelector<HTMLImageElement>('img')!,dest=to.querySelector<HTMLImageElement>('img')!;
  // Different genuine photographs are never morphed into each other on return.
  if(im.src!==dest.src){done();return;}
  let canceled=false,clone:HTMLElement|null=null,animation:Animation|null=null;
  const oldSource=source.style.visibility,oldTarget=target.style.visibility;
  const cleanup=()=>{canceled=true;animation?.cancel();clone?.remove();source.style.visibility=oldSource;target.style.visibility=oldTarget;if(cutCancel===cleanup)cutCancel=null;};cutCancel=cleanup;
  void(async()=>{
   im.loading=dest.loading='eager';try{await Promise.all([im.decode(),dest.decode()]);}catch{if(!canceled){cleanup();done();}return;}if(canceled)return;
   const visible=(node:HTMLElement)=>{const box=node.getBoundingClientRect();if(node!==target)return box;const viewport=reader.querySelector<HTMLElement>('[data-mw-target]')!.getBoundingClientRect(),left=Math.max(box.left,viewport.left),top=Math.max(box.top,viewport.top);return new DOMRect(left,top,Math.max(0,Math.min(box.right,viewport.right)-left),Math.max(0,Math.min(box.bottom,viewport.bottom)-top));};
   const a=visible(from),ai=im.getBoundingClientRect(),b=visible(to),bi=dest.getBoundingClientRect();
   if(!ai.width||!bi.width||!a.width||!b.width){cleanup();done();return;}
   clone=document.createElement('div');clone.className='mw-match';clone.setAttribute('aria-hidden','true');
   const pic=new Image();pic.src=im.src;pic.alt='';clone.append(pic);
   Object.assign(clone.style,{left:`${ai.left}px`,top:`${ai.top}px`,width:`${ai.width}px`,height:`${ai.height}px`,transformOrigin:'0 0'});Object.assign(pic.style,{left:'0',top:'0',width:'100%',height:'100%'});(document.fullscreenElement===world?world:document.body).append(clone);
   try{await pic.decode();}catch{if(!canceled){cleanup();done();}return;}if(canceled)return;
   const clip=(outer:DOMRect,image:DOMRect)=>`inset(${Math.max(0,(outer.top-image.top)/image.height*100)}% ${Math.max(0,(image.right-outer.right)/image.width*100)}% ${Math.max(0,(image.bottom-outer.bottom)/image.height*100)}% ${Math.max(0,(outer.left-image.left)/image.width*100)}%)`;
   requestAnimationFrame(()=>{if(canceled||!clone)return;source.style.visibility=target.style.visibility='hidden';animation=clone.animate([{transform:'none',clipPath:clip(a,ai)},{transform:`translate(${bi.left-ai.left}px,${bi.top-ai.top}px) scale(${bi.height/ai.height})`,clipPath:clip(b,bi)}],{duration:560,easing:'cubic-bezier(.22,.68,.18,1)',fill:'forwards'});animation.onfinish=()=>{if(canceled)return;cleanup();done();};});
  })();
 };
 for(const reader of world.querySelectorAll<HTMLElement>('[data-mw-reader]')){
  const panels=[...reader.querySelectorAll<HTMLElement>('[data-mw-view-panel]')],photos=panels.map(p=>p.querySelector<HTMLElement>('[data-mw-photo]')!),images=photos.map(p=>p.querySelector<HTMLImageElement>('img')!);
  const viewport=reader.querySelector<HTMLElement>('[data-mw-target]')!,tools=reader.querySelector<HTMLElement>('[data-mw-zoom]')!,inspect=reader.querySelector<HTMLButtonElement>('[data-rd-inspect]')!,status=reader.querySelector<HTMLElement>('[data-mw-status]')!;
  let view=0,requestedView=0,selection=0,zoom=1,x=0,y=0,lastX=0,lastY=0,distance=0;
  const pointers=new Map<number,{x:number;y:number}>();
  const draw=()=>{const photo=photos[view],mx=Math.max(0,(photo.clientWidth*zoom-viewport.clientWidth)/2),my=Math.max(0,(photo.clientHeight*zoom-viewport.clientHeight)/2);x=clamp(x,-mx,mx);y=clamp(y,-my,my);photo.style.transform=`translate(${x}px,${y}px) scale(${zoom})`;status.textContent=reader.hasAttribute('data-inspect')?`${Math.round(zoom*100)}% · drag / pinch / arrow keys`:!images[view].complete?'Loading photograph…':!images[view].naturalWidth?'Photograph unavailable. Return to the exhibition to continue.':'';};
  const reset=()=>{selection++;requestedView=view;pointers.clear();photos.forEach(p=>p.style.transform='');zoom=1;x=y=0;reader.removeAttribute('data-inspect');inspect.setAttribute('aria-pressed','false');tools.hidden=true;reader.removeAttribute('aria-busy');draw();};
  const select=(n:number,immediate=false)=>{
   cutCancel?.();const next=clamp(n,0,panels.length-1),token=++selection;requestedView=next;const image=images[next];preparePhotograph(image);
   const commit=()=>{if(token!==selection)return;reset();view=requestedView=next;reader.toggleAttribute('data-wide',Number(photos[next].style.getPropertyValue('--photo-aspect'))>1.1);panels.forEach((p,i)=>p.hidden=i!==next);reader.querySelectorAll<HTMLElement>('[data-mw-view]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.mwView)===next)));reader.querySelector<HTMLAnchorElement>('[data-mw-original]')!.href=image.src;draw();};
   if(next===view||immediate||sameLoadedPhotograph(image,images[view])){commit();return;}reader.setAttribute('aria-busy','true');status.textContent='Loading photograph…';void image.decode().then(commit,()=>{if(token===selection){if(sameLoadedPhotograph(image,images[view])){commit();return;}requestedView=view;reader.removeAttribute('aria-busy');status.textContent='Requested photograph unavailable; the current view remains available.';}});
  };
  readerStates.set(reader,{select,reset,draw,view:()=>view});
  reader.querySelectorAll<HTMLButtonElement>('[data-mw-view]').forEach(b=>b.addEventListener('click',()=>select(Number(b.dataset.mwView))));
  inspect.addEventListener('click',()=>{cutCancel?.();const on=!reader.hasAttribute('data-inspect');reset();reader.toggleAttribute('data-inspect',on);inspect.setAttribute('aria-pressed',String(on));tools.hidden=!on;zoom=on?1.75:1;draw();});
  reader.querySelectorAll<HTMLButtonElement>('[data-mw-zoom-by]').forEach(b=>b.addEventListener('click',()=>{zoom=clamp(zoom*Number(b.dataset.mwZoomBy),1,5);draw();}));reader.querySelector('[data-mw-fit]')!.addEventListener('click',()=>{zoom=1;x=y=0;draw();});
  viewport.addEventListener('pointerdown',e=>{pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});lastX=e.clientX;lastY=e.clientY;distance=0;viewport.setPointerCapture(e.pointerId);});
  viewport.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId)||!reader.hasAttribute('data-inspect'))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const[a,b]=[...pointers.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(distance)zoom=clamp(zoom*d/distance,1,5);distance=d;}else{x+=e.clientX-lastX;y+=e.clientY-lastY;}lastX=e.clientX;lastY=e.clientY;draw();});
  const release=(e:PointerEvent)=>{const start=pointers.get(e.pointerId);if(start&&!reader.hasAttribute('data-inspect')&&Math.abs(e.clientX-start.x)>45)select(requestedView+(e.clientX<start.x?1:-1));pointers.delete(e.pointerId);distance=0;const left=[...pointers.values()][0];if(left){lastX=left.x;lastY=left.y;}};viewport.addEventListener('pointerup',release);viewport.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);distance=0;});
  reader.addEventListener('keydown',e=>{if((e.target as HTMLElement).closest('a,input,textarea,select'))return;
   if(!reader.hasAttribute('data-inspect')&&(e.key==='PageDown'||e.key==='PageUp')){
    const next=reader.querySelector<HTMLAnchorElement>(`[data-mw-garment="${e.key==='PageDown'?'next':'previous'}"]`);
    if(next){e.preventDefault();next.click();return;}
   }
   if(reader.hasAttribute('data-inspect')){if(e.key.startsWith('Arrow')){e.preventDefault();x+=e.key==='ArrowLeft'?50:e.key==='ArrowRight'?-50:0;y+=e.key==='ArrowUp'?50:e.key==='ArrowDown'?-50:0;draw();}else if(['+','=','-','Home','0'].includes(e.key)){e.preventDefault();if(e.key==='Home'||e.key==='0'){zoom=1;x=y=0;}else zoom=clamp(zoom*(e.key==='-'?1/1.4:1.4),1,5);draw();}}
   else if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();select(requestedView+(e.key==='ArrowRight'?1:-1));}
  });
  reader.addEventListener('pf:subject-reset',()=>{reset();if(active===reader){active=null;exhibition.inert=false;}});
  images.forEach(im=>{im.addEventListener('load',draw);im.addEventListener('error',draw);});
 }
 const cancel=()=>{cutCancel?.();const done=returnFinish;returnFinish=null;done?.();epoch++;};
 const resize=()=>{cancel();if(!archive)experience.scrollTop=start()+range()*position/4;paint();if(active)readerStates.get(active)?.draw();};
 window.addEventListener('resize',resize);reduce.addEventListener('change',()=>{resize();if(!active)scene(Math.round(position),true);});
 new MutationObserver(()=>{if(!world.hasAttribute('data-open')){stop();cancel();setPresent(false);menuState(false);}}).observe(world,{attributes:true,attributeFilter:['data-open']});
 activate(null);
 return{focusTarget:()=>experience,ownsWorld:(el:HTMLElement)=>el===world,get category(){return category;},activate,cancel,owns:(reader:HTMLElement)=>reader.hasAttribute('data-mw-reader'),returnHash:(reader:HTMLElement)=>`#menswear/${reader.dataset.returnWorld??reader.dataset.of}`,
  enter(reader:HTMLElement,source:HTMLElement|null,instant:boolean){cancel();stop();reader.dataset.returnWorld=category;const back=reader.querySelector<HTMLAnchorElement>('[data-subject-close]')!;back.href=`#menswear/${category}`;back.textContent=reader.dataset.of===category?`← ${menswearDirections[category].name}`:'← Full reference collection';heldActor=Number(source?.closest<HTMLElement>('[data-mw-actor]')?.dataset.mwActor)||undefined;archive=experience.scrollTop>start()+range()+1||!!source?.closest('.mw-rail');active=reader;exhibition.inert=true;readerStates.get(reader)!.select(0,true);match(reader,source,true,instant,()=>{});},
  leave(reader:HTMLElement,source:HTMLElement|null,instant:boolean,done:()=>void){cancel();exhibition.inert=false;const token=epoch;const finish=()=>{if(token!==epoch)return;active=null;returnFinish=null;done();};returnFinish=finish;match(reader,location.hash===`#menswear/${reader.dataset.returnWorld??reader.dataset.of}`?source:null,false,instant,finish);},
 };
}
