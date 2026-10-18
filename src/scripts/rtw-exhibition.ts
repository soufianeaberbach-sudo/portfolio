import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {paintRtwPhoto} from './rtw-photo';
gsap.registerPlugin(ScrollTrigger);
/** Full silhouettes share a camera floor. Small viewing-distance changes, not detail planes. */
export function initRtwExhibition(root:HTMLElement){
 const world=root.closest<HTMLElement>('[data-world]')!,camera=root.querySelector<HTMLElement>('[data-rtw-camera]')!,stage=root.querySelector<HTMLElement>('[data-rtw-stage]')!;
 const actors=Object.fromEntries([...root.querySelectorAll<HTMLElement>('[data-rtw-actor]')].map(a=>[a.dataset.rtwActor!,a]));
 const title=root.querySelector<HTMLElement>('[data-rtw-title]')!,label=root.querySelector<HTMLElement>('[data-rtw-shot]')!;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 let timeline:gsap.core.Timeline|null=null,held=false,resizedWhileHeld=false,heldProgress=0,holdShot=false;
 const paint=(scope:ParentNode=root)=>{for(const photo of scope.querySelectorAll<HTMLElement>('[data-rtw-photo]'))paintRtwPhoto(photo);};
 const render=()=>{
  paint(stage);for(const actor of Object.values(actors)){
   const rect=actor.getBoundingClientRect(),visible=Number(gsap.getProperty(actor,'opacity'))>.5&&rect.right>4&&rect.left<stage.clientWidth-4;
   actor.tabIndex=visible?0:-1;actor.setAttribute('aria-hidden',String(!visible));actor.style.pointerEvents=visible?'auto':'none';
  }
 };
 const build=()=>{
  timeline?.scrollTrigger?.kill();timeline?.kill();timeline=null;
  root.removeAttribute('data-enhanced');
  for(const a of Object.values(actors)){gsap.set(a,{clearProps:'transform,opacity,left,top'});a.removeAttribute('aria-hidden');a.tabIndex=0;a.style.pointerEvents='';}
  gsap.set(title,{clearProps:'opacity,transform'});
  if(reduced.matches){paint();return;}
  root.setAttribute('data-enhanced','');
  const compact=stage.clientWidth<768||(stage.clientWidth<1024&&stage.clientHeight>stage.clientWidth);
  const h=()=>stage.clientHeight,w=()=>stage.clientWidth;
  const pose=(role:string,x:number,scale=1,opacity=1)=>({x:()=>x*w()-actors[role].offsetWidth/2,y:()=>h()*.96-actors[role].offsetHeight,scale,opacity,force3D:true});
  for(const role of Object.keys(actors))gsap.set(actors[role],pose(role,1.4,1,0));
  gsap.set(actors.anchor,pose('anchor',compact?.58:.66,compact?.73:.88));
  // Each named arrival earns the next shot through silhouette and colour.
  timeline=gsap.timeline({scrollTrigger:{trigger:camera,scroller:world,start:()=>`top top+=${world.querySelector<HTMLElement>('.pf-act__bar')!.offsetHeight}`,end:'bottom bottom',scrub:.16,invalidateOnRefresh:true},onUpdate:render});
  const move=(role:string,x:number,scale:number,at:number,duration=.6)=>timeline!.set(actors[role],{opacity:1},at).to(actors[role],{...pose(role,x,scale),duration,ease:'power1.inOut'},at);
  const exit=(role:string,x:number,at:number)=>{move(role,x,1,at);timeline!.set(actors[role],{opacity:0},at+.6);};
  move('anchor',compact?.51:.59,1,.15,.9);
  timeline.to(title,{opacity:0,y:-18,duration:.5},.25)
   .to(actors.anchor.querySelector('[data-rtw-photo]'),{'--view':1,duration:.7,ease:'power3.inOut'},1.15)
   .set(label,{textContent:'FRONT → BACK'},1.15);
  if(compact){exit('anchor',-.65,2.1);move('arrival',.51,1,2.35);}
  else{move('anchor',.29,.96,2.1);move('arrival',.72,1,2.25);}
  timeline.set(label,{textContent:'DRAPE / PROPORTION'},2.1);
  if(!compact)exit('anchor',-.65,3.45);
  move('arrival',compact?-.65:.28,1,3.45);
  move('tailoring',compact?.51:.72,1,3.7);
  if(compact)timeline.set(actors.arrival,{opacity:0},4.05);
  timeline.set(label,{textContent:'A CHANGE OF PROPORTION'},3.7);
  if(!compact)exit('arrival',-.65,4.9);
  exit('tailoring',-.65,5.05);move('pause',.51,1.02,5.3);
  timeline.set(label,{textContent:'ONE CONTINUOUS LINE'},5.3)
   .to(actors.pause.querySelector('[data-rtw-photo]'),{'--view':1,duration:.6,ease:'power3.inOut'},6.05);
  exit('pause',-.65,6.85);
  move('resolve',compact?.51:.68,1,7.1);
  if(!compact){gsap.set(actors.arrival,pose('arrival',-.6,1,0));move('arrival',.29,.96,7.1);}
  timeline.set(label,{textContent:'SELECTED READY-TO-WEAR'},7.1).to({}, {duration:.85},7.7);
  render();
  if(!world.hasAttribute('data-open'))timeline.scrollTrigger?.disable(false);
 };
 const observer=new ResizeObserver(()=>{if(held){resizedWhileHeld=true;return;}build();});observer.observe(stage);
 const stateObserver=new MutationObserver(()=>{if(world.hasAttribute('data-open')){timeline?.scrollTrigger?.enable(false);timeline?.scrollTrigger?.refresh();paint();}else timeline?.scrollTrigger?.disable(false);});stateObserver.observe(world,{attributes:true,attributeFilter:['data-open']});
 reduced.addEventListener('change',build);
 root.querySelectorAll('img').forEach(img=>img.addEventListener('load',()=>paint()));
 document.fonts.ready.then(()=>{paint();timeline?.scrollTrigger?.refresh();});
 build();
 return {hold(on:boolean){
  if(on){const trigger=timeline?.scrollTrigger;heldProgress=timeline?.progress()??0;holdShot=!!trigger&&world.scrollTop>=trigger.start-1&&world.scrollTop<=trigger.end+1;held=true;timeline?.pause();return;}
  held=false;
  if(resizedWhileHeld){resizedWhileHeld=false;build();const trigger=timeline?.scrollTrigger;if(holdShot&&trigger){trigger.refresh();world.scrollTop=trigger.start+(trigger.end-trigger.start)*heldProgress;trigger.update();render();}}
  else timeline?.scrollTrigger?.update();
  paint();
 },paint};
}
