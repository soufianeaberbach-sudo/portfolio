/* PATTERN GEOMETRY — the curves the Portfolio is cut along.
 *
 * WHY THIS FILE EXISTS. "Pattern-inspired" has meant irregular rectangles
 * twice on this project, and irregular rectangles are not patternmaking. A
 * pattern piece is defined by a small number of named curves, each with a
 * job: an armhole is scooped so a sleeve head can rotate into it; a princess
 * seam takes suppression out at the waist and releases it over the bust and
 * the hip; a side seam springs at the hip and falls straight below it. Those
 * curves are what makes a flat piece become a body.
 *
 * So the seams that divide this page are built from that geometry rather than
 * drawn to look like it. Every value below is a proportion of the field, so
 * one seam is the same seam at 320px and at 1920px.
 *
 * Nothing here draws a sewing pattern on the screen. It produces the EDGE
 * along which one region of the composition ends and the next begins.
 */

export interface SeamOptions {
  /* Where the seam crosses the field, 0 (left edge) to 1 (right edge). */
  x: number;
  /* Which seam this is, so each of the three has its own character rather
     than three copies of one curve. */
  kind: 0 | 1 | 2;
  /* Field size in CSS pixels. */
  width: number;
  height: number;
  /* Which way the seam runs. 'x' is a seam down the field, dividing it left
     from right — the desk composition. 'y' is the same seam turned, running
     across the field and dividing top from bottom, which is what a phone
     needs: four vertical slivers on a 390px screen would be unusable, and
     the story has to survive the rotation rather than be replaced by a list.
     The curve is identical; only the axis it is laid on changes. */
  axis?: 'x' | 'y';
}

/* The three seams, as the amount each control point pulls away from the
 * vertical, in fractions of the FIELD width. Positive pulls right.
 *
 *   0  ARMHOLE          a scoop high on the field, returning to the vertical
 *                       at the waist — the curve a sleeve head sits in.
 *   1  PRINCESS         suppression at the waist, released above and below:
 *                       the classic two-way curve of a panelled front.
 *   2  SIDE SEAM        straight through the bodice, springing at the hip and
 *                       falling away below it.
 *
 * The magnitudes are small on purpose. A seam that wanders is not a seam.
 */
const SEAMS: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
  /* [y as a fraction of height, x offset as a fraction of width] */
  [[0, 0.028], [0.18, 0.052], [0.38, 0.016], [0.62, -0.004], [1, 0.006]],
  [[0, -0.014], [0.26, 0.026], [0.5, -0.03], [0.74, 0.018], [1, 0.004]],
  [[0, 0.004], [0.3, 0.002], [0.58, 0.026], [0.8, 0.044], [1, 0.012]],
];

/* A cubic through the seam's control points, in field pixels. Catmull-Rom
 * converted to Bézier: it passes through every point, which matters because
 * each point is a named body landmark rather than a handle. */
const seamPoints = (o: SeamOptions): Array<[number, number]> =>
  SEAMS[o.kind].map(([ty, dx]) => (o.axis === 'y'
    ? [ty * o.width, (o.x + dx) * o.height]
    : [(o.x + dx) * o.width, ty * o.height]));

const curveThrough = (pts: Array<[number, number]>): string => {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    /* Catmull-Rom → cubic Bézier, tension 1/6. */
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d;
};

/* The seam on its own, for drawing the cut line. */
export const seamPath = (o: SeamOptions): string => curveThrough(seamPoints(o));

/* The seam in the 0..100 viewBox the drawn overlay uses. */
export const seamPathUnit = (x: number, kind: 0 | 1 | 2, axis: 'x' | 'y' = 'x'): string =>
  curveThrough(seamPoints({ x, kind, width: 100, height: 100, axis }));

/* A closed region between two seams — the shape one chapter occupies.
 *
 * `left` and `right` are seam descriptors or the field's own edges. The region
 * runs down the left seam, across the bottom, up the right seam and back
 * across the top, so it is a single closed piece with two curved sides: a
 * panel, in the sense a patternmaker means it. */
