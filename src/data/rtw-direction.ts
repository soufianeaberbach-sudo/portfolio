/** Camera roles are deliberate reference selections, not positions in the archive.
 * Production Subject/image metadata remains the authority for every view. */
export const rtwCast = [
  { id: 'rtw-ref-01', role: 'anchor', reason: 'Fluid champagne satin establishes the full-length line; its genuine low back rewards the first turn.' },
  { id: 'rtw-ref-06', role: 'arrival', reason: 'Rust halter introduces a shorter silhouette and warm colour against the long satin dress.' },
  { id: 'rtw-ref-02', role: 'tailoring', reason: 'Pink cropped shirting and stone trousers shift attention from drape to proportion.' },
  { id: 'rtw-ref-03', role: 'pause', reason: 'The neutral jumpsuit holds the complete silhouette in one quiet line after the traversal.' },
  { id: 'rtw-ref-05', role: 'resolve', reason: 'Printed shirting and rust trousers close the colour relationship with the halter, without claiming shared project history.' },
] as const;

/** Resting windows trim only the empty gap/floor spill within the production
 * split. They never change ImageAsset.front or separate an inseparable pair.
 * Bound to both ID and source so future content cannot inherit a wrong crop. */
export const rtwFrames:Record<string,{source:string;front:[number,number];back:[number,number]}>= {
 'rtw-ref-01':{source:'/portfolio/woven/1-1400.webp',front:[0,.49],back:[.575,1]},
 'rtw-ref-02':{source:'/portfolio/woven/2-1400.webp',front:[0,.49],back:[.565,1]},
 'rtw-ref-03':{source:'/portfolio/woven/3-1400.webp',front:[0,.50],back:[.585,1]},
 'rtw-ref-05':{source:'/portfolio/woven/5-1400.webp',front:[0,.48],back:[.57,1]},
 'rtw-ref-06':{source:'/portfolio/woven/6-1400.webp',front:[0,.515],back:[.565,1]},
};
