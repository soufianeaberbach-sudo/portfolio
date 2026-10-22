import {paintPhoto} from './garment-photo';
let cancelCurrent:(()=>void)|null=null;
export const cancelGarmentMatchCut=()=>{cancelCurrent?.();};
/** The router owns navigation/focus. This utility owns only one decoded photographic clone. */
export function garmentMatchCut(reader:HTMLElement,source:HTMLElement,entering:boolean,instant:boolean,finished:()=>void){
 cancelCurrent?.();
 const target=reader.querySelector<HTMLElement>('[data-photo-view]:not([hidden]) [data-ww-photo]')!;
 let canceled=false,clone:HTMLElement|null=null,animations:Animation[]=[];
 const oldTarget=target.style.visibility,oldSource=source.style.visibility;
 const cleanup=()=>{canceled=true;clone?.remove();for(const a of animations)a.cancel();target.style.visibility=oldTarget;source.style.visibility=oldSource;if(cancelCurrent===cleanup)cancelCurrent=null;};
 cancelCurrent=cleanup;
 const view=Number(source.style.getPropertyValue('--view'))||0;
 if(instant){cleanup();finished();return;}
 const from=entering?source:target,to=entering?target:source;
 const start=async()=>{
  const original=from.querySelector<HTMLImageElement>('img')!;
  original.loading='eager';
  const destination=to.querySelector<HTMLImageElement>('img')!;destination.loading='eager';
  try{await Promise.all([original.decode(),destination.decode()]);}catch{if(!canceled){cleanup();finished();}return;}
  if(canceled)return;
  const a=from.getBoundingClientRect(),b=to.getBoundingClientRect();
  if(!a.width||!b.width){cleanup();finished();return;}
  clone=from.cloneNode(true) as HTMLElement;clone.removeAttribute('data-ww-photo');clone.removeAttribute('data-door-source');clone.setAttribute('aria-hidden','true');clone.classList.add('ww-match');
  // Inspection uses a centre origin; the measured clone's coordinates use top-left.
  Object.assign(clone.style,{left:`${a.left}px`,top:`${a.top}px`,width:`${a.width}px`,height:`${a.height}px`,transform:'none',transformOrigin:'top left',visibility:'visible'});
  const img=clone.querySelector<HTMLImageElement>('img')!;img.src=original.currentSrc||original.src;img.removeAttribute('srcset');img.style.height=`${a.height}px`;img.decoding='sync';
  document.body.append(clone);paintPhoto(clone,view);
  try{await img.decode();}catch{if(!canceled){cleanup();finished();}return;}
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   if(canceled||!clone)return;
   target.style.visibility='hidden';source.style.visibility='hidden';
   const options={duration:560,easing:'cubic-bezier(.22,.68,.18,1)',fill:'forwards' as FillMode};
   const garment=clone.animate([{transform:'translate3d(0,0,0) scale(1)'},{transform:`translate3d(${b.left-a.left}px,${b.top-a.top}px,0) scale(${b.height/a.height})`}],options);
   // One opaque white viewing space: fading the entire reader ghosted other
   // exhibition figures through the moving garment. Only the measured image moves.
   animations=[garment];
   garment.onfinish=()=>{if(canceled)return;cleanup();finished();};
  }));
 };
 void start();
}