export const panelPath = (
  left: SeamOptions | null,
  right: SeamOptions | null,
  width: number,
  height: number,
): string => {
  const axis = (left ?? right)?.axis ?? 'x';
  const leftEdge: Array<[number, number]> = left
    ? seamPoints(left)
    : (axis === 'y' ? [[0, 0], [width, 0]] : [[0, 0], [0, height]]);
  const rightEdge: Array<[number, number]> = right
    ? seamPoints(right)
    : (axis === 'y' ? [[0, height], [width, height]] : [[width, 0], [width, height]]);

  const down = curveThrough(leftEdge);
  /* The right edge is walked upward, so its points are reversed. */
  const up = curveThrough([...rightEdge].reverse());
  /* `up` starts with its own M; splice it on as a line instead. */
  return `${down} L ${rightEdge[rightEdge.length - 1][0].toFixed(2)} ${rightEdge[rightEdge.length - 1][1].toFixed(2)} ${up.replace(/^M/, 'L')} Z`;
};

/* WHERE A SEAM ACTUALLY IS AT ONE HEIGHT.
 *
 * A seam's nominal position is not where its edge falls: the curve swings up
 * to 5% of the field either side of it. Type set from the nominal position was
 * therefore set slightly INSIDE the chapter next door, and the first letter of
 * "Pattern Development" was cut off by its own seam. This returns the offset
 * at one height so a caller can bound a line of type by the edge that is
 * really there.
 *
 * Linear between control points rather than along the Bézier: the type sits in
 * the bottom band, where the nearest points are close together and the error
 * is a fraction of a pixel.
 */
export const seamOffsetAt = (kind: 0 | 1 | 2, ty: number): number => {
  const pts = SEAMS[kind];
  if (ty <= pts[0][0]) return pts[0][1];
  for (let i = 0; i < pts.length - 1; i += 1) {
    const [y0, d0] = pts[i];
    const [y1, d1] = pts[i + 1];
    if (ty <= y1) return d0 + ((d1 - d0) * (ty - y0)) / (y1 - y0 || 1);
  }
  return pts[pts.length - 1][1];
};

/* ==========================================================================
   THE LAY — how several pieces share one field.

   A marker, or lay plan, is how a cutter puts a garment's pattern pieces on a
   length of cloth. It is the craft's own answer to the problem this page has:
   arrange several pieces of DIFFERENT SHAPE on one surface so that the cloth
   is fully used and no piece is privileged. A lay is not a grid and it is not
   a random scatter — pieces are nested against each other along their own
   edges, in courses across the width, all sharing one grain direction.

   So a chapter's categories are laid, not listed. Every piece has the SAME
   AREA and a different shape: equal value without identical cards. The edges
   between them are the seam curves above, and one grain line runs the whole
   length of the field through all of them.

   COURSES. n pieces split into two courses, ceil(n/2) above and the rest
   below. The upper course takes a/n of the height and holds a pieces, the
   lower takes b/n and holds b — so each piece is exactly (1/n) of the field
   whichever course it is in. Five pieces are three over two; four are two
   over two; one is the whole field.
   ========================================================================== */

export interface Side {
  /* Where the seam sits, as a fraction of the field along its own axis. */
  pos: number;
  kind: 0 | 1 | 2;
}

export interface LayPiece {
  /* Any side may be `null`, which means the field's own edge: a straight cut
     along the selvedge. */
  left: Side | null;
  right: Side | null;
  top: Side | null;
  bottom: Side | null;
}

/* The lay for n pieces: which seams bound each one, and which seams to draw.
   Deterministic — the same n always produces the same lay, because a
   composition that changes shape on reload is not a composition. */
export const layOf = (n: number): { pieces: LayPiece[]; courseY: number | null } => {
  if (n <= 1) {
    return { pieces: [{ left: null, right: null, top: null, bottom: null }], courseY: null };
  }
  const above = Math.ceil(n / 2);
  const below = n - above;
  const courseY = above / n;
  const course = (count: number, top: Side | null, bottom: Side | null): LayPiece[] =>
    Array.from({ length: count }, (_, i) => ({
      /* Each internal seam takes its own character, and the sequence is
         offset between the courses so the two never divide alike — which is
         what stops a two-course lay from reading as a table. */
      left: i === 0 ? null : { pos: i / count, kind: ((i + count) % 3) as 0 | 1 | 2 },
      right: i === count - 1 ? null : { pos: (i + 1) / count, kind: ((i + 1 + count) % 3) as 0 | 1 | 2 },
      top,
      bottom,
    }));
  const seam: Side = { pos: courseY, kind: 1 };
  return {
    pieces: [
      ...course(above, null, seam),
      ...course(below, seam, null),
    ],
    courseY,
  };
};

