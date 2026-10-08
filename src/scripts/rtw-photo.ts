/** Read-only geometric window over a studio source. No photo pixels are changed. */
export function paintRtwPhoto(photo: HTMLElement, view: number, visualHeight = photo.clientHeight) {
  const split = Number(photo.dataset.split);
  if (split === 1) return;
  const image = photo.querySelector<HTMLElement>('img')!;
  const width = visualHeight * Number(photo.style.getPropertyValue('--aspect'));
  const aperture = visualHeight * Number(photo.style.getPropertyValue('--aspect')) * Number(photo.style.getPropertyValue('--window'));
  const front = photo.dataset.front!.split(',').map(Number);
  const back = photo.dataset.back!.split(',').map(Number);
  const left = front[0] + view*(back[0]-front[0]);
  const crop = front[1]-front[0] + view*((back[1]-back[0])-(front[1]-front[0]));
  const empty = Math.max(0,(aperture - crop * width)/2);
  image.style.transform=`translate3d(${(aperture-crop*width)/2-left*width}px,0,0)`;
  photo.style.clipPath=`inset(0 ${empty}px 0 ${empty}px)`;
  photo.dataset.side=view>.5?'back':'front';
}
