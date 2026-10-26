import{womenswear}from'./portfolio';
const categoryLabel=(id:string)=>womenswear.categories.find(c=>c.id===id)!.label;
/** Four public photographic edits. Coordinates describe composed shots, never archive rank. */
export interface Pose { x:number; floor?:number; scale:number; opacity?:number; }
export interface Shot { at:number; label:string; poses:Record<string,Pose>; }
export interface Direction {
 id:string; name:string; title:string[]; number:string; next:{id:string;name:string}; length:number; mobileLength:number;
 cast:{id:string;role:string;reason:string}[]; desktop:Shot[]; mobile:Shot[];
}
const p=(x:number,scale=1,floor=.97,opacity=1):Pose=>({x,scale,floor,opacity});
const leadDirection=(id:string,name:string,title:string[],number:string,leads:string[],next:{id:string;name:string}):Direction=>({
 id,name,title,number,next,length:235,mobileLength:220,
 cast:leads.map((id,i)=>({id,role:i?'second':'lead',reason:'Owner-selected category hook; complete existing photograph.'})),
 desktop:[
  {at:0,label:'SELECTED / 01',poses:{lead:p(.68,.88),second:p(1.5,.96,.97,0)}},
  {at:.2,label:'SILHOUETTE',poses:{lead:p(.55,1)}},
  {at:.56,label:'SELECTED / 02',poses:{lead:p(-.7,.96,.97,0),second:p(.53,1)}},
  {at:1,label:'EXPLORE THE EDIT',poses:{second:p(.53,1)}}],
 mobile:[
  {at:0,label:'SELECTED / 01',poses:{lead:p(.55,.90),second:p(1.5,.96,.97,0)}},
  {at:.2,label:'SILHOUETTE',poses:{lead:p(.51,1)}},
  {at:.56,label:'SELECTED / 02',poses:{lead:p(-.8,.96,.97,0),second:p(.51,1)}},
  {at:1,label:'EXPLORE THE EDIT',poses:{second:p(.51,1)}}],
});
export const directions:Record<string,Direction>={
 casualwear:leadDirection('casualwear','Casualwear',['CASUAL—','WEAR'],'01',['rtw-ref-03','streetwear-ref-01'],{id:'activewear',name:'ACTIVEWEAR'}),
 activewear:leadDirection('activewear',categoryLabel('activewear'),['ACTIVE—','WEAR'],'02',['activewear-ref-01','activewear-ref-08'],{id:'evening',name:'OCCASIONWEAR'}),
 evening:leadDirection('evening',categoryLabel('evening'),['OCCASION—','WEAR'],'03',['evening-ref-01','evening-ref-05'],{id:'swimwear',name:'SWIMWEAR'}),
 swimwear:leadDirection('swimwear','Swimwear',['SWIMWEAR'],'04',['swimwear-ref-01','swimwear-ref-08'],{id:'menswear',name:'MENSWEAR'}),
};
/** Existing source-qualified empty-gap windows; source metadata remains authoritative. */
export const photoFrames:Record<string,{source:string;front:[number,number];back:[number,number];single?:boolean}>= {
 'streetwear-ref-03':{source:'/portfolio/temporary-v21/pexels-16982847-1800.webp',front:[.27,.80],back:[.27,.80],single:true},
 'streetwear-ref-04':{source:'/portfolio/temporary-v21/pexels-5878800-1800.webp',front:[.19,.84],back:[.19,.84],single:true},
 'streetwear-ref-05':{source:'/portfolio/temporary-v21/pexels-18532851-1800.webp',front:[.23,.77],back:[.23,.77],single:true},
 'swimwear-ref-10':{source:'/portfolio/temporary-v21/pexels-19132425-1800.webp',front:[.12,.79],back:[.12,.79],single:true},
 'swimwear-ref-01':{source:'/portfolio/swim/1-1400.webp',front:[0.2,0.84],back:[0.2,0.84],single:true},
 'swimwear-ref-02':{source:'/portfolio/swim/2-1400.webp',front:[0.17,0.86],back:[0.17,0.86],single:true},
 'swimwear-ref-03':{source:'/portfolio/swim/3-1400.webp',front:[0.22,0.83],back:[0.22,0.83],single:true},
 'swimwear-ref-04':{source:'/portfolio/swim/4-1400.webp',front:[0.23,0.73],back:[0.23,0.73],single:true},
 'swimwear-ref-07':{source:'/portfolio/swim/7-1400.webp',front:[0.15,0.82],back:[0.15,0.82],single:true},
 'swimwear-ref-09':{source:'/portfolio/swim/9-1400.webp',front:[0.27,0.82],back:[0.27,0.82],single:true},
 'swimwear-ref-06':{source:'/portfolio/swim/6-1400.webp',front:[.25,.78],back:[.25,.78],single:true},
 'swimwear-ref-08':{source:'/portfolio/swim/8-1400.webp',front:[.25,.78],back:[.25,.78],single:true},
 'swimwear-ref-05':{source:'/portfolio/swim/5-1400.webp',front:[.24,.86],back:[.24,.86],single:true},
 'activewear-ref-01':{source:'/portfolio/sport/1-1400.webp',front:[0,.538],back:[.54,1]},
 'rtw-ref-01':{source:'/portfolio/woven/1-1400.webp',front:[0,.49],back:[.575,1]},
 'rtw-ref-02':{source:'/portfolio/woven/2-1400.webp',front:[0,.49],back:[.565,1]},
 'rtw-ref-03':{source:'/portfolio/woven/3-1400.webp',front:[0,.50],back:[.585,1]},
 'rtw-ref-05':{source:'/portfolio/woven/5-1400.webp',front:[0,.48],back:[.57,1]},
 'rtw-ref-06':{source:'/portfolio/woven/6-1400.webp',front:[0,.515],back:[.565,1]},
};
