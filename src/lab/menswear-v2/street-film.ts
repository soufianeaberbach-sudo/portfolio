/**
 * One source-coordinate camera passage. No image morph, relighting or fake 3D.
 * The booth's actual white wall is the initial obstruction and subsequent room.
 * Stateless paint makes scrubbing, reversing and interruption deterministic.
 */
type Box={x:number;y:number;w:number;h:number};
type Window=[number,number,number,number];
type Context={frame:HTMLElement;root:HTMLElement;position:number;compact:boolean;reduce:boolean;plates:Map<string,HTMLButtonElement>};
const whole:Window=[0,0,1,1],heroWindow:Window=[.24,0,.60,1];
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const smooth=(v:number)=>{const t=clamp(v);return t*t*(3-2*t);};
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const mix=(a:Box,b:Box,t:number):Box=>({x:lerp(a.x,b.x,t),y:lerp(a.y,b.y,t),w:lerp(a.w,b.w,t),h:lerp(a.h,b.h,t)});
function fit(aspect:number,win:Window,w:number,h:number,factor=1,cx=.5):Box{
 const sourceH=Math.min(h*.95/win[3],w*.91/(aspect*win[2]))*factor;
 return{x:w*cx-sourceH*aspect*(win[0]+win[2]/2),y:(h-sourceH*win[3])/2-sourceH*win[1],w:sourceH*aspect,h:sourceH};
}
// A plane clips to its real source window and the stage, never stretches pixels.
function draw(button:HTMLButtonElement,box:Box,w:number,h:number,win:Window=whole,interactive=true){
 const left=Math.max(0,box.x+box.w*win[0]),top=Math.max(0,box.y+box.h*win[1]);
 const right=Math.min(w,box.x+box.w*(win[0]+win[2])),bottom=Math.min(h,box.y+box.h*(win[1]+win[3]));
 const visible=right-left>1&&bottom-top>1;
 const complete=visible&&left>=0&&right<=w&&top>=0&&bottom<=h;
 button.inert=!visible||!interactive;button.tabIndex=visible&&interactive?0:-1;button.setAttribute('aria-hidden',String(!visible||!interactive));button.style.visibility=visible?'visible':'hidden';
 Object.assign(button.style,{left:`${left}px`,top:`${top}px`,width:`${Math.max(0,right-left)}px`,height:`${Math.max(0,bottom-top)}px`,transform:'none'});
 const image=button.querySelector('img')!;
 Object.assign(image.style,{left:`${box.x-left}px`,top:`${box.y-top}px`,width:`${box.w}px`,height:`${box.h}px`});
 button.dataset.fullSource=String(complete&&Math.abs(left-box.x)<.5&&Math.abs(top-box.y)<.5&&Math.abs(right-left-box.w)<.5&&Math.abs(bottom-top-box.h)<.5);
}
function hide(button:HTMLButtonElement){button.inert=true;button.tabIndex=-1;button.setAttribute('aria-hidden','true');button.style.visibility='hidden';}
export function resetStreet(root:HTMLElement){(root.querySelector('[data-frame]') as HTMLElement).style.color='';for(const n of root.querySelectorAll<HTMLElement>('.dc-wing'))n.style.display='none';}
export function paintStreet({frame,root,position,compact,reduce,plates}:Context){
 const w=frame.clientWidth,h=frame.clientHeight;
 // Short authored holds tolerate real wheel/touch quantization without scroll snapping.
 const act=Math.floor(position),fraction=position-act;
 const p=reduce?Math.round(position):Math.min(4,act+clamp((fraction-.08)/.84));
 const cream=plates.get('cream')!,city=plates.get('city')!,booth=plates.get('booth')!,hero=plates.get('statement')!;
 const drawn=new Set<HTMLButtonElement>();
 const drawPhoto=(b:HTMLButtonElement,box:Box,w:number,h:number,win:Window=whole,interactive=true)=>{drawn.add(b);draw(b,box,w,h,win,interactive);};
 const caption=root.querySelector<HTMLElement>('[data-film-caption]')!;
 caption.style.opacity=p<.65?'1':'0';caption.style.visibility=p<.65?'visible':'hidden';
 const roomWin:Window=compact?[.46,.25,.54,.75]:[0,.20,1,.80];
 const hoodie=fit(2/3,whole,w,h,.99),stride=fit(2/3,whole,w,h,.99,compact?.46:.25);
 const room=fit(1200/1680,roomWin,w,h),final=fit(.8,heroWindow,w,h,1),revealed=fit(.8,heroWindow,w,h,.86);
 const wall:Box={x:w*(compact?.925:.58),y:-h*.82,w:h*2.4*(1200/1680),h:h*2.4};
 const ink=p>=3?smooth(p-3):0;
 frame.removeAttribute('data-dark');frame.style.color=ink>.5?'var(--paper)':'var(--ink)';frame.style.background=`rgb(${Math.round(lerp(243,17,ink))} ${Math.round(lerp(240,17,ink))} ${Math.round(lerp(233,15,ink))})`;
 (root.querySelector('[data-gate]') as HTMLElement).style.clipPath='inset(0 100% 0 0)';
 cream.style.zIndex='2';city.style.zIndex='2';booth.style.zIndex='4';hero.style.zIndex='1';
 const leftWing=root.querySelector<HTMLElement>('[data-wing-left]')!,rightWing=root.querySelector<HTMLElement>('[data-wing-right]')!;
 leftWing.style.display=rightWing.style.display='none';leftWing.style.visibility=rightWing.style.visibility='hidden';
 // I → II: one held full look, an editorial cut, a growing photographic limit.
 if(p<=1){
  const q=smooth(p),cut=p<.43;
  if(cut)drawPhoto(cream,hoodie,w,h,whole,true);else drawPhoto(city,stride,w,h,whole,true);
  const hint={...wall,x:w*.97};drawPhoto(booth,mix(hint,wall,q),w,h,whole,false);
 }
 // II → III: the obstruction takes the field before revealing its actual room.
 else if(p<=2){
  const q=p-1;
  if(q<.34){drawPhoto(city,stride,w,h,whole,q<.1);drawPhoto(booth,{...wall,x:lerp(wall.x,-wall.w*.04,smooth(q/.34))},w,h,whole,false);}
  else{
   const q2=smooth((q-.34)/.66),expanded={...wall,x:-wall.w*.04};
   // Source coordinates stay continuous; the final window only trims empty margins.
   drawPhoto(booth,mix(expanded,room,q2),w,h,whole,q2>.99);
   if(q2>.999)drawPhoto(booth,room,w,h,roomWin,true);
  }
 }
 // III → V: one photographic seam opens, then its two leaves clear the field.
 else{
  const reveal=clamp(p-2),release=clamp(p-3),q=smooth(reveal),r=smooth(release);
  drawPhoto(hero,mix(revealed,final,r),w,h,heroWindow,p>=3);
  const src=booth.querySelector('img')!.src,seam=.50;
  for(const [wing,isLeft] of [[leftWing,true],[rightWing,false]] as const){
   const startX=isLeft?room.x+room.w*roomWin[0]:room.x+room.w*seam;
   const endX=isLeft?room.x+room.w*seam:room.x+room.w*(roomWin[0]+roomWin[2]);
   const width=endX-startX,held=isLeft?-width*.55:w-width*.10;
   const destination=isLeft?-width-2:w+2;
   const x=lerp(lerp(startX,held,q),destination,r),y=room.y+room.h*roomWin[1];
   Object.assign(wing.style,{display:p<3.999?'block':'none',visibility:p<3.999?'visible':'hidden',left:`${x}px`,top:`${y}px`,width:`${Math.max(0,width)}px`,height:`${room.h*roomWin[3]}px`});
   const im=wing.querySelector('img')!;if(im.getAttribute('src')!==src)im.src=src;
   Object.assign(im.style,{left:`${room.x-startX}px`,top:`${-room.h*roomWin[1]}px`,width:`${room.w}px`,height:`${room.h}px`});
  }
 }
 // Do not make a still-active focused door inert during a resize/repaint.
 for(const b of plates.values())if(!drawn.has(b))hide(b);
 frame.dataset.filmAct=String(Math.min(4,Math.round(p)));
}
