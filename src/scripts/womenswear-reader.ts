import {garmentMatchCut,cancelGarmentMatchCut} from './garment-match-cut';
import {initWomenswearExhibition} from './womenswear-exhibition';
import {initPhotoInspection} from './photo-inspection';
import {initScrollContinuation} from './scroll-continuation';
export function initWomenswear(root:HTMLElement){
 const exhibitions=[...root.querySelectorAll<HTMLElement>('[data-ww-exhibition]')];if(!exhibitions.length)return null;
 const world=exhibitions[0].closest<HTMLElement>('[data-world]')!,cameras=exhibitions.map(initWomenswearExhibition),reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const readers=[...world.querySelectorAll<HTMLElement>('[data-ww-reader]')],states=new Map(readers.map(reader=>[reader,initPhotoInspection(reader)]));
 let active:HTMLElement|null=null,entryInterrupted=false,epoch=0,returnFinish:(()=>void)|null=null;
 initScrollContinuation(world,()=>world.hasAttribute('data-open')&&!active,'#menswear');
 const floor=[...world.querySelector<HTMLElement>('[data-screen=index]')!.children].filter(e=>!e.classList.contains('pf-rd')) as HTMLElement[];
 const setInert=(on:boolean,source:HTMLElement|null=null)=>{
  for(const part of floor)part.inert=on;let resized=false;for(const camera of cameras)resized=camera.hold(on,source)||resized;
  if(!on&&resized&&source?.closest('.ww-rail'))source.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});
 };
 for(const reader of readers){
  reader.addEventListener('pf:subject-reset',()=>{states.get(reader)!.reset();if(active===reader){active=null;setInert(false);}});
  reader.addEventListener('focusin',e=>{if(e.target!==reader&&reader.hasAttribute('data-ww-moving')){entryInterrupted=true;cancelGarmentMatchCut();reader.removeAttribute('data-ww-moving');states.get(reader)!.draw();}});
 }
 const cancel=()=>{if(active?.hasAttribute('data-ww-moving'))entryInterrupted=true;cancelGarmentMatchCut();active?.removeAttribute('data-ww-moving');const finish=returnFinish;returnFinish=null;finish?.();epoch++;};
 const settle=()=>{cancel();if(active)states.get(active)!.draw();};window.addEventListener('resize',settle);reduced.addEventListener('change',settle);
 return{
  owns:(reader:HTMLElement)=>reader.hasAttribute('data-ww-reader'),returnHash:(reader:HTMLElement)=>`#${world.id}/${reader.dataset.editorial??reader.dataset.of}`,cancel,
  enter(reader:HTMLElement,source:HTMLElement|null,instant:boolean){
   cancel();entryInterrupted=false;active=reader;setInert(true,source);states.get(reader)!.select();const token=epoch;
   if(source){reader.setAttribute('data-ww-moving','');garmentMatchCut(reader,source,true,instant||reduced.matches,()=>{if(token===epoch){reader.removeAttribute('data-ww-moving');states.get(reader)!.draw();}});}
  },
  leave(reader:HTMLElement,source:HTMLElement|null,instant:boolean,finished:()=>void){
   cancel();const immediate=entryInterrupted||instant;entryInterrupted=false;states.get(reader)!.reset();setInert(false,source);const token=epoch;
   const done=()=>{if(token!==epoch)return;reader.removeAttribute('data-ww-moving');returnFinish=null;if(active===reader)active=null;finished();};returnFinish=done;
   if(source&&location.hash===`#${world.id}/${reader.dataset.editorial??reader.dataset.of}`)garmentMatchCut(reader,source,false,immediate||reduced.matches,done);else done();
  }
 };
}
