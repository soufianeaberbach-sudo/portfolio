/** Lab specimens, not project evidence. No seams, sizes, measurements, grading,
 * fit claims or assembly instructions. The contour is an approximate reading
 * of the visible reference photograph, NOT an original sketch/technical flat.
 * The curve sheet tests vector inspection. The ruled envelope tests registration,
 * NOT CLO simulation. These are never supplied to the public Project model. */
export const contour = 'M260 367 L276 431 Q328 475 392 540 Q447 466 469 412 L470 375 M276 431 Q252 461 256 562 Q253 721 224 900 Q222 1070 193 1290 L151 1624 Q271 1660 380 1631 Q486 1651 597 1620 L570 1280 Q555 1122 555 905 Q555 754 516 566 Q516 470 469 412';
const outer = 'M276 431 Q252 461 256 562 Q253 721 224 900 Q222 1070 193 1290 L151 1624 Q271 1660 380 1631 Q486 1651 597 1620 L570 1280 Q555 1122 555 905 Q555 754 516 566 Q516 470 469 412 Q447 466 392 540 Q328 475 276 431Z';
export const lineSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="130 330 490 1350" role="img" aria-label="UI contour specimen based on reference photograph proportions; not a design sketch"><g fill="none" stroke="#211e1b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path data-ink d="${contour}"/><path data-ink opacity=".5" d="M283 450 Q303 530 379 561 M300 451 Q327 515 381 545 M465 433 Q448 520 403 550 M490 450 Q474 541 424 564"/><path data-ink opacity=".22" d="M272 438 Q317 483 388 548 M253 752 Q233 1050 181 1586 M565 972 Q563 1300 591 1602"/></g></svg>`;
let curves='';
for(let i=0;i<4;i++){
 const x=70+(i%2)*720,y=90+Math.floor(i/2)*540;
 curves+=`<g transform="translate(${x} ${y})"><text x="0" y="0" font-family="monospace" font-size="18" fill="#6e6a63">${String.fromCharCode(65+i)} / CURVE SPECIMEN</text><g fill="none" stroke="#28241f" stroke-width="2"><path d="M30 440 L30 170 Q40 40 185 45 Q365 30 465 135 Q580 245 560 440Z"/><path d="M75 400 L75 185 Q92 86 196 92 Q356 74 428 168 Q510 255 510 400Z" opacity=".4"/><path d="M140 440 Q100 280 190 170 Q260 80 390 135 Q490 196 450 335 Q395 467 240 420"/><path d="M190 420 Q220 345 195 270 Q176 180 269 153 Q362 125 408 207 Q466 330 355 406" opacity=".3"/></g><text x="30" y="486" font-family="monospace" font-size="15" fill="#6e6a63">UI GEOMETRY ONLY / NO CONSTRUCTION DATA</text></g>`;
}
export const sheetSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 1160" role="img" aria-label="Neutral vector inspection sheet with four curve specimens. Not a garment pattern."><text x="70" y="34" font-family="monospace" font-size="16" fill="#c7020c">DEMO / INSPECTION SPECIMEN — NOT A GARMENT PATTERN</text>${curves}</svg>`;
let mesh='';
for(let i=0;i<10;i++){
 const y=520+i*108,t=i/9,left=255-104*t,right=517+80*t;
 mesh+=`<path d="M${left} ${y} Q374 ${y-58} ${right} ${y} Q378 ${y+63} ${left} ${y}" opacity="${.3+i*.035}"/>`;
}
for(let i=0;i<8;i++){
 const t=i/7;
 mesh+=`<path d="M${276+193*t} ${431+110*Math.sin(t*Math.PI)} Q${235+313*t} 1000 ${151+446*t} ${1624+18*Math.sin(t*Math.PI)}" opacity=".52"/>`;
}
export const volumeSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="130 330 490 1350" role="img" aria-label="Ruled UI envelope for image registration testing; not a CLO render or fit simulation"><defs><clipPath id="iv-envelope"><path d="${outer}"/></clipPath></defs><g fill="none" stroke="#504b45" stroke-width="2"><path d="${contour}" stroke-width="3"/><g clip-path="url(#iv-envelope)">${mesh}</g></g></svg>`;
