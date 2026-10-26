/** Direct featured and historical URLs must not borrow another clicked source. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {installFonts,fontsReady} from './fixtures/fonts.mjs';
import {featuredWomenswearIdentity,selectedWomenswear} from './fixtures/womenswear-presentation.mjs';

const base=process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:4431';
const clicked=featuredWomenswearIdentity('rtw-ref-02');
const historical='rtw-ref-03',selected=selectedWomenswear(historical);
const targets=[{id:historical,src:'/portfolio/woven/3-1400.webp',featured:!selected}];
if(selected)targets.push({id:selected.id,src:selected.image.src,featured:true});
const browser=await chromium.launch();let checks=0;
try{
 for(const [width,height] of [[1440,900],[390,844]]){
  const context=await browser.newContext({viewport:{width,height}});
  await installFonts(context);const page=await context.newPage();
  for(const target of targets){
   await page.goto(base+'/portfolio/#womenswear/casualwear');await fontsReady(page);
   const reader=page.locator(`[data-subject="${target.id}"]`);
   await reader.locator('img').first().evaluate(image=>{image.loading='eager';return image.decode();});
   const clickedDoor=page.locator(`[data-ww-exhibition=casualwear] .ww-rail [data-open-subject="${clicked}"]`);await clickedDoor.scrollIntoViewIfNeeded();await clickedDoor.click();
   await page.waitForFunction(id=>{const reader=document.querySelector(`[data-subject="${id}"]`);return !reader.hidden&&!reader.hasAttribute('data-ww-moving');},clicked);
   await page.evaluate(id=>location.hash='#womenswear/rtw/'+id,target.id);
   await reader.waitFor({state:'visible'});
   assert(!await reader.evaluate(element=>element.hasAttribute('data-ww-moving')),'direct route must not animate from a different subject');checks++;
   assert.equal(await page.locator('.ww-match').count(),0);checks++;
   assert.equal(await reader.locator('img').first().getAttribute('src'),target.src,'direct route retains its own exact image');checks++;
   await page.keyboard.press('Escape');await reader.waitFor({state:'hidden'});
   if(target.featured){
    assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('data-open-subject')),target.id,'featured route returns to its own occurrence');
   }else{
    assert(await page.locator('[data-act-toggle]').evaluate(element=>element===document.activeElement),'historical route without a visible source returns to the category control');
   }
   checks++;
  }
  await context.close();
 }
 console.log(checks+' direct-route source identity checks passed');
}finally{await browser.close();}