/* One edge of a piece, as points in field pixels.
 *
 * `along` is the axis the edge RUNS in: an edge that runs in x is a seam
 * across the field (a course seam); one that runs in y is a seam down it.
 * The two pieces either side of a seam call this with identical arguments, so
 * they get an identical point list and the two clip paths share one edge
 * exactly — no gap, no overlap, at any width.
 */
const edgePoints = (
  side: Side | null,
  fallback: number,
  along: 'x' | 'y',
  t0: number,
  t1: number,
  width: number,
  height: number,
): Array<[number, number]> => {
  /* Along-axis size, and the size of the axis the seam is offset in. */
  const span = along === 'x' ? width : height;
  const off = along === 'x' ? height : width;
  const at = (t: number): [number, number] => {
    const d = side ? side.pos + seamOffsetAt(side.kind, t) : fallback;
    return along === 'x' ? [t * span, d * off] : [d * off, t * span];
  };
  const pts: Array<[number, number]> = [at(t0)];
  if (side) {
    for (const [t] of SEAMS[side.kind]) {
      if (t > t0 + 0.02 && t < t1 - 0.02) pts.push(at(t));
    }
  }
  pts.push(at(t1));
  return pts;
};

/* A closed piece of the lay: top edge left to right, right edge down, bottom
 * edge right to left, left edge up. Catmull-Rom is symmetric under reversal,
 * so walking a shared edge backwards traces the same curve the neighbour
 * walked forwards.
 *
 * THE CORNERS ARE CANONICAL. Where a seam down the field meets a seam across
 * it, the two curves do not agree on the crossing point — each is offset in
 * its own axis. So a corner is defined once, from both seams' nominal
 * positions, and every edge that ends there is made to end at exactly that
 * point. Both neighbours compute it the same way and the lay closes.
 */
export const piecePath = (p: LayPiece, width: number, height: number): string => {
  const x0 = p.left ? p.left.pos : 0;
  const x1 = p.right ? p.right.pos : 1;
  const y0 = p.top ? p.top.pos : 0;
  const y1 = p.bottom ? p.bottom.pos : 1;

  const corner = (vx: Side | null, xEdge: number, hy: Side | null, yEdge: number): [number, number] => [
    (vx ? vx.pos + seamOffsetAt(vx.kind, hy ? hy.pos : yEdge) : xEdge) * width,
    (hy ? hy.pos + seamOffsetAt(hy.kind, vx ? vx.pos : xEdge) : yEdge) * height,
  ];
  const tl = corner(p.left, 0, p.top, 0);
  const tr = corner(p.right, 1, p.top, 0);
  const br = corner(p.right, 1, p.bottom, 1);
  const bl = corner(p.left, 0, p.bottom, 1);

  const pin = (pts: Array<[number, number]>, a: [number, number], b: [number, number]) => {
    const out = pts.slice();
    out[0] = a;
    out[out.length - 1] = b;
    return out;
  };

  /* THE ORDER MATTERS, AND IT IS THE ORDER OF THE WALK.
     `edgePoints` always returns an edge in its own increasing direction, so
     the two edges that are walked backwards must be REVERSED BEFORE their
     corners are pinned on. Pinning first and reversing after put the bottom
     edge's right-hand corner at its left-hand end: the piece closed through
     its own middle, and a diagonal of bare cloth cut across every garment. */
  const top = pin(edgePoints(p.top, 0, 'x', x0, x1, width, height), tl, tr);
  const right = pin(edgePoints(p.right, 1, 'y', y0, y1, width, height), tr, br);
  const bottom = pin(edgePoints(p.bottom, 1, 'x', x0, x1, width, height).reverse(), br, bl);
  const left = pin(edgePoints(p.left, 0, 'y', y0, y1, width, height).reverse(), bl, tl);

  const run = (pts: Array<[number, number]>) => curveThrough(pts).replace(/^M[^C]*/, '');
  return [
    `M ${tl[0].toFixed(2)} ${tl[1].toFixed(2)}`,
    run(top) || ` L ${tr[0].toFixed(2)} ${tr[1].toFixed(2)}`,
    run(right) || ` L ${br[0].toFixed(2)} ${br[1].toFixed(2)}`,
    run(bottom) || ` L ${bl[0].toFixed(2)} ${bl[1].toFixed(2)}`,
    run(left) || ` L ${tl[0].toFixed(2)} ${tl[1].toFixed(2)}`,
    'Z',
  ].join('');
};

