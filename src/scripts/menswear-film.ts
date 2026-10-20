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
 const world=frame.closest<HTMLElement>('[data-mw-film]')!.dataset.mwFilm;
 frame.style.background='#fff';frame.style.color='var(--ink)';
 const wings=[...frame.querySelectorAll<HTMLElement>('[data-mw-wing]')];for(const n of wings)n.style.display='none';
 if(world==='m-streetwear'){
  const cream=fit(6311316),city=fit(8505243,compact?.44:.26),roomWindow:SourceWindow=viewWindow(30599804),room=fit(30599804,.5,1,.5,roomWindow),hero=fit(17303564),puffer=fit(26936522);
  if(!photo(30599804).dataset.mwSeam){
   // Unknown replacement photography gets complete primary shots, never the old wall crop.
   const id=p<.46?6311316:p<1.46?8505243:p<2.46?30599804:p<3.46?17303564:26936522;draw(id,fit(id));
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
   const t=ease(p-3);
   if(compact){if(p<3.46)draw(17303564,hero);else{draw(26936522,puffer);frame.style.background=original(26936522)?'#ccc9c6':'#fff';}}
   else {
   // A second, genuinely different volume resolves the reveal: angular jacket → quilted outerwear.
   if(t<1)draw(17303564,mix(hero,{...hero,x:hero.x-w*.32},t),undefined,t<.08,[0,0,1-t,1]);
   draw(26936522,puffer,undefined,t>.94,[1-t,0,t,1]);
   frame.style.background=original(26936522)?`rgb(${Math.round(lerp(255,204,t))},${Math.round(lerp(255,201,t))},${Math.round(lerp(255,198,t))})`:'#fff';
   }
  }
  }
 }else if(world==='m-activewear'){
  const polo=fit(7648388),black=fit(30954220),ground=fit(7116192,.5,.88,.55),red=fit(11000101),white=fit(6974949),jump=fit(33443605);
  const compression=()=>{if(compact)draw(30954220,black);else draw(7116192,ground);};
  if(p<=1){if(p<.43)draw(7648388,polo);else compression();}
  else if(p<=2){if(p<1.46)compression();else draw(11000101,red);}
  else if(p<=3){
   const t=ease(p-2);
   if(compact){if(p<2.46)draw(11000101,red);else draw(6974949,white);}
   else{draw(11000101,mix(red,fit(11000101,.27,.91),t));draw(6974949,fit(6974949,.74,.91),whole,t>.95,[1-t*.5,0,t*.5,1]);}
  }else{
   if(p<3.46){if(compact)draw(6974949,white);else{draw(11000101,fit(11000101,.27,.91));draw(6974949,fit(6974949,.74,.91));}}
   else draw(33443605,jump);
  }
 }else if(world==='m-rtw'){
  const knit=fit(16711124),plinth=fit(29727778),chair=fit(13128635),green=fit(8508752),final=fit(6844165);
  if(p<=1){if(p<.46)draw(16711124,knit);else draw(29727778,plinth);}
  else if(p<=2){/* The real support becomes a carried structure; no invented prop or assembly. */if(p<1.46)draw(29727778,plinth);else draw(13128635,chair);}
  else if(p<=3){const t=ease(p-2);if(compact){if(p<2.46)draw(13128635,chair);else draw(8508752,green);}else{draw(13128635,mix(chair,fit(13128635,.28,.91),t));draw(8508752,fit(8508752,.74,.91),undefined,t>.95,[1-t*.5,0,t*.5,1]);}}
  else if(compact){if(p<3.46)draw(8508752,green);else{draw(6844165,final);backdrop(6844165,'#17100f');}}
  else{const t=ease(p-3),opening:SourceWindow=[.5-t*.5,0,t,1];if(t<1){draw(13128635,fit(13128635,.28,.91),whole,false);draw(8508752,fit(8508752,.74,.91),undefined,false);}draw(6844165,final,whole,t>.98,opening);if(t>.98)backdrop(6844165,'#17100f');}
 }else{
  const daylight=fit(6097464),pale=fit(29242239),steel=fit(16862147),ivory=fit(14348500),coat=fit(6207215);
  if(p<=1){const t=ease(p);if(compact){if(p<.46)draw(6097464,daylight);else draw(29242239,pale);}else{draw(6097464,mix(daylight,fit(6097464,.27,.92),t));draw(29242239,fit(29242239,.74,.92),whole,t>.95,[1-t*.5,0,t*.5,1]);}}
  else if(p<=2){if(p<1.46){if(!compact)draw(6097464,fit(6097464,.27,.92));draw(29242239,compact?pale:fit(29242239,.74,.92));}else{draw(16862147,steel);backdrop(16862147,'#161718');}}
  else if(p<=3){if(p<2.46){draw(16862147,steel);backdrop(16862147,'#161718');}else{draw(14348500,ivory);backdrop(14348500,'#161718');}}
  else{if(p<3.46){draw(14348500,ivory);backdrop(14348500,'#161718');}else{draw(6207215,coat);backdrop(6207215,'#161718');}}
 }
 // A reader opened before a breakpoint change keeps its actual photographic
 // occurrence until the visitor advances, even when that role has a portrait alternative.
 if(heldActor&&!drawn.has(photo(heldActor))){drawn.clear();for(const wing of wings)wing.style.display='none';draw(heldActor,fit(heldActor));}
 for(const node of nodes)if(!drawn.has(node)){node.inert=true;node.tabIndex=-1;node.style.visibility='hidden';node.setAttribute('aria-hidden','true');}
 frame.querySelector<HTMLElement>('.mw-film-title')!.style.opacity=String(1-clamp(p*2));
 const failed=[...drawn].some(node=>{const im=node.querySelector('img')!;return node.style.visibility==='visible'&&im.complete&&!im.naturalWidth;});
 frame.querySelector<HTMLElement>('[data-mw-media-status]')!.hidden=!failed;
 frame.dataset.composition=String(Math.round(p));
}
