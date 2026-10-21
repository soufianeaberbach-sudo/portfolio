/** A reversible geometric window over the production source. Pixels and metadata are untouched. */
export function paintPhoto(photo:HTMLElement,view=Number(photo.style.getPropertyValue('--view'))||0){
 const split=Number(photo.dataset.split),image=photo.querySelector<HTMLImageElement>('img');if(!image)return;
 const width=photo.clientHeight*Number(photo.style.getPropertyValue('--aspect'));
 if(split===1){image.style.transform='';photo.style.clipPath='';return;}
 const front=photo.dataset.front!.split(',').map(Number),back=photo.dataset.back!.split(',').map(Number);
 const regions=[front,back,...(photo.dataset.third?[photo.dataset.third.split(',').map(Number)]:[])],at=Math.max(0,Math.min(regions.length-1,view)),a=regions[Math.floor(at)],b=regions[Math.ceil(at)],t=at-Math.floor(at);
 const left=a[0]+t*(b[0]-a[0]);
 const fraction=a[1]-a[0]+t*((b[1]-b[0])-(a[1]-a[0])),aperture=photo.clientWidth;
 const empty=Math.max(0,(aperture-width*fraction)/2);
 image.style.transform=`translateX(${(aperture-width*fraction)/2-left*width}px)`;
 photo.style.clipPath=`inset(0 ${empty}px 0 ${empty}px)`;photo.dataset.side=at>1.5?'third':at>.5?'back':'front';
}
