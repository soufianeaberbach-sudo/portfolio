/** RTW prototype: roles describe what the camera does, not publication weight.
 * Selection follows silhouette, colour and the information visible in the source.
 * Crop boundaries sit in measured empty studio gaps; touching pairs stay whole.
 */
export const rtwCast = [
  { id: 'rtw-ref-01', role: 'anchor', reason: 'Champagne satin gives the threshold a quiet long silhouette; its low back rewards the first turn.' },
  { id: 'rtw-ref-06', role: 'arrival', reason: 'The rust halter mini introduces colour and a shorter silhouette against the satin low-back close view.' },
  { id: 'rtw-ref-02', role: 'near', reason: 'The pink cropped shirt and stone wide-leg trousers make a clear, clean-floor destination; the cropped hem and trouser waist answer the preceding satin drape.' },
  { id: 'rtw-ref-03', role: 'interruption', reason: 'The stone V-neck jumpsuit quiets the palette and joins the silhouette into one long line after the traverse; a V-neck/waist close view and the complete back provide the quiet punctuation.' },
  { id: 'rtw-ref-05', role: 'resolve', reason: 'The floral shirt jacket and rust wide-leg trousers resolve the final campaign view against the rust halter’s tie-back close view; the colour echo is visible, not a claim of shared provenance.' },
] as const;

export const rtwSplit: Record<string, number | null> = {
  'rtw-ref-01': .512, 'rtw-ref-02': .51, 'rtw-ref-03': .543,
  'rtw-ref-04': .504, 'rtw-ref-05': .52, 'rtw-ref-06': .532,
  'rtw-ref-07': .498, 'rtw-ref-08': null, 'rtw-ref-09': .514,
  'rtw-ref-10': .533, 'rtw-ref-11': .52, 'rtw-ref-12': .523,
  'rtw-ref-13': .548, 'rtw-ref-14': .546, 'rtw-ref-15': .533,
  'rtw-ref-16': null, 'rtw-ref-17': .529,
};

// A little empty space between the views need not enter either resting window.
// Bounds were checked on complete heads, hands and shoes, including the floor.
export const rtwWindows: Record<string, { front: [number,number]; back: [number,number] }> = {
  'rtw-ref-01': {front:[0,.49],back:[.575,1]},
  'rtw-ref-02': {front:[0,.49],back:[.565,1]},
  'rtw-ref-03': {front:[0,.50],back:[.585,1]},
  'rtw-ref-05': {front:[0,.48],back:[.57,1]},
  'rtw-ref-06': {front:[0,.515],back:[.565,1]},
  'rtw-ref-12': {front:[0,.505],back:[.545,1]},
};
