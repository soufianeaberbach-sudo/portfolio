import {gsap} from 'gsap';
import {paintRtwPhoto} from './rtw-photo';
import {rtwMatchCut,cancelRtwMatchCut} from './rtw-match-cut';
import {initRtwExhibition} from './rtw-exhibition';
export function initRtw(root:HTMLElement){
 const exhibition=root.querySelector<HTMLElement>('[data-rtw-exhibition]');if(!exhibition)return null;
 const world=exhibition.closest<HTMLElement>('[data-world]')!,camera=initRtwExhibition(exhibition);
 const readers=[...world.querySelectorAll<HTMLElement>('[data-rtw-reader]')],reduced=matchMedia('(prefers-reduced-motion:reduce)');
 let active:HTMLElement|null=null,entering=false,epoch=0,returnFinish:(()=>void)|null=null;
 const floor=[...world.querySelector<HTMLElement>('[data-screen=index]')!.children].filter(e=>!e.classList.contains('pf-rd')) as HTMLElement[];
 const setInert=(on:boolean)=>{for(const part of floor)part.inert=on;camera.hold(on);};
 const states=new Map<HTMLElement,{view:number;zoom:number;x:number;y:number;draw:()=>void;reset:()=>void}>();
 for(const reader of readers){
  const photo=reader.querySelector<HTMLElement>('[data-rtw-photo]')!,image=photo.querySelector<HTMLImageElement>('img')!,viewport=reader.querySelector<HTMLElement>('[data-rtw-target]')!;
  const inspect=reader.querySelector<HTMLButtonElement>('[data-rd-inspect]')!,tools=reader.querySelector<HTMLElement>('[data-rtw-zoom-tools]')!;
  const status=reader.querySelector<HTMLElement>('[data-rtw-source-status]')!;
  const originalSizes=image.sizes;
  const s={view:0,zoom:1,x:0,y:0,draw:()=>{},reset:()=>{}};states.set(reader,s);
  const limit=()=>Math.max(2,Math.min(4,Number(image.getAttribute('height'))/Math.max(1,photo.clientHeight)));
  s.draw=()=>{
   const x=Math.max(0,(s.zoom-1)*photo.clientWidth/2),y=Math.max(0,(s.zoom-1)*photo.clientHeight/2);
   s.x=Math.max(-x,Math.min(x,s.x));s.y=Math.max(-y,Math.min(y,s.y));
   photo.style.transform=`translate3d(${s.x}px,${s.y}px,0) scale(${s.zoom})`;photo.style.transformOrigin='center center';
   paintRtwPhoto(photo,s.view);
   status.textContent=reader.hasAttribute('data-inspect')?`${Math.round(s.zoom*100)}% · drag / pinch / arrow keys`:'';
  };
  const setInspect=(on:boolean)=>{cancelRtwMatchCut();reader.toggleAttribute('data-inspect',on);image.sizes=on?`${image.getAttribute('width')}px`:originalSizes;inspect.setAttribute('aria-pressed',String(on));tools.hidden=!on;s.zoom=on?Math.min(2,limit()):1;s.x=s.y=0;s.draw();};
  s.reset=()=>{gsap.killTweensOf(s);gsap.killTweensOf(photo);pointers.clear();image.sizes=originalSizes;reader.removeAttribute('data-inspect');inspect.setAttribute('aria-pressed','false');tools.hidden=true;s.zoom=1;s.x=s.y=0;s.draw();};
  const setView=(view:number,instant=false)=>{
   cancelRtwMatchCut();gsap.killTweensOf(s);s.x=s.y=0;
   reader.querySelectorAll<HTMLElement>('[data-rtw-view]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.rtwView)===view)));
   gsap.to(s,{view,duration:instant||reduced.matches?0:.42,ease:'power3.inOut',onUpdate:()=>{photo.style.setProperty('--view',String(s.view));s.draw();}});
  };
  for(const button of reader.querySelectorAll<HTMLButtonElement>('[data-rtw-view]'))button.addEventListener('click',e=>setView(Number(button.dataset.rtwView),(e as MouseEvent).detail===0));
  inspect.addEventListener('click',()=>setInspect(!reader.hasAttribute('data-inspect')));
  reader.querySelectorAll<HTMLButtonElement>('[data-rtw-zoom]').forEach(b=>b.addEventListener('click',()=>{s.zoom=Math.max(1,Math.min(limit(),s.zoom*Number(b.dataset.rtwZoom)));s.draw();}));
  reader.querySelector('[data-rtw-fit]')?.addEventListener('click',()=>{s.zoom=1;s.x=s.y=0;s.draw();});
  const pointers=new Map<number,{x:number;y:number}>();let lastX=0,lastY=0,distance=0;
  viewport.addEventListener('pointerdown',e=>{pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});lastX=e.clientX;lastY=e.clientY;distance=0;try{viewport.setPointerCapture(e.pointerId);}catch{}});
  viewport.addEventListener('pointermove',e=>{
   if(!pointers.has(e.pointerId)||!reader.hasAttribute('data-inspect'))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(pointers.size===2){const[a,b]=[...pointers.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(distance)s.zoom=Math.max(1,Math.min(limit(),s.zoom*d/distance));distance=d;}
   else{s.x+=e.clientX-lastX;s.y+=e.clientY-lastY;}
   lastX=e.clientX;lastY=e.clientY;s.draw();
  });
  const release=(e:PointerEvent)=>{const start=pointers.get(e.pointerId);if(start&&!reader.hasAttribute('data-inspect')&&Number(photo.dataset.split)!==1&&Math.abs(e.clientX-lastX)>40)setView(e.clientX<lastX?1:0);pointers.delete(e.pointerId);distance=0;const left=[...pointers.values()][0];if(left){lastX=left.x;lastY=left.y;}};
  viewport.addEventListener('pointerup',release);viewport.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);distance=0;});
  reader.addEventListener('keydown',e=>{
   if(!reader.hasAttribute('data-inspect')){if(Number(photo.dataset.split)!==1&&(e.key==='ArrowRight'||e.key==='ArrowLeft')){e.preventDefault();setView(e.key==='ArrowRight'?1:0,true);}return;}
   if(e.key.startsWith('Arrow')){e.preventDefault();s.x+=e.key==='ArrowLeft'?40:e.key==='ArrowRight'?-40:0;s.y+=e.key==='ArrowUp'?40:e.key==='ArrowDown'?-40:0;s.draw();}
   if(e.key==='+'||e.key==='='||e.key==='-'){e.preventDefault();s.zoom=Math.max(1,Math.min(limit(),s.zoom*(e.key==='-'?1/1.4:1.4)));s.draw();}
   if(e.key==='Home'){e.preventDefault();s.zoom=1;s.x=s.y=0;s.draw();}
  });
  reader.addEventListener('pf:subject-reset',()=>{s.reset();if(active===reader){active=null;setInert(false);}});
  image.addEventListener('error',()=>{status.textContent='Original photograph unavailable. Return to the exhibition to continue.';});
  image.addEventListener('load',s.draw);
 }
 const cancel=()=>{const finish=returnFinish;returnFinish=null;finish?.();epoch++;cancelRtwMatchCut();};
 const settle=()=>{cancel();if(active){const s=states.get(active)!;gsap.killTweensOf(s);s.view=Math.round(s.view);active.querySelectorAll<HTMLElement>('[data-rtw-view]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.rtwView)===s.view)));active.querySelector<HTMLElement>('[data-rtw-photo]')!.style.setProperty('--view',String(s.view));s.draw();}};
 window.addEventListener('resize',settle);reduced.addEventListener('change',settle);
 return {
  owns:(reader:HTMLElement)=>reader.hasAttribute('data-rtw-reader'),cancel,
  enter(reader:HTMLElement,source:HTMLElement|null,instant:boolean){
   cancel();active=reader;entering=!!source;setInert(true);const s=states.get(reader)!;s.reset();const photo=reader.querySelector<HTMLElement>('[data-rtw-photo]')!;
   s.view=source?Number(source.style.getPropertyValue('--view'))||0:0;photo.style.setProperty('--view',String(s.view));s.draw();
   reader.querySelectorAll<HTMLElement>('[data-rtw-view]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.rtwView)===Math.round(s.view))));
   const img=photo.querySelector<HTMLImageElement>('img')!;img.loading='eager';if(!img.complete)reader.querySelector<HTMLElement>('[data-rtw-source-status]')!.textContent='Loading original photograph…';const current=epoch;
   if(source)rtwMatchCut(reader,source,true,instant||reduced.matches,()=>{if(epoch===current){entering=false;s.draw();}});
  },
  leave(reader:HTMLElement,source:HTMLElement|null,instant:boolean,finished:()=>void){
   const interrupted=entering;entering=false;cancel();const s=states.get(reader)!;gsap.killTweensOf(s);s.view=Math.round(s.view);const photo=reader.querySelector<HTMLElement>('[data-rtw-photo]')!;photo.style.setProperty('--view',String(s.view));s.draw();
   setInert(false);const current=epoch;
   const done=()=>{if(current!==epoch)return;returnFinish=null;if(active===reader)active=null;finished();};
   returnFinish=done;
   if(source&&location.hash===`#${world.id}/rtw`){rtwMatchCut(reader,source,false,interrupted||instant||reduced.matches,done);}
   else done();
  },
 };
}
