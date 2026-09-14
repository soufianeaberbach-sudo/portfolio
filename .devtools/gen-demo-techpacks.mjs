/* Generates the five DEMO technical packs the Tech Packs world uses for
 * interface review.
 *
 * These are not documents. They exist so the folio viewer can be designed and
 * judged against something real enough to open, and every single page says so:
 * DEMO / INTERFACE PROTOTYPE / NOT CLIENT WORK, in the header, in the footer,
 * and across the sheet.
 *
 * Deliberately absent, because inventing any of it would be fabricating
 * technical documentation:
 *   - client or brand names
 *   - measurements, tolerances, points of measure
 *   - grading increments
 *   - BOM quantities, suppliers, component codes
 *   - care, composition or country of origin
 * Every field is drawn as an empty rule. The pages carry the STRUCTURE of a
 * pack and no data whatsoever.
 *
 * Printed with the Chromium that Playwright already provides — no PDF library
 * is added to the project.
 *
 *   node .devtools/gen-demo-techpacks.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'public/demo/techpacks');

/* Garment types only — the kind of product a pack would cover. No client, no
   season, no style number that could read as a real reference. */
const PACKS = [
  { slug: 'demo-01-jersey-top', title: 'Jersey Top', category: 'Womenswear' },
  { slug: 'demo-02-tailored-trouser', title: 'Tailored Trouser', category: 'Womenswear' },
  { slug: 'demo-03-performance-legging', title: 'Performance Legging', category: 'Womenswear' },
  { slug: 'demo-04-woven-dress', title: 'Woven Dress', category: 'Womenswear' },
  { slug: 'demo-05-hooded-sweatshirt', title: 'Hooded Sweatshirt', category: 'Womenswear' },
];

const SECTIONS = [
  { n: '01', name: 'Technical flat', note: 'Front, back and any construction detail needing its own view.' },
  { n: '02', name: 'Construction detail', note: 'Seam type, stitch class and finish, called out where it is not obvious.' },
  { n: '03', name: 'Measurement chart', note: 'Points of measure, defined so the factory and the client measure the same way.' },
  { n: '04', name: 'Grading', note: 'Increments across the size range, with the rules that produced them.' },
  { n: '05', name: 'Bill of materials', note: 'Every component, placement and quantity the garment consumes.' },
  { n: '06', name: 'Label and packing', note: 'Care, content, placement and how the garment leaves the line.' },
];

const rules = (count, widths) => widths.slice(0, count)
  .map((w) => `<i style="width:${w}%"></i>`).join('');

const page = (pack, section, index) => `
<section class="sheet">
  <header>
    <span class="mono">${pack.category} / ${pack.title}</span>
    <span class="mono flag">Demo — interface prototype</span>
  </header>

  <div class="body">
    <p class="mono step">Section ${section.n}</p>
    <h1>${section.name}</h1>
    <p class="note">${section.note}</p>

    <div class="frame">
      <span class="mono frame__tag">No content — structure only</span>
    </div>

    <div class="fields">
      ${rules(6, [34, 88, 72, 90, 58, 80])}
    </div>
  </div>

  <div class="watermark">DEMO</div>

  <footer>
    <span class="mono">Not client work — no measurements, grading or BOM values are present</span>
    <span class="mono">${String(index + 1).padStart(2, '0')} / ${SECTIONS.length}</span>
  </footer>
</section>`;

const doc = (pack) => `<!doctype html><html><head><meta charset="utf-8"><style>
  @page { size: A4 landscape; margin: 0; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Helvetica, Arial, sans-serif; color: #11110f; background: #fff; }
  .mono { font-family: "Courier New", monospace; font-size: 7.5pt; letter-spacing: .13em; text-transform: uppercase; }
  .sheet {
    position: relative; width: 297mm; height: 210mm; padding: 14mm 16mm;
    display: flex; flex-direction: column; page-break-after: always; overflow: hidden;
  }
  .sheet:last-child { page-break-after: auto; }
  header { display: flex; justify-content: space-between; padding-bottom: 4mm; border-bottom: .4mm solid #11110f; color: #6e6d64; }
  .flag { color: #d45f36; }
  .body { flex: 1; padding-top: 9mm; }
  .step { color: #6e6d64; margin: 0; }
  h1 { margin: 2mm 0 0; font-size: 22pt; letter-spacing: -.02em; font-weight: 700; }
  .note { margin: 3mm 0 0; max-width: 120mm; font-size: 9.5pt; line-height: 1.5; color: #383832; }
  .frame {
    position: relative; margin: 8mm 0 0; height: 72mm; border: .3mm solid rgba(17,17,15,.28);
    display: flex; align-items: center; justify-content: center;
    background: repeating-linear-gradient(45deg, #fafafa 0 4mm, #f2f1ee 4mm 8mm);
  }
  .frame__tag { color: #6e6d64; }
  .fields { margin-top: 7mm; display: flex; flex-direction: column; gap: 3.6mm; }
  .fields i { display: block; height: .25mm; background: rgba(17,17,15,.22); }
  footer { display: flex; justify-content: space-between; padding-top: 4mm; border-top: .25mm solid rgba(17,17,15,.28); color: #6e6d64; }
  .watermark {
    position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%) rotate(-24deg);
    font-size: 86pt; font-weight: 700; letter-spacing: .06em; color: rgba(212,95,54,.10); pointer-events: none;
  }
</style></head><body>
${SECTIONS.map((s, i) => page(pack, s, i)).join('')}
</body></html>`;

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext();
for (const pack of PACKS) {
  const p = await context.newPage();
  await p.setContent(doc(pack), { waitUntil: 'load' });
  await p.pdf({
    path: path.join(OUT, `${pack.slug}.pdf`),
    width: '297mm',
    height: '210mm',
    printBackground: true,
  });
  await p.close();
  const bytes = fs.statSync(path.join(OUT, `${pack.slug}.pdf`)).size;
  console.log(`${pack.slug}.pdf  ${SECTIONS.length} pages  ${(bytes / 1024).toFixed(0)} KB`);
}
await browser.close();
console.log(`\n${PACKS.length} demo packs written to public/demo/techpacks/`);
