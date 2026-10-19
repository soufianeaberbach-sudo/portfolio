import type {FinalViews,ImageCredit,MarketCategory,Subject} from './portfolio';
import {projectSubject,referenceSubject} from './portfolio';
import {exhibitionImage} from './womenswear-exhibition';
import additions from './womenswear-references.json';
const externalReferences=additions.map(r=>({...r,image:{...r.image,views:1 as const}}));

/** Display order is independent of the immutable historical reference arrays.
 * Replace photography here, retaining the slot's ID and category URL. Only
 * supplied final views appear. This never creates development evidence. */
export interface CollectionSlot {
 id:string;
 photography?:FinalViews;
 credit?:ImageCredit;
}
const slots=(category:string,numbers:number[]):CollectionSlot[]=>numbers.map(n=>({id:`${category}-ref-${String(n).padStart(2,'0')}`}));
export const collectionSlots:Record<string,CollectionSlot[]>={
 rtw:slots('rtw',[1,2,3,4,5,6,7,10,11,15]),
 activewear:slots('activewear',[1,2,3,4,5,6,7,8,9,10]),
 streetwear:slots('streetwear',[1,2,3,4,5,6,7,8,9,10]),
 evening:slots('evening',[1,2,3,4,5,6,7,8,10,11]),
 swimwear:slots('swimwear',[1,2,3,4,5,6,7,8,9,10]),
};
export function collectionCredit(category:MarketCategory,id:string):ImageCredit|undefined {
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
 const references=[...category.references,...externalReferences.filter(r=>r.category===category.id)];
 return references.map(reference=>{
  let subject=referenceSubject({...reference,image:exhibitionImage(reference.image)},world,category.id);
  if(additions.some(r=>r.id===reference.id))subject={...subject,views:subject.views.map(v=>({...v,label:'Primary photograph'}))};
  const slot=collectionSlots[category.id]?.find(s=>s.id===subject.id);
  return slot?slotPhotographs(subject,slot):subject;
 });
}
export function displayedCollection(category:string,pool:Subject[]):Subject[] {
 const selection=collectionSlots[category];
 if(!selection)return pool;
 const edit=selection.map(slot=>pool.find(s=>s.id===slot.id));
 if(edit.some(s=>!s)||new Set(selection.map(s=>s.id)).size!==10||selection.length!==10)
  throw new Error(`Incomplete ten-look collection: ${category}`);
 return edit as Subject[];
}
