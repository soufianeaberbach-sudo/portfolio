/* Review capture only. WW_MOTION_ONLY=1 records uninterrupted primary-size takes.
   Default: six exact viewport screenshot sets. Output is ignored local QA data. */
import{photoReady}from'./fixtures/final-photo.mjs';
import{chromium}from'playwright';import{installFonts,fontsReady}from'./fixtures/fonts.mjs';import fs from'node:fs/promises';
const base=process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:4389',out=process.env.WW_CAPTURE_DIR||'.qa-director/womenswear-v2/final',b=await chromium.launch();await fs.mkdir(out,{recursive:true});
const worlds=[['rtw',.16,.60,'rtw-ref-01'],['activewear',.19,.69,'activewear-ref-08'],['streetwear',.18,.64,'streetwear-ref-02'],['evening',.20,.47,'evening-ref-04'],['swimwear',.23,.73,'swimwear-ref-06']];
async function travel(root,value,duration){await root.evaluate(async(e,{value,duration})=>{const w=e.closest('[data-world]'),cam=e.querySelector('[data-ww-camera]'),bar=w.querySelector('.pf-act__bar').offsetHeight,top=w.scrollTop+cam.getBoundingClientRect().top-w.getBoundingClientRect().top-bar,end=top+(cam.offsetHeight-w.clientHeight+bar)*value,start=w.scrollTop,t=performance.now();await new Promise(resolve=>{const tick=()=>{const f=Math.min(1,(performance.now()-t)/duration);w.scrollTo({top:start+(end-start)*(f*f*(3-2*f)),behavior:'instant'});f<1?requestAnimationFrame(tick):resolve();};tick();});},{value,duration});}
for(const[width,height]of [[1440,900],[390,844],[1366,768],[1024,768],[768,1024],[430,932]]){
 if((process.env.WW_MOTION_ONLY||process.env.WW_FILM_ONLY)&&![1440,390].includes(width))continue;
 if(process.env.WW_NO_FILM&&[1440,390].includes(width))continue;
 const film=!!process.env.WW_MOTION_ONLY&&[1440,390].includes(width),c=await b.newContext({viewport:{width,height},isMobile:width<500,hasTouch:width<500,...(film?{recordVideo:{dir:`${out}/raw-${width}`,size:{width,height}}}:{})});await installFonts(c);const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'/portfolio/#womenswear/rtw');await fontsReady(p);await p.waitForTimeout(650);
 for(const[cat,start,mid,id]of worlds){
  if(cat!=='rtw'&&await p.evaluate(()=>location.hash)!==`#womenswear/${cat}`){await p.locator(`[data-act-link=${cat}]`).evaluate(e=>e.click());await p.waitForTimeout(850);}
  const root=p.locator(`[data-ww-exhibition=${cat}]`);await root.locator('.ww-stage img').evaluateAll(imgs=>imgs.forEach(i=>i.loading='eager'));await root.locator('.ww-stage img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
  const shot=async name=>{await p.locator('[data-world][data-open] img').evaluateAll(imgs=>Promise.all(imgs.filter(i=>{const r=i.getBoundingClientRect();return r.width&&r.height&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth;}).map(i=>{i.loading='eager';return i.decode();}))); if(process.env.WW_MOTION_ONLY){await p.waitForTimeout(220);return;}await p.screenshot({path:`${out}/${width}-${cat}-${name}.jpg`,quality:93});};
  await travel(root,0,20);await p.waitForTimeout(320);await shot('opening');
  const keyframes=film?({rtw:[.16,.38,.60,.80,1],activewear:width===390?[.19,.46,.69,.91,1]:[.19,.43,.67,.82,1],streetwear:[.18,.41,.64,.89,1],evening:[.20,.47,.75,1],swimwear:[.23,.55,.73,.95,1]}[cat].map((at,i)=>['shot-'+i,at])):[['start',start],['midpoint',mid],['payoff',1]];
  for(const[name,f]of keyframes){await travel(root,f,film?(cat==='evening'?1100:900):20);await p.waitForTimeout(350);await shot(name);}
  await root.locator('.ww-archive').evaluate(e=>e.scrollIntoView({behavior:'smooth',block:'center'}));await p.waitForTimeout(650);await root.locator('.ww-rail img').evaluateAll(imgs=>imgs.forEach(i=>i.loading='eager'));await root.locator('.ww-rail img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));await shot('archive');
  if(film&&width===390){const box=await root.locator('.ww-rail').boundingBox(),y=box.y+box.height*.5,cd=await c.newCDPSession(p);await cd.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:320,y}]});for(let i=1;i<=8;i++){await cd.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:320-i*25,y}]});await p.waitForTimeout(20);}await cd.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(250);await cd.detach();}
  const door=root.locator(`.ww-rail [data-open-subject=${id}]`);await door.scrollIntoViewIfNeeded();await door.click();await p.waitForTimeout(720);const reader=p.locator('[data-ww-reader]:not([hidden])');await shot('reader');
  if(await reader.locator('[data-ww-view="1"]').count()){await reader.locator('[data-ww-view="1"]').click();await photoReady(reader,1);await p.waitForTimeout(500);await shot('reader-back');await reader.locator('[data-ww-view="2"]').click();await photoReady(reader,2);await p.waitForTimeout(500);await shot('original');await reader.locator('[data-ww-view="0"]').click();await photoReady(reader,0);}
  await reader.locator('[data-rd-inspect]').click();await p.waitForTimeout(180);await shot('closer');await reader.locator('[data-rd-inspect]').click();await reader.locator('[data-subject-close]').click();await p.waitForTimeout(720);await shot('return');
  await root.locator('.ww-handoff').click();await p.waitForTimeout(1000);await shot('handoff');
 }
 console.log(width,errors);await c.close();
}await b.close();
