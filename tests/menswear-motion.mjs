import{chromium}from'playwright';import{installFonts,fontsReady}from'./fixtures/fonts.mjs';import{mkdirSync,writeFileSync}from'node:fs';
const base='http://127.0.0.1:4393',out='.qa-director/menswear-production/motion';mkdirSync(out,{recursive:true});const b=await chromium.launch();
async function finger(p,x,y,dx,dy){const cd=await p.context().newCDPSession(p);await cd.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=24;i++){await cd.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/24,y:y+dy*i/24}]});await p.waitForTimeout(18);}await p.waitForTimeout(180);await cd.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cd.detach();}
for(const[width,height]of(process.env.MENSWEAR_MOTION_WIDTH==='390'?[[390,844]]:[[1440,900],[390,844]])){
 const c=await b.newContext({viewport:{width,height},isMobile:width<500,hasTouch:width<500,recordVideo:{dir:out,size:{width,height}}});await installFonts(c);const p=await c.newPage();await p.goto(base+'/portfolio/#menswear/m-streetwear');await fontsReady(p);await p.waitForTimeout(800);
 for(const world of ['m-streetwear','m-activewear','m-rtw','m-tailoring']){
  if(world!=='m-streetwear'){await p.locator('[data-mw-worlds-toggle]').click();await p.locator(`[data-mw-world-link="${world}"]`).click();await p.waitForTimeout(500);}
  const stage=p.locator('[data-mw-film][data-current] [data-mw-experience]');await stage.focus();
  if(width<500){await finger(p,220,650,0,-280);await p.waitForTimeout(300);await p.locator('[data-mw-scene="0"]').click();await p.waitForTimeout(1000);}
  else{await p.mouse.move(1050,500);await p.mouse.wheel(0,190);await p.waitForTimeout(350);await p.locator('[data-mw-scene="0"]').click();await p.waitForTimeout(1000);}
  await p.locator('[data-mw-present]').click();for(let n=1;n<5;n++){await p.keyboard.press('PageDown');await p.waitForTimeout(1300);}await p.waitForTimeout(400);
  await p.keyboard.press('Escape');await p.locator('[data-mw-archive-open]').click();await p.waitForTimeout(250);
  if(width<500)await finger(p,320,430,-190,0);else{await p.locator('[data-mw-film][data-current] .mw-rail').focus();await p.keyboard.press('ArrowRight');await p.waitForTimeout(350);}
  const door=p.locator('[data-mw-film][data-current] [data-mw-archive-door]').nth(2);await door.scrollIntoViewIfNeeded();await door.click();await p.waitForTimeout(750);const reader=p.locator('[data-mw-reader]:not([hidden])');await reader.locator('[data-rd-inspect]').click();await reader.locator('[data-mw-zoom-by="1.4"]').click();await p.waitForTimeout(300);await reader.locator('[data-mw-fit]').click();await p.keyboard.press('Escape');await p.keyboard.press('Escape');await p.waitForTimeout(650);
 }
 await p.locator('[data-mw-worlds-toggle]').click();await p.locator('[data-mw-world-link="m-streetwear"]').click();await p.waitForTimeout(400);await p.locator('[data-mw-scene="4"]').click();await p.waitForTimeout(140);await p.locator('[data-mw-scene="1"]').click();await p.waitForTimeout(160);await p.locator('[data-mw-scene="3"]').click();await p.waitForTimeout(1200);await p.waitForTimeout(300);
 const v=await p.video().path();await c.close();writeFileSync(`${out}/${width}-video.txt`,v);console.log(width,v);
}
await b.close();
