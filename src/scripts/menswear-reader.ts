import{paintMenswear}from'./menswear-film';
import{initPhotoInspection}from'./photo-inspection';
import{garmentMatchCut,cancelGarmentMatchCut}from'./garment-match-cut';
import{initScrollContinuation}from'./scroll-continuation';
import{menswearDirections}from'../data/menswear-direction';
import type{MenswearCategory}from'../data/menswear-collection';
import{gsap}from'gsap';
import{clientLocale,terms,term,categoryName}from'../i18n/portfolio-terms';
/* Runtime words in the page language (<html lang>). */
const say=terms[clientLocale()].runtime;

/** Scoped media/controller adapter. It never pushes history or opens/closes router layers. */
export function initMenswear(root:HTMLElement){
 const world=root.querySelector<HTMLElement>('[data-mw-world]');if(!world)return null;
 const exhibition=world.querySelector<HTMLElement>('.mw-exhibition')!,films=[...world.querySelectorAll<HTMLElement>('[data-mw-film]')];
 for(const f of films)f.removeAttribute('id');
 const reduce=matchMedia('(prefers-reduced-motion:reduce)'),menu=world.querySelector<HTMLElement>('[data-mw-worlds]')!,toggle=world.querySelector<HTMLButtonElement>('[data-mw-worlds-toggle]')!;
 const presentButton=world.querySelector<HTMLButtonElement>('[data-mw-present]')!,fullscreen=world.querySelector<HTMLButtonElement>('[data-mw-fullscreen]')!;
 let category:MenswearCategory='m-streetwear',film=films[0],experience=world.querySelector<HTMLElement>('[data-mw-scroll]')!,position=0,requested=0,present=false,active:HTMLElement|null=null;
 let archive=false,heldActor:number|undefined;
 let motion:gsap.core.Tween|null=null,raf=0,epoch=0,cutCancel:(()=>void)|null=null,returnFinish:(()=>void)|null=null;
 const readerStates=new Map<HTMLElement,{select:()=>void;reset:()=>void;draw:()=>void}>();
 const clamp=(n:number,a=0,b=4)=>Math.max(a,Math.min(b,n));
 const start=(f=film)=>experience.scrollTop+f.getBoundingClientRect().top-experience.getBoundingClientRect().top;
 const range=()=>Math.max(1,film.querySelector<HTMLElement>('.mw-walkway')!.offsetHeight-film.querySelector<HTMLElement>('[data-mw-frame]')!.offsetHeight);
 const menuState=(on:boolean,focus=false)=>{menu.hidden=!on;toggle.setAttribute('aria-expanded',String(on));if(focus)(on?menu.querySelector<HTMLElement>('[aria-current=page]')??menu.querySelector<HTMLElement>('a'):toggle)?.focus({preventScroll:true});};
 const paint=()=>{
  const current=Math.round(position),direction=menswearDirections[category];
  paintMenswear(film.querySelector<HTMLElement>('[data-mw-frame]')!,position,reduce.matches,heldActor);
  world.querySelectorAll<HTMLElement>('[data-mw-scene]').forEach(b=>{b.setAttribute('aria-pressed',String(Number(b.dataset.mwScene)===current));b.setAttribute('aria-label',`${Number(b.dataset.mwScene)+1}: ${term(clientLocale(),'scenes',direction.scenes[Number(b.dataset.mwScene)])}`);});
  film.querySelector<HTMLElement>('[data-mw-scene-caption]')!.textContent=term(clientLocale(),'scenes',direction.scenes[current]);
 };
 const stop=()=>{motion?.kill();motion=null;cancelAnimationFrame(raf);};
 const scene=(n:number,immediate=false)=>{
  stop();archive=false;heldActor=undefined;requested=clamp(n);const target=requested;
  const done=()=>{motion=null;world.querySelector<HTMLElement>('[data-mw-live]')!.textContent=`${categoryName(clientLocale(),category)}. ${term(clientLocale(),'scenes',menswearDirections[category].scenes[target])}`;};
  if(immediate||reduce.matches){position=target;experience.scrollTop=start()+range()*target/4;paint();done();return;}
  // The film renderer owns shot easing/holds. A second ease rushed its central comparisons.
  const state={p:position};motion=gsap.to(state,{p:target,duration:Math.abs(target-position)>.99?.95:.65,ease:'none',onUpdate:()=>{position=state.p;experience.scrollTop=start()+range()*position/4;paint();},onComplete:done});
 };
 const setPresent=(on:boolean)=>{
  present=on;world.toggleAttribute('data-present',on);presentButton.setAttribute('aria-pressed',String(on));presentButton.textContent=on?say.exitPresent:say.present;fullscreen.hidden=!on;
  if(on){scene(Math.round(position),true);experience.focus({preventScroll:true});}
  else if(document.fullscreenElement===world)void document.exitFullscreen().catch(()=>{});
 };
 // All films remain in one native flow. Selection follows the viewport, not hidden panels.
 const selectWorld=(next:HTMLElement)=>{
  if(film===next&&next.hasAttribute('data-current')&&(!world.hasAttribute('data-open')||next.hasAttribute('data-prepared')))return;

  film=next;category=film.dataset.mwFilm as MenswearCategory;
  films.forEach(f=>{f.toggleAttribute('data-current',f===film);f.querySelector<HTMLElement>('[data-mw-frame]')!.inert=f!==film;});
  world.querySelectorAll<HTMLElement>('[data-mw-world-link]').forEach(a=>{if(a.dataset.mwWorldLink===category)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  if(world.hasAttribute('data-open'))film.setAttribute('data-prepared','');
  if(world.hasAttribute('data-open'))for(const[at,image]of [...film.querySelectorAll<HTMLImageElement>('[data-mw-actor] img')].entries()){
   if(at===0)image.fetchPriority='high';image.loading='eager';void image.decode().catch(()=>{image.closest('a')?.setAttribute('data-unavailable','');});
  }
 };
 const follow=()=>{
  if(active||motion||present)return;
  const line=experience.getBoundingClientRect().top+Math.min(90,experience.clientHeight*.16);
  const next=films.find(f=>{const b=f.getBoundingClientRect();return b.top<=line&&b.bottom>line;})??(experience.scrollTop<1?films[0]:films.at(-1)!);
  selectWorld(next);heldActor=undefined;archive=experience.scrollTop>start()+range()+1;
  position=clamp(4*(experience.scrollTop-start())/range());requested=Math.round(position);paint();
  // Scroll changes orientation without generating Back-button entries. Reader routes stay router-owned.
  if(world.hasAttribute('data-open')&&location.hash.startsWith('#menswear')&&location.hash.split('/').length<3){
   const hash=`#menswear/${category}`;if(location.hash!==hash&&!(location.hash==='#menswear'&&category==='m-streetwear'))world.dispatchEvent(new CustomEvent('pf:menswear-orientation',{bubbles:true,detail:hash}));
  }
 };
 const activate=(next:string|null)=>{
  stop();cancel();archive=false;heldActor=undefined;menuState(false);
  const id=next&&next in menswearDirections?next as MenswearCategory:'m-streetwear';
  selectWorld(films.find(f=>f.dataset.mwFilm===id)!);position=requested=0;
  experience.scrollTop=start();paint();
 };
 experience.addEventListener('scroll',()=>{if(active||motion||present)return;cancelAnimationFrame(raf);raf=requestAnimationFrame(follow);},{passive:true});
 experience.addEventListener('wheel',()=>{if(!present&&!active)stop();},{passive:true});
 experience.addEventListener('touchstart',()=>{if(!present&&!active)stop();},{passive:true});
 const step=(delta:number)=>{
  const n=requested+delta,index=films.indexOf(film);
  if(n<0&&index>0){world.querySelector<HTMLAnchorElement>(`[data-mw-world-link="${films[index-1].dataset.mwFilm}"]`)!.click();scene(4,true);}
  else if(n>4&&index<films.length-1){world.querySelector<HTMLAnchorElement>(`[data-mw-world-link="${films[index+1].dataset.mwFilm}"]`)!.click();scene(0,true);}
  else scene(n);
 };
 experience.addEventListener('keydown',e=>{
  if(e.defaultPrevented||active||!menu.hidden||(e.target as HTMLElement).closest('a,button,input,select,textarea,summary,.mw-rail,[contenteditable=true]'))return;
  // In Explore, vertical keys retain native scrolling. Presentation remotes use arrows/Page/Space.
  const forward=present?['ArrowRight','ArrowDown','PageDown',' ']:['ArrowRight'],back=present?['ArrowLeft','ArrowUp','PageUp']:['ArrowLeft'];
  // Endpoints are direct seeks, not playback through every skipped composition.
  if(present&&(e.key==='Home'||e.key==='End')){e.preventDefault();scene(e.key==='Home'?0:4,true);}
  else if(forward.includes(e.key)||back.includes(e.key)){e.preventDefault();step((back.includes(e.key)||(e.key===' '&&e.shiftKey))?-1:1);}
 });
 initScrollContinuation(experience,()=>world.hasAttribute('data-open')&&!active&&!present,'#3d-simulation');
 for(const f of films){
  for(const im of f.querySelectorAll<HTMLImageElement>('[data-mw-actor] img'))for(const event of ['load','error'])im.addEventListener(event,()=>{if(f===film)paint();});
  const rail=f.querySelector<HTMLElement>('.mw-rail')!;
  rail.addEventListener('keydown',e=>{if(e.target!==rail||!['Home','End'].includes(e.key))return;e.preventDefault();const links=[...rail.querySelectorAll<HTMLAnchorElement>('a')];(e.key==='Home'?links[0]:links.at(-1))?.focus();});
 }
 toggle.addEventListener('click',()=>menuState(menu.hidden,true));
 world.querySelectorAll('[data-mw-world-link]').forEach(a=>a.addEventListener('click',()=>menuState(false)));
 presentButton.addEventListener('click',()=>setPresent(!present));
 fullscreen.addEventListener('click',async()=>{try{if(document.fullscreenElement===world)await document.exitFullscreen();else await world.requestFullscreen();}catch{world.querySelector<HTMLElement>('[data-mw-live]')!.textContent=say.fullscreenUnavailable;} });
 world.querySelectorAll<HTMLButtonElement>('[data-mw-scene]').forEach(b=>b.addEventListener('click',()=>scene(Number(b.dataset.mwScene))));
 world.querySelector('[data-mw-prev]')!.addEventListener('click',()=>step(-1));world.querySelector('[data-mw-next]')!.addEventListener('click',()=>step(1));
 world.querySelector('[data-mw-archive-open]')!.addEventListener('click',()=>{stop();archive=true;heldActor=undefined;if(present)setPresent(false);menuState(false);experience.scrollTo({top:start()+range()+experience.clientHeight,behavior:'instant'});film.querySelector<HTMLElement>('.mw-rail')!.focus({preventScroll:true});});
 document.addEventListener('pointerdown',e=>{if(!menu.hidden&&!(e.target as HTMLElement).closest('[data-mw-worlds],[data-mw-worlds-toggle]'))menuState(false);});
 document.addEventListener('keydown',e=>{
  if(e.key!=='Escape'||!world.hasAttribute('data-open')||active)return;
  if(!menu.hidden){e.preventDefault();e.stopImmediatePropagation();menuState(false,true);}
  else if(present){e.preventDefault();e.stopImmediatePropagation();setPresent(false);presentButton.focus({preventScroll:true});}
 },true);
 const match=(reader:HTMLElement,source:HTMLElement|null,enter:boolean,instant:boolean,done:()=>void)=>{
  cutCancel?.();if(!source||instant||reduce.matches){done();return;}
  cutCancel=cancelGarmentMatchCut;garmentMatchCut(reader,source,enter,false,done);
 };
 for(const reader of world.querySelectorAll<HTMLElement>('[data-mw-reader]')){
  const state=initPhotoInspection(reader);readerStates.set(reader,state);
  reader.addEventListener('pf:subject-reset',()=>{state.reset();if(active===reader){active=null;exhibition.inert=false;}});
 }
 const cancel=()=>{cutCancel?.();const done=returnFinish;returnFinish=null;done?.();epoch++;};
 const resize=()=>{cancel();if(!archive)experience.scrollTop=start()+range()*position/4;paint();if(active)readerStates.get(active)?.draw();};
 window.addEventListener('resize',resize);reduce.addEventListener('change',()=>{resize();if(!active)scene(Math.round(position),true);});
 new MutationObserver(()=>{if(!world.hasAttribute('data-open')){stop();cancel();setPresent(false);menuState(false);}}).observe(world,{attributes:true,attributeFilter:['data-open']});
 activate(null);
 return{focusTarget:()=>experience,ownsWorld:(el:HTMLElement)=>el===world,get category(){return category;},activate,cancel,owns:(reader:HTMLElement)=>reader.hasAttribute('data-mw-reader'),returnHash:(reader:HTMLElement)=>`#menswear/${reader.dataset.returnWorld??reader.dataset.of}`,
  enter(reader:HTMLElement,source:HTMLElement|null,instant:boolean){cancel();stop();reader.dataset.returnWorld=category;const back=reader.querySelector<HTMLAnchorElement>('[data-subject-close]')!;back.href=`#menswear/${category}`;back.textContent=reader.dataset.of===category?`← ${categoryName(clientLocale(),category)}`:say.fullCollectionBack;heldActor=Number(source?.closest<HTMLElement>('[data-mw-actor]')?.dataset.mwActor)||undefined;archive=experience.scrollTop>start()+range()+1||!!source?.closest('.mw-rail');active=reader;exhibition.inert=true;readerStates.get(reader)!.select();match(reader,source,true,instant,()=>{});},
  leave(reader:HTMLElement,source:HTMLElement|null,instant:boolean,done:()=>void){cancel();exhibition.inert=false;const token=epoch;const finish=()=>{if(token!==epoch)return;active=null;returnFinish=null;done();};returnFinish=finish;match(reader,location.hash===`#menswear/${reader.dataset.returnWorld??reader.dataset.of}`?source:null,false,instant,finish);},
 };
}
