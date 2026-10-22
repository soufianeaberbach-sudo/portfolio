import {paintPhoto,preparePhotograph,sameLoadedPhotograph} from './garment-photo';
import {garmentMatchCut,cancelGarmentMatchCut} from './garment-match-cut';
import {initWomenswearExhibition} from './womenswear-exhibition';
export function initWomenswear(root:HTMLElement){
 const exhibitions=[...root.querySelectorAll<HTMLElement>('[data-ww-exhibition]')];if(!exhibitions.length)return null;
 const world=exhibitions[0].closest<HTMLElement>('[data-world]')!,cameras=exhibitions.map(initWomenswearExhibition);
 const readers=[...world.querySelectorAll<HTMLElement>('[data-ww-reader]')],reduced=matchMedia('(prefers-reduced-motion:reduce)');
 let active:HTMLElement|null=null,entering=false,epoch=0,returnFinish:(()=>void)|null=null;
 const floor=[...world.querySelector<HTMLElement>('[data-screen=index]')!.children].filter(e=>!e.classList.contains('pf-rd')) as HTMLElement[];
 const setInert=(on:boolean,source:HTMLElement|null=null)=>{
  for(const part of floor)part.inert=on;let resized=false;for(const camera of cameras)resized=camera.hold(on,source)||resized;
  // The same archive door must remain visible after all responsive stage
  // rebuilds. Recompute its position instead of restoring old pixel offsets.
  if(!on&&resized&&source?.closest('.ww-rail'))source.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});
 };
 const states=new Map<HTMLElement,{view:number;zoom:number;x:number;y:number;draw:()=>void;reset:()=>void;select:(view:number,immediate?:boolean)=>void}>();
 for(const reader of readers){
  const panels=[...reader.querySelectorAll<HTMLElement>('[data-photo-view]')],viewport=reader.querySelector<HTMLElement>('[data-ww-target]')!;
  const photos=panels.map(p=>p.querySelector<HTMLElement>('[data-ww-photo]')!),images=photos.map(p=>p.querySelector<HTMLImageElement>('img')!);
  const inspect=reader.querySelector<HTMLButtonElement>('[data-rd-inspect]')!,tools=reader.querySelector<HTMLElement>('[data-ww-zoom-tools]')!,original=reader.querySelector<HTMLAnchorElement>('[data-original-source]')!,status=reader.querySelector<HTMLElement>('[data-ww-source-status]')!;
  const pointers=new Map<number,{x:number;y:number}>();let lastX=0,lastY=0,distance=0,selection=0,requestedView=0;
  const s={view:0,zoom:1,x:0,y:0,draw:()=>{},reset:()=>{},select:(_view:number,_immediate=false)=>{}};states.set(reader,s);
  const limit=()=>Math.max(2,Math.min(4,Number(images[s.view].getAttribute('height'))/Math.max(1,photos[s.view].clientHeight)));
  s.draw=()=>{
   const photo=photos[s.view],image=images[s.view],x=Math.max(0,(s.zoom-1)*photo.clientWidth/2),y=Math.max(0,(s.zoom-1)*photo.clientHeight/2);
   s.x=Math.max(-x,Math.min(x,s.x));s.y=Math.max(-y,Math.min(y,s.y));photo.style.transform=s.zoom===1&&!s.x&&!s.y?'':`translate3d(${s.x}px,${s.y}px,0) scale(${s.zoom})`;photo.style.transformOrigin='center center';paintPhoto(photo);
   status.textContent=image.complete&&!image.naturalWidth?'Original photograph unavailable. Return to the exhibition to continue.':reader.hasAttribute('data-inspect')?`${Math.round(s.zoom*100)}% · drag / pinch / arrow keys`:'';
  };
  const setInspect=(on:boolean)=>{selection++;requestedView=s.view;reader.removeAttribute('aria-busy');cancelGarmentMatchCut();reader.removeAttribute('data-ww-moving');entering=false;reader.toggleAttribute('data-inspect',on);inspect.setAttribute('aria-pressed',String(on));tools.hidden=!on;s.zoom=on?Math.min(2,limit()):1;s.x=s.y=0;s.draw();};
  s.reset=()=>{selection++;requestedView=s.view;pointers.clear();photos.forEach(photo=>photo.style.transform='');reader.removeAttribute('aria-busy');reader.removeAttribute('data-inspect');inspect.setAttribute('aria-pressed','false');tools.hidden=true;s.zoom=1;s.x=s.y=0;s.draw();};
  s.select=(view:number,immediate=false)=>{
   cancelGarmentMatchCut();reader.removeAttribute('data-ww-moving');entering=false;
   const chosen=Math.max(0,Math.min(panels.length-1,view)),request=++selection,image=images[chosen];requestedView=chosen;
   preparePhotograph(image);
   const commit=()=>{
    if(request!==selection)return;s.reset();s.view=requestedView=chosen;panels.forEach((p,i)=>p.hidden=i!==chosen);original.href=image.src;
    reader.querySelectorAll<HTMLElement>('[data-ww-view]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.wwView)===chosen)));s.draw();
    // Only the selected reader's next genuine view is prepared. Zoom never
    // swaps responsive candidates. Static crop windows avoid extra 3D layers.
    const next=images[chosen+1];if(next){preparePhotograph(next);void next.decode().catch(()=>{});}
   };
   if(immediate||chosen===s.view||sameLoadedPhotograph(image,images[s.view])){commit();return;}
   // Keep the current photograph visible until its replacement is decoded.
   // An interrupted request cannot overwrite a later selection or return.
   reader.setAttribute('aria-busy','true');status.textContent='Loading photograph…';
   void image.decode().then(commit,()=>{if(request!==selection)return;if(sameLoadedPhotograph(image,images[s.view])){commit();return;}requestedView=s.view;reader.removeAttribute('aria-busy');status.textContent='Requested photograph unavailable. The current view remains available.';});
  };
  for(const button of reader.querySelectorAll<HTMLButtonElement>('[data-ww-view]'))button.addEventListener('click',()=>s.select(Number(button.dataset.wwView)));
  inspect.addEventListener('click',()=>setInspect(!reader.hasAttribute('data-inspect')));
  reader.querySelectorAll<HTMLButtonElement>('[data-ww-zoom]').forEach(b=>b.addEventListener('click',()=>{s.zoom=Math.max(1,Math.min(limit(),s.zoom*Number(b.dataset.wwZoom)));s.draw();}));
  reader.querySelector('[data-ww-fit]')?.addEventListener('click',()=>{s.zoom=1;s.x=s.y=0;s.draw();});
  viewport.addEventListener('pointerdown',e=>{pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});lastX=e.clientX;lastY=e.clientY;distance=0;try{viewport.setPointerCapture(e.pointerId);}catch{}});
  viewport.addEventListener('pointermove',e=>{
   if(!pointers.has(e.pointerId)||!reader.hasAttribute('data-inspect'))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(pointers.size===2){const[a,b]=[...pointers.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(distance)s.zoom=Math.max(1,Math.min(limit(),s.zoom*d/distance));distance=d;}else{s.x+=e.clientX-lastX;s.y+=e.clientY-lastY;}lastX=e.clientX;lastY=e.clientY;s.draw();
  });
  viewport.addEventListener('pointerup',e=>{const start=pointers.get(e.pointerId);if(start&&!reader.hasAttribute('data-inspect')&&Math.abs(e.clientX-start.x)>40)s.select(requestedView+(e.clientX<start.x?1:-1));pointers.delete(e.pointerId);distance=0;const left=[...pointers.values()][0];if(left){lastX=left.x;lastY=left.y;}});
  viewport.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);distance=0;});
  reader.addEventListener('focusin',e=>{if(e.target!==reader&&reader.hasAttribute('data-ww-moving')){
   cancelGarmentMatchCut();reader.removeAttribute('data-ww-moving');
   // Focusing Return interrupts entry before its click reaches the router.
   // Preserve that fact so the exit settles immediately, without a second cut.
   if(active===reader&&returnFinish){const finish=returnFinish;returnFinish=null;finish();}
  }});
  reader.addEventListener('keydown',e=>{
   if(!reader.hasAttribute('data-inspect')){if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();s.select(requestedView+(e.key==='ArrowRight'?1:-1));}return;}
   if(e.key.startsWith('Arrow')){e.preventDefault();s.x+=e.key==='ArrowLeft'?40:e.key==='ArrowRight'?-40:0;s.y+=e.key==='ArrowUp'?40:e.key==='ArrowDown'?-40:0;s.draw();}
   if(e.key==='+'||e.key==='='||e.key==='-'){e.preventDefault();s.zoom=Math.max(1,Math.min(limit(),s.zoom*(e.key==='-'?1/1.4:1.4)));s.draw();}if(e.key==='Home'){e.preventDefault();s.zoom=1;s.x=s.y=0;s.draw();}
  });
  reader.addEventListener('pf:subject-reset',()=>{s.reset();if(active===reader){active=null;setInert(false);}});
  images.forEach(image=>{image.addEventListener('error',()=>{if(image===images[s.view])s.draw();});image.addEventListener('load',()=>{if(image===images[s.view])s.draw();});});
 }
 const cancel=()=>{active?.removeAttribute('data-ww-moving');const finish=returnFinish;returnFinish=null;finish?.();epoch++;cancelGarmentMatchCut();};
 const settle=()=>{cancel();if(active)states.get(active)!.draw();};window.addEventListener('resize',settle);reduced.addEventListener('change',settle);
 return{
  owns:(reader:HTMLElement)=>reader.hasAttribute('data-ww-reader'),returnHash:(reader:HTMLElement)=>`#${world.id}/${reader.dataset.editorial??reader.dataset.of}`,cancel,
  enter(reader:HTMLElement,source:HTMLElement|null,instant:boolean){
   cancel();active=reader;setInert(true,source);states.get(reader)!.select(0,true);entering=!!source;const current=epoch;
   if(source){reader.setAttribute('data-ww-moving','');garmentMatchCut(reader,source,true,instant||reduced.matches,()=>{if(epoch===current){entering=false;reader.removeAttribute('data-ww-moving');states.get(reader)!.draw();}});}
  },
  leave(reader:HTMLElement,source:HTMLElement|null,instant:boolean,finished:()=>void){
   const interrupted=entering;entering=false;cancel();
   // Return resolves on the primary photograph. A deliberate Back selection
   // never changes the exhibition or its scrolling primary-view choreography.
   states.get(reader)!.select(0,true);setInert(false,source);const current=epoch;
   const done=()=>{if(current!==epoch)return;reader.removeAttribute('data-ww-moving');returnFinish=null;if(active===reader)active=null;finished();};returnFinish=done;
   if(source&&location.hash===`#${world.id}/${reader.dataset.editorial??reader.dataset.of}`){reader.setAttribute('data-ww-moving','');garmentMatchCut(reader,source,false,interrupted||instant||reduced.matches,done);}else done();
  }
 };
}
