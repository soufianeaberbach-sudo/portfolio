/* Deterministic A4 CV production: source text -> browser PNG -> matching PDF.
   Original crisp portrait; canonical owner data; editable approved-model adaptation. */
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const DIR = fileURLToPath(new URL('./', import.meta.url));
const OUT = resolve(ROOT, process.env.CV_OUTPUT_DIR || 'public/cv');
const QA = resolve(ROOT, process.env.CV_QA_DIR || '.qa-director/cv');
const layoutPreview = process.argv.includes('--layout-preview');
const localeIndex=process.argv.indexOf('--locale');
const requestedLocales=localeIndex>=0?[process.argv[localeIndex+1]]:['en','fr','es'];
if(requestedLocales.some(l=>!['en','fr','es'].includes(l)))throw new Error('Supported CV locales: en, fr, es.');
if (layoutPreview && OUT.startsWith(resolve(ROOT, 'public'))) throw new Error('Layout previews must stay outside public/.');
const sourceBytes=await readFile(join(DIR,'career.json'));
const sourceSHA256=createHash('sha256').update(sourceBytes).digest('hex');
const data=JSON.parse(sourceBytes.toString('utf8'));
const template = await readFile(join(DIR, 'template.html'), 'utf8');
const productionSources={};
for(const file of ['template.html','render.mjs','fashion-signature.svg'])productionSources[file]=createHash('sha256').update(await readFile(join(DIR,file))).digest('hex');
const portraitSource = JSON.parse(await readFile(join(DIR, 'portrait-source.json'), 'utf8'));
const portraitPath = join(DIR, portraitSource.file);
const portraitBytes = await readFile(portraitPath);
const portraitSHA256 = createHash('sha256').update(portraitBytes).digest('hex');
if (portraitSHA256 !== portraitSource.sourceSHA256) throw new Error('Portrait differs from the owner attachment recorded in portrait-source.json.');
const contentVerified=data.authoritativeSource?.status==='owner-confirmed'&&data.contentVerification?.status==='owner-confirmed-canonical' && data.roles.every(r=>r.factSource==='owner-confirmed-and-current-site' && Object.values(r.scope).every(lines=>lines.length===0));
if(!contentVerified&&!layoutPreview)throw new Error('Unverified career claims cannot be released. Inspect the primary source or restrict content to documented owner/site facts.');
if(!data.workflow?.englishVisualApproved&&requestedLocales.some(l=>l!=='en'))throw new Error('Render and review the English master before producing French or Spanish. Use --locale en.');
if(!layoutPreview&&!requestedLocales.every(l=>data.workflow?.approvedLocales?.includes(l)))throw new Error('Owner visual review is required before replacing public CV files.');
const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const imageURI = async (file) => 'data:image/' + (file.endsWith('.png') ? 'png' : 'jpeg') + ';base64,' + (await readFile(file)).toString('base64');
const fontSpecs = [
  ['Archivo', '400 900', 'k3kQo8UDI-1M0wlSfdnoLmvDIaI.woff2'],
  ['Inter', '400 900', 'UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7W0Q5nw.woff2'],
];
let fonts = '';
for (const [family, weight, file] of fontSpecs) {
  const binary = await readFile(join(ROOT, 'tests/fixtures/fonts', file));
  fonts += `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};font-stretch:75% 125%;src:url(data:font/woff2;base64,${binary.toString('base64')}) format('woff2');font-display:block}`;
}
// Record 300 DPI as PNG pHYs metadata without resampling a single pixel.
const printResolution = async (path) => {
  const png = await readFile(path);
  const payload = Buffer.alloc(9);
  payload.writeUInt32BE(11811, 0); payload.writeUInt32BE(11811, 4); payload[8] = 1;
  const content = Buffer.concat([Buffer.from('pHYs'), payload]);
  let crc = 0xffffffff;
  for (const b of content) { crc ^= b; for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0); }
  const chunk = Buffer.alloc(21);
  chunk.writeUInt32BE(9, 0); content.copy(chunk, 4); chunk.writeUInt32BE((crc ^ 0xffffffff) >>> 0, 17);
  await writeFile(path, Buffer.concat([png.subarray(0, 33), chunk, png.subarray(33)]));
};
const browser = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
try {
  await mkdir(OUT, { recursive: true });
  await mkdir(QA, { recursive: true });
  let portrait = await imageURI(portraitPath);
  const probe = await browser.newPage();
  await probe.setContent(`<img src="${portrait}">`);
  const color = await probe.locator('img').evaluate(async img => {
    await img.decode();const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
    const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;let colored=0;
    for(let i=0;i<pixels.length;i+=4)if(Math.max(pixels[i],pixels[i+1],pixels[i+2])-Math.min(pixels[i],pixels[i+1],pixels[i+2])>12)colored++;
    return {fraction:colored/(canvas.width*canvas.height),width:canvas.width,height:canvas.height};
  });
  await probe.close();
  if(color.fraction<.03)throw new Error('Original color portrait required. Monochrome portrait input is prohibited, including in design proofs.');
  if(layoutPreview){
    console.log('English master for owner visual review; canonical data and original unmodified color portrait. No public asset replacement.');
  }
  const report = [];
  const siteCSS=await readFile(join(ROOT,'src/styles/global.css'),'utf8');
  const brandCSS=siteCSS.match(/\.brand \{[^}]+\}/)[0]+'\n'+siteCSS.match(/\.brand i \{[^}]+\}/)[0];
  const fashionSignature=await readFile(join(DIR,'fashion-signature.svg'),'utf8');
  for (const locale of requestedLocales) {
    const t = data.editions[locale];
    const month = (iso) => {
      if (!iso) return t.present;
      const [year, m] = iso.split('-');
      const names = {
        en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        fr: ['Janv.','Févr.','Mars','Avr.','Mai','Juin','Juil.','Août','Sept.','Oct.','Nov.','Déc.'],
        es: ['Ene.','Feb.','Mar.','Abr.','May.','Jun.','Jul.','Ago.','Sep.','Oct.','Nov.','Dic.'],
      };
      return names[locale][Number(m) - 1] + ' ' + year;
    };
    const renderRole=(role,i)=>`<article class="role ${i===0?'role--current':''}" data-role="${role.id}"><div class="role__head"><h3 class="role__company">${escape(role.company)}${role.location?` <span class="role__location">· ${escape(role.location[locale])}</span>`:''}</h3><p class="role__meta"><time datetime="${role.start}">${escape(month(role.start))}</time> – ${role.end?`<time datetime="${role.end}">${escape(month(role.end))}</time>`:escape(t.present)}</p></div><p class="role__title">${escape(role.title[locale])}</p></article>`;
    const roles=data.roles.map(renderRole).join('');
    const expertise=t.expertiseItems.map(s=>`<li>${escape(s)}</li>`).join('');
    const displayTitle = t.displayTitle.map((line) => `<span>${escape(line)}</span>`).join('');
    const software=data.software.map(s=>`<li>${escape(s)}</li>`).join('');
    const languages=t.languageItems.map(s=>`<li>${escape(s)}</li>`).join('');
    const fields = { ...t, displayTitle, locale, title: data.roles[0].title[locale], email: data.email, roles, expertise, fonts, brandCSS, fashionSignature, portrait, languages, practice:t.practice.map(p=>`<p>${escape(p)}</p>`).join(''), software };
    const raw = new Set(['displayTitle', 'fonts', 'brandCSS', 'fashionSignature', 'roles', 'expertise', 'software', 'portrait', 'languages','practice']);
    const html = template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      if (!(key in fields)) throw new Error('Missing template field: ' + key);
      return raw.has(key) ? fields[key] : escape(fields[key]);
    });
    const stem = `Soufiane-Aberbach-CV-${locale.toUpperCase()}`;
    const p = await browser.newPage({ viewport: { width: 2480, height: 3508 }, deviceScaleFactor: 1 });
    await p.setContent(html);
    await p.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((i) => i.decode())); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); });
    const geometry = await p.evaluate(() => {
      const footer = document.querySelector('.footer').getBoundingClientRect();
      const lastRole = {bottom:Math.max(...[...document.querySelectorAll('[data-flow]')].map(n=>n.getBoundingClientRect().bottom))};
      const languages = document.querySelector('.languages').getBoundingClientRect();
      const sheet = document.querySelector('.sheet').getBoundingClientRect();
      const photo = document.querySelector('.portrait').getBoundingClientRect();
      const text = [...document.querySelectorAll('h1,h2,h3,p,a,time,span,li')].filter((n) => n.textContent.trim());
      const clipped = text.filter((n) => { const r = n.getBoundingClientRect(); return r.left < 40 || r.right > sheet.width - 40 || r.bottom > footer.top && !n.closest('.footer') ; }).map((n) => n.textContent.trim());
      const signature=document.querySelector('.fashion-signature').getBoundingClientRect();
      const photoStyle=getComputedStyle(document.querySelector('.portrait'));
      const copyRight=Math.max(...[...document.querySelectorAll('.role__head,.role__title,.practice p')].map(n=>n.getBoundingClientRect().right));
      return { footerTop: footer.top, lastRoleBottom: lastRole.bottom, languagesBottom: languages.bottom, sheet: {width:sheet.width,height:sheet.height}, clipped, copyRight, brand:document.querySelector('.brand').getBoundingClientRect().toJSON(), portrait:{x:photo.x,y:photo.y,width:photo.width,height:photo.height,filter:photoStyle.filter,maskImage:photoStyle.maskImage}, signature:{x:signature.x,y:signature.y,width:signature.width,height:signature.height,opacity:getComputedStyle(document.querySelector('.fashion-signature g')).opacity}, fonts: [...document.fonts].map((f) => ({ family: f.family, status: f.status })) };
    });
    if (geometry.clipped.length || geometry.lastRoleBottom > geometry.footerTop - 15 || geometry.languagesBottom > geometry.footerTop - 15 || geometry.fonts.some((f) => f.status !== 'loaded')) throw new Error(`${locale}: layout QA failed: ${JSON.stringify(geometry)}`);
    await writeFile(join(QA, `${stem}.html`), html);
    await p.evaluate(() => document.documentElement.dataset.render = 'png');
    await p.screenshot({ path: join(OUT, `${stem}.png`) });
    await printResolution(join(OUT, `${stem}.png`));
    // Retain the identical source text as a tagged searchable layer. Final
    // PDF production happens only after the image review, via finalize.py.
    await p.evaluate(() => { delete document.documentElement.dataset.render; });
    await p.pdf({ path: join(QA, `${stem}-text.pdf`), width: '210mm', height: '297mm', margin: {top:0,left:0,right:0,bottom:0}, printBackground: true, preferCSSPageSize: true, tagged: true, outline: true });
    report.push({locale, stem, sourceSHA256, portraitSHA256, productionSources, layoutPreview, careerVerified:contentVerified, linkedinVerified:false, ownerVisualApproved:data.workflow.approvedLocales.includes(locale), portraitColor:color, geometry});
    await p.close();
    console.log(`${stem}: PNG 2480 × 3508 @ 300 DPI; searchable source retained for final PDF.`);
  }
  await writeFile(join(QA, 'layout-report.json'), JSON.stringify(report, null, 2) + '\n');
  if(!layoutPreview)await writeFile(join(DIR,'export-layout.json'),JSON.stringify(report,null,2)+'\n');
} finally { await browser.close(); }
