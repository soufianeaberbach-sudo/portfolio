/* Normalise the studio ground of the derived Portfolio renditions.
 *
 * WHY
 * The 49 photographs were shot on grounds running roughly #eeeeee to #ffffff.
 * On the Portfolio stage the garments are laid out as an overlapping deck, so
 * two adjacent frames with different whites meet along a hard vertical seam and
 * the deck reads as a row of tiles instead of one photographic space.
 *
 * WHAT THIS DOES NOT DO
 * It does not touch the masters in assets/source/. It does not globally replace
 * light pixels — that would eat ivory fabric, white lace, highlights and skin.
 *
 * THE RULE
 * A pixel is ground only if BOTH hold:
 *   1. it is reachable from the outside of the frame through other ground
 *      pixels (a flood fill seeded from the border), and
 *   2. it sits within a tight tolerance of that image's own measured ground
 *      value, sampled from the corners.
 *
 * A white garment is not edge-connected unless it physically touches the frame
 * edge, and even then its own contour shading breaks the chain. The tolerance
 * is deliberately tight (default 7 levels) so the fill stops at anything that
 * is not the flat backdrop.
 *
 * The mask is then feathered before compositing, so the ground meets the
 * garment's antialiased edge smoothly instead of leaving a cut-out halo.
 *
 * Usage:
 *   node .devtools/normalise-ground.mjs --check          report only
 *   node .devtools/normalise-ground.mjs --write          regenerate WebPs
 *   node .devtools/normalise-ground.mjs --sample a/1 b/2  write PNG comparisons
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'public/portfolio');
const WIDTHS = [900, 1400];

/* folder key -> master directory, as in gen-portfolio.sh */
const MAP = {
  evening: 'EVENING & OCCASION',
  jersey: 'JERSEY & KNITS',
  woven: 'WOMENSWEAR - WOVEN',
  sport: 'SPORTSWEAR & ACTIVEWEAR',
  swim: 'SWIMWEAR',
};

/* How close to the sampled ground a pixel must be to count as ground. Raising
   this makes the fill braver and risks eating pale fabric; 7 was chosen by
   rendering the hardest frames (white lace, ivory satin, bare skin at the
   edge) and comparing before and after. */
const TOLERANCE = 7;
/* Pixels between TOLERANCE and SOFT are lightened proportionally rather than
   snapped, which is what keeps the boundary from ringing. */
const SOFT = 16;

const luma = (r, g, b) => (r * 299 + g * 587 + b * 114) / 1000;

/** Sample the ground from the four corners of the frame. */
function sampleGround(data, w, h) {
  const patch = 12;
  const values = [];
  for (const [ox, oy] of [[0, 0], [w - patch, 0], [0, h - patch], [w - patch, h - patch]]) {
    for (let y = oy; y < oy + patch; y += 1) {
      for (let x = ox; x < ox + patch; x += 1) {
        const i = (y * w + x) * 3;
        values.push(luma(data[i], data[i + 1], data[i + 2]));
      }
    }
  }
  values.sort((a, b) => a - b);
  return values[Math.floor(values.length / 2)];
}

/**
 * Flood fill from the border. Returns a Uint8Array mask: 255 = certainly
 * ground, intermediate = in the soft band, 0 = leave alone.
 */
function groundMask(data, w, h, ground) {
  const mask = new Uint8Array(w * h);
  const seen = new Uint8Array(w * h);
  const stack = [];

  const near = (p) => {
    const i = p * 3;
    const d = Math.abs(luma(data[i], data[i + 1], data[i + 2]) - ground);
    if (d <= TOLERANCE) return 255;
    if (d <= SOFT) return Math.round(255 * (1 - (d - TOLERANCE) / (SOFT - TOLERANCE)));
    return 0;
  };

  const push = (p) => {
    if (seen[p]) return;
    seen[p] = 1;
    const strength = near(p);
    if (strength === 0) return;
    mask[p] = strength;
    /* Only keep walking through pixels that are unambiguously ground, so the
       soft band forms a boundary rather than a route into the garment. */
    if (strength === 255) stack.push(p);
  };

  for (let x = 0; x < w; x += 1) { push(x); push((h - 1) * w + x); }
  for (let y = 0; y < h; y += 1) { push(y * w); push(y * w + w - 1); }

  while (stack.length) {
    const p = stack.pop();
    const x = p % w;
    const y = (p / w) | 0;
    if (x > 0) push(p - 1);
    if (x < w - 1) push(p + 1);
    if (y > 0) push(p - w);
    if (y < h - 1) push(p + w);
  }
  return mask;
}

