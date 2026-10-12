import { gsap } from 'gsap';
import { paintRtwPhoto } from '../../scripts/rtw-photo';
import { rtwMatchCut, cancelRtwMatchCut } from '../../scripts/rtw-match-cut';

type Key = 'A'|'B'|'C'|'D'|'E';
const root=document.querySelector<HTMLElement>('[data-iv]');
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
 const input=get<HTMLInputElement>('#iv-comparison'),dialog=get<HTMLDialogElement>('dialog');
 const match=(entering:boolean,instant:boolean,finished:()=>void)=>{
  rtwMatchCut(reader,source,entering,instant,finished);if(instant)return;
  const clone=document.querySelector<HTMLElement>('.rtw-match');if(!clone)return;
  const animations=[...clone.getAnimations(),...reader.getAnimations()];
  for(const a of animations){a.pause();a.currentTime=0;}
  const from=entering?source:plate;from.style.visibility='visible';
  // Keep the existing figure until the clone has had a real paint. Then
  // resume the unchanged measured WAAPI motion; no blank first frame.
  requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!clone.isConnected)return;from.style.visibility='hidden';for(const a of animations)a.play();}));
 };
 // Availability tests are lab-only. These never populate the public Project.
 // Real reader integration must derive origin/build from projectSubject; refs
 // have no such stages. E is a return only when there was evidence to explore.
 const availability=new URLSearchParams(location.search).get('evidence')??'full';
 const keys:Key[]=availability==='none'?['A']:availability==='design'?['A','B','E']:availability==='construction'?['A','C','E']:['A','B','C','D','E'];
 for(const b of root.querySelectorAll<HTMLElement>('[data-go]'))b.hidden=!keys.includes(b.dataset.go as Key);
 let current:Key='A',open=false,tl:gsap.core.Timeline|null=null,turnTween:gsap.core.Tween|null=null,view=0,compare=0,alternate=false,entryScroll=0;
 const strings:Record<Key,[string,string,string,string]>={
  A:['A / THE COMPLETE LOOK','Champagne<br> satin slip.','Cowl neckline.<br>Low open back.',''],
  B:['B / DESIGN — UI DEMO','Read the outline.','Photo-based contour.<br>Not an original design sketch.','UI CONTOUR / APPROXIMATE PHOTO PROPORTIONS · NOT A DESIGN SKETCH'],
  C:['C / CONSTRUCTION — UI DEMO','Construction.','Curves at inspection scale.<br>No garment construction data.','VECTOR INSPECTION SPECIMEN / NOT A GARMENT PATTERN OR TECHNICAL FLAT'],
  D:['D / VOLUME — UI DEMO','Compare<br>representations.','Ruled envelope, not CLO evidence.<br>No simulation or fit claim.','UI VOLUME ENVELOPE / NOT A CLO RENDER · DRAG THE COMPARISON'],
  E:['E / THE COMPLETE RESULT','','Cowl front. Open back.<br>Reference photography.','']
 };
 function dimensions(){
  const h=stage.clientHeight,w=stage.clientWidth;
  const fullHeight=innerHeight-(compact()?183:176);
  photo.style.setProperty('--photo-h',`${fullHeight*.97}px`);
  Object.assign(line.style,{width:`${h*.97*490/1350}px`,height:`${h*.97}px`});
  Object.assign(volume.style,{width:`${photo.offsetWidth}px`,height:`${fullHeight*.97}px`});
  for(const [el,mediaHeight]of [[line,h*.97],[volume,fullHeight*.97]] as [HTMLElement,number][]){const img=el.querySelector('img');if(img?.naturalWidth)el.style.width=`${Math.min(mediaHeight*img.naturalWidth/img.naturalHeight,w*(compact()?.86:.44))}px`;}
  volume.querySelector('svg')?.setAttribute('viewBox','0 0 686 1867');
  const sh=compact()?h*.82:Math.min(h*.91,w*.58*1160/1500);
  const sw=sh*(compact()?720/1160:1500/1160);
  Object.assign(sheet.style,{width:`${sw}px`,height:`${sh}px`});
  sheet.querySelector('svg')?.setAttribute('viewBox',compact()?'0 0 720 1160':'0 0 1500 1160');
  paintRtwPhoto(plate,view);paintRtwPhoto(source,Number(source.style.getPropertyValue('--view'))||0);
 }
 function positions(k:Key){
  const w=stage.clientWidth,h=stage.clientHeight,c=compact();
  const p=(el:HTMLElement,cx:number,cy:number,s=1,opacity=1)=>{if(el===photo||el===volume)s*=h/(innerHeight-(c?183:176));return {x:cx*w-el.offsetWidth*s/2,y:cy*h,scale:s,opacity,force3D:true};};
  let poses={photo:p(photo,.58,0),line:p(line,1.2,0,1,0),sheet:p(sheet,1.5,0,1,0),volume:p(volume,.58,0,1,0)};
  if(k==='A')poses.photo=p(photo,c?.52:.60,c?.045:0,c?.92:1);
  if(k==='B'){
   poses.photo=p(photo,c?.52:alternate?.60:.79,c?.12:alternate?0:.14,c?.85:alternate?1:.76,c?(alternate?1:0):1);
   poses.line=p(line,c?.52:.44,c?.11:.01,c?.83:1,alternate?0:1);
  }
  if(k==='C'){
   poses.photo=p(photo,-.3,0,.7,0);
   poses.line=p(line,c?.5:.23,c?.10:.25,c?.85:.71,c?(alternate?1:0):1);
   poses.sheet=p(sheet,c?.5:.695,c?.08:.025,1,c&&alternate?0:1);
  }
  if(k==='D'){
   poses.photo=p(photo,c?.52:.55,c?.10:0,c?.85:1,1);
   poses.volume=p(volume,c?.52:.55,c?.10:0,c?.85:1,1);
   poses.line=p(line,c?.52:.55,c?.10:0,.8,0);
  }
  if(k==='E')poses.photo=p(photo,c?.52:.53,c?.02:0,c?.94:1);
  return poses;
 }
 const paintCompare=(value:number)=>{compare=value;photo.style.clipPath='none';if(current==='D'){photo.style.opacity=String(value/100);volume.style.opacity=String(1-value/100);}else volume.style.opacity='0';};
 function showUI(k:Key){
  stage.dataset.stage=k;const [marker,title,note,caption]=strings[k];
  get('[data-kicker]').textContent=marker;get('[data-title]').innerHTML=title;get('[data-note]').innerHTML=note;
  get('[data-media-caption]').textContent=caption;
  const c=compact();copy.style.top=c?(k==='A'||k==='E'?'6px':'0'):(k==='C'?'0':'30%');
  copy.style.opacity=(c&&(k==='A'||k==='B'||k==='C'||k==='D'||k==='E'))?'0':'1';
  // On vertical screens, stage orientation is already in the navigation;
  // give the entire canvas to the media. Captions retain explicit provenance.
  get('[data-views]').hidden=k!=='A'&&k!=='E';get('[data-doc-tools]').hidden=k==='A'||k==='E';get('[data-compare]').hidden=k!=='D';
  const flat=get('[data-flat]');flat.hidden=k!=='B'&&k!=='C';flat.textContent=k==='B'?(alternate?'SHOW LINE':'SHOW PHOTO'):compact()?(alternate?'SHOW SHEET':'SHOW OUTLINE'):'INSPECT OUTLINE ↗';
  get('[data-position]').textContent=`REFERENCE 01 / ${k==='A'?'LOOK':k==='E'?'RESULT':k==='B'?'DESIGN':k==='C'?'CONSTRUCTION':'VOLUME'}`;
  const index=keys.indexOf(k),next=get<HTMLButtonElement>('[data-next]'),nextHadFocus=document.activeElement===next;next.hidden=index===keys.length-1;next.textContent=index<keys.length-1?`${keys[index+1]==='B'?'LINE':keys[index+1]==='C'?'CONSTRUCTION':keys[index+1]==='D'?'VOLUME':'RESULT'} →`:'';
  if(nextHadFocus&&next.hidden)get<HTMLButtonElement>('[data-view="0"]').focus({preventScroll:true});
  for(const b of root.querySelectorAll('[data-go]')) {if((b as HTMLElement).dataset.go===k)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');}
  for(const b of root.querySelectorAll('[data-view]'))b.setAttribute('aria-pressed',String(Number((b as HTMLElement).dataset.view)===view));
  get('[data-provenance]').textContent=k==='A'||k==='E'?'Reference photograph only. No verified development history is supplied.':'DEMO MEDIA / No sketch, pattern, flat or CLO history is claimed for this reference.';
 }
 function go(k:Key,instant=false){
  if(!keys.includes(k)||!open)return;
  tl?.kill();turnTween?.kill();cancelRtwMatchCut();const previous=current,oldTop=stage.getBoundingClientRect().top;current=k;alternate=false;root!.dataset.settled='';
  if(k!=='A'&&k!=='E'){view=0;plate.style.setProperty('--view','0');paintRtwPhoto(plate,0);}
  photo.style.clipPath='none';volume.style.opacity='0';showUI(k);dimensions();const delta=oldTop-stage.getBoundingClientRect().top;
  for(const el of [photo,line,sheet,volume])gsap.set(el,{y:Number(gsap.getProperty(el,'y'))+delta});
  const poses=positions(k);
  const elements={photo,line,sheet,volume};
  const immediate=instant||reduced.matches;
  for(const p of line.querySelectorAll<SVGPathElement>('[data-ink]')){p.style.strokeDasharray='none';p.style.strokeDashoffset='0';}
  if(immediate){for(const [name,el]of Object.entries(elements))gsap.set(el,poses[name as keyof typeof poses]);if(k==='D'){input.value='0';paintCompare(0);}if(k==='E'){view=1;plate.style.setProperty('--view','1');paintRtwPhoto(plate,1);showUI('E');}root!.dataset.settled=k;return;}
  if(k==='D'){input.value='0';compare=0;poses.photo.opacity=0;}
  tl=gsap.timeline({onComplete:()=>{if(k==='D'){input.value='0';paintCompare(0);}root!.dataset.settled=k;}});
  const vectorSpecimen=!!line.querySelector('[data-ink]');
  if(k==='B'&&previous==='A'&&vectorSpecimen){
   // The demo contour is explicitly photo-based: emerge at the source's
   // garment coordinates before becoming the primary reading. This is not
   // an inferred relationship between a genuine sketch and a photograph.
   const box=photo.getBoundingClientRect(),canvas=stage.getBoundingClientRect();
   gsap.set(line,{x:box.left-canvas.left+box.height*130/1867,y:box.top-canvas.top+box.height*330/1867,scale:box.height*1350/1867/line.offsetHeight,opacity:1});
   for(const [name,el]of Object.entries(elements))tl.to(el,{...poses[name as keyof typeof poses],duration:.65,ease:'power2.inOut'},name==='line'||name==='photo'?.22:0);
  }else if(k==='D'&&previous==='C'&&vectorSpecimen){
   // The same outline key travels into the envelope's registered frame;
   // only the mesh is new. No curve-sheet pieces assemble into a garment.
   const v=poses.volume,physicalHeight=volume.offsetHeight*v.scale;
   tl.to(line,{x:v.x+physicalHeight*130/1867,y:v.y+physicalHeight*330/1867,scale:physicalHeight*1350/1867/line.offsetHeight,opacity:1,duration:.55,ease:'power2.inOut'},0);
   gsap.set(volume,{...v,opacity:0});tl.to(volume,{opacity:1,duration:.3},.38).to(line,{opacity:0,duration:.2},.6);
   for(const name of ['photo','sheet'] as const)tl.to(elements[name],{...poses[name],duration:.7,ease:'power2.inOut'},0);
  }else for(const [name,el]of Object.entries(elements))tl.to(el,{...poses[name as keyof typeof poses],duration:.7,ease:'power2.inOut'},0);
  if(k==='B'){
   const paths=[...line.querySelectorAll<SVGPathElement>('[data-ink]')];
   for(const p of paths){const length=p.getTotalLength();p.style.strokeDasharray=String(length);gsap.set(p,{strokeDashoffset:length});tl.to(p,{strokeDashoffset:0,duration:.65,ease:'power1.inOut'},0);}
  }else for(const p of line.querySelectorAll<SVGPathElement>('[data-ink]'))p.style.strokeDasharray='none';
  if(k==='E'){
   // Material handoff stays at the registered frame, then the original source
   // turns to the real back. The final identity is never replaced by an effect.
   if(previous==='D'){gsap.set(photo,{opacity:compare/100});}
   const state={view};tl.to(state,{view:1,duration:.65,ease:'power2.inOut',onUpdate:()=>{paintRtwPhoto(plate,state.view);}},.3).call(()=>{view=1;plate.style.setProperty('--view','1');showUI('E');});
  }
 }
 function enter(key:Key='A',instant=false){
  entryScroll=scrollY;exhibition.inert=true;reader.hidden=false;open=true;current='A';view=Number(source.style.getPropertyValue('--view'))||0;
  dimensions();go('A',true);showUI('A');
  const opening=get('.iv-opening');gsap.killTweensOf([opening,copy]);
  if(!reduced.matches&&!instant){gsap.to(opening,{opacity:0,y:-12,duration:.18});if(!compact()){gsap.set(copy,{opacity:0});gsap.to(copy,{opacity:1,delay:.22,duration:.22});}}
  match(true,reduced.matches||instant,()=>{exhibition.hidden=true;get<HTMLButtonElement>('[data-view="0"]').focus({preventScroll:true});if(key!=='A')go(key,true);});
 }
 function leave(instant=false){
  tl?.kill();turnTween?.kill();dialog.close();exhibition.hidden=false;cancelRtwMatchCut();
  const opening=get('.iv-opening');gsap.killTweensOf([opening,copy]);
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
 get('[data-flat]').addEventListener('click',()=>{tl?.kill();if(current==='C'&&!compact()){inspect('line');return;}alternate=!alternate;showUI(current);const poses=positions(current);for(const [name,el]of Object.entries({photo,line,sheet,volume}))gsap.to(el,{...poses[name as keyof typeof poses],duration:reduced.matches?0:.35,ease:'power2.inOut'});if(current==='B')get('[data-media-caption]').textContent=alternate?'REFERENCE PHOTOGRAPH / UNCHANGED SOURCE':'UI CONTOUR / APPROXIMATE PHOTO PROPORTIONS · NOT A DESIGN SKETCH';});
 input.addEventListener('input',()=>paintCompare(Number(input.value)));
 let wheelGate=0;
 root.addEventListener('wheel',e=>{if(!open||dialog.open||Math.abs(e.deltaY)<18)return;e.preventDefault();if(performance.now()-wheelGate<850)return;wheelGate=performance.now();const i=keys.indexOf(current)+Math.sign(e.deltaY);if(i>=0&&i<keys.length)go(keys[i]);},{passive:false});
 document.addEventListener('keydown',e=>{if(dialog.open||!open||e.target instanceof HTMLInputElement)return;if(e.key==='Escape'){leave(true);return;}if(['ArrowRight','ArrowLeft','PageDown','PageUp'].includes(e.key)){e.preventDefault();const d=e.key==='ArrowRight'||e.key==='PageDown'?1:-1;const i=keys.indexOf(current)+d;if(i>=0&&i<keys.length)go(keys[i],true);}});
 const iw=get('[class="iv-inspector-window"]'),im=get('[data-inspector-media]');let z=1,px=0,py=0,mw=0,mh=0,drag=false,lastX=0,lastY=0;
 const renderInspect=()=>{im.style.transform=`translate3d(${px}px,${py}px,0) scale(${z})`;};
 function fit(){z=Math.min(iw.clientWidth/mw,iw.clientHeight/mh)*.95;px=(iw.clientWidth-mw*z)/2;py=(iw.clientHeight-mh*z)/2;renderInspect();}
 function inspect(kind:'photo'|'line'|'sheet'|'volume'){
  tl?.kill();dialog.showModal();im.replaceChildren();
  const title=kind==='photo'?'Original reference photograph':kind==='sheet'?'Vector inspection specimen':kind==='volume'?'UI volume envelope':'UI contour specimen';
  get('#iv-inspector-title').textContent=title;get('[data-inspector-truth]').textContent=kind==='photo'?'REFERENCE PHOTOGRAPHY / UNCHANGED ORIGINAL SOURCE':'DEMO / NOT A SKETCH, PATTERN, TECHNICAL FLAT OR CLO RESULT';
  if(kind==='photo'){const clone=plate.cloneNode(true) as HTMLElement;clone.removeAttribute('data-rtw-photo');im.append(clone);clone.style.setProperty('--photo-h','1200px');paintRtwPhoto(clone,view,1200);mw=clone.offsetWidth;mh=1200;}
  else {const original=(kind==='sheet'?sheet:kind==='volume'?volume:line).firstElementChild!;const media=original.cloneNode(true) as SVGSVGElement|HTMLImageElement;if(media instanceof HTMLImageElement){mw=(original as HTMLImageElement).naturalWidth;mh=(original as HTMLImageElement).naturalHeight;}else if(kind==='sheet'){media.setAttribute('viewBox','0 0 1500 1160');mw=1500;mh=1160;}else if(kind==='volume'){mw=686;mh=1867;}else{mw=490;mh=1350;}im.append(media);}
  Object.assign(im.style,{width:`${mw}px`,height:`${mh}px`});fit();get<HTMLButtonElement>('[data-close]').focus();
 }
 get('[data-look]').addEventListener('click',()=>inspect('photo'));
 get('[data-inspect]').addEventListener('click',()=>inspect(current==='D'?(compare>50?'photo':'volume'):current==='B'?(alternate?'photo':'line'):alternate?'line':'sheet'));
 get('[data-close]').addEventListener('click',()=>dialog.close());get('[data-fit]').addEventListener('click',fit);
 const zoom=(delta:number)=>{const old=z;z=Math.min(6,Math.max(.15,z*Math.pow(1.35,delta)));px=iw.clientWidth/2-(iw.clientWidth/2-px)*z/old;py=iw.clientHeight/2-(iw.clientHeight/2-py)*z/old;renderInspect();};
 for(const b of root.querySelectorAll<HTMLButtonElement>('[data-zoom]'))b.addEventListener('click',()=>zoom(Number(b.dataset.zoom)));
 const pointers=new Map<number,{x:number,y:number}>();let pinchDistance=0;
 iw.addEventListener('pointerdown',e=>{pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});iw.setPointerCapture(e.pointerId);drag=true;lastX=e.clientX;lastY=e.clientY;pinchDistance=0;});
 iw.addEventListener('pointermove',e=>{if(!drag)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const [a,b]=[...pointers.values()];const distance=Math.hypot(a.x-b.x,a.y-b.y);if(pinchDistance){const old=z;z=Math.min(6,Math.max(.15,z*distance/pinchDistance));px=iw.clientWidth/2-(iw.clientWidth/2-px)*z/old;py=iw.clientHeight/2-(iw.clientHeight/2-py)*z/old;}pinchDistance=distance;}else{px+=e.clientX-lastX;py+=e.clientY-lastY;}lastX=e.clientX;lastY=e.clientY;renderInspect();});
 const release=(e:PointerEvent)=>{pointers.delete(e.pointerId);drag=pointers.size>0;pinchDistance=0;const p=[...pointers.values()][0];if(p){lastX=p.x;lastY=p.y;}};iw.addEventListener('pointerup',release);iw.addEventListener('pointercancel',release);
 iw.addEventListener('keydown',e=>{if(e.key==='+'||e.key==='=')zoom(1);else if(e.key==='-')zoom(-1);else if(e.key.startsWith('Arrow')){px+=e.key==='ArrowRight'?-40:e.key==='ArrowLeft'?40:0;py+=e.key==='ArrowDown'?-40:e.key==='ArrowUp'?40:0;renderInspect();}else return;e.preventDefault();});
 window.addEventListener('resize',()=>{tl?.kill();dimensions();if(open)go(current,true);});reduced.addEventListener('change',()=>{if(open)go(current,true);});
 dimensions();let ready=true;const deep=location.hash.slice(1) as Key;
 // Raster input exercise: render ONLY the labelled neutral specimens to PNG.
 // Photography is never processed. The same canvas/inspector accepts vectors
 // and raster images, with native aspect/resolution and no automatic tracing.
 if(new URLSearchParams(location.search).get('media')==='raster'){
  ready=false;get<HTMLButtonElement>('[data-enter]').disabled=true;
  Promise.all([line,sheet,volume].map(async(layer)=>{
   const svg=layer.querySelector('svg')!.cloneNode(true) as SVGSVGElement;
   const [width,height]=layer===sheet?[1500,1160]:layer===volume?[686,1867]:[490,1350];
   if(layer===sheet)svg.setAttribute('viewBox','0 0 1500 1160');svg.setAttribute('width',String(width*2));svg.setAttribute('height',String(height*2));
   const image=new Image();image.src=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;await image.decode();
   const canvas=document.createElement('canvas');canvas.width=width*2;canvas.height=height*2;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0);const raster=new Image();raster.src=canvas.toDataURL('image/png');raster.alt=svg.getAttribute('aria-label')??'Labelled UI specimen, not project evidence';await raster.decode();layer.replaceChildren(raster);
  })).then(()=>{ready=true;get<HTMLButtonElement>('[data-enter]').disabled=false;dimensions();if(keys.includes(deep))enter(deep,true);});
 }else if(keys.includes(deep))requestAnimationFrame(()=>enter(deep));
 window.addEventListener('hashchange',()=>{const target=location.hash.slice(1) as Key;if(keys.includes(target)){if(open)go(target,true);else enter(target,true);}});
 // Read-only review instrumentation, useful for testing geometry and recording.
 (window as unknown as {rtwIV:unknown}).rtwIV={go:(k:Key)=>go(k,true),get stage(){return current;},get available(){return keys;},get ready(){return ready;}};
}
