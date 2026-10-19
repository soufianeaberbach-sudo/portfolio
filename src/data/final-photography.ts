import type {ImageAsset,Subject,SubjectView} from './portfolio';
export interface Photograph extends Omit<SubjectView,'key'> {key:SubjectView['key']|'original';}
export const separable=(image:ImageAsset)=>image.views===2&&image.separable!==false&&image.front>0&&image.front<1;
/** An adapter over existing final views, not a second project/content model. */
export function finalPhotographs(subject:Subject):Photograph[]{
 const views:Photograph[]=[],seen=new Set<string>();
 for(const supplied of subject.views){
  const crop=supplied.crop!=='whole'&&!separable(supplied.image)?'whole':supplied.crop;
  const token=`${supplied.image.src}:${crop}`;if(seen.has(token))continue;seen.add(token);
  views.push({...supplied,crop,label:crop==='whole'&&supplied.image.views===2?'Complete original':supplied.label});
 }
 if(!views.length)views.push({key:'original',label:'Complete original',image:subject.cover,crop:'whole'});
 for(const v of [...views])if(v.crop!=='whole'&&!views.some(other=>other.image.src===v.image.src&&other.crop==='whole'))views.push({key:'original',label:'Complete original',image:v.image,crop:'whole'});
 return views;
}
