import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {directions,type Pose} from '../data/womenswear-direction';
import {paintPhoto} from './garment-photo';
gsap.registerPlugin(ScrollTrigger);
/** A shared photographic stage; each category supplies a deliberately directed edit. */
export function initWomenswearExhibition(root:HTMLElement){
 const direction=directions[root.dataset.wwExhibition!];
 const world=root.closest<HTMLElement>('[data-world]')!,camera=root.querySelector<HTMLElement>('[data-ww-camera]')!,stage=root.querySelector<HTMLElement>('[data-ww-stage]')!;
 const actors=Object.fromEntries([...root.querySelectorAll<HTMLElement>('[data-ww-actor]')].map(a=>[a.dataset.wwActor!,a]));
 const title=root.querySelector<HTMLElement>('[data-ww-title]')!,label=root.querySelector<HTMLElement>('[data-ww-shot]')!,reduced=matchMedia('(prefers-reduced-motion:reduce)');
 let timeline:gsap.core.Timeline|null=null,held=false,resizedWhileHeld=false,heldProgress=0,holdShot=false;
 const paint=(scope:ParentNode=root)=>{for(const photo of scope.querySelectorAll<HTMLElement>('[data-ww-photo]'))paintPhoto(photo);};
 const render=()=>{
  paint(stage);
  for(const actor of Object.values(actors)){
   const r=actor.getBoundingClientRect(),visible=Number(gsap.getProperty(actor,'opacity'))>.5&&r.right>4&&r.left<stage.clientWidth-4&&r.bottom>stage.getBoundingClientRect().top&&r.top<innerHeight;
   actor.tabIndex=visible?0:-1;actor.setAttribute('aria-hidden',String(!visible));actor.style.pointerEvents=visible?'auto':'none';
  }
 };
 const build=()=>{
  timeline?.scrollTrigger?.kill();timeline?.kill();timeline=null;root.removeAttribute('data-enhanced');
  for(const actor of Object.values(actors)){gsap.set(actor,{clearProps:'transform,opacity,left,top'});actor.removeAttribute('aria-hidden');actor.tabIndex=0;actor.style.pointerEvents='';}
  gsap.set(title,{clearProps:'opacity,transform'});if(reduced.matches){paint();return;}
  root.setAttribute('data-enhanced','');
  const compact=stage.clientWidth<768||(stage.clientWidth<1024&&stage.clientHeight>stage.clientWidth),shots=compact?direction.mobile:direction.desktop;
  const pose=(role:string,p:Pose)=>({x:()=>p.x*stage.clientWidth-actors[role].offsetWidth/2,y:()=>stage.clientHeight*(p.floor??.97)-actors[role].offsetHeight,scale:p.scale,force3D:true});
  for(const[role,p]of Object.entries(shots[0].poses))if(actors[role])gsap.set(actors[role],{...pose(role,p),opacity:p.opacity??1});
  timeline=gsap.timeline({scrollTrigger:{trigger:camera,scroller:world,start:()=>`top top+=${world.querySelector<HTMLElement>('.pf-act__bar')!.offsetHeight}`,end:'bottom bottom',scrub:direction.id==='activewear'?.12:.22,invalidateOnRefresh:true},onUpdate:render});
  let previous=0;
  for(const shot of shots.slice(1)){
   const duration=Math.min(direction.id==='evening'?.19:.15,shot.at-previous-.035),start=shot.at-duration;
   for(const[role,p]of Object.entries(shot.poses))if(actors[role]){
    // Opaque photographs travel in separated lanes; no ghosted model crossfades.
    if(p.opacity!==0)timeline.set(actors[role],{opacity:1},start);
    timeline.to(actors[role],{...pose(role,p),duration,ease:direction.id==='activewear'?'power3.inOut':'power1.inOut'},start);
    if(p.opacity===0)timeline.set(actors[role],{opacity:0},shot.at);
   }
   timeline.set(label,{textContent:shot.label},shot.at);previous=shot.at;
  }
  // Clear the title before the approaching silhouette enters its type field.
  timeline.to(title,{opacity:0,y:-18,duration:.065},.025).to({}, {duration:.001},1);
  render();if(!world.hasAttribute('data-open'))timeline.scrollTrigger?.disable(false);
 };
 const observer=new ResizeObserver(()=>{if(held){resizedWhileHeld=true;return;}build();});observer.observe(stage);
 const stateObserver=new MutationObserver(()=>{if(world.hasAttribute('data-open')){timeline?.scrollTrigger?.enable(false,false);timeline?.scrollTrigger?.refresh();paint();}else timeline?.scrollTrigger?.disable(false);});stateObserver.observe(world,{attributes:true,attributeFilter:['data-open']});
 reduced.addEventListener('change',build);root.querySelectorAll('img').forEach(img=>img.addEventListener('load',()=>paint()));
 document.fonts.ready.then(()=>{paint();timeline?.scrollTrigger?.refresh();});build();
 return{hold(on:boolean){if(on){const t=timeline?.scrollTrigger;heldProgress=timeline?.progress()??0;holdShot=!!t&&world.scrollTop>=t.start-1&&world.scrollTop<=t.end+1;held=true;timeline?.pause();return;}held=false;if(resizedWhileHeld){resizedWhileHeld=false;build();const t=timeline?.scrollTrigger;if(holdShot&&t){t.refresh();world.scrollTop=t.start+(t.end-t.start)*heldProgress;t.update();render();}}else timeline?.scrollTrigger?.update();paint();},paint};
}
