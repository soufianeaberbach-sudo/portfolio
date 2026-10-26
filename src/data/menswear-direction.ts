import{menswear}from'./portfolio';
const categoryLabel=(id:string)=>menswear.categories.find(c=>c.id===id)!.label;
import type{MenswearCategory}from'./menswear-collection';
export type SourceWindow=[number,number,number,number];
// Windows trim only verified empty source margins. All primary resting figures remain complete.
export const menswearWindows:Record<number,SourceWindow>={30599804:[0,.2,1,.8],7116192:[0,.45,1,.55],8508752:[.27,.13,.6,.6],17303564:[.24,0,.6,1],26936522:[.28,.09,.45,.84]};
export interface MenswearDirection{name:string;title:string;cast:number[];scenes:string[];next:string;}
export const menswearDirections:Record<MenswearCategory,MenswearDirection>={
 'm-streetwear':{name:categoryLabel('m-streetwear'),title:'Presence',cast:[6311316,8505243,30599804,17303564,26936522],scenes:['Denim / proportion', 'Everyday essentials', 'Boxy jersey', 'Volume / contrast', 'Jersey co-ord'],next:'m-activewear'},
 'm-activewear':{name:categoryLabel('m-activewear'),title:'Momentum',cast:[7648388,30954220,7116192,11000101,6974949,33443605],scenes:['Training', 'Performance / pace', 'Running', 'Protection / movement', 'Outdoor performance'],next:'m-rtw'},
 'm-rtw':{name:categoryLabel('m-rtw'),title:'Evolution',cast:[16711124,29727778,13128635,8508752,7764014],scenes:['Bomber / volume', 'Structure / contrast', 'Leather', 'Length / proportion', 'Trench'],next:'m-tailoring'},
 'm-tailoring':{name:categoryLabel('m-tailoring'),title:'Authority',cast:[6097464,29242239,16862147,14348500,6207215],scenes:['Single-breasted', 'Structure / balance', 'Double-breasted', 'Evening / precision', 'Tuxedo'],next:'3d-simulation'},
};
