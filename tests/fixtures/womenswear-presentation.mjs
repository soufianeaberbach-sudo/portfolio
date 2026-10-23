import {readFileSync} from 'node:fs';

// A selected presentation has its own route; historical source routes stay intact.
const records=JSON.parse(readFileSync(new URL('../../src/data/womenswear-generated.json',import.meta.url),'utf8'));
export function selectedWomenswear(sourceIdentity){
 return records.find(record=>record.integrated&&record.sourceIdentity===sourceIdentity);
}
export function featuredWomenswearIdentity(sourceIdentity){
 return selectedWomenswear(sourceIdentity)?.id??sourceIdentity;
}
