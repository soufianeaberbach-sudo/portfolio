import fs from 'node:fs/promises';
import type { APIRoute } from 'astro';
// These sources are served only by astro dev; no third-party media enter dist.
const names=['connolly-night-drifter.webp','momu-st656-pattern.svg','momu-st656-flat.svg','cgelves-purple.jpg'];
export function getStaticPaths(){return import.meta.env.DEV?names.map(asset=>({params:{asset}})):[];}
export const GET:APIRoute=async({params})=>{
  if(!import.meta.env.DEV||!names.includes(params.asset??''))return new Response(null,{status:404});
  const bytes=await fs.readFile(new URL(`../../../../lab/rtw-v/assets/${params.asset}`,import.meta.url));
  const type=params.asset!.endsWith('.svg')?'image/svg+xml':params.asset!.endsWith('.webp')?'image/webp':params.asset!.endsWith('.png')?'image/png':params.asset!.endsWith('.tiff')?'image/tiff':'image/jpeg';
  return new Response(new Uint8Array(bytes),{headers:{'Content-Type':type,'Cache-Control':'no-store'}});
};
