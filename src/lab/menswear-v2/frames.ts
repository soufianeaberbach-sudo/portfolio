import type {Look} from '../menswear/frames';
import {worlds as reviewedWorlds,looks as reviewedLooks} from '../menswear/frames';
export type {World,Pose,Look} from '../menswear/frames';

// V1 stays immutable. The V2 camera trims only empty grey margins around the hero.
// The source image, available view and reader original remain unchanged.
export const looks:Record<string,Look>={...reviewedLooks,statement:{...reviewedLooks.statement,window:[.24,0,.60,1] as [number,number,number,number]}};
const acts=['Intrigue / Held volume','Expectation / The barrier','Disruption / A room within','Revelation / The opening','Hero / Presence'];
export const worlds={...reviewedWorlds,'m-streetwear':{...reviewedWorlds['m-streetwear'],shots:reviewedWorlds['m-streetwear'].shots.map((shot,i)=>({...shot,name:acts[i],phrase:'',note:''}))}};
