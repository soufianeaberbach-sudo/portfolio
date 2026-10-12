import { media } from './media';
import { gsap } from 'gsap';
import { paintRtwPhoto } from '../../scripts/rtw-photo';
import { rtwMatchCut, cancelRtwMatchCut } from '../../scripts/rtw-match-cut';

type Key = 'A'|'B'|'C'|'D'|'E';
const root=document.querySelector<HTMLElement>('[data-v]');
if(root) {
 const get=<T extends HTMLElement=HTMLElement>(selector:string)=>root.querySelector<T>(selector)!;
 const reader=get('[data-reader]'),exhibition=get('[data-exhibition]'),stage=get('[data-stage]');
 const photo=get('[data-photo]'),plate=get('[data-photo] [data-rtw-photo]'),source=get('[data-enter] [data-rtw-photo]');
 const line=get('[data-line]'),sheet=get('[data-sheet]'),volume=get('[data-volume]'),copy=get('[data-copy]');
 // Entry clones reuse decoded source pixels. Synchronous decoding prevents
 // the cloned image's first paint from lagging after the original is hidden.
 source.querySelector('img')!.decoding='sync';plate.querySelector('img')!.decoding='sync';
 for(const img of [source.querySelector('img')!,plate.querySelector('img')!]){
  const freeze=()=>{const loaded=img.currentSrc;if(loaded){img.src=loaded;img.removeAttribute('srcset');}};
  if(img.complete&&img.currentSrc)freeze();else img.addEventListener('load',freeze,{once:true});
 }
 const reduced=matchMedia('(prefers-reduced-motion:reduce)'),compact=()=>innerWidth<768||(innerWidth<1024&&innerHeight>innerWidth);
 const flatMedia=get('[data-flat-media]');
 const dialog=get<HTMLDialogElement>('dialog');
 const match=(entering:boolean,instant:boolean,finished:()=>void)=>{
  rtwMatchCut(reader,source,entering,instant,finished);if(instant)return;
  const clone=document.querySelector<HTMLElement>('.rtw-match');if(!clone)return;
  const animations=[...clone.getAnimations(),...reader.getAnimations()];
  for(const a of animations){a.pause();a.currentTime=0;}
  const from=entering?source:plate;from.style.visibility='visible';
  // Keep the existing figure until the clone has had a real paint. Then
  // resume the unchanged measured WAAPI motion; no blank first frame.
  const start=()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!clone.isConnected)return;from.style.visibility='hidden';for(const a of animations)a.play();}));
  // Decode the new element itself; decoding its source is not a paint guarantee.
  clone.querySelector('img')!.decode().then(start,()=>{cancelRtwMatchCut();finished();});
 };
 // Availability tests are lab-only. These never populate the public Project.
 // Real reader integration must derive origin/build from projectSubject; refs
 // have no such stages. E is a return only when there was evidence to explore.
 const availability=new URLSearchParams(location.search).get('evidence')??'full';
 const keys:Key[]=availability==='none'?['A']:availability==='design'?['A','B','E']:availability==='construction'?['A','C','E']:['A','B','C','D','E'];
 for(const b of root.querySelectorAll<HTMLElement>('[data-go]'))b.hidden=!keys.includes(b.dataset.go as Key);
 let current:Key='A',open=false,tl:gsap.core.Timeline|null=null,turnTween:gsap.core.Tween|null=null,view=0,alternate=false,entryScroll=0;
 const strings:Record<Key,[string,string,string]>={
  A:['A / THE COMPLETE LOOK','Champagne<br> satin slip.','Cowl neckline. Low open back.'],
  B:['B / FASHION ILLUSTRATION','The first<br>gesture.','Sybil Connolly’s original drawing.<br>Many Pannelled Dress / Hunt Museum.'],
  C:['C / PATTERN ENGINEERING','Shape becomes<br>construction.','Dress ST656-1 / MoMu.<br>A documented pattern and its technical drawing.'],
  D:['D / DIGITAL GARMENT','Digital cloth.','CGElves / Marvelous Designer.<br>An independent digital robe, not CLO or fit evidence.'],
  E:['E / THE COMPLETE RESULT','','The original reference. Front and back remain available.']
 };
 const elements={photo,line,sheet,flatMedia,volume};
 function dimensions(){
  const h=stage.clientHeight,w=stage.clientWidth,c=compact();
  const fullHeight=innerHeight-(c?183:176);
  photo.style.setProperty('--photo-h',`${fullHeight*.97}px`);
  const fitMedia=(el:HTMLElement,m:{width:number,height:number},maxW:number,maxH:number)=>{
   const scale=Math.min(maxW/m.width,maxH/m.height);
   Object.assign(el.style,{width:`${m.width*scale}px`,height:`${m.height*scale}px`});
  };
  fitMedia(line,media.sketch,w*(c?.88:.52),h*(c?.94:.96));
  fitMedia(sheet,media.pattern,w*(c?.9:.47),h*.94);
  fitMedia(flatMedia,media.flat,w*(c?.9:.28),h*(c?.88:.59));
  fitMedia(volume,media.digital,w*(c?.96:.54),h*(c?.95:.98));
  paintRtwPhoto(plate,view);paintRtwPhoto(source,Number(source.style.getPropertyValue('--view'))||0);
 }
 function positions(k:Key){
  const w=stage.clientWidth,h=stage.clientHeight,c=compact();
  const p=(el:HTMLElement,cx:number,cy:number,s=1,opacity=1)=>{
   if(el===photo)s*=h/(innerHeight-(c?183:176));
   return {x:cx*w-el.offsetWidth*s/2,y:cy*h,scale:s,opacity,force3D:true};
  };
  const centered=(el:HTMLElement,cx:number,opacity=1)=>p(el,cx,(h-el.offsetHeight)/2/h,1,opacity);
  let poses={photo:p(photo,.58,0,1,0),line:centered(line,.61,0),sheet:centered(sheet,.72,0),flatMedia:centered(flatMedia,.30,0),volume:centered(volume,.61,0)};
  if(k==='A')poses.photo=p(photo,c?.52:.60,c?.045:0,c?.92:1);
  if(k==='B'){
   poses.line=centered(line,c?.50:.61,alternate?0:1);
   if(alternate)poses.photo=p(photo,c?.52:.61,c?.045:0,c?.92:1);
  }
  if(k==='C'){
   poses.sheet=centered(sheet,c?.50:.71,alternate?0:1);
   poses.flatMedia=centered(flatMedia,c?.50:alternate?.61:.29,c&&!alternate?0:1);
   if(!alternate&&!c)poses.flatMedia.y=h*.36;
   if(alternate&&!c){const target=poses.flatMedia;target.scale=1.45;target.x=w*.61-flatMedia.offsetWidth*1.45/2;target.y=(h-flatMedia.offsetHeight*1.45)/2;}
  }
  if(k==='D'){
   poses.volume=centered(volume,c?.50:.62,alternate?0:1);
   if(alternate)poses.photo=p(photo,c?.52:.62,c?.045:0,c?.92:1);
  }
  if(k==='E')poses.photo=p(photo,c?.52:.53,c?.02:0,c?.94:1);
  return poses;
 }
 function activeKind():'photo'|'sketch'|'pattern'|'flat'|'digital'{
  return current==='A'||current==='E'?'photo':current==='B'?(alternate?'photo':'sketch'):current==='C'?(alternate?'flat':'pattern'):(alternate?'photo':'digital');
 }
 function showUI(k:Key){
  stage.dataset.stage=k;root!.dataset.representation=activeKind();
  const [marker,title,note]=strings[k];get('[data-kicker]').textContent=marker;get('[data-title]').innerHTML=title;get('[data-note]').innerHTML=note;
  const kind=activeKind(),m=kind==='photo'?null:media[kind];
  get('[data-media-caption]').textContent=m?m.credit+(kind==='pattern'||kind==='flat'?' / MATCHED ST656-1 SOURCES':' / INDEPENDENT EXAMPLE'):'';
  copy.style.top=compact()?'0':k==='C'?'0':'26%';copy.style.opacity='1';
  get('[data-views]').hidden=k!=='A'&&k!=='E';get('[data-doc-tools]').hidden=k==='A'||k==='E';
  const toggle=get<HTMLButtonElement>('[data-flat]');toggle.hidden=k==='A'||k==='E';
  toggle.textContent=k==='C'?(alternate?'PATTERN':'TECHNICAL FLAT'):alternate?(k==='B'?'DRAWING':'3D RENDER'):'REFERENCE PHOTO';
  toggle.setAttribute('aria-pressed',String(alternate));
  get('[data-position]').textContent=k==='A'||k==='E'?'REFERENCE 01':'INDEPENDENT EXAMPLES';
  const index=keys.indexOf(k),next=get<HTMLButtonElement>('[data-next]'),hadFocus=document.activeElement===next;
  next.hidden=index===keys.length-1;next.textContent=index<keys.length-1?`${({B:'SKETCH',C:'PATTERN',D:'3D',E:'RESULT'} as Record<string,string>)[keys[index+1]]} →`:'';
  if(hadFocus&&next.hidden)get<HTMLButtonElement>('[data-view="0"]').focus({preventScroll:true});
  for(const b of root!.querySelectorAll('[data-go]')){if((b as HTMLElement).dataset.go===k)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');}
  for(const b of root!.querySelectorAll<HTMLElement>('[data-view]'))b.setAttribute('aria-pressed',String(Number(b.dataset.view)===view));
  get('[data-provenance]').textContent=k==='A'||k==='E'?'Reference photograph. No verified development history.':'External illustrative example. Not this garment’s history or Aberbach’s work.';
 }
 function go(k:Key,instant=false){
  if(!keys.includes(k)||!open)return;
  tl?.kill();turnTween?.kill();gsap.killTweensOf(Object.values(elements));cancelRtwMatchCut();const oldTop=stage.getBoundingClientRect().top;
  current=k;alternate=false;root!.dataset.settled='';showUI(k);dimensions();
  const delta=oldTop-stage.getBoundingClientRect().top;
  for(const el of Object.values(elements))gsap.set(el,{y:Number(gsap.getProperty(el,'y'))+delta});
  const poses=positions(k),immediate=instant||reduced.matches;
  if(immediate){for(const [name,el]of Object.entries(elements))gsap.set(el,poses[name as keyof typeof poses]);if(k==='E'){view=1;plate.style.setProperty('--view','1');paintRtwPhoto(plate,view);showUI(k);}root!.dataset.settled=k;return;}
  tl=gsap.timeline({onComplete:()=>{root!.dataset.settled=k;}});
  // A material handoff, not a false morphological relationship. The prior
  // medium leaves the viewing axis before the independent source takes it.
  for(const [name,el]of Object.entries(elements)){
   const target=poses[name as keyof typeof poses],visible=Number(gsap.getProperty(el,'opacity'))>.01;
   if(target.opacity===0&&visible)tl.to(el,{opacity:0,x:Number(gsap.getProperty(el,'x'))-28,duration:.22,ease:'power2.out'},0);
   else if(target.opacity>0){
    if(!visible)gsap.set(el,{...target,x:target.x+28,opacity:0});
    tl.to(el,{...target,duration:.48,ease:'power2.inOut'},visible?0:.24);
   }else gsap.set(el,target);
  }
  if(k==='E'){const state={view};view=1;plate.style.setProperty('--view','1');tl.to(state,{view:1,duration:.55,ease:'power2.inOut',onUpdate:()=>paintRtwPhoto(plate,state.view)},.38).call(()=>{view=1;plate.style.setProperty('--view','1');showUI('E');});}
  // The only registered travel is within the genuine front/back source.
 }
 function enter(key:Key='A',instant=false){
  entryScroll=scrollY;exhibition.inert=true;reader.hidden=false;open=true;current='A';view=Number(source.style.getPropertyValue('--view'))||0;
  dimensions();go('A',true);showUI('A');
  const opening=get('.v-opening');gsap.killTweensOf([opening,copy]);
  if(!reduced.matches&&!instant){gsap.to(opening,{opacity:0,y:-12,duration:.18});gsap.set(copy,{opacity:0});gsap.to(copy,{opacity:1,delay:.22,duration:.22});}
  match(true,reduced.matches||instant,()=>{exhibition.hidden=true;get<HTMLButtonElement>('[data-view="0"]').focus({preventScroll:true});if(key!=='A')go(key,true);});
 }
 function leave(instant=false){
  tl?.kill();turnTween?.kill();gsap.killTweensOf(Object.values(elements));dialog.close();exhibition.hidden=false;cancelRtwMatchCut();
  const opening=get('.v-opening');gsap.killTweensOf([opening,copy]);
  if(reduced.matches||instant)gsap.set(opening,{opacity:1,y:0});else{gsap.to(copy,{opacity:0,duration:.12});gsap.to(opening,{opacity:1,y:0,delay:.20,duration:.25});}
  const finished=()=>{reader.hidden=true;exhibition.inert=false;open=false;scrollTo(0,entryScroll);get<HTMLButtonElement>('[data-enter]').focus({preventScroll:true});};
  const rect=photo.getBoundingClientRect();
  if(Number(gsap.getProperty(photo,'opacity'))>.1&&rect.right>0&&rect.left<innerWidth){match(false,reduced.matches||instant,finished);}
  else{
   // No invented shared element when the photo is absent from an evidence
   // frame. Return directly, retaining view, position and keyboard focus.
   source.style.setProperty('--view',String(view));paintRtwPhoto(source,view);
   if(reduced.matches||instant)finished();else{const retreat=reader.animate([{opacity:1},{opacity:0}],{duration:220,easing:'ease-out'});retreat.onfinish=()=>{finished();retreat.cancel();};}
  }
 }
 get('[data-enter]').addEventListener('click',e=>enter('A',(e as MouseEvent).detail===0));
 get('[data-return]').addEventListener('click',e=>leave((e as MouseEvent).detail===0));
 for(const b of root.querySelectorAll<HTMLButtonElement>('[data-go]'))b.addEventListener('click',e=>go(b.dataset.go as Key,(e as MouseEvent).detail===0));
 get('[data-next]').addEventListener('click',e=>go(keys[keys.indexOf(current)+1],(e as MouseEvent).detail===0));
 for(const b of root.querySelectorAll<HTMLButtonElement>('[data-view]'))b.addEventListener('click',e=>{
  tl?.kill();turnTween?.kill();const target=Number(b.dataset.view),state={view};
  if(reduced.matches||(e as MouseEvent).detail===0){view=target;paintRtwPhoto(plate,view);}else turnTween=gsap.to(state,{view:target,duration:.55,ease:'power2.inOut',onUpdate:()=>paintRtwPhoto(plate,state.view),onComplete:()=>{view=target;showUI(current);}});
  view=target;plate.style.setProperty('--view',String(view));showUI(current);
 });
 get('[data-flat]').addEventListener('click',e=>{
  tl?.kill();const immediate=reduced.matches||(e as MouseEvent).detail===0;
  alternate=!alternate;showUI(current);const poses=positions(current);
  // Unrelated drawings/renders never overlap the photographic figure.
  for(const [name,el]of Object.entries(elements)){
   const target=poses[name as keyof typeof poses];gsap.killTweensOf(el);
   if(immediate)gsap.set(el,target);
   else if(target.opacity===0)gsap.to(el,{opacity:0,duration:.14});
   else {gsap.set(el,{...target,opacity:0});gsap.to(el,{opacity:1,duration:.24,delay:.15});}
  }
 });
 let wheelGate=0;
 root.addEventListener('wheel',e=>{if(!open||dialog.open||Math.abs(e.deltaY)<18)return;e.preventDefault();if(performance.now()-wheelGate<850)return;wheelGate=performance.now();const i=keys.indexOf(current)+Math.sign(e.deltaY);if(i>=0&&i<keys.length)go(keys[i]);},{passive:false});
 document.addEventListener('keydown',e=>{if(dialog.open||!open||e.target instanceof HTMLInputElement)return;if(e.key==='Escape'){leave(true);return;}if(['ArrowRight','ArrowLeft','PageDown','PageUp'].includes(e.key)){e.preventDefault();const d=e.key==='ArrowRight'||e.key==='PageDown'?1:-1;const i=keys.indexOf(current)+d;if(i>=0&&i<keys.length)go(keys[i],true);}});
 const iw=get('.v-inspector-window'),im=get('[data-inspector-media]');
 let z=1,px=0,py=0,mw=0,mh=0,fitScale=1,drag=false,lastX=0,lastY=0,inspectionToken=0;
 function clampPan(){
  const bound=(pos:number,size:number,windowSize:number)=>size<=windowSize?(windowSize-size)/2:Math.min(16,Math.max(windowSize-size-16,pos));
  px=bound(px,mw*z,iw.clientWidth);py=bound(py,mh*z,iw.clientHeight);
 }
 function renderInspect(){
  clampPan();im.style.transform=`translate3d(${px}px,${py}px,0) scale(${z})`;
  const whole=mw*z<=iw.clientWidth&&mh*z<=iw.clientHeight;
  const col=Math.round(Math.max(0,-px)/Math.max(1,mw*z-iw.clientWidth)*100),row=Math.round(Math.max(0,-py)/Math.max(1,mh*z-iw.clientHeight)*100);
  get('[data-inspector-position]').textContent=whole?`WHOLE SOURCE / ${Math.round(z*100)}% · ${mw} × ${mh}`:`${Math.round(z*100)}% / horizontal ${col}% · vertical ${row}% / FIT restores overview`;
 }
 function fit(){fitScale=Math.min(iw.clientWidth/mw,iw.clientHeight/mh)*.95;z=fitScale;px=(iw.clientWidth-mw*z)/2;py=(iw.clientHeight-mh*z)/2;renderInspect();}
 async function inspect(kind:'photo'|'sketch'|'pattern'|'flat'|'digital'){
  tl?.kill();dialog.showModal();im.replaceChildren();dialog.dataset.source=kind;dialog.dataset.ready='false';const token=++inspectionToken;im.style.width='';im.style.height='';get('[data-inspector-position]').textContent='Loading original source…';
  const title=kind==='photo'?'Original reference photograph':media[kind].title;
  get('#v-inspector-title').textContent=title;
  get('[data-inspector-truth]').replaceChildren();
  if(kind==='photo')get('[data-inspector-truth]').textContent='REFERENCE PHOTOGRAPH / UNCHANGED SOURCE';
  else {
   const m=media[kind],info=get('[data-inspector-truth]');
   info.append(`${m.credit} · Independent example. ${kind==='pattern'||kind==='flat'?'UTF-8 encoding only.':kind==='sketch'?'Lossless TIFF conversion.':'Unmodified JPEG.'} `);
   for(const [label,url]of [['Source',m.source],['License',m.license]]){const a=document.createElement('a');a.textContent=label;a.href=url;a.target='_blank';a.rel='noopener';info.append(a,' ');}
  }
  if(kind==='photo'){
   const clone=plate.cloneNode(true) as HTMLElement;clone.removeAttribute('data-rtw-photo');im.append(clone);clone.style.setProperty('--photo-h','1867px');paintRtwPhoto(clone,view,1867);mw=clone.offsetWidth;mh=1867;
  }else {
   const original=(kind==='sketch'?line:kind==='pattern'?sheet:kind==='flat'?flatMedia:volume).querySelector('img')!;
   const image=original.cloneNode(true) as HTMLImageElement;im.append(image);await image.decode();if(token!==inspectionToken||!dialog.open)return;mw=media[kind].width;mh=media[kind].height;
  }
  Object.assign(im.style,{width:`${mw}px`,height:`${mh}px`});fit();dialog.dataset.ready='true';get<HTMLButtonElement>('[data-close]').focus();
 }
 get('[data-look]').addEventListener('click',()=>inspect('photo'));
 get('[data-inspect]').addEventListener('click',()=>inspect(activeKind()));
 get('[data-close]').addEventListener('click',()=>dialog.close());get('[data-fit]').addEventListener('click',fit);get('[data-reset]').addEventListener('click',()=>{pointers.clear();drag=false;fit();});
 const zoom=(delta:number)=>{
  const old=z;z=Math.min(Math.max(6,fitScale*8),Math.max(fitScale,z*Math.pow(1.6,delta)));
  px=iw.clientWidth/2-(iw.clientWidth/2-px)*z/old;py=iw.clientHeight/2-(iw.clientHeight/2-py)*z/old;renderInspect();
 };
 for(const b of root.querySelectorAll<HTMLButtonElement>('[data-zoom]'))b.addEventListener('click',()=>zoom(Number(b.dataset.zoom)));
 const pointers=new Map<number,{x:number,y:number}>();let pinchDistance=0;
 iw.addEventListener('pointerdown',e=>{pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});iw.setPointerCapture(e.pointerId);drag=true;lastX=e.clientX;lastY=e.clientY;pinchDistance=0;});
 iw.addEventListener('pointermove',e=>{
  if(!drag)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pointers.size===2){const [a,b]=[...pointers.values()],distance=Math.hypot(a.x-b.x,a.y-b.y);
   if(pinchDistance){const old=z;z=Math.min(Math.max(6,fitScale*8),Math.max(fitScale,z*distance/pinchDistance));const box=iw.getBoundingClientRect(),cx=(a.x+b.x)/2-box.x,cy=(a.y+b.y)/2-box.y;px=cx-(cx-px)*z/old;py=cy-(cy-py)*z/old;}pinchDistance=distance;
  }else{px+=e.clientX-lastX;py+=e.clientY-lastY;}
  lastX=e.clientX;lastY=e.clientY;renderInspect();
 });
 const release=(e:PointerEvent)=>{pointers.delete(e.pointerId);drag=pointers.size>0;pinchDistance=0;const p=[...pointers.values()][0];if(p){lastX=p.x;lastY=p.y;}};
 iw.addEventListener('pointerup',release);iw.addEventListener('pointercancel',release);
 dialog.addEventListener('close',()=>{inspectionToken++;pointers.clear();drag=false;});
 iw.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY<0?1:-1);},{passive:false});
 iw.addEventListener('keydown',e=>{
  if(e.key==='+'||e.key==='=')zoom(1);else if(e.key==='-')zoom(-1);else if(e.key==='0'||e.key==='Home')fit();
  else if(e.key.startsWith('Arrow')){px+=e.key==='ArrowRight'?-40:e.key==='ArrowLeft'?40:0;py+=e.key==='ArrowDown'?-40:e.key==='ArrowUp'?40:0;renderInspect();}else return;e.preventDefault();
 });
 function settleFrame(){tl?.kill();turnTween?.kill();gsap.killTweensOf(Object.values(elements));dimensions();if(open){showUI(current);const poses=positions(current);for(const [name,el]of Object.entries(elements))gsap.set(el,poses[name as keyof typeof poses]);root!.dataset.settled=current;}}
 window.addEventListener('resize',()=>{settleFrame();if(dialog.open)fit();});reduced.addEventListener('change',settleFrame);
 dimensions();let ready=false;const deep=location.hash.slice(1) as Key;
 get<HTMLButtonElement>('[data-enter]').disabled=true;
 Promise.all([...root.querySelectorAll('img')].map(i=>i.decode())).then(()=>{
  ready=true;get<HTMLButtonElement>('[data-enter]').disabled=false;dimensions();if(keys.includes(deep))enter(deep,true);
 }).catch(()=>{get('[data-provenance]').textContent='Source could not load. Please reload; no substitute evidence is generated.';});
 window.addEventListener('hashchange',()=>{const target=location.hash.slice(1) as Key;if(keys.includes(target)){if(open)go(target,true);else enter(target,true);}});
 // Review instrumentation; never imported by public Portfolio.
 (window as unknown as {rtwV:unknown}).rtwV={go:(k:Key)=>go(k,true),get stage(){return current;},get available(){return keys;},get ready(){return ready;}};
}
