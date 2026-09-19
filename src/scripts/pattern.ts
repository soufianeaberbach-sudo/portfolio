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
