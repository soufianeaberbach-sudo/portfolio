import {menswear,referenceSubject,projectSubject} from './portfolio';
import type{Subject,ImageAsset,ImageCredit,FinalViews}from'./portfolio';
import sources from './menswear-references.json';
export type MenswearCategory='m-streetwear'|'m-activewear'|'m-rtw'|'m-tailoring';
export interface MenswearSlot {id:string;photography?:FinalViews;credit?:ImageCredit;projectId?:string;}
// The stable pool is never reordered. Only this explicit edit determines the forty public slots.
const edit:Record<MenswearCategory,number[]>={
 'm-streetwear':[6311316,8505243,30599804,17303564,26936522,10217699,18584221,19461562,33167524,19805883],
 'm-activewear':[7648388,30954220,7116192,28757997,4062190,26222792,11000101,6974949,33443605,7187833],
 'm-rtw':[16711124,29727778,8508752,6844165,7764014,8217535,6600679,4971009,13128635,37556024],
 'm-tailoring':[16862147,6097464,14348500,6981885,10843819,22719301,16449208,17050139,29242239,6207215],
};
export const menswearSlots=Object.fromEntries(Object.entries(edit).map(([cat,ids])=>[cat,ids.map(id=>({id:`${cat}-pexels-${id}`}))]))as Record<MenswearCategory,MenswearSlot[]>;
export const menswearCredit=(id:string):ImageCredit|undefined=>{
 const slot=Object.values(menswearSlots).flat().find(s=>s.id===id);if(slot?.photography||slot?.projectId)return slot.credit;
 const added=sources.find(r=>id.endsWith(`-pexels-${r.photo}`));if(added)return{source:'Pexels · temporary reference',photographer:added.creator.startsWith('Creator not recorded')?undefined:added.creator,sourcePage:added.source};
 return menswear.categories.flatMap(c=>c.references).find(r=>r.id===id)?.credit;
};
export function menswearPool(category:MenswearCategory):Subject[]{
 const c=menswear.categories.find(c=>c.id===category)!;
 const historical=c.references.map(r=>referenceSubject(r,'menswear',category));
 const additional=edit[category].filter(id=>!historical.some(s=>s.id===`${category}-pexels-${id}`)).map(id=>{
  const r=sources.find(r=>r.photo===id);if(!r)throw new Error(`Missing licensed photograph ${id}`);
  const image:ImageAsset={src:r.src,srcset:`${r.thumbnail} 360w, ${r.src} ${r.width}w`,width:r.width,height:r.height,alt:r.alt,front:1,views:1};
  return referenceSubject({id:`${category}-pexels-${id}`,image},'menswear',category);
 });
 return [...historical,...additional].map(subject=>{
  const slot=menswearSlots[category].find(s=>s.id===subject.id);
  if(slot?.projectId){const project=c.projects.find(p=>p.id===slot.projectId);if(!project)throw new Error(`Missing verified project ${slot.projectId}`);return{...projectSubject(project,'menswear'),id:slot.id,category};}
  if(!slot?.photography)return{...subject,views:subject.views.map(v=>({...v,label:v.crop==='whole'&&v.image.views!==2?'Primary photograph':v.label}))};
  const final=slot.photography,cover=final.front??final.composite??final.back??final.side??final.editorial??final.details?.[0]?.image;
  if(!cover)throw new Error(`Empty photographic replacement ${slot.id}`);
  const parsed=projectSubject({id:subject.id,gender:'menswear',marketCategory:category,title:'',garmentType:'',finalGarmentImage:cover,final},'menswear');
  // Parsing FinalViews confers no authorship or verification.
  return{...subject,cover,caption:cover.alt,views:parsed.views};
 });
}
export const menswearDisplayed=(category:MenswearCategory,pool=menswearPool(category))=>{
 const found=menswearSlots[category].map(slot=>pool.find(s=>s.id===slot.id));
 if(found.length!==10||found.some(s=>!s)||new Set(found.map(s=>s!.id)).size!==10)throw new Error(`Invalid ten-look Menswear edit ${category}`);
 return found as Subject[];
};
