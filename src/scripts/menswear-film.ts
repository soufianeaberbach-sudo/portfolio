import type{SourceWindow}from'../data/menswear-direction';
type Box={x:number;y:number;w:number;h:number};
const whole:SourceWindow=[0,0,1,1];
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const ease=(v:number)=>{const t=clamp(v);return t*t*(3-2*t);};
const lerp=(a:number,b:number,p:number)=>a+(b-a)*p;
const mix=(a:Box,b:Box,p:number):Box=>({x:lerp(a.x,b.x,p),y:lerp(a.y,b.y,p),w:lerp(a.w,b.w,p),h:lerp(a.h,b.h,p)});
export function paintMenswear(frame:HTMLElement,position:number,reduced:boolean){
 const camera=frame.querySelector<HTMLElement>('[data-mw-camera]')!,w=camera.clientWidth,h=camera.clientHeight,compact=w<700;
 if(!w||!h)return;
 let order=2;
 const nodes=[...frame.querySelectorAll<HTMLAnchorElement>('[data-mw-actor]')],drawn=new Set<HTMLElement>();
 const photo=(id:number)=>nodes.find(n=>Number(n.dataset.mwActor)===id)!;
 const viewWindow=(id:number):SourceWindow=>(photo(id).dataset[compact?'mwMobileWindow':'mwWindow']??'0,0,1,1').split(',').map(Number) as SourceWindow;
 const fit=(id:number,cx=.5,factor=1,cy=.5,win=viewWindow(id)):Box=>{
  const im=photo(id).querySelector('img')!,a=Number(im.getAttribute('width'))/Number(im.getAttribute('height'));
  const sh=Math.min(h*.94/win[3],w*(compact?.94:.90)/(a*win[2]))*factor;
  return{x:w*cx-sh*a*(win[0]+win[2]/2),y:h*cy-sh*(win[1]+win[3]/2),w:sh*a,h:sh};
 };
 const draw=(id:number,b:Box,win=viewWindow(id),interactive=true,gate:SourceWindow=whole)=>{
  const node=photo(id);drawn.add(node);node.style.zIndex=String(++order);
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
 const q=ease(p%1),world=frame.closest<HTMLElement>('[data-mw-film]')!.dataset.mwFilm;
 frame.style.background='#fff';frame.style.color='var(--ink)';
 const wings=[...frame.querySelectorAll<HTMLElement>('[data-mw-wing]')];for(const n of wings)n.style.display='none';
 if(world==='m-streetwear'){
  const cream=fit(6311316),city=fit(8505243,compact?.44:.26),roomWindow:SourceWindow=viewWindow(30599804),room=fit(30599804,.5,1,.5,roomWindow),hero=fit(17303564),puffer=fit(26936522);
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
   const t=ease(p-3);
   // A second, genuinely different volume resolves the reveal: angular jacket → quilted outerwear.
   if(t<1)draw(17303564,mix(hero,{...hero,x:hero.x-w*.32},t),undefined,t<.08,[0,0,1-t,1]);
   draw(26936522,puffer,undefined,t>.94,[1-t,0,t,1]);
   frame.style.background=`rgb(${Math.round(lerp(255,204,t))},${Math.round(lerp(255,201,t))},${Math.round(lerp(255,198,t))})`;
  }
 }else if(world==='m-activewear'){
  const polo=fit(7648388),black=fit(30954220,compact?.5:.23,.88),ground=fit(7116192,compact?.5:.72,compact?.94:.56,.62),red=fit(11000101),jump=fit(33443605);
  if(p<=1){
   // An intentional editorial cut changes the body's axis; never close both images to a blank seam.
   if(p<.43)draw(7648388,polo);else{draw(30954220,black);if(!compact)draw(7116192,ground);}
  }else if(p<=2){
   const t=ease(p-1);if(t<1){draw(30954220,black,whole,false,[0,0,1-t,1]);if(!compact)draw(7116192,ground,undefined,false,[0,0,1-t,1]);}draw(11000101,red,whole,t>.98,[1-t,0,t,1]);
  }else if(p<=3){
   const t=ease(p-2);draw(11000101,mix(red,fit(11000101,compact?.5:.27,compact?1:.91),t),whole,!compact||t<.1);
   const settled=fit(7116192,compact?.5:.76,compact?1:.56,.58);
   if(compact){if(t>.3)draw(7116192,settled,undefined,t>.98,[0,1-ease((t-.3)/.7),1,ease((t-.3)/.7)]);}else draw(7116192,settled,undefined,t>.98,[0,1-t,1,t]);
  }else{
   const t=ease(p-3);if(t<1){if(!compact)draw(11000101,fit(11000101,.27,.91),whole,false,[0,t,1,1-t]);draw(7116192,fit(7116192,compact?.5:.76,compact?1:.56,.58),undefined,false,[0,t,1,1-t]);}
   draw(33443605,jump,whole,t>.98,[0,0,1,t]);
  }
 }else if(world==='m-rtw'){
  const knit=fit(16711124),plinth=fit(29727778),green=fit(8508752),shirt=fit(7764014),final=fit(6844165);
  if(p<=1){const t=ease(p);draw(16711124,knit,whole,t<.05,[0,0,1-t,1]);draw(29727778,plinth,whole,t>.95,[1-t,0,t,1]);}
  else if(p<=2){const t=ease(p-1);draw(29727778,plinth,whole,t<.05,[0,0,1,1-t]);draw(8508752,green,undefined,t>.95,[0,1-t,1,t]);}
  else if(p<=3){const t=ease(p-2);if(compact){draw(8508752,green,undefined,t<.05,[0,0,1-t,1]);draw(7764014,shirt,whole,t>.95,[1-t,0,t,1]);}else{draw(8508752,mix(green,fit(8508752,.30,.91),t));draw(7764014,fit(7764014,.74,.91),whole,t>.95,[1-t*.5,0,t*.5,1]);}}
  else{const t=ease(p-3),opening:[number,number,number,number]=[.5-t*.5,0,t,1];if(t<1){if(!compact)draw(8508752,fit(8508752,.30,.91),undefined,false);draw(7764014,compact?shirt:fit(7764014,.74,.91),whole,false);}draw(6844165,final,whole,t>.98,opening);frame.style.background=t>.98?'#17100f':'#fff';frame.style.color=t>.98?'var(--paper)':'var(--ink)';}
 }else{
  const daylight=fit(6097464),pale=fit(29242239),steel=fit(16862147),ivory=fit(14348500),coat=fit(6207215);
  if(p<=1){const t=ease(p);if(compact){draw(6097464,daylight,whole,t<.05,[0,0,1-t,1]);draw(29242239,pale,whole,t>.95,[1-t,0,t,1]);}else{draw(6097464,mix(daylight,fit(6097464,.27,.92),t));draw(29242239,fit(29242239,.74,.92),whole,t>.95,[1-t*.5,0,t*.5,1]);}}
  else if(p<=2){const t=ease(p-1);if(!compact&&t<1)draw(6097464,fit(6097464,.27,.92),whole,false,[0,0,(1-t)*.5,1]);if(t<1)draw(29242239,compact?pale:fit(29242239,.74,.92),whole,false,[t,0,1-t,1]);draw(16862147,steel,whole,t>.95,[0,0,t,1]);frame.style.background=`rgb(${Math.round(lerp(255,22,t))},${Math.round(lerp(255,23,t))},${Math.round(lerp(255,24,t))})`;frame.style.color=t>.5?'var(--paper)':'var(--ink)';}
  else if(p<=3){const t=ease(p-2);frame.style.background='#161718';frame.style.color='var(--paper)';draw(16862147,steel,whole,t<.05,[0,0,1-t,1]);draw(14348500,ivory,whole,t>.95,[1-t,0,t,1]);}
  else{const t=ease(p-3);frame.style.background='#161718';frame.style.color='var(--paper)';if(t<1)draw(14348500,ivory,whole,t<.05,[0,0,1,1-t]);draw(6207215,coat,whole,t>.95,[0,1-t,1,t]);}
 }
 for(const node of nodes)if(!drawn.has(node)){node.inert=true;node.tabIndex=-1;node.style.visibility='hidden';node.setAttribute('aria-hidden','true');}
 frame.querySelector<HTMLElement>('.mw-film-title')!.style.opacity=String(1-clamp(p*2));
 frame.dataset.composition=String(Math.round(p));
}