/** Box-blur the mask so the composite boundary is soft. */
function feather(mask, w, h, radius = 2) {
  const tmp = new Uint8Array(w * h);
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      let sum = 0, n = 0;
      for (let d = -radius; d <= radius; d += 1) {
        const xx = x + d;
        if (xx < 0 || xx >= w) continue;
        sum += mask[y * w + xx]; n += 1;
      }
      tmp[y * w + x] = sum / n;
    }
  }
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      let sum = 0, n = 0;
      for (let d = -radius; d <= radius; d += 1) {
        const yy = y + d;
        if (yy < 0 || yy >= h) continue;
        sum += tmp[yy * w + x]; n += 1;
      }
      out[y * w + x] = sum / n;
    }
  }
  return out;
}

async function normalise(masterPath, width) {
  const img = sharp(masterPath).resize({ width, kernel: 'lanczos3' }).removeAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const ground = sampleGround(data, w, h);
  const mask = feather(groundMask(data, w, h, ground), w, h);

  let touched = 0;
  const out = Buffer.from(data);
  for (let p = 0; p < w * h; p += 1) {
    const m = mask[p] / 255;
    if (m === 0) continue;
    touched += 1;
    const i = p * 3;
    for (let c = 0; c < 3; c += 1) out[i + c] = Math.round(data[i + c] * (1 - m) + 255 * m);
  }
  return { out, w, h, ground, touchedPct: (touched / (w * h)) * 100 };
}

const args = process.argv.slice(2);
const mode = args[0] ?? '--check';
const entries = [];
for (const [key, dir] of Object.entries(MAP)) {
  for (const f of fs.readdirSync(path.join(ROOT, 'assets/source', dir))) {
    if (!f.endsWith('.png')) continue;
    entries.push({ key, n: path.basename(f, '.png'), master: path.join(ROOT, 'assets/source', dir, f) });
  }
}
entries.sort((a, b) => (a.key === b.key ? Number(a.n) - Number(b.n) : a.key.localeCompare(b.key)));

if (mode === '--sample') {
  const want = new Set(args.slice(1));
  const dest = process.env.SAMPLE_DIR ?? path.join(ROOT, '.tmp-samples');
  fs.mkdirSync(dest, { recursive: true });
  for (const e of entries) {
    const id = `${e.key}/${e.n}`;
    if (!want.has(id)) continue;
    const { out, w, h, ground, touchedPct } = await normalise(e.master, 900);
    const before = await sharp(e.master).resize({ width: 900, kernel: 'lanczos3' }).removeAlpha().raw().toBuffer();
    const pair = Buffer.alloc(w * 2 * h * 3);
    for (let y = 0; y < h; y += 1) {
      before.copy(pair, (y * w * 2) * 3, y * w * 3, (y + 1) * w * 3);
      out.copy(pair, (y * w * 2 + w) * 3, y * w * 3, (y + 1) * w * 3);
    }
    await sharp(pair, { raw: { width: w * 2, height: h, channels: 3 } })
      .png().toFile(path.join(dest, `${e.key}-${e.n}.png`));
    console.log(`${id.padEnd(12)} ground ${ground.toFixed(1)}  touched ${touchedPct.toFixed(1)}%`);
  }
  process.exit(0);
}

let worst = [];
for (const e of entries) {
  const { out, w, h, ground, touchedPct } = await normalise(e.master, WIDTHS[1]);
  worst.push({ id: `${e.key}/${e.n}`, ground: +ground.toFixed(1), touched: +touchedPct.toFixed(1) });
  if (mode === '--write') {
    for (const width of WIDTHS) {
      const r = width === WIDTHS[1]
        ? { out, w, h }
        : await normalise(e.master, width);
      fs.mkdirSync(path.join(OUT, e.key), { recursive: true });
      await sharp(r.out, { raw: { width: r.w, height: r.h, channels: 3 } })
        .webp({ quality: 82, effort: 5 })
        .toFile(path.join(OUT, e.key, `${e.n}-${width}.webp`));
    }
  }
}
worst.sort((a, b) => a.ground - b.ground);
console.log('ground value, darkest first:');
for (const r of worst.slice(0, 8)) console.log(`  ${r.id.padEnd(12)} ${r.ground}  touched ${r.touched}%`);
worst.sort((a, b) => b.touched - a.touched);
console.log('most changed:');
for (const r of worst.slice(0, 8)) console.log(`  ${r.id.padEnd(12)} ${r.ground}  touched ${r.touched}%`);
console.log(`\n${entries.length} frames${mode === '--write' ? ' rewritten' : ' checked'}`);
