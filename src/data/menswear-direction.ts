import type{MenswearCategory}from'./menswear-collection';
export type SourceWindow=[number,number,number,number];
// Windows trim only verified empty source margins. All primary resting figures remain complete.
export const menswearWindows:Record<number,SourceWindow>={30599804:[0,.2,1,.8],7116192:[0,.45,1,.55],8508752:[.27,.13,.6,.6],17303564:[.24,0,.6,1],26936522:[.28,.09,.45,.84]};
export interface MenswearDirection{name:string;title:string;cast:number[];scenes:string[];next:string;}
export const menswearDirections:Record<MenswearCategory,MenswearDirection>={
 'm-streetwear':{name:'Streetwear',title:'Presence',cast:[6311316,8505243,30599804,17303564,26936522],scenes:['A held volume','The obstruction','The room within','An opening in the room','Volume, resolved'],next:'m-activewear'},
 'm-activewear':{name:'Activewear',title:'Momentum',cast:[7648388,30954220,7116192,11000101,6974949,33443605],scenes:['Poise','Compression','A change of direction','Counterweight','Suspension'],next:'m-rtw'},
 'm-rtw':{name:'Ready-to-Wear',title:'Evolution',cast:[16711124,29727778,13128635,8508752,6844165],scenes:['A contained line','The support','A held structure','The interval opens','Unbound'],next:'m-tailoring'},
 'm-tailoring':{name:'Tailoring',title:'Authority',cast:[6097464,29242239,16862147,14348500,6207215],scenes:['In the clear','A lighter silhouette','The dark line','A reversal of light','Into the city'],next:'3d-simulation'},
};
