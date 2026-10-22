import type {ImageAsset,Subject,SubjectView} from './portfolio';
export interface Photograph extends Omit<SubjectView,'key'> {key:SubjectView['key']|'original';}
/** Three-panel geometry is opt-in and validates the standard 2:1 master. */
export const threePanel=(image:ImageAsset)=>image.views===3&&image.separable!==false&&image.width>0&&image.height>0&&image.width===2*image.height;
export const separable=(image:ImageAsset)=>threePanel(image)||(image.views===2&&image.separable!==false&&image.front>0&&image.front<1);
export function photoRegion(image:ImageAsset,crop:SubjectView['crop']):[number,number]{
 if(crop==='whole'||!separable(image))return[0,1];
 if(threePanel(image))return crop==='front'?[0,1/3]:crop==='back'?[1/3,2/3]:[2/3,1];
 return crop==='front'?[0,image.front]:crop==='back'?[image.front,1]:[0,1];
}
/** sizes describes the full image, not just a one-third aperture. Legacy sizing is unchanged. */
export function photoSizes(image:ImageAsset,crop:SubjectView['crop'],sizes:string):string{
 const[a,b]=photoRegion(image,crop);if(!threePanel(image)||b-a===1)return sizes;
 return sizes.replace(/([\d.]+)(vw|px|rem|em)(?=\s*(?:,|$))/g,(_,value,unit)=>`${Number((Number(value)/(b-a)).toFixed(3))}${unit}`);
}
/** An adapter over existing final views, not a second project/content model. */
export function finalPhotographs(subject:Subject):Photograph[]{
 const views:Photograph[]=[],seen=new Set<string>();
 for(const supplied of subject.views){
  const crop=supplied.crop!=='whole'&&(!separable(supplied.image)||(supplied.crop==='third'&&!threePanel(supplied.image)))?'whole':supplied.crop;
  const token=`${supplied.image.src}:${crop}`;if(seen.has(token))continue;seen.add(token);
  views.push({...supplied,crop,label:crop==='whole'&&(supplied.image.views??1)>1?'Complete original':supplied.label});
 }
 if(!views.length)views.push({key:'original',label:'Complete original',image:subject.cover,crop:'whole'});
 for(const v of [...views])if(v.crop!=='whole'&&!views.some(other=>other.image.src===v.image.src&&other.crop==='whole'))views.push({key:'original',label:'Complete original',image:v.image,crop:'whole'});
 return views;
}
