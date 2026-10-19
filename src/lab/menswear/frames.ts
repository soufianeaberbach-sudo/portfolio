import {editorial} from '../../data/portfolio-editorial';
import type {ImageAsset,FinalViews} from '../../data/portfolio';
export type World='m-streetwear'|'m-activewear'|'m-rtw'|'m-tailoring';
export type Pose={x:number;y:number;h:number;max?:number};
export type Shot={name:string;phrase:string;note:string;dark?:boolean;white?:boolean;desktop:Record<string,Pose>;mobile:Record<string,Pose>};
export type Look={id:string;photo:number;image:ImageAsset;source:string;creator:string;existing:boolean;window?:[number,number,number,number];photography?:FinalViews};
const path=(id:number)=>`sources/pexels-${id}.webp`;
const fresh=(photo:number,creator:string,slug:string,alt:string,width:number,height=1800):Look=>({id:`concept-pexels-${photo}`,photo,creator,source:`https://www.pexels.com/photo/${slug}-${photo}/`,existing:false,image:{src:path(photo),srcset:`${path(photo)} ${width}w`,width,height,alt,front:1,views:1}});
const old=(photo:number,world:World):Look=>({id:`${world}-pexels-${photo}`,photo,image:{...editorial[photo].image,src:`../../../../public${editorial[photo].image.src}`,srcset:'',views:1},creator:'Creator not recorded in existing metadata',source:editorial[photo].credit.sourcePage!,existing:true});
export const looks:Record<string,Look>={
 cream:fresh(6311316,'Monstera Production','calm-black-man-in-comfy-sportswear-standing-in-light-room','Man in a cream hooded sweatshirt and matching trousers, standing against a concrete wall, with both shoes visible.',1200),
 city:old(8505243,'m-streetwear'),booth:old(30599804,'m-streetwear'),
 statement:fresh(17303564,'George Issack','man-wearing-oversized-suit','Full photographed look in a teal oversized jacket, white wide-leg trousers, patterned tie and white bucket hat against a grey studio wall.',1440),
 polo:old(7648388,'m-activewear'),black:old(30954220,'m-activewear'),
 ground:{...fresh(7116192,'Wesley Davi','man-in-sportswear-standing-on-knee-in-studio','Man in a black T-shirt, shorts and trainers, kneeling on a white studio floor. Complete photographed pose.',1375),window:[0,.45,1,.55]},
 knit:old(16711124,'m-rtw'),
 plinth:fresh(29727778,'Mohammed Hassan','fashion-model-posing-in-minimalist-studio-setting','Man in a white T-shirt, dark trousers and white trainers, seated on a white plinth against a pale blue studio background.',1192),
 green:{...fresh(8508752,'Ivan S','a-man-in-white-shirt','Full photographed figure in a white shirt and green trousers, barefoot, with a checked shirt over one shoulder on a white studio ground.',1200),window:[.27,.13,.60,.60]},
 unbound:fresh(6844165,'cottonbro studio','man-wearing-frill-shirt-in-white-linen-and-black-pants','Complete photographed pose of a man in a white frill-front shirt and black trousers, with both arms raised, in a red and dark studio.',1200),
 steel:old(16862147,'m-tailoring'),
 daylight:fresh(6097464,'Willy Espinosa','studio-portrait-of-an-elegant-man-in-a-suit','Complete standing man in a dark suit with contrasting elbow patches and brown shoes on a light studio background.',1200),
 ivory:fresh(14348500,'Trần Long','man-in-a-beige-suit-sitting','Complete photographed pose of a man in an ivory suit and black bow tie, leaning on a plinth in a dark studio.',1201),
};
const p=(x:number,y:number,h:number,max?:number):Pose=>({x,y,h,max});
export const worlds:Record<World,{name:string;title:string;number:string;cast:string[];shots:Shot[]}>= {
 'm-streetwear':{name:'Streetwear',title:'Presence',number:'01',cast:['cream','booth','city','statement'],shots:[
  {name:'The held figure',phrase:'Presence.',note:'Volume. Attitude. Identity.',desktop:{cream:p(68,49,86)},mobile:{cream:p(50,55,75)}},
  {name:'A second axis',phrase:'A second\naxis.',note:'Volume meets direction.',desktop:{cream:p(31,50,77),city:p(75,50,77)},mobile:{city:p(50,53,79)}},
  {name:'The threshold',phrase:'Outside\nthe frame.',note:'The same light. A different room.',dark:true,desktop:{booth:p(69,50,86)},mobile:{booth:p(50,54,78)}},
  {name:'Space between',phrase:'Space\nbetween.',note:'Two photographic rooms. One dialogue.',desktop:{cream:p(29,53,76),booth:p(73,53,76)},mobile:{cream:p(50,53,79)}},
  {name:'Presence, held',phrase:'Own the\nroom.',note:'Volume becomes a point of view.',desktop:{statement:p(67,50,91)},mobile:{statement:p(50,54,82)}},
 ]},
 'm-activewear':{name:'Activewear',title:'Momentum',number:'02',cast:['polo','black','ground'],shots:[
  {name:'Poise',phrase:'Momentum.',note:'Precision before movement.',desktop:{polo:p(68,49,86)},mobile:{polo:p(50,54,77)}},
  {name:'Counterweight',phrase:'Held in\nbalance.',note:'Upright. Grounded. Ready.',desktop:{polo:p(29,51,78),black:p(74,51,78)},mobile:{black:p(50,53,79)}},
  {name:'Compression',phrase:'Stored\nenergy.',white:true,note:'A real pose. No invented performance.',desktop:{ground:p(66,56,90)},mobile:{ground:p(50,57,82)}},
  {name:'Release',phrase:'Then,\nrelease.',note:'Direction without distortion.',desktop:{polo:p(52,50,87)},mobile:{polo:p(50,53,79)}},
  {name:'Momentum, held',phrase:'In your\nown time.',white:true,note:'A vertical line. A low counterpoint.',desktop:{black:p(28,47,80),ground:p(76,64,61)},mobile:{black:p(50,53,80)}},
 ]},
 'm-rtw':{name:'Ready-to-Wear',title:'Evolution',number:'03',cast:['knit','plinth','green','unbound'],shots:[
  {name:'Ease',phrase:'Evolution.',note:'Refinement can be relaxed.',desktop:{knit:p(68,50,86)},mobile:{knit:p(50,55,75)}},
  {name:'The interval',phrase:'A quieter\nstructure.',note:'Proportion. Support. Ease.',desktop:{plinth:p(62,51,88)},mobile:{plinth:p(50,54,79)}},
  {name:'Open field',phrase:'Room to\nchange.',white:true,note:'A complete silhouette, newly standing.',desktop:{green:p(65,52,85)},mobile:{green:p(50,54,77)}},
  {name:'Balance',phrase:'In\nbalance.',note:'Different sources. Deliberate relationships.',desktop:{knit:p(28,53,75),plinth:p(73,53,75)},mobile:{plinth:p(50,53,79)}},
  {name:'Evolution, held',phrase:'Ease,\nunbound.',note:'From a compressed pose to a real expressive stance.',dark:true,desktop:{unbound:p(66,49,90)},mobile:{unbound:p(50,54,81)}},
 ]},
 'm-tailoring':{name:'Tailoring',title:'Authority',number:'04',cast:['steel','daylight','ivory'],shots:[
  {name:'The line',phrase:'Authority.',note:'Proportion speaks first.',dark:true,desktop:{steel:p(68,49,86)},mobile:{steel:p(50,54,77)}},
  {name:'Daylight',phrase:'In the\nclear.',note:'The complete line, in daylight.',desktop:{daylight:p(67,50,86)},mobile:{daylight:p(50,54,78)}},
  {name:'The reversal',phrase:'Two ways\nto hold.',note:'Dark cloth. Different photographic light.',desktop:{steel:p(29,52,77),daylight:p(74,52,77)},mobile:{daylight:p(50,54,79)}},
  {name:'Precision',phrase:'Every\nline counts.',note:'A precise pause before the final look.',desktop:{steel:p(66,49,85)},mobile:{steel:p(50,53,79)},dark:true},
  {name:'Authority, held',phrase:'Nothing\nto add.',note:'Hold the look. Then explore the edit.',desktop:{ivory:p(62,48,90)},mobile:{ivory:p(50,53,80)}},
 ]},
};
