let cancelCurrent:(()=>void)|null=null;
export const cancelGarmentMatchCut=()=>{cancelCurrent?.();};
/** Open the existing opaque reader from its exhibition frame. Fashion and
 * technical photographs are different views: never morph one into the other
 * or create a second enlarged-image surface. */
export function garmentMatchCut(reader:HTMLElement,source:HTMLElement,entering:boolean,instant:boolean,finished:()=>void){
 cancelCurrent?.();
 if(instant){finished();return;}
 const box=source.getBoundingClientRect();
 if(!box.width||!box.height){finished();return;}
 const pct=(n:number,of:number)=>`${Math.max(0,Math.min(100,n/of*100))}%`;
 const crop=`inset(${pct(box.top,innerHeight)} ${pct(innerWidth-box.right,innerWidth)} ${pct(innerHeight-box.bottom,innerHeight)} ${pct(box.left,innerWidth)})`;
 const full='inset(0% 0% 0% 0%)';
 const animation=reader.animate(entering?[{clipPath:crop},{clipPath:full}]:[{clipPath:full,opacity:1},{clipPath:crop,opacity:0}],{duration:entering?320:220,easing:'cubic-bezier(.22,.68,.18,1)'});
 const cancel=()=>{animation.cancel();if(cancelCurrent===cancel)cancelCurrent=null;};cancelCurrent=cancel;
 animation.onfinish=()=>{cancel();finished();};
}
