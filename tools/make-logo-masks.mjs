import { chromium } from 'playwright';
import fs from 'fs'; import path from 'path';
// Only the three logos that ship with NO usable alpha (fully opaque, white
// background) get a derived mask. Originals are left untouched on disk.
const targets = ['ISIF.jpg','MISSGUIDED.png','PLT.png'];
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
const p = await b.newPage();
for (const f of targets) {
  const src = path.join('public/LOGO', f);
  const data = fs.readFileSync(src).toString('base64');
  const mime = f.toLowerCase().endsWith('.jpg') ? 'image/jpeg' : 'image/png';
  const url = await p.evaluate(async ([d,m])=>{
    const img=new Image(); img.src=`data:${m};base64,${d}`; await img.decode();
    const c=document.createElement('canvas'); c.width=img.naturalWidth; c.height=img.naturalHeight;
    const x=c.getContext('2d'); x.drawImage(img,0,0);
    const im=x.getImageData(0,0,c.width,c.height); const px=im.data;
    // alpha = ink coverage = 255 - luminance ; RGB forced white.
    // Normalise against the densest ink so a logo drawn in dark grey rather
    // than pure black still renders fully white (PLT's darkest pixel is 33,
    // which would otherwise cap it at 87% opacity and read grey).
    let peak=0;
    for(let i=0;i<px.length;i+=4){
      const L=0.2126*px[i]+0.7152*px[i+1]+0.0722*px[i+2];
      const a=255-L; if(a>peak) peak=a;
    }
    const gain = peak>0 ? 255/peak : 1;
    let minX=c.width,minY=c.height,maxX=0,maxY=0;
    for(let i=0;i<px.length;i+=4){
      const L=0.2126*px[i]+0.7152*px[i+1]+0.0722*px[i+2];
      const a=Math.max(0,Math.min(255,Math.round((255-L)*gain)));
      px[i]=255;px[i+1]=255;px[i+2]=255;px[i+3]=a;
      if(a>24){const idx=i/4,py=Math.floor(idx/c.width),pxx=idx%c.width;
        if(pxx<minX)minX=pxx; if(pxx>maxX)maxX=pxx; if(py<minY)minY=py; if(py>maxY)maxY=py;}
    }
    x.putImageData(im,0,0);
    // trim to ink bounds with a 2% breathing margin
    const mw=Math.round((maxX-minX+1)*0.02), mh=Math.round((maxY-minY+1)*0.02);
    const sx=Math.max(0,minX-mw), sy=Math.max(0,minY-mh);
    const sw=Math.min(c.width-sx,(maxX-minX+1)+mw*2), sh=Math.min(c.height-sy,(maxY-minY+1)+mh*2);
    const t=document.createElement('canvas'); t.width=sw; t.height=sh;
    t.getContext('2d').drawImage(c,sx,sy,sw,sh,0,0,sw,sh);
    return t.toDataURL('image/png');
  },[data,mime]);
  const outName = f.replace(/\.(png|jpg)$/i,'') + '-mask.png';
  const buf = Buffer.from(url.split(',')[1],'base64');
  fs.writeFileSync(path.join('public/LOGO',outName), buf);
  console.log(`  ${f.padEnd(18)} -> ${outName.padEnd(24)} ${buf.length} bytes`);
}
await b.close();

// Run with:  npm i -D playwright && node tools/make-logo-masks.mjs
// Only needed if ISIF / MISSGUIDED / PLT source artwork is ever replaced.
