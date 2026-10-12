from pathlib import Path
p=Path('src/lab/rtw-v')
def rename(s):
 return s.replace('iv-','v-').replace('.iv{','.v{').replace('[data-iv]','[data-v]').replace('rtwIV','rtwV')
s=rename(Path('src/lab/rtw-iv/proof.ts').read_text()).replace("import { gsap }", "import { media } from './media';\nimport { gsap }")
s=s.replace("const input=get<HTMLInputElement>('#v-comparison'),dialog=", "const flatMedia=get('[data-flat-media]');\n const dialog=")
start=s.index(' const strings:');end=s.index(' function enter(')
s=s[:start]+''' const strings:Record<Key,[string,string,string]>={
  A:['A / THE COMPLETE LOOK','Champagne<br> satin slip.','Cowl neckline. Low open back.'],
  B:['B / FASHION ILLUSTRATION','The first<br>gesture.','Sybil Connolly’s original drawing.<br>Many Pannelled Dress / Hunt Museum.'],
  C:['C / PATTERN ENGINEERING','Shape becomes<br>construction.','Dress ST656-1 / MoMu.<br>A documented pattern and its technical drawing.'],
  D:['D / DIGITAL GARMENT','Volume.<br>Material.<br>Drape.','CGElves / Marvelous Designer.<br>An independent digital robe, not CLO or fit evidence.'],
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
   poses.sheet=centered(sheet,c?.50:.71,c&&alternate?0:1);
   poses.flatMedia=centered(flatMedia,c?.50:.29,c&&!alternate?0:1);
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
  for(const b of root!.querySelectorAll('[data-view]'))b.setAttribute('aria-pressed',String(Number((b as HTMLElement).dataset.view===undefined?'0':(b as HTMLElement).dataset.view)===view));
  get('[data-provenance]').textContent=k==='A'||k==='E'?'Reference photograph. No verified development history.':'External illustrative example. Not this garment’s history or Aberbach’s work.';
 }
 function go(k:Key,instant=false){
  if(!keys.includes(k)||!open)return;
  tl?.kill();turnTween?.kill();cancelRtwMatchCut();const previous=current,oldTop=stage.getBoundingClientRect().top;
  current=k;alternate=false;root!.dataset.settled='';showUI(k);dimensions();
  const delta=oldTop-stage.getBoundingClientRect().top;
  for(const el of Object.values(elements))gsap.set(el,{y:Number(gsap.getProperty(el,'y'))+delta});
  const poses=positions(k),immediate=instant||reduced.matches;
  if(immediate){for(const [name,el]of Object.entries(elements))gsap.set(el,poses[name as keyof typeof poses]);root!.dataset.settled=k;return;}
  tl=gsap.timeline({onComplete:()=>{root!.dataset.settled=k;}});
  // A material handoff, not a false morphological relationship. The prior
  // medium leaves the viewing axis before the independent source takes it.
  for(const [name,el]of Object.entries(elements)){
   const target=poses[name as keyof typeof poses],visible=Number(gsap.getProperty(el,'opacity'))>.01;
   if(target.opacity===0&&visible)tl.to(el,{opacity:0,x:Number(gsap.getProperty(el,'x'))-28,duration:.22,ease:'power2.out'},0);
   else if(target.opacity>0){
    if(!visible)gsap.set(el,{...target,x:target.x+28,opacity:0});
    tl.to(el,{...target,duration:.48,ease:'power2.inOut'},visible?0:.18);
   }else gsap.set(el,target);
  }
  // Final returns to the actual source identity. Its selected view persists;
  // visitors may turn it themselves rather than watch an invented assembly.
 }
''' + s[end:]
start=s.index(" get('[data-flat]').addEventListener");end=s.index(' let wheelGate',start)
s=s[:start]+''' get('[data-flat]').addEventListener('click',e=>{
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
''' +s[end:]
start=s.index(" const iw=get(");end=s.index(' window.addEventListener(\'resize\'',start)
s=s[:start]+''' const iw=get('.v-inspector-window'),im=get('[data-inspector-media]');
 let z=1,px=0,py=0,mw=0,mh=0,fitScale=1,drag=false,lastX=0,lastY=0;
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
  tl?.kill();dialog.showModal();im.replaceChildren();dialog.dataset.source=kind;
  const title=kind==='photo'?'Original reference photograph':media[kind].title;
  get('#v-inspector-title').textContent=title;
  get('[data-inspector-truth]').replaceChildren();
  if(kind==='photo')get('[data-inspector-truth]').textContent='REFERENCE PHOTOGRAPH / UNCHANGED SOURCE';
  else {
   const m=media[kind],info=get('[data-inspector-truth]');
   info.append(`${m.credit} · Independent example. `);
   for(const [label,url]of [['Source',m.source],['License',m.license]]){const a=document.createElement('a');a.textContent=label;a.href=url;a.target='_blank';a.rel='noopener';info.append(a,' ');}
  }
  if(kind==='photo'){
   const clone=plate.cloneNode(true) as HTMLElement;clone.removeAttribute('data-rtw-photo');im.append(clone);clone.style.setProperty('--photo-h','1867px');paintRtwPhoto(clone,view,1867);mw=clone.offsetWidth;mh=1867;
  }else {
   const original=(kind==='sketch'?line:kind==='pattern'?sheet:kind==='flat'?flatMedia:volume).querySelector('img')!;
   const image=original.cloneNode(true) as HTMLImageElement;im.append(image);await image.decode();mw=media[kind].width;mh=media[kind].height;
  }
  Object.assign(im.style,{width:`${mw}px`,height:`${mh}px`});fit();get<HTMLButtonElement>('[data-close]').focus();
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
 dialog.addEventListener('close',()=>{pointers.clear();drag=false;});
 iw.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY<0?1:-1);},{passive:false});
 iw.addEventListener('keydown',e=>{
  if(e.key==='+'||e.key==='=')zoom(1);else if(e.key==='-')zoom(-1);else if(e.key==='0'||e.key==='Home')fit();
  else if(e.key.startsWith('Arrow')){px+=e.key==='ArrowRight'?-40:e.key==='ArrowLeft'?40:0;py+=e.key==='ArrowDown'?-40:e.key==='ArrowUp'?40:0;renderInspect();}else return;e.preventDefault();
 });
''' +s[end:]
start=s.index(' dimensions();let ready=');end=s.index(" window.addEventListener('hashchange'",start)
s=s[:start]+''' dimensions();let ready=false;const deep=location.hash.slice(1) as Key;
 get<HTMLButtonElement>('[data-enter]').disabled=true;
 Promise.all([...root.querySelectorAll('img')].map(i=>i.decode())).then(()=>{
  ready=true;get<HTMLButtonElement>('[data-enter]').disabled=false;dimensions();if(keys.includes(deep))enter(deep,true);
 }).catch(()=>{get('[data-provenance]').textContent='Source could not load. Please reload; no substitute evidence is generated.';});
''' +s[end:]
s=s.replace('if(open)go(current,true);});reduced','if(open)go(current,true);if(dialog.open)fit();});reduced')
p.joinpath('proof.ts').write_text(s)
p.joinpath('proof.css').write_text(rename(Path('src/lab/rtw-iv/proof.css').read_text()))
f=Path('src/pages/lab/rtw-v/[proof].astro');s=f.read_text().replace('<dv','<div').replace('</dv','</div').replace('Archvo','Archivo').replace('aria-lve','aria-live')
s=s.replace('<div class="v-line v-media" data-line set:html={lineSVG}></div>','<div class="v-line v-media" data-line><img src={media.sketch.url} alt={media.sketch.title} /></div>')
s=s.replace('<div class="v-sheet v-media" data-sheet set:html={sheetSVG}></div>','<div class="v-sheet v-media" data-sheet><img src={media.pattern.url} alt={media.pattern.title} /></div><div class="v-flat v-media" data-flat-media><img src={media.flat.url} alt={media.flat.title} /></div>')
s=s.replace('<div class="v-volume v-media" data-volume set:html={volumeSVG}></div>','<div class="v-volume v-media" data-volume><img src={media.digital.url} alt={media.digital.title} /></div>')
import re
s=re.sub(r'<div class="v-compare".*?</div>','',s,flags=re.S)
s=s.replace('<div class="v-inspector-window"','<p class="v-inspector-position" data-inspector-position aria-live="polite">Whole document</p><div class="v-inspector-window"');f.write_text(s)
