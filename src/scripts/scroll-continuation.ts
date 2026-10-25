/** Native scrolling does the traversal. Only an additional gesture at the
 * chapter boundary asks the existing router for the following chapter. */
export function initScrollContinuation(scroller:HTMLElement,isActive:()=>boolean,next:string){
 let delta=0,startY:number|null=null;
 const atEnd=()=>scroller.scrollTop+scroller.clientHeight>=scroller.scrollHeight-3;
 const handoff=()=>{delta=0;startY=null;scroller.dispatchEvent(new CustomEvent('pf:world-handoff',{bubbles:true,detail:next}));};
 scroller.addEventListener('wheel',e=>{
  if(!isActive()||!atEnd()||e.deltaY<=0||e.ctrlKey){delta=0;return;}
  delta+=e.deltaY;if(delta>=80)handoff();
 },{passive:true});
 scroller.addEventListener('touchstart',e=>{startY=isActive()&&atEnd()&&e.touches.length===1?e.touches[0].clientY:null;},{passive:true});
 scroller.addEventListener('touchmove',e=>{if(startY!==null&&isActive()&&e.touches.length===1&&startY-e.touches[0].clientY>=48)handoff();},{passive:true});
 scroller.addEventListener('touchend',()=>startY=null,{passive:true});
 scroller.addEventListener('keydown',e=>{
  if(e.defaultPrevented||!isActive()||!atEnd()||(e.target as HTMLElement).closest('a,button,input,textarea,select,summary,[contenteditable=true]'))return;
  if(e.key==='PageDown'||e.key==='ArrowDown'||(e.key===' '&&!e.shiftKey)){e.preventDefault();handoff();}
 });
}
