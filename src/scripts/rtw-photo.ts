/** A reversible geometric window over the production source. Pixels and metadata are untouched. */
export function paintRtwPhoto(photo:HTMLElement,view=Number(photo.style.getPropertyValue('--view'))||0){
 const split=Number(photo.dataset.split),image=photo.querySelector<HTMLImageElement>('img');if(!image)return;
 const width=photo.clientHeight*Number(photo.style.getPropertyValue('--aspect'));
 if(split===1){image.style.transform='';photo.style.clipPath='';return;}
 const front=photo.dataset.front!.split(',').map(Number),back=photo.dataset.back!.split(',').map(Number);
 const left=front[0]+view*(back[0]-front[0]);
 const fraction=front[1]-front[0]+view*((back[1]-back[0])-(front[1]-front[0])),aperture=photo.clientWidth;
 const empty=Math.max(0,(aperture-width*fraction)/2);
 image.style.transform=`translate3d(${(aperture-width*fraction)/2-left*width}px,0,0)`;
 photo.style.clipPath=`inset(0 ${empty}px 0 ${empty}px)`;photo.dataset.side=view>.5?'back':'front';
}