/* The piece's bounding box, in fractions of the field, widened by the most a
 * seam can swing so a picture laid in it always reaches its own edges. */
export const pieceBox = (p: LayPiece): { x: number; y: number; w: number; h: number } => {
  const swing = 0.055;
  const x0 = (p.left ? p.left.pos : 0) - (p.left ? swing : 0);
  const x1 = (p.right ? p.right.pos : 1) + (p.right ? swing : 0);
  const y0 = (p.top ? p.top.pos : 0) - (p.top ? swing : 0);
  const y1 = (p.bottom ? p.bottom.pos : 1) + (p.bottom ? swing : 0);
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
};

/* THE SEAMS A LAY DRAWS, derived from the pieces themselves rather than
 * described a second time: every internal edge, once. Two pieces share an
 * edge, so the second time an edge is seen it is skipped — and because the
 * drawn path is built from the same `edgePoints` call the clip used, the line
 * a visitor sees IS the cut. */
export const laySeamPaths = (pieces: LayPiece[], width: number, height: number): string[] => {
  const seen = new Set<string>();
  const out: string[] = [];
  const add = (side: Side | null, along: 'x' | 'y', t0: number, t1: number) => {
    if (!side) return;
    const key = `${along}|${side.pos}|${side.kind}|${t0}|${t1}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(curveThrough(edgePoints(side, 0, along, t0, t1, width, height)));
  };
  for (const p of pieces) {
    const x0 = p.left ? p.left.pos : 0;
    const x1 = p.right ? p.right.pos : 1;
    const y0 = p.top ? p.top.pos : 0;
    const y1 = p.bottom ? p.bottom.pos : 1;
    add(p.left, 'y', y0, y1);
    add(p.right, 'y', y0, y1);
    add(p.top, 'x', x0, x1);
    add(p.bottom, 'x', x0, x1);
  }
  return out;
};

/* The largest rectangle inside a piece that no seam crosses: where its type
 * can be set. Each edge is taken at the WORST it gets anywhere along the
 * piece — the furthest-right left edge, the lowest top edge — sampled across
 * that edge's own extent. A label placed on a seam's nominal position sits
 * inside the piece next door, because a seam's nominal position is not where
 * its edge falls. */
export const safeRect = (p: LayPiece): { x: number; y: number; w: number; h: number } => {
  const worst = (side: Side | null, t0: number, t1: number, dir: 'max' | 'min', edge: number) => {
    if (!side) return edge;
    let o = seamOffsetAt(side.kind, t0);
    for (let i = 1; i <= 6; i += 1) {
      const s = seamOffsetAt(side.kind, t0 + ((t1 - t0) * i) / 6);
      o = dir === 'max' ? Math.max(o, s) : Math.min(o, s);
    }
    return side.pos + o;
  };
  const y0n = p.top ? p.top.pos : 0;
  const y1n = p.bottom ? p.bottom.pos : 1;
  const x0n = p.left ? p.left.pos : 0;
  const x1n = p.right ? p.right.pos : 1;
  const x = worst(p.left, y0n, y1n, 'max', 0);
  const r = worst(p.right, y0n, y1n, 'min', 1);
  const y = worst(p.top, x0n, x1n, 'max', 0);
  const b = worst(p.bottom, x0n, x1n, 'min', 1);
  return { x, y, w: r - x, h: b - y };
};

/* THE NARROW CLOTH. One piece wide, in n courses down the length.
 *
 * A cutter facing a 90cm cloth does not redesign the garment: the same pieces
 * go down the length in single file. So a phone gets the same lay, folded —
 * every piece still holds one nth of the cloth, still has two curved edges,
 * and the grain line still runs the whole length. */
export const layColumn = (n: number): { pieces: LayPiece[]; courseY: number | null } => {
  if (n <= 1) {
    return { pieces: [{ left: null, right: null, top: null, bottom: null }], courseY: null };
  }
  return {
    pieces: Array.from({ length: n }, (_, i) => ({
      left: null,
      right: null,
      top: i === 0 ? null : { pos: i / n, kind: (i % 3) as 0 | 1 | 2 },
      bottom: i === n - 1 ? null : { pos: (i + 1) / n, kind: ((i + 1) % 3) as 0 | 1 | 2 },
    })),
    courseY: null,
  };
};
