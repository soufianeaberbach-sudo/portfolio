import type{SourceWindow}from'../data/menswear-direction';
type Box={x:number;y:number;w:number;h:number};
const whole:SourceWindow=[0,0,1,1];
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const ease=(v:number)=>{const t=clamp(v);return t*t*(3-2*t);};
const lerp=(a:number,b:number,p:number)=>a+(b-a)*p;
const mix=(a:Box,b:Box,p:number):Box=>({x:lerp(a.x,b.x,p),y:lerp(a.y,b.y,p),w:lerp(a.w,b.w,p),h:lerp(a.h,b.h,p)});
export function paintMenswear(frame:HTMLElement,position:number,reduced:boolean,heldActor?:number){
 const camera=frame.querySelector<HTMLElement>('[data-mw-camera]')!,w=camera.clientWidth,h=camera.clientHeight,compact=w<700||(w<1024&&matchMedia('(orientation:portrait)').matches);
 if(!w||!h)return;
 let order=2;
 const nodes=[...frame.querySelectorAll<HTMLAnchorElement>('[data-mw-actor]')],drawn=new Set<HTMLElement>();
 const photo=(id:number)=>nodes.find(n=>Number(n.dataset.mwActor)===id)!;
 const viewWindow=(id:number):SourceWindow=>(photo(id).dataset[compact?'mwMobileWindow':'mwWindow']??'0,0,1,1').split(',').map(Number) as SourceWindow;
 const original=(id:number)=>photo(id).dataset.mwOriginal==='true';
 const backdrop=(id:number,color:string)=>{frame.style.background=original(id)?color:'#fff';frame.style.color=original(id)?'var(--paper)':'var(--ink)';};
 const fit=(id:number,cx=.5,factor=1,cy=.5,win=viewWindow(id)):Box=>{
  const im=photo(id).querySelector('img')!,a=Number(im.getAttribute('width'))/Number(im.getAttribute('height'));
  const sh=Math.min(h*.94/win[3],w*(compact?.94:.90)/(a*win[2]))*factor;
  return{x:w*cx-sh*a*(win[0]+win[2]/2),y:h*cy-sh*(win[1]+win[3]/2),w:sh*a,h:sh};
 };
 const draw=(id:number,b:Box,win=viewWindow(id),interactive=true,gate:SourceWindow=whole)=>{
  const node=photo(id);drawn.add(node);node.style.zIndex=String(++order);node.style.clipPath='';
  const l=Math.max(0,b.x+b.w*win[0],w*gate[0]),t=Math.max(0,b.y+b.h*win[1],h*gate[1]);
  const r=Math.min(w,b.x+b.w*(win[0]+win[2]),w*(gate[0]+gate[2])),d=Math.min(h,b.y+b.h*(win[1]+win[3]),h*(gate[1]+gate[3]));
  const visible=r-l>1&&d-t>1;
  node.style.visibility=visible?'visible':'hidden';node.inert=!visible||!interactive;node.tabIndex=visible&&interactive?0:-1;node.setAttribute('aria-hidden',String(!visible||!interactive));
  Object.assign(node.style,{left:`${l}px`,top:`${t}px`,width:`${Math.max(0,r-l)}px`,height:`${Math.max(0,d-t)}px`});
  Object.assign(node.querySelector('img')!.style,{left:`${b.x-l}px`,top:`${b.y-t}px`,width:`${b.w}px`,height:`${b.h}px`});
 };
 const act=Math.floor(position),fraction=position-act;
 // Brief holds around all authored compositions; no scroll snapping or forced waiting.
 const p=reduced?Math.round(position):Math.min(4,act+clamp((fraction-.09)/.82));
 const world=frame.closest<HTMLElement>('[data-mw-film]')!.dataset.mwFilm;
 frame.style.background='#fff';frame.style.color='var(--ink)';
 const wings=[...frame.querySelectorAll<HTMLElement>('[data-mw-wing]')];for(const n of wings)n.style.display='none';
 if(world==='m-streetwear'){
  const cream=fit(6311316),city=fit(8505243,compact?.44:.26),roomWindow:SourceWindow=viewWindow(30599804),room=fit(30599804,.5,1,.5,roomWindow),hero=fit(17303564),puffer=fit(26936522);
  if(!photo(30599804).dataset.mwSeam){
   // New full-length studio portraits retain the authored camera journey.
   // Move photographic planes instead of borrowing the historical wall seam.
   const cast=[6311316,8505243,30599804,17303564,26936522],i=Math.min(3,Math.floor(p)),t=ease(p-i);
   if(p>=4)draw(cast[4],fit(cast[4]));
   else if(t===0)draw(cast[i],fit(cast[i]));
   else if(compact){
    const left=fit(cast[i],.25,.47),right=fit(cast[i+1],.75,.47);
    if(t<.5){
     const q=t*2;draw(cast[i],mix(fit(cast[i]),left,q),undefined,false);
     if(q>.02)draw(cast[i+1],fit(cast[i+1],.75,Math.max(.01,.47*q)),undefined,false);
    }else{
     const q=(t-.5)*2;
     if(q<.98)draw(cast[i],fit(cast[i],.25,Math.max(.01,.47*(1-q))),undefined,false);
     draw(cast[i+1],mix(right,fit(cast[i+1]),q),undefined,q>.95);
    }
   }else{
    const left=fit(cast[i],.27,.86),right=fit(cast[i+1],.73,.86);
    if(t<.3)draw(cast[i],mix(fit(cast[i]),left,t/.3));
    else if(t<.7){
     draw(cast[i],left,undefined,false);
     const entering=fit(cast[i+1],.73+(1-ease((t-.3)/.4))*.65,.86);
     draw(cast[i+1],entering,undefined,false);
    }else{
     const q=ease((t-.7)/.3);
     if(q<1)draw(cast[i],{...left,x:left.x-w*q},undefined,false);
     draw(cast[i+1],mix(right,fit(cast[i+1]),q),undefined,q>.95);
    }
   }
  }else{
  const wall={x:w*(compact?.92:.64),y:-h*.78,w:h*2.1*(1200/1680),h:h*2.1};
  if(p<=1){
   if(p<.44)draw(6311316,cream);else draw(8505243,city);
   draw(30599804,mix({...wall,x:w*1.02},wall,ease(p)),whole,false);
  }else if(p<=2){
   const t=p-1;
   if(t<.30){draw(8505243,city);draw(30599804,{...wall,x:lerp(wall.x,-wall.w*.04,ease(t/.30))},whole,false);}
   else draw(30599804,mix({...wall,x:-wall.w*.04},room,ease((t-.30)/.70)),t>.999?roomWindow:whole,t>.99);
  }else if(p<3){
   const t=ease(p-2),win=roomWindow,src=photo(30599804).querySelector('img')!.currentSrc,seam=Number(photo(30599804).dataset.mwSeam);
   if(!seam){draw(17303564,hero,undefined,p>2.9);draw(30599804,{...room,x:room.x-w*t},roomWindow,false);}
   else {
   draw(17303564,hero,undefined,p>2.85);
   // The room opens along an actual empty architectural seam; pixels retain their proportions.
   wings.forEach((wing,i)=>{
    const a=room.x+room.w*(i===0?win[0]:seam),b=room.x+room.w*(i===0?seam:win[0]+win[2]),ww=b-a;
    const x=lerp(a,i===0?-ww-2:w+2,t);
    Object.assign(wing.style,{display:'block',left:`${x}px`,top:`${room.y+room.h*win[1]}px`,width:`${ww}px`,height:`${room.h*win[3]}px`});
    const im=wing.querySelector('img')!;if(im.src!==src)im.src=src;
    Object.assign(im.style,{left:`${room.x-a}px`,top:`${-room.h*win[1]}px`,width:`${room.w}px`,height:`${room.h}px`});
   });
   }
  }else{
   // The open jacket and compact quilted volume occupy the same floor, then
   // the camera leaves the first volume behind. No wiping through a body.
   const t=ease(p-3),teal=fit(17303564,compact?.34:.27,compact?.70:.85),quilt=fit(26936522,compact?.66:.73,compact?.88:1);
   if(compact){if(t<.58)draw(17303564,hero);else draw(26936522,puffer);}
   else if(t<.30){draw(17303564,mix(hero,teal,t/.30));}
   else if(t<.64){draw(17303564,teal);draw(26936522,quilt);}
   else{const q=ease((t-.64)/.36);draw(26936522,mix(quilt,puffer,q));if(q<.01)draw(17303564,teal);}
   frame.style.background=original(26936522)&&t>=.64?'#ccc9c6':'#fff';
  }
  }
 }else if(world==='m-activewear'){
  const polo=fit(7648388),black=fit(30954220),ground=fit(7116192,.5,.88,.55),red=fit(11000101),white=fit(6974949),jump=fit(33443605);
  const compression=()=>{draw(7116192,ground);};
  if(p<=1){if(p<.43)draw(7648388,polo);else compression();}
  else if(p<=2){if(p<1.46)compression();else draw(11000101,red);}
  else if(p<=3){
   const t=ease(p-2);
   if(compact){if(p<2.46)draw(11000101,red);else draw(6974949,white);}
   else{draw(11000101,mix(red,fit(11000101,.27,.91),t));draw(6974949,fit(6974949,.74,.91),whole,t>.95,[1-t*.5,0,t*.5,1]);}
  }else{
   // A diagonal editorial cut follows the existing lifted stance. The people
   // never move within their photographs, and the full jump is held at payoff.
   const t=ease(p-3);
   if(t<.26){if(!compact&&t<.01)draw(11000101,fit(11000101,.27,.91));draw(6974949,compact?white:mix(fit(6974949,.74,.91),white,ease(t/.26)));}
   else{const q=ease((t-.26)/.74);if(q<1)draw(6974949,white);draw(33443605,jump,undefined,q>.98);photo(33443605).style.clipPath=`polygon(0 0, ${q*220}% 0, ${q*220-120}% 100%, 0 100%)`;}
  }
 }else if(world==='m-rtw'){
  const knit=fit(16711124),plinth=fit(29727778),chair=fit(13128635),green=fit(8508752),final=fit(7764014);
  if(p<=1){if(p<.46)draw(16711124,knit);else draw(29727778,plinth);}
  else if(p<=2){
   // Resting on a block → carrying a chair: two independent photographs,
   // connected by the visible support, never a fabricated prop transformation.
   const t=ease(p-1),left=fit(29727778,.27,.90),right=fit(13128635,.73,.94);
   if(compact){if(t<.5)draw(29727778,plinth);else draw(13128635,chair);}
   else if(t<.30)draw(29727778,mix(plinth,left,t/.30));
   else if(t<.70){draw(29727778,left);draw(13128635,right);}
   else draw(13128635,mix(right,chair,ease((t-.70)/.30)));
  }
  else if(p<=3){const t=ease(p-2);if(compact){if(p<2.46)draw(13128635,chair);else draw(8508752,green);}else{draw(13128635,mix(chair,fit(13128635,.28,.91),t));draw(8508752,fit(8508752,.74,.91),undefined,t>.95,[1-t*.5,0,t*.5,1]);}}
  else if(compact){if(p<3.46)draw(8508752,green);else{draw(7764014,final);}}
  else{const t=ease(p-3);if(t<.5){draw(13128635,fit(13128635,.28,.91));draw(8508752,fit(8508752,.74,.91));}else draw(7764014,final);}
 }else{
  const daylight=fit(6097464),pale=fit(29242239),steel=fit(16862147),ivory=fit(14348500),coat=fit(6207215);
  if(p<=1){const t=ease(p);if(compact){if(p<.46)draw(6097464,daylight);else draw(29242239,pale);}else{draw(6097464,mix(daylight,fit(6097464,.27,.92),t));draw(29242239,fit(29242239,.74,.92),whole,t>.95,[1-t*.5,0,t*.5,1]);}}
  else if(p<=2){if(p<1.46){if(!compact)draw(6097464,fit(6097464,.27,.92));draw(29242239,compact?pale:fit(29242239,.74,.92));}else{draw(16862147,steel);backdrop(16862147,'#161718');}}
  else if(p<=3){
   // Light suit in a dark room answers the dark suit. Stable axes and full
   // proportions make the reversal readable without invented relighting.
   const t=ease(p-2);backdrop(16862147,'#161718');
   if(compact){if(t<.5)draw(16862147,steel);else draw(14348500,ivory);}
   else if(t<.27)draw(16862147,mix(steel,fit(16862147,.28,.92),t/.27));
   else if(t<.72){draw(16862147,fit(16862147,.28,.92));draw(14348500,fit(14348500,.73,.96));}
   else draw(14348500,mix(fit(14348500,.73,.96),ivory,ease((t-.72)/.28)));
  }
  else{if(p<3.46){draw(14348500,ivory);backdrop(14348500,'#161718');}else{draw(6207215,coat);backdrop(6207215,'#161718');}}
 }
 // A reader opened before a breakpoint change keeps its actual photographic
 // occurrence until the visitor advances, even when that role has a portrait alternative.
 if(heldActor&&!drawn.has(photo(heldActor))){drawn.clear();for(const wing of wings)wing.style.display='none';draw(heldActor,fit(heldActor));}
 for(const node of nodes)if(!drawn.has(node)){node.inert=true;node.tabIndex=-1;node.style.visibility='hidden';node.setAttribute('aria-hidden','true');}
 frame.querySelector<HTMLElement>('.mw-film-title')!.style.opacity=String(1-clamp(p*2));
 const visibleImages=[...drawn].filter(node=>node.style.visibility==='visible').map(node=>node.querySelector('img')!);
 const failed=visibleImages.some(im=>im.complete&&!im.naturalWidth);
 const loading=visibleImages.length>0&&visibleImages.every(im=>!im.complete||!im.naturalWidth)&&!failed;
 const status=frame.querySelector<HTMLElement>('[data-mw-media-status]')!,message=failed?'Photograph unavailable. Open the ten-look edit to continue.':'Loading photograph…';
 if(status.textContent!==message)status.textContent=message;
 status.hidden=!failed&&!loading;
 if(loading)frame.setAttribute('aria-busy','true');else frame.removeAttribute('aria-busy');
 frame.dataset.composition=String(Math.round(p));
}
