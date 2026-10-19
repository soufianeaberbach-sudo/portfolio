import {paintPhoto} from './garment-photo';
import {garmentMatchCut,cancelGarmentMatchCut} from './garment-match-cut';
import {initWomenswearExhibition} from './womenswear-exhibition';
export function initWomenswear(root:HTMLElement){
 const exhibitions=[...root.querySelectorAll<HTMLElement>('[data-ww-exhibition]')];if(!exhibitions.length)return null;
 const world=exhibitions[0].closest<HTMLElement>('[data-world]')!,cameras=exhibitions.map(initWomenswearExhibition);
 const readers=[...world.querySelectorAll<HTMLElement>('[data-ww-reader]')],reduced=matchMedia('(prefers-reduced-motion:reduce)');
 let active:HTMLElement|null=null,entering=false,epoch=0,returnFinish:(()=>void)|null=null;
 const floor=[...world.querySelector<HTMLElement>('[data-screen=index]')!.children].filter(e=>!e.classList.contains('pf-rd')) as HTMLElement[];
 const setInert=(on:boolean)=>{for(const part of floor)part.inert=on;for(const camera of cameras)camera.hold(on);};
 const states=new Map<HTMLElement,{view:number;zoom:number;x:number;y:number;draw:()=>void;reset:()=>void;select:(view:number)=>void}>();
 for(const reader of readers){
  const panels=[...reader.querySelectorAll<HTMLElement>('[data-photo-view]')],viewport=reader.querySelector<HTMLElement>('[data-ww-target]')!;
  const photos=panels.map(p=>p.querySelector<HTMLElement>('[data-ww-photo]')!),images=photos.map(p=>p.querySelector<HTMLImageElement>('img')!);
  const originalSizes=images.map(i=>i.sizes),inspect=reader.querySelector<HTMLButtonElement>('[data-rd-inspect]')!,tools=reader.querySelector<HTMLElement>('[data-ww-zoom-tools]')!,original=reader.querySelector<HTMLAnchorElement>('[data-original-source]')!,status=reader.querySelector<HTMLElement>('[data-ww-source-status]')!;
  const pointers=new Map<number,{x:number;y:number}>();let lastX=0,lastY=0,distance=0;
  const s={view:0,zoom:1,x:0,y:0,draw:()=>{},reset:()=>{},select:(_view:number)=>{}};states.set(reader,s);
  const limit=()=>Math.max(2,Math.min(4,Number(images[s.view].getAttribute('height'))/Math.max(1,photos[s.view].clientHeight)));
  s.draw=()=>{
   const photo=photos[s.view],image=images[s.view],x=Math.max(0,(s.zoom-1)*photo.clientWidth/2),y=Math.max(0,(s.zoom-1)*photo.clientHeight/2);
   s.x=Math.max(-x,Math.min(x,s.x));s.y=Math.max(-y,Math.min(y,s.y));photo.style.transform=`translate3d(${s.x}px,${s.y}px,0) scale(${s.zoom})`;photo.style.transformOrigin='center center';paintPhoto(photo);
   status.textContent=image.complete&&!image.naturalWidth?'Original photograph unavailable. Return to the exhibition to continue.':reader.hasAttribute('data-inspect')?`${Math.round(s.zoom*100)}% · drag / pinch / arrow keys`:'';
  };
  const setInspect=(on:boolean)=>{cancelGarmentMatchCut();reader.removeAttribute('data-ww-moving');entering=false;reader.toggleAttribute('data-inspect',on);images[s.view].sizes=on?`${images[s.view].getAttribute('width')}px`:originalSizes[s.view];inspect.setAttribute('aria-pressed',String(on));tools.hidden=!on;s.zoom=on?Math.min(2,limit()):1;s.x=s.y=0;s.draw();};
  s.reset=()=>{pointers.clear();images.forEach((img,i)=>{img.sizes=originalSizes[i];photos[i].style.transform='';});reader.removeAttribute('data-inspect');inspect.setAttribute('aria-pressed','false');tools.hidden=true;s.zoom=1;s.x=s.y=0;s.draw();};
  s.select=(view:number)=>{
   cancelGarmentMatchCut();reader.removeAttribute('data-ww-moving');entering=false;s.reset();s.view=Math.max(0,Math.min(panels.length-1,view));panels.forEach((p,i)=>p.hidden=i!==s.view);images[s.view].loading='eager';original.href=images[s.view].src;
   reader.querySelectorAll<HTMLElement>('[data-ww-view]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.wwView)===s.view)));s.draw();
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
  viewport.addEventListener('pointerup',e=>{const start=pointers.get(e.pointerId);if(start&&!reader.hasAttribute('data-inspect')&&Math.abs(e.clientX-start.x)>40)s.select(s.view+(e.clientX<start.x?1:-1));pointers.delete(e.pointerId);distance=0;const left=[...pointers.values()][0];if(left){lastX=left.x;lastY=left.y;}});
  viewport.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);distance=0;});
  reader.addEventListener('focusin',e=>{if(e.target!==reader&&reader.hasAttribute('data-ww-moving')){cancelGarmentMatchCut();reader.removeAttribute('data-ww-moving');entering=false;}});
  reader.addEventListener('keydown',e=>{
   if(!reader.hasAttribute('data-inspect')){if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();s.select(s.view+(e.key==='ArrowRight'?1:-1));}return;}
   if(e.key.startsWith('Arrow')){e.preventDefault();s.x+=e.key==='ArrowLeft'?40:e.key==='ArrowRight'?-40:0;s.y+=e.key==='ArrowUp'?40:e.key==='ArrowDown'?-40:0;s.draw();}
   if(e.key==='+'||e.key==='='||e.key==='-'){e.preventDefault();s.zoom=Math.max(1,Math.min(limit(),s.zoom*(e.key==='-'?1/1.4:1.4)));s.draw();}if(e.key==='Home'){e.preventDefault();s.zoom=1;s.x=s.y=0;s.draw();}
  });
  reader.addEventListener('pf:subject-reset',()=>{s.reset();if(active===reader){active=null;setInert(false);}});
  images.forEach(image=>{image.addEventListener('error',()=>{if(image===images[s.view])s.draw();});image.addEventListener('load',()=>{if(image===images[s.view])s.draw();});});
 }
 const cancel=()=>{active?.removeAttribute('data-ww-moving');const finish=returnFinish;returnFinish=null;finish?.();epoch++;cancelGarmentMatchCut();};
 const settle=()=>{cancel();if(active)states.get(active)!.draw();};window.addEventListener('resize',settle);reduced.addEventListener('change',settle);
 return{
  owns:(reader:HTMLElement)=>reader.hasAttribute('data-ww-reader'),returnHash:(reader:HTMLElement)=>`#${world.id}/${reader.dataset.of}`,cancel,
  enter(reader:HTMLElement,source:HTMLElement|null,instant:boolean){
   cancel();active=reader;setInert(true);states.get(reader)!.select(0);entering=!!source;const current=epoch;
   if(source){reader.setAttribute('data-ww-moving','');garmentMatchCut(reader,source,true,instant||reduced.matches,()=>{if(epoch===current){entering=false;reader.removeAttribute('data-ww-moving');states.get(reader)!.draw();}});}
  },
  leave(reader:HTMLElement,source:HTMLElement|null,instant:boolean,finished:()=>void){
   const interrupted=entering;entering=false;cancel();
   // Return resolves on the primary photograph. A deliberate Back selection
   // never changes the exhibition or its scrolling primary-view choreography.
   states.get(reader)!.select(0);setInert(false);const current=epoch;
   const done=()=>{if(current!==epoch)return;reader.removeAttribute('data-ww-moving');returnFinish=null;if(active===reader)active=null;finished();};returnFinish=done;
   if(source&&location.hash===`#${world.id}/${reader.dataset.of}`){reader.setAttribute('data-ww-moving','');garmentMatchCut(reader,source,false,interrupted||instant||reduced.matches,done);}else done();
  }
 };
}
