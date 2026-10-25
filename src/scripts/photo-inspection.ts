import {paintPhoto,preparePhotograph} from './garment-photo';

/** Each actual photograph owns its fit, zoom and pan; navigation stays router-owned. */
export function initPhotoInspection(reader:HTMLElement){
 const states=new Map<HTMLElement,{reset:()=>void;draw:()=>void;zoom:()=>number}>();
 let selected:HTMLElement|null=null;
 const sync=()=>reader.toggleAttribute('data-inspect',[...states.values()].some(s=>s.zoom()>1));
 for(const panel of reader.querySelectorAll<HTMLElement>('[data-photo-panel]')){
  const viewport=panel.querySelector<HTMLButtonElement>('[data-photo-viewport]')!,photo=viewport.querySelector<HTMLElement>('[data-ww-photo],[data-mw-photo]')!,image=photo.querySelector<HTMLImageElement>('img')!,status=panel.querySelector<HTMLElement>('[data-photo-status]')!;
  let zoom=1,x=0,y=0,width=0,height=0,drag:{id:number;x:number;y:number;startX:number;startY:number;moved:boolean}|null=null,skipClick=false;
  let touch:{distance:number;zoom:number;x:number;y:number;cx:number;cy:number}|null=null;
  const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));
  const draw=()=>{
   x=clamp(x,-Math.max(0,(width*zoom-viewport.clientWidth)/2),Math.max(0,(width*zoom-viewport.clientWidth)/2));
   y=clamp(y,-Math.max(0,(height*zoom-viewport.clientHeight)/2),Math.max(0,(height*zoom-viewport.clientHeight)/2));
   photo.style.transform=zoom===1?'':`translate3d(${x}px,${y}px,0) scale(${zoom})`;
   viewport.toggleAttribute('data-zoomed',zoom>1);viewport.setAttribute('aria-pressed',String(zoom>1));
   viewport.setAttribute('aria-busy',String(!image.complete));
   status.textContent=!image.complete?' · Loading photograph…':!image.naturalWidth?' · Photograph unavailable':zoom>1?` · ${Math.round(zoom*100)}%`:'';sync();
  };
  const reset=()=>{zoom=1;x=y=0;touch=null;drag=null;skipClick=false;draw();};
  const fit=()=>{
   if(!viewport.clientWidth)return;
   reader.style.setProperty('--inspection-head',`${reader.querySelector('header')!.offsetHeight}px`);
   if(panel.closest('[data-photo-pair]')&&innerWidth>=900){
    const top=viewport.getBoundingClientRect().top+reader.scrollTop;
    viewport.style.height=`${Math.max(240,Math.min(900,innerHeight-top-38))}px`;
   }else viewport.style.height='';
   const aspect=photo.hasAttribute('data-ww-photo')?Number(photo.style.getPropertyValue('--aspect'))*Number(photo.style.getPropertyValue('--window')):Number(photo.style.getPropertyValue('--photo-aspect'));
   height=Math.max(1,Math.min(viewport.clientHeight,viewport.clientWidth/aspect));width=height*aspect;
   photo.style.setProperty('--photo-h',`${height}px`);photo.style.height=`${height}px`;photo.style.width=`${width}px`;photo.style.transformOrigin='center center';
   if(photo.hasAttribute('data-ww-photo'))paintPhoto(photo);draw();
  };
  const change=(next:number,clientX?:number,clientY?:number)=>{
   selected=panel;preparePhotograph(image);const ratio=clamp(next,1,5)/zoom;
   if(clientX!==undefined&&clientY!==undefined){const rect=viewport.getBoundingClientRect(),px=clientX-rect.left-rect.width/2,py=clientY-rect.top-rect.height/2;x=px-(px-x)*ratio;y=py-(py-y)*ratio;}
   zoom=clamp(next,1,5);if(zoom===1)x=y=0;draw();
  };
  states.set(panel,{reset,draw:fit,zoom:()=>zoom});
  panel.addEventListener('focusin',()=>selected=panel);
  panel.querySelectorAll<HTMLButtonElement>('[data-photo-zoom]').forEach(b=>b.addEventListener('click',()=>change(zoom*(b.dataset.photoZoom==='in'?1.4:1/1.4))));
  panel.querySelector('[data-photo-fit]')!.addEventListener('click',()=>{selected=panel;reset();});
  viewport.addEventListener('click',e=>{if(skipClick){skipClick=false;return;}if(e.detail>1)return;change(zoom>1?1:2,e.clientX||undefined,e.clientY||undefined);});
  viewport.addEventListener('pointerdown',e=>{selected=panel;if(e.pointerType==='touch'||zoom===1)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false};viewport.setPointerCapture(e.pointerId);});
  viewport.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>4)drag.moved=true;x+=dx;y+=dy;drag.x=e.clientX;drag.y=e.clientY;draw();});
  viewport.addEventListener('pointerup',()=>{if(drag?.moved)skipClick=true;drag=null;});
  viewport.addEventListener('pointercancel',()=>{drag=null;});
  const points=(e:TouchEvent)=>{const a=e.touches[0],b=e.touches[1]??a;return{cx:(a.clientX+b.clientX)/2,cy:(a.clientY+b.clientY)/2,distance:e.touches.length>1?Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY):0};};
  const begin=(e:TouchEvent)=>{selected=panel;const p=points(e);touch={...p,zoom,x,y};if(e.touches.length>1||zoom>1)e.preventDefault();};
  viewport.addEventListener('touchstart',begin,{passive:false});
  viewport.addEventListener('touchmove',e=>{
   if(!touch||(!touch.distance&&zoom===1&&e.touches.length===1))return;
   e.preventDefault();skipClick=true;const p=points(e);
   if(e.touches.length>1){if(!touch.distance){begin(e);return;}const next=clamp(touch.zoom*p.distance/touch.distance,1,5),ratio=next/touch.zoom,rect=viewport.getBoundingClientRect(),px=touch.cx-rect.left-rect.width/2,py=touch.cy-rect.top-rect.height/2;x=px-(px-touch.x)*ratio+p.cx-touch.cx;y=py-(py-touch.y)*ratio+p.cy-touch.cy;zoom=next;}
   else{x=touch.x+p.cx-touch.cx;y=touch.y+p.cy-touch.cy;}draw();
  },{passive:false});
  viewport.addEventListener('touchend',e=>{if(e.touches.length)begin(e);else{touch=null;window.setTimeout(()=>skipClick=false,350);}});
  viewport.addEventListener('touchcancel',()=>touch=null);
  viewport.addEventListener('wheel',e=>{if(!e.ctrlKey&&!e.metaKey)return;e.preventDefault();change(zoom*Math.exp(-e.deltaY*.01),e.clientX,e.clientY);},{passive:false});
  viewport.addEventListener('keydown',e=>{
   if(['+','=','-','0','Home'].includes(e.key)){e.preventDefault();if(e.key==='0'||e.key==='Home')reset();else change(zoom*(e.key==='-'?1/1.4:1.4));}
   else if(zoom>1&&e.key.startsWith('Arrow')){e.preventDefault();x+=e.key==='ArrowLeft'?40:e.key==='ArrowRight'?-40:0;y+=e.key==='ArrowUp'?40:e.key==='ArrowDown'?-40:0;draw();}
  });
  const observer=new ResizeObserver(fit);observer.observe(viewport);image.addEventListener('load',fit);image.addEventListener('error',draw);fit();
 }
 const reset=()=>{for(const s of states.values())s.reset();selected=null;reader.removeAttribute('data-inspect');};
 reader.addEventListener('pf:photo-fit',()=>{const target=selected&&states.get(selected)!.zoom()>1?selected:[...states].find(([,s])=>s.zoom()>1)?.[0];if(target)states.get(target)!.reset();});
 return{reset,select:()=>{reset();for(const image of reader.querySelectorAll<HTMLImageElement>('[data-photo-pair] img')){preparePhotograph(image);void image.decode().catch(()=>{});}},draw:()=>{for(const s of states.values())s.draw();}};
}
