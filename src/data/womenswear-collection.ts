import type {FinalViews,ImageCredit,MarketCategory,Subject} from './portfolio';
import {projectSubject,referenceSubject} from './portfolio';
import {exhibitionImage} from './womenswear-exhibition';
import additions from './womenswear-references.json';
import generated from './womenswear-generated.json';
const externalReferences=additions.map(r=>({...r,image:{...r.image,views:1 as const}}));
const generatedReferences=generated.filter(r=>r.integrated).map(r=>({...r,image:{...r.image,views:3 as const,thirdView:'editorial' as const}}));
/** New presentations have their own identities; historical routes retain original pixels. */
export const generatedPresentation=(id:string)=>generatedReferences.find(r=>r.id===id);
export const featuredIdentity=(sourceId:string)=>generatedReferences.find(r=>r.sourceIdentity===sourceId)?.id??sourceId;

/** Display order is independent of the immutable historical reference arrays.
 * Replace photography here, retaining the slot's ID and category URL. Only
 * supplied final views appear. This never creates development evidence. */
export interface CollectionSlot {
 id:string;
 photography?:FinalViews;
 credit?:ImageCredit;
}
export const womenswearWorlds=[{id:'casualwear',label:'Casualwear'},{id:'activewear',label:'Activewear'},{id:'evening',label:'Occasionwear'},{id:'swimwear',label:'Swimwear'}] as const;
/** Routing aliases preserve source-category URLs; subjects never change identity. */
export const editorialWorld=(id:string)=>id==='rtw'||id==='streetwear'?'casualwear':id;
const slots=(category:string,numbers:number[]):CollectionSlot[]=>numbers.map(n=>({id:`${category}-ref-${String(n).padStart(2,'0')}`}));
export const collectionSlots:Record<string,CollectionSlot[]>={
 rtw:slots('rtw',[1,2,3,4,5,6,7,10,11,15]),
 activewear:slots('activewear',[1,2,3,4,5,6,7,8,9,10]),
 streetwear:slots('streetwear',[1,2,3,4,5,6,7,8,9,10]),
 evening:slots('evening',[1,2,3,4,5,6,7,8,10,11]),
 swimwear:slots('swimwear',[1,2,3,4,5,6,7,8,9,10]),
};
// Four public edits, independent of the five immutable source pools.
const sourceEditorialSlots:Record<string,CollectionSlot[]>={
 casualwear:[...slots('rtw',[2,3,4,5,15]),...slots('streetwear',[1,2,4,5,10])].map(slot=>Object.values(collectionSlots).flat().find(source=>source.id===slot.id)!),
 activewear:collectionSlots.activewear,evening:collectionSlots.evening,swimwear:collectionSlots.swimwear,
};
export const editorialSlots:Record<string,CollectionSlot[]>=Object.fromEntries(Object.entries(sourceEditorialSlots).map(([world,selection])=>[world,selection.map(slot=>{
 const id=featuredIdentity(slot.id);return id===slot.id?slot:{id};
})]));
export function collectionCredit(category:MarketCategory,id:string):ImageCredit|undefined {
 const presentation=generatedPresentation(id);if(presentation)return presentation.credit;
 const slot=collectionSlots[category.id]?.find(s=>s.id===id);
 // Replacing a photograph must not retain the former creator's credit.
 if(slot?.photography)return slot.credit;
 return slot?.credit
  ?? additions.find(r=>r.id===id)?.credit ?? category.references.find(r=>r.id===id)?.credit;
}
export function slotPhotographs(subject:Subject,slot:CollectionSlot):Subject {
 if(!slot.photography)return subject;
 const final=slot.photography,cover=final.front??final.composite??final.back??final.side??final.editorial??final.details?.[0]?.image;
 if(!cover)throw new Error(`No photograph supplied for ${slot.id}`);
 // Reuse the existing FinalViews parser. This is still reference material;
 // parsing views does not confer project ownership or verification.
 const parsed=projectSubject({id:subject.id,gender:'womenswear',marketCategory:subject.category,title:'',garmentType:'',finalGarmentImage:cover,final},subject.world);
 return {...subject,cover,views:parsed.views,caption:cover.alt};
}
export function referenceCollection(category:MarketCategory,world:string):Subject[] {
 const references=[...category.references,...externalReferences.filter(r=>r.category===category.id),...generatedReferences.filter(r=>r.category===category.id)];
 return references.map(reference=>{
  let subject=referenceSubject({...reference,image:exhibitionImage(reference.image)},world,category.id);
  const presentation=generatedPresentation(subject.id);if(presentation)subject={...subject,caption:presentation.caption};
  if(additions.some(r=>r.id===reference.id))subject={...subject,views:subject.views.map(v=>({...v,label:'Primary photograph'}))};
  const slot=collectionSlots[category.id]?.find(s=>s.id===subject.id);
  return slot?slotPhotographs(subject,slot):subject;
 });
}
export function displayedCollection(category:string,pool:Subject[]):Subject[] {
 const selection=editorialSlots[editorialWorld(category)];
 if(!selection)return pool;
 const edit=selection.map(slot=>pool.find(s=>s.id===slot.id));
 if(edit.some(s=>!s)||new Set(selection.map(s=>s.id)).size!==10||selection.length!==10)
  throw new Error(`Incomplete ten-look collection: ${category}`);
 return edit as Subject[];
}
