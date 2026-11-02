/* Deterministic A4 CV production: source text -> browser PNG -> matching PDF.
   No model-generated text or imagery. See README.md for the portrait workflow. */
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
const data = JSON.parse(await readFile(join(DIR, 'career.json'), 'utf8'));
const template = await readFile(join(DIR, 'template.html'), 'utf8');
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
  const preparationIndex = process.argv.indexOf('--prepare-portrait');
  if (preparationIndex >= 0) {
    const original = resolve(process.argv[preparationIndex + 1]);
    const p = await browser.newPage({ viewport: { width: 435, height: 573 }, deviceScaleFactor: 1 });
    await p.setContent(`<style>*{margin:0}img{display:block;width:435px;height:573px;object-fit:cover;object-position:center 31%;filter:grayscale(1)}</style><img src="${await imageURI(original)}">`);
    await p.locator('img').evaluate((img) => img.decode());
    await p.screenshot({ path: join(DIR, 'portrait.png') });
    await p.close();
    console.log('Prepared a cropped monochrome derivative; original was not copied into the repository.');
  }
  const portrait = await imageURI(join(DIR, 'portrait.png'));
  const report = [];
  for (const locale of ['en', 'fr', 'es']) {
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
    const roles = data.roles.map((role, i) => `<article class="role ${i === 0 ? 'role--current' : ''}" data-role="${role.id}"><p class="role__meta"><time datetime="${role.start}">${escape(month(role.start))}</time> – ${role.end ? `<time datetime="${role.end}">${escape(month(role.end))}</time>` : escape(t.present)}</p><h3 class="role__company">${escape(role.company)}</h3><p class="role__title">${escape(role.title[locale])}</p></article>`).join('');
    const skills = t.skills.map((g) => `<div class="skill-group"><h3>${escape(g.heading)}</h3><p>${g.items.map(escape).join('<br>')}</p></div>`).join('');
    const displayTitle = t.displayTitle.map((line) => `<span>${escape(line)}</span>`).join('');
    const fields = { ...t, displayTitle, locale, title: data.roles[0].title[locale], email: data.email, roles, skills, fonts, portrait, software: [data.software.slice(0, 2), data.software.slice(2, 5), data.software.slice(5)].map((line) => line.map(escape).join(' · ')).join('<br>') };
    const raw = new Set(['displayTitle', 'fonts', 'roles', 'skills', 'software', 'portrait']);
    const html = template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      if (!(key in fields)) throw new Error('Missing template field: ' + key);
      return raw.has(key) ? fields[key] : escape(fields[key]);
    });
    const stem = `Soufiane-Aberbach-CV-${locale.toUpperCase()}`;
    const p = await browser.newPage({ viewport: { width: 2480, height: 3508 }, deviceScaleFactor: 1 });
    await p.setContent(html);
    await p.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((i) => i.decode())); });
    const geometry = await p.evaluate(() => {
      const footer = document.querySelector('.footer').getBoundingClientRect();
      const lastRole = document.querySelector('.role:last-child').getBoundingClientRect();
      const languages = document.querySelector('.languages').getBoundingClientRect();
      const sheet = document.querySelector('.sheet').getBoundingClientRect();
      const text = [...document.querySelectorAll('h1,h2,h3,p,a,time,span')].filter((n) => n.textContent.trim());
      const clipped = text.filter((n) => { const r = n.getBoundingClientRect(); return r.left < 40 || r.right > sheet.width - 40 || r.bottom > footer.top && !n.closest('.footer'); }).map((n) => n.textContent.trim());
      return { footerTop: footer.top, lastRoleBottom: lastRole.bottom, languagesBottom: languages.bottom, sheet: {width:sheet.width,height:sheet.height}, clipped, fonts: [...document.fonts].map((f) => ({ family: f.family, status: f.status })) };
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
    report.push({locale, stem, geometry});
    await p.close();
    console.log(`${stem}: PNG 2480 × 3508 @ 300 DPI; searchable source retained for final PDF.`);
  }
  await writeFile(join(QA, 'layout-report.json'), JSON.stringify(report, null, 2) + '\n');
} finally { await browser.close(); }
