/** Real touch: horizontal edit browsing must leave vertical category travel free. */
import assert from 'node:assert/strict';import {chromium} from 'playwright';import {installFonts,fontsReady} from './fixtures/fonts.mjs';
const base=process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:4339',b=await chromium.launch();let checks=0;const check=(x,m)=>{assert.ok(x,m);checks++;};
try{const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});await installFonts(c);const p=await c.newPage();
const swipe=async(x,y,dx,dy)=>{const cd=await c.newCDPSession(p);await cd.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let n=1;n<=10;n++){await cd.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*n/10,y:y+dy*n/10}]});await p.waitForTimeout(15);}await cd.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cd.detach();await p.waitForTimeout(200);};
for(const chapter of ['womenswear','menswear']){
 await p.goto(base+'/portfolio/#'+chapter);await fontsReady(p);
 const root=p.locator(chapter==='womenswear'?'[data-ww-exhibition=casualwear]':'[data-mw-film=m-streetwear]'),rail=root.locator('.ww-rail,.mw-rail'),scroller=p.locator(chapter==='womenswear'?'[data-world=womenswear]':'[data-mw-scroll]');
 if(chapter==='womenswear')await root.locator('[data-edit-browse]').click();else await p.locator('[data-mw-archive-open]').click();
 await rail.evaluate(e=>e.scrollLeft=0);const box=await rail.boundingBox();await swipe(320,Math.min(600,box.y+100),-240,0);
 check(await rail.evaluate(e=>e.scrollLeft)>70,chapter+' horizontal touch reveals remainder');
 const top=await scroller.evaluate(e=>e.scrollTop);await swipe(382,680,0,-330);check(await scroller.evaluate(e=>e.scrollTop)>top+100,chapter+' vertical swipe continues towards next category');
 check(await p.locator('[data-ww-reader]:not([hidden]),[data-mw-reader]:not([hidden])').count()===0,chapter+' gestures do not open a garment');
}
await c.close();console.log(checks+' native horizontal/vertical touch checks passed');}finally{await b.close();}
