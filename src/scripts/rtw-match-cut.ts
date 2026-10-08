import { paintRtwPhoto } from './rtw-photo';
/** Measured garment continuity, shared by entry and return. The router still
 * owns addresses, focus and scroll. Only the RTW image and white floor animate.
 */
let cleanup: (() => void) | null = null;
export function cancelRtwMatchCut() { cleanup?.(); }
export function rtwMatchCut(reader: HTMLElement, source: HTMLElement, entering: boolean, reduced: boolean, finished?: () => void) {
  cleanup?.();
  const target = reader.querySelector<HTMLElement>('[data-rtw-photo]');
  if (!target) { finished?.(); return; }
  if(!entering) {
    const view=reader.querySelector<HTMLElement>('[data-rtw-view][aria-pressed="true"]')?.dataset.rtwView ?? target.style.getPropertyValue('--view') ?? '0';
    target.style.setProperty('--view',view);paintRtwPhoto(target,Number(view));
    source.style.setProperty('--view',view);source.dataset.returnView=view;paintRtwPhoto(source,Number(view));
    const caption=source.closest('[data-rtw-stage]')?.querySelector('[data-rtw-side]');
    if(caption) caption.textContent=Number(view)>.5?'BACK':'FRONT';
  }
  const from = entering ? source : target;
  const to = entering ? target : source;
  // Use the current source view when entering; the reader opens on the same evidence.
  if (entering) {
    const view = source.style.getPropertyValue('--view') || '0';
    target.style.setProperty('--view',view);
    paintRtwPhoto(target,Number(view));
    reader.querySelectorAll<HTMLElement>('[data-rtw-view]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.rtwView)===Math.round(Number(view)))));
  }
  if(reduced) { finished?.(); return; }
  const a=from.getBoundingClientRect(), b=to.getBoundingClientRect();
  if (!a.width || !b.width) { finished?.(); return; }
  const clone=from.cloneNode(true) as HTMLElement;
  clone.setAttribute('aria-hidden','true');
  clone.classList.add('rtw-match'); clone.removeAttribute('data-rtw-photo'); clone.removeAttribute('data-door-source');
  Object.assign(clone.style,{left:`${a.left}px`,top:`${a.top}px`,width:`${a.width}px`,height:`${a.height}px`,transform:'none'});
  // Freeze the computed image transform so the clone's crop matches exactly.
  const image=clone.querySelector<HTMLElement>('img');
  if(image) image.style.height=`${a.height}px`;
  paintRtwPhoto(clone,Number(from.style.getPropertyValue('--view'))||0,a.height);
  document.body.append(clone);
  const oldVisibility=target.style.visibility; target.style.visibility='hidden';
  const oldSourceVisibility=source.style.visibility; source.style.visibility='hidden';
  const duration=560, easing='cubic-bezier(.22,.68,.18,1)';
  const garment=clone.animate([{transform:'translate3d(0,0,0) scale(1)'},{transform:`translate3d(${b.left-a.left}px,${b.top-a.top}px,0) scale(${b.width/a.width},${b.height/a.height})`}],{duration,easing,fill:'forwards'});
  const floor=reader.animate(entering ? [{opacity:0},{opacity:1}] : [{opacity:1},{opacity:0}],{duration,easing,fill:'forwards'});
  let done=false;
  const finish=(complete:boolean)=>{if(done)return;done=true;clone.remove();target.style.visibility=oldVisibility;source.style.visibility=oldSourceVisibility;garment.cancel();floor.cancel();cleanup=null;if(complete)finished?.();};
  cleanup=()=>finish(false); garment.onfinish=()=>finish(true);
}
