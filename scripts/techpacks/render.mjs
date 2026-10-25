import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const records=JSON.parse(await fs.readFile(path.join(root,'src/data/techpacks.json'),'utf8'));
const executablePath=process.env.TECHPACK_CHROMIUM;
const browser=await chromium.launch({...(executablePath?{executablePath}:{}),args:['--no-sandbox']});
const results=[];
try {
 for(const r of records){
  const page=await browser.newPage();
  await page.setContent(await fs.readFile(path.join(root,'.work/techpacks',r.slug+'.html'),'utf8'));
  await page.evaluate(()=>document.fonts.ready);
  const overflow=await page.evaluate(()=>[...document.querySelectorAll('.sheet')].flatMap(sheet=>{
   const body=sheet.querySelector('.content');const limit=body.getBoundingClientRect();
   const bad=[...body.querySelectorAll('table,.operation,.method,.box,.note-row,p,li')].filter(el=>{const b=el.getBoundingClientRect();return b.bottom>limit.bottom+2||b.right>limit.right+2;}).map(el=>el.textContent.slice(0,100));
   return bad.length?[{page:sheet.dataset.page,bad}]:[];
  }));
  const dest=path.join(root,'public',r.pdfUrl);await fs.mkdir(path.dirname(dest),{recursive:true});
  await page.pdf({path:dest,preferCSSPageSize:true,printBackground:true,tagged:true,outline:true});
  results.push({slug:r.slug,pages:r.pageCount,overflow});
  await page.close();
 }
}finally{await browser.close();}
await fs.mkdir(path.join(root,'docs/techpacks/review'),{recursive:true});
await fs.writeFile(path.join(root,'docs/techpacks/review/layout-results.json'),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify(results,null,2));
if(results.some(r=>r.overflow.length))process.exitCode=1;
