import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {directions,type Pose} from '../data/womenswear-direction';
import {paintPhoto} from './garment-photo';
import {clientLocale,term} from '../i18n/portfolio-terms';
gsap.registerPlugin(ScrollTrigger);
/** A shared photographic stage; each category supplies a deliberately directed edit. */
export function initWomenswearExhibition(root:HTMLElement){
 const direction=directions[root.dataset.wwExhibition!];
 const world=root.closest<HTMLElement>('[data-world]')!,camera=root.querySelector<HTMLElement>('[data-ww-camera]')!,stage=root.querySelector<HTMLElement>('[data-ww-stage]')!;
 const actors=Object.fromEntries([...root.querySelectorAll<HTMLElement>('[data-ww-actor]')].map(a=>[a.dataset.wwActor!,a]));
 const title=root.querySelector<HTMLElement>('[data-ww-title]')!,label=root.querySelector<HTMLElement>('[data-ww-shot]')!,reduced=matchMedia('(prefers-reduced-motion:reduce)');
 let timeline:gsap.core.Timeline|null=null,held=false,resizedWhileHeld=false,heldProgress=0,holdShot=false;
 let originRole:string|undefined;
 const shotMap=()=>stage.clientWidth<768||(stage.clientWidth<1024&&stage.clientHeight>stage.clientWidth)?direction.mobile:direction.desktop;
 const paint=(scope:ParentNode=root)=>{for(const photo of scope.querySelectorAll<HTMLElement>('[data-ww-photo]'))paintPhoto(photo);};
 const render=()=>{
  paint(stage);
  for(const actor of Object.values(actors)){
   const r=actor.getBoundingClientRect(),visible=Number(gsap.getProperty(actor,'opacity'))>.5&&r.right>4&&r.left<stage.clientWidth-4&&r.bottom>stage.getBoundingClientRect().top&&r.top<innerHeight;
   actor.tabIndex=visible?0:-1;actor.setAttribute('aria-hidden',String(!visible));actor.style.pointerEvents=visible?'auto':'none';
  }
 };
 const build=()=>{
  timeline?.scrollTrigger?.kill();timeline?.kill();timeline=null;
  // Keep the enhanced camera's height during rebuilds. Temporarily reverting
  // a long world to fallback layout clamped late-category deep-link scroll.
  root.toggleAttribute('data-enhanced',!reduced.matches);
  for(const actor of Object.values(actors)){gsap.set(actor,{clearProps:'transform,opacity,left,top'});actor.removeAttribute('aria-hidden');actor.tabIndex=0;actor.style.pointerEvents='';}
  gsap.set(title,{clearProps:'opacity,transform'});if(reduced.matches){paint();return;}
  const shots=shotMap();
  const pose=(role:string,p:Pose)=>({x:()=>p.x*stage.clientWidth-actors[role].offsetWidth/2,y:()=>{
   const height=actors[role].offsetHeight;
   // A wide original may fit by width on a phone. Keep that full photograph
   // balanced vertically rather than stranding it beneath an empty screen.
   const balance=(p.floor??.97)===.97?Math.max(0,stage.clientHeight*.93-height)/2:0;
   return stage.clientHeight*(p.floor??.97)-height-balance;
  },scale:p.scale,force3D:true});
  for(const[role,p]of Object.entries(shots[0].poses))if(actors[role])gsap.set(actors[role],{...pose(role,p),opacity:p.opacity??1});
  timeline=gsap.timeline({scrollTrigger:{trigger:camera,scroller:world,start:()=>`top top+=${world.querySelector<HTMLElement>('.pf-act__bar')!.offsetHeight}`,end:'bottom bottom',scrub:direction.id==='activewear'?.12:.22,invalidateOnRefresh:true},onUpdate:render});
  let previous=0;
  const settled:Record<string,Pose>={...shots[0].poses};
  for(const shot of shots.slice(1)){
   const duration=Math.min(direction.id==='evening'?.19:.15,shot.at-previous-.035),start=shot.at-duration;
   // A complete photograph rising through the floor produced floating heads
   // and feet. Hold the prior composition, then cut to the whole next look.
   // Anchored horizontal camera relationships keep their existing movement.
   const verticalArrival=Object.entries(shot.poses).some(([role,p])=>p.opacity!==0&&settled[role]?.opacity===0&&(settled[role].floor??.97)>1);
   for(const[role,p]of Object.entries(shot.poses))if(actors[role]){
    if(verticalArrival){timeline.set(actors[role],{...pose(role,p),opacity:p.opacity??1},shot.at);continue;}
    // Opaque photographs travel in separated lanes; no ghosted model crossfades.
    if(p.opacity!==0)timeline.set(actors[role],{opacity:1},start);
    timeline.to(actors[role],{...pose(role,p),duration,ease:direction.id==='activewear'?'power3.inOut':'power1.inOut'},start);
    if(p.opacity===0)timeline.set(actors[role],{opacity:0},(p.floor??.97)<0?start:shot.at);
   }
   timeline.set(label,{textContent:term(clientLocale(),'shots',shot.label)},shot.at);
   for(const[role,p]of Object.entries(shot.poses))settled[role]={...p,opacity:p.opacity??1};
   previous=shot.at;
  }
  // Clear the title before the approaching silhouette enters its type field.
  timeline.to(title,{opacity:0,y:-18,duration:.065},.025).to({}, {duration:.001},1);
  render();if(!world.hasAttribute('data-open'))timeline.scrollTrigger?.disable(false);
 };
 const observer=new ResizeObserver(()=>{if(held){resizedWhileHeld=true;return;}build();});observer.observe(stage);
 const stateObserver=new MutationObserver(()=>{if(world.hasAttribute('data-open')){timeline?.scrollTrigger?.enable(false,false);timeline?.scrollTrigger?.refresh();paint();}else timeline?.scrollTrigger?.disable(false);});stateObserver.observe(world,{attributes:true,attributeFilter:['data-open']});
 reduced.addEventListener('change',build);root.querySelectorAll('img').forEach(img=>img.addEventListener('load',()=>paint()));
 document.fonts.ready.then(()=>{paint();timeline?.scrollTrigger?.refresh();});build();
 return{hold(on:boolean,source:HTMLElement|null=null){
  if(on){const t=timeline?.scrollTrigger;originRole=source&&root.contains(source)?source.closest<HTMLElement>('[data-ww-actor]')?.dataset.wwActor:undefined;heldProgress=timeline?.progress()??0;holdShot=!!t&&world.scrollTop>=t.start-1&&world.scrollTop<=t.end+1;held=true;timeline?.pause();return false;}
  held=false;
  const changed=resizedWhileHeld;
  if(resizedWhileHeld){
   resizedWhileHeld=false;build();const t=timeline?.scrollTrigger;
   if((holdShot||originRole)&&t){
    t.refresh();const seek=(at:number)=>{world.scrollTop=t.start+(t.end-t.start)*at;t.update();t.getTween()?.progress(1);timeline!.progress(at);render();};seek(heldProgress);
    if(originRole){
     const actor=actors[originRole],r=actor.getBoundingClientRect(),s=stage.getBoundingClientRect();
     if(Number(gsap.getProperty(actor,'opacity'))<.5||r.left<s.left-1||r.right>s.right+1||r.top<s.top-1||r.bottom>s.bottom+1){
      // Responsive edits can omit a secondary look from the current shot.
      // Return to its nearest complete shot, keeping the actual source door.
      const resting=shotMap().filter(shot=>{const p=shot.poses[originRole!];return p&&p.opacity!==0&&p.x>0&&p.x<1&&(p.floor??.97)>0&&(p.floor??.97)<=1;}).sort((a,b)=>Math.abs(a.at-heldProgress)-Math.abs(b.at-heldProgress))[0];
      if(resting)seek(resting.at);
     }
    }
   }
  }else timeline?.scrollTrigger?.update();
  originRole=undefined;paint();return changed;
 },paint};
}
