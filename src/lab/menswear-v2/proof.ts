import gsap from 'gsap';
import {worlds,looks,type World,type Pose,type Look} from './frames';
import{paintStreet,resetStreet}from './street-film';
import {referenceSubject} from '../../data/portfolio';
import {finalPhotographs} from '../../data/final-photography';
const root=document.querySelector<HTMLElement>('[data-concept]')!;
const $=<T extends HTMLElement=HTMLElement>(selector:string)=>root.querySelector<T>(selector)!;
const experience=$('[data-experience]'),frame=$('[data-frame]'),cast=$('[data-cast]');
const menu=$<HTMLDialogElement>('[data-world-dialog]'),archive=$<HTMLDialogElement>('[data-archive-dialog]'),reader=$<HTMLDialogElement>('[data-reader]');
const reduce=matchMedia('(prefers-reduced-motion:reduce)'),compact=matchMedia('(max-width:767px), (max-width:1023px) and (orientation:portrait)');
const reviewBase=root.dataset.reviewBase?new URL(root.dataset.reviewBase,location.href):new URL('./',location.href);
const resolve=(src:string)=>location.pathname.startsWith('/lab/menswear')&&src.startsWith('../../../../public/')?src.replace('../../../../public',''):new URL(src,reviewBase).href;
const asset=(look:Look)=>resolve(look.image.src);
const worldKeys=Object.keys(worlds) as World[];
let world:World='m-streetwear',position=0,requested=0,present=false,explorePosition=0,token=0,raf=0,quiet=0;
let motion:gsap.core.Tween|null=null,source:HTMLElement|null=null,archiveSource=false,readerLook:Look|null=null,transfer:Animation|null=null;
let readToken=0,transferToken=0,closing=false;
let plateNodes=new Map<string,HTMLButtonElement>();
const status=$('[data-announcement]');
const speak=(text:string)=>{status.textContent=text;status.toggleAttribute('data-visible',/unavailable|could not/.test(text));};
function showControls(){root.setAttribute('data-controls-on','');clearTimeout(quiet);quiet=window.setTimeout(()=>root.removeAttribute('data-controls-on'),2800);}
function stop(){readToken++;transferToken++;motion?.kill();motion=null;transfer?.cancel();transfer=null;reader.querySelector('.mc-transfer')?.remove();$<HTMLImageElement>('[data-reader-image]').style.visibility='';}
function appendImage(look:Look){const img=new Image();img.src=asset(look);img.alt=look.image.alt;img.width=look.image.width;img.height=look.image.height;img.draggable=false;return img;}
async function prepare(id:World){const promises=worlds[id].cast.map(k=>{const img=new Image();img.src=asset(looks[k]);return img.decode();});if(id==='m-streetwear')for(const img of root.querySelectorAll<HTMLImageElement>('.dc-wing img')){img.src=asset(looks.booth);promises.push(img.decode());}await Promise.all(promises);}
function placeGeometry(look:Look,p:Pose){
 const w=frame.clientWidth,h=frame.clientHeight,window=look.window??[0,0,1,1],aspect=look.image.width*window[2]/(look.image.height*window[3]);
 const type=$('[data-title]').getBoundingClientRect(),stage=frame.getBoundingClientRect();
 const top=compact.matches?Math.max(104,type.bottom-stage.top+18):0,bottom=compact.matches?h-28:h;
 const height=Math.min(h*p.h/100,w*(p.max??(compact.matches?.9:.48))/aspect,bottom-top);
 return{x:w*p.x/100-height*aspect/2,y:compact.matches?top+(bottom-top-height)/2:h*p.y/100-height/2,h:height,w:height*aspect,aspect};
}
function paint(){
 const shots=worlds[world].shots,a=Math.min(4,Math.floor(position)),b=Math.min(4,a+1),t=position-a;
 const cut=t<.52?a:b,shot=shots[cut],current=shots[a],next=shots[b],mode=compact.matches?'mobile':'desktop';
 frame.toggleAttribute('data-dark',!!shot.dark);frame.style.background=shot.white?'#fff':'var(--paper)';
 const dark=current.dark?1:0,light=next.dark?1:0,gate=dark+(light-dark)*Math.min(1,Math.max(0,(t-.12)/.72));
 $('[data-gate]').style.clipPath=`inset(0 ${(1-gate)*100}% 0 0)`;
 $('[data-phrase]').textContent=shot.phrase;$('[data-note]').textContent=shot.note;
 $('[data-kicker]').textContent=`${worlds[world].number} / ${worlds[world].name.toUpperCase()}`;
 $('[data-scene-name]').textContent=shot.name;$('[data-counter]').textContent=`0${cut+1} / 05`;
 const pose=shot[mode],mix=t*t*(3-2*t);
 if(world==='m-streetwear'){paintStreet({frame,root,position,compact:compact.matches,reduce:reduce.matches,plates:plateNodes});}
 else {resetStreet(root);
 for(const[k,button]of plateNodes){
  const p=pose[k];button.tabIndex=p?0:-1;button.inert=!p;button.style.visibility=p?'visible':'hidden';button.setAttribute('aria-hidden',String(!p));
  if(!p)continue;
  let shown=p;const from=current[mode][k],to=next[mode][k];
  if(from&&to&&!reduce.matches)shown={x:from.x+(to.x-from.x)*mix,y:from.y+(to.y-from.y)*mix,h:from.h+(to.h-from.h)*mix};
  const g=placeGeometry(looks[k],shown);button.style.width=`${1000*g.aspect}px`;button.style.transform=`translate3d(${g.x}px,${g.y}px,0) scale(${g.h/1000})`;
 }
 }
 // Two-room shots reserve a top strip; their typography never lies across a figure.
 const paired=Object.keys(pose).length>1;
 root.toggleAttribute('data-paired',paired);root.dataset.world=world;root.dataset.scene=String(cut);root.dataset.position=position.toFixed(4);
 $('[data-title]').setAttribute('data-layout',paired?'paired':'solo');
 for(const button of root.querySelectorAll<HTMLButtonElement>('[data-scene-to]'))button.setAttribute('aria-current',String(Number(button.dataset.sceneTo)===cut));
 $<HTMLButtonElement>('[data-prev]').disabled=cut===0;$<HTMLButtonElement>('[data-next]').disabled=cut===4;
}
function renderCast(){
 cast.replaceChildren();plateNodes.clear();
 for(const k of worlds[world].cast){const look=looks[k],button=document.createElement('button');button.className='mc-plate';button.dataset.look=k;button.setAttribute('aria-label',`Inspect reference photograph: ${look.image.alt}`);
  const img=appendImage(look),win=look.window??[0,0,1,1];
  Object.assign(img.style,{left:`-${win[0]/win[2]*100}%`,top:`-${win[1]/win[3]*100}%`,width:`${100/win[2]}%`,height:`${100/win[3]}%`});
  button.append(img);button.addEventListener('click',()=>void openReader(k,button));cast.append(button);plateNodes.set(k,button);
 }
 const nav=$('[data-scene-nav]');nav.replaceChildren();
 worlds[world].shots.forEach((shot,i)=>{const b=document.createElement('button');b.textContent=`0${i+1}`;b.dataset.sceneTo=String(i);b.setAttribute('aria-label',`Scene ${i+1}: ${shot.name}`);b.addEventListener('click',()=>goScene(i,true));nav.append(b);});
 $('[data-world-label]').textContent=worlds[world].name;
 for(const b of root.querySelectorAll<HTMLElement>('[data-world-to]'))b.setAttribute('aria-current',String(b.dataset.worldTo===world));
}
function goScene(index:number,immediate=false){
 stop();requested=Math.max(0,Math.min(4,index));showControls();
 if(!present){experience.scrollTop=experience.scrollHeight>experience.clientHeight?(experience.scrollHeight-experience.clientHeight)*requested/4:0;}
 if(reduce.matches||immediate){position=requested;paint();return;}
 const state={at:position};motion=gsap.to(state,{at:requested,duration:world==='m-streetwear'?[.95,1.65,1.35,1.1][Math.min(3,Math.floor(Math.min(position,requested)))]??1.2:.42,ease:'power2.inOut',onUpdate:()=>{position=state.at;paint();},onComplete:()=>{motion=null;position=requested;paint();}});
}
async function jump(id:World){
 const mine=++token;++readToken;stop();speak('');
 try{await prepare(id);}catch{if(mine===token){if(menu.open)menu.close();speak('That reference could not load. Your current world remains available.');}return;}
 if(mine!==token)return;
 if(menu.open)menu.close();if(archive.open)archive.close();if(reader.open)finishReader();world=id;if(present)explorePosition=0;position=requested=0;renderCast();experience.scrollTop=0;paint();experience.focus({preventScroll:true});showControls();speak(`${worlds[id].name}. Opening composition.`);
}
$('[data-world-menu]').addEventListener('click',()=>menu.showModal());$('[data-world-close]').addEventListener('click',()=>menu.close());
for(const id of worldKeys){const b=document.createElement('button');b.innerHTML=`<span>${worlds[id].number}</span>${worlds[id].name}`;b.dataset.worldTo=id;b.addEventListener('click',()=>void jump(id));$('[data-world-links]').append(b);}
$('[data-next]').addEventListener('click',e=>goScene(requested+1,(e as PointerEvent).detail===0));$('[data-prev]').addEventListener('click',e=>goScene(requested-1,(e as PointerEvent).detail===0));
experience.addEventListener('scroll',()=>{if(present||reader.open||motion)return;readToken++;cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{position=4*experience.scrollTop/Math.max(1,experience.scrollHeight-experience.clientHeight);requested=Math.round(position);if(reduce.matches)position=requested;paint();});},{passive:true});
function togglePresent(on:boolean){stop();if(on===present)return;if(on){explorePosition=position;position=requested=Math.round(position);}present=on;root.toggleAttribute('data-present',on);$('[data-presentation-tools]').hidden=!on;paint();experience.focus({preventScroll:true});showControls();if(!on){position=explorePosition;experience.scrollTop=(experience.scrollHeight-experience.clientHeight)*position/4;paint();if(document.fullscreenElement===root)void document.exitFullscreen().catch(()=>{});}speak(on?'Presentation. Use arrow keys, Page Up/Down or Space while the stage is focused.':'Explore. Previous scroll position restored.');}
$('[data-present]').addEventListener('click',()=>togglePresent(true));$('[data-exit]').addEventListener('click',()=>togglePresent(false));
$('[data-fullscreen]').addEventListener('click',async()=>{try{if(!root.requestFullscreen)throw new Error('unsupported');await root.requestFullscreen();}catch{speak('Fullscreen is unavailable. In-page presentation remains active.');}});
root.addEventListener('pointermove',showControls,{passive:true});root.addEventListener('pointerdown',showControls,{passive:true});
function showArchive(){stop();$('[data-archive-name]').textContent=worlds[world].name;$('[data-archive-context]').textContent=`${worlds[world].cast.length} genuine candidates in this concept. The approved future collection will have ten unique looks per world.`;const rail=$('[data-archive-rail]');rail.replaceChildren();for(const key of worlds[world].cast){const b=document.createElement('button');b.dataset.archiveLook=key;b.append(appendImage(looks[key]));const t=document.createElement('small');t.textContent=looks[key].image.alt;b.append(t);b.addEventListener('click',()=>void openReader(key,b));rail.append(b);}const link=$<HTMLAnchorElement>('[data-public-link]');link.href=`${location.pathname.startsWith('/lab/')?'/portfolio/':'https://aberbach.co/portfolio/'}#menswear/${world}`;archive.showModal();}
$('[data-archive]').addEventListener('click',showArchive);$('[data-archive-close]').addEventListener('click',()=>archive.close());
const image=$<HTMLImageElement>('[data-reader-image]'),inspection=$('[data-inspection]');let zoom=1,panX=0,panY=0;const fingers=new Map<number,{x:number;y:number}>();let distance=0,last={x:0,y:0};
function drawZoom(){const bounds=inspection.getBoundingClientRect();const maxX=Math.max(0,(image.clientWidth*zoom-bounds.width)/2),maxY=Math.max(0,(image.clientHeight*zoom-bounds.height)/2);panX=Math.max(-maxX,Math.min(maxX,panX));panY=Math.max(-maxY,Math.min(maxY,panY));image.style.transform=`translate3d(${panX}px,${panY}px,0) scale(${zoom})`;$('[data-reader-status]').textContent=reader.hasAttribute('data-inspecting')?`${Math.round(zoom*100)}% · drag / pinch / arrow keys`:'';}
function inspect(on:boolean){closing=false;stop();reader.toggleAttribute('data-inspecting',on);$('[data-inspect]').setAttribute('aria-pressed',String(on));$('[data-zoom-tools]').hidden=!on;zoom=on?2:1;panX=panY=0;fingers.clear();drawZoom();inspection.focus({preventScroll:true});}
async function match(sourceNode:HTMLElement,enter:boolean,done:()=>void){
 const generation=++transferToken;
 if(reduce.matches||!sourceNode.isConnected){done();return;}
 const original=sourceNode.querySelector<HTMLImageElement>('img')!;if(!original){done();return;}
 // Same-source crop expansion: measure the full photographed plane as well as
 // its visible window. Uniform scaling + clip travel preserves body proportions.
 const sourceRect=original.getBoundingClientRect(),windowRect=sourceNode.getBoundingClientRect(),target=image.getBoundingClientRect();
 const a=enter?sourceRect:target,b=enter?target:sourceRect;
 if(!a.width||!b.width||Math.abs(a.width/a.height-b.width/b.height)>.02){done();return;}
 const crop=`inset(${Math.max(0,(windowRect.top-sourceRect.top)/sourceRect.height*100)}% ${Math.max(0,(sourceRect.right-windowRect.right)/sourceRect.width*100)}% ${Math.max(0,(sourceRect.bottom-windowRect.bottom)/sourceRect.height*100)}% ${Math.max(0,(windowRect.left-sourceRect.left)/sourceRect.width*100)}%)`;
 const clone=image.cloneNode() as HTMLImageElement;clone.className='mc-transfer';clone.removeAttribute('data-reader-image');clone.setAttribute('aria-hidden','true');Object.assign(clone.style,{left:`${a.left}px`,top:`${a.top}px`,width:`${a.width}px`,height:`${a.height}px`,transform:'none'});reader.append(clone);
 try{await clone.decode();}catch{clone.remove();if(generation===transferToken&&reader.open)done();return;}
 if(!reader.open||generation!==transferToken){clone.remove();return;}image.style.visibility='hidden';const scaleX=b.width/a.width;
 transfer=clone.animate([{transform:'translate(0,0) scale(1)',clipPath:enter?crop:'inset(0%)'},{transform:`translate(${b.left-a.left}px,${b.top-a.top}px) scale(${scaleX})`,clipPath:enter?'inset(0%)':crop}],{duration:540,easing:'cubic-bezier(.22,.68,.18,1)',fill:'forwards'});
 const current=transfer;current.onfinish=()=>{if(transfer!==current)return;clone.remove();image.style.visibility='';transfer=null;done();};
}
async function openReader(key:string,door:HTMLElement){
 stop();const mine=++readToken,look=looks[key];const preload=new Image();preload.src=asset(look);try{await preload.decode();}catch{if(mine===readToken)speak('Photograph unavailable. Stay in the exhibition and try another look.');return;}if(mine!==readToken)return;
 source=door;archiveSource=archive.open;readerLook=look;zoom=1;panX=panY=0;reader.removeAttribute('data-inspecting');$('[data-inspect]').setAttribute('aria-pressed','false');$('[data-zoom-tools]').hidden=true;image.src=asset(look);image.alt=look.image.alt;image.width=look.image.width;image.height=look.image.height;image.style.transform='';
 $('[data-reader-caption]').textContent=look.image.alt;$<HTMLAnchorElement>('[data-reader-credit]').href=look.source;$('[data-reader-credit]').textContent=`${look.existing?'Pexels reference':look.creator+' / Pexels'} ↗`;$<HTMLAnchorElement>('[data-original]').href=asset(look);
 const subject=referenceSubject({id:look.id,image:look.image},'menswear',world),photos=finalPhotographs(subject);$('[data-views]').replaceChildren();
 // Current proof photographs genuinely have one view. No Front/Back fiction.
 for(const photo of photos){const span=document.createElement('span');span.textContent=photo.crop==='whole'?'PRIMARY PHOTOGRAPH':photo.label.toUpperCase();$('[data-views]').append(span);}
 reader.showModal();await image.decode().catch(()=>{});if(mine!==readToken||!reader.open)return;drawZoom();void match(door,true,()=>{});$('[data-reader-close]').focus({preventScroll:true});
}
function finishReader(){closing=false;stop();reader.close();readToken++;readerLook=null;if(source?.isConnected)source.focus({preventScroll:true});showControls();}
function closeReader(instant=false){if(!reader.open)return;stop();if(reader.hasAttribute('data-inspecting')){inspect(false);return;}if(instant||!source||archiveSource){finishReader();return;}closing=true;void match(source,false,finishReader);}
$('[data-reader-close]').addEventListener('click',e=>{if(reader.hasAttribute('data-inspecting'))inspect(false);closeReader((e as PointerEvent).detail===0);});
$('[data-inspect]').addEventListener('click',()=>inspect(!reader.hasAttribute('data-inspecting')));$('[data-fit]').addEventListener('click',()=>{zoom=1;panX=panY=0;drawZoom();});
for(const b of root.querySelectorAll<HTMLElement>('[data-zoom]'))b.addEventListener('click',()=>{zoom=Math.max(1,Math.min(4,zoom*(Number(b.dataset.zoom)>0?1.35:1/1.35)));drawZoom();});
inspection.addEventListener('pointerdown',e=>{if(!reader.hasAttribute('data-inspecting'))return;fingers.set(e.pointerId,{x:e.clientX,y:e.clientY});last={x:e.clientX,y:e.clientY};distance=0;try{inspection.setPointerCapture(e.pointerId);}catch{}});
inspection.addEventListener('pointermove',e=>{if(!fingers.has(e.pointerId))return;fingers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(fingers.size===2){const[a,b]=[...fingers.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(distance)zoom=Math.max(1,Math.min(4,zoom*d/distance));distance=d;}else{panX+=e.clientX-last.x;panY+=e.clientY-last.y;}last={x:e.clientX,y:e.clientY};drawZoom();});
for(const type of ['pointerup','pointercancel'])inspection.addEventListener(type,(e:PointerEvent)=>{fingers.delete(e.pointerId);distance=0;const left=[...fingers.values()][0];if(left)last=left;});
reader.addEventListener('cancel',e=>{e.preventDefault();closeReader(true);});
inspection.addEventListener('keydown',e=>{if(!reader.hasAttribute('data-inspecting'))return;if(e.key.startsWith('Arrow')){e.preventDefault();panX+=e.key==='ArrowLeft'?60:e.key==='ArrowRight'?-60:0;panY+=e.key==='ArrowUp'?60:e.key==='ArrowDown'?-60:0;}else if(e.key==='+'||e.key==='=')zoom=Math.min(4,zoom*1.3);else if(e.key==='-')zoom=Math.max(1,zoom/1.3);else if(e.key==='0'){zoom=1;panX=panY=0;}else return;e.preventDefault();drawZoom();});
root.addEventListener('keydown',e=>{
 if(reader.open||archive.open||menu.open)return;
 const target=e.target as HTMLElement;if(target!==experience&&target!==root&&target!==document.body)return;
 if(e.altKey||e.metaKey||e.ctrlKey)return;
 if(e.key==='Escape'&&present){e.preventDefault();togglePresent(false);return;}
 const forward=['ArrowRight','ArrowDown','PageDown'].includes(e.key)||(e.key===' '&&!e.shiftKey),back=['ArrowLeft','ArrowUp','PageUp'].includes(e.key)||(e.key===' '&&e.shiftKey);
 if(forward||back){e.preventDefault();goScene(requested+(forward?1:-1),!present);}else if(e.key==='Home'||e.key==='End'){e.preventDefault();goScene(e.key==='Home'?0:4,true);}
});
window.addEventListener('resize',()=>{const held=position;if(reader.open&&closing)finishReader();else stop();if(!present)experience.scrollTop=(experience.scrollHeight-experience.clientHeight)*held/4;paint();if(reader.open)drawZoom();});reduce.addEventListener('change',()=>{stop();position=requested=Math.round(position);paint();});compact.addEventListener('change',()=>{stop();paint();});
// Lab-only inspection API used to capture actual authored storyboard positions.
(window as any).menswearConcept={jump,scene:(n:number)=>goScene(n,true),snapshot:()=>({world,position,requested,present,scroll:experience.scrollTop,reader:reader.open,archive:archive.open}),position:(n:number)=>{stop();position=Math.max(0,Math.min(4,n));requested=Math.round(position);paint();},ready:prepare(world).then(()=>{renderCast();paint();root.dataset.ready='true';},()=>{renderCast();paint();root.dataset.ready='error';speak('Opening photograph unavailable. Choose another world or return to Portfolio.');})};
