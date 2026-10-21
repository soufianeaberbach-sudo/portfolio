/* Pure metadata fixtures, never imported by public data or shipped as photographs. */
import assert from'node:assert/strict';
import{build}from'esbuild';
const compiled=await build({stdin:{contents:"export {projectSubject,referenceSubject} from './src/data/portfolio';export {finalPhotographs,photoRegion,photoSizes} from './src/data/final-photography';",resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm'});
const{projectSubject,referenceSubject,finalPhotographs,photoRegion,photoSizes}=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
const image=(name,width=1200,height=1800)=>({src:`/test-only/${name}.webp`,srcset:'',alt:`TEST CONFIGURATION: ${name}`,width,height,front:1,views:1});
const project=(final)=>({id:'test-only',gender:'womenswear',marketCategory:'rtw',title:'TEST ONLY',finalGarmentImage:image('front'),final});
let checks=0;const same=(a,b)=>{assert.deepEqual(a,b);checks++;};
const two={...image('two-up'),views:2,front:.5};
same(finalPhotographs(projectSubject(project({composite:two}),'womenswear')).map(v=>[v.key,v.crop]),[['front','front'],['back','back'],['original','whole']]);
same(finalPhotographs(projectSubject(project({composite:{...two,separable:false}}),'womenswear')).map(v=>v.crop),['whole']);
same(finalPhotographs(projectSubject(project({composite:{...two,front:0}}),'womenswear')).map(v=>v.crop),['whole']);
same(finalPhotographs(projectSubject(project({front:image('front'),back:image('back')}),'womenswear')).map(v=>[v.key,v.image.src,v.crop]),[['front','/test-only/front.webp','whole'],['back','/test-only/back.webp','whole']]);
const multiple=finalPhotographs(projectSubject(project({front:image('portrait'),back:image('back',1800,1200),side:image('side',900,2400),editorial:image('editorial',2400,1200),details:[{image:image('detail')}]}),'womenswear'));
same(multiple.map(v=>v.key),['front','back','side','editorial','detail']);same(multiple.map(v=>[v.image.width,v.image.height]),[[1200,1800],[1800,1200],[900,2400],[2400,1200],[1200,1800]]);
same(finalPhotographs(projectSubject(project({front:image('single')}),'womenswear')).map(v=>v.key),['front']);
const missing=projectSubject(project({}),'womenswear');missing.views=[];same(finalPhotographs(missing).map(v=>v.crop),['whole']);
const repeated=projectSubject(project({front:image('single')}),'womenswear');repeated.views.push({...repeated.views[0]});same(finalPhotographs(repeated).length,1);
// Standard three-panel masters are explicit; old sources are never repartitioned.
const three={...image('three-panel',5400,2700),views:3,front:1/3,thirdView:'editorial'};
for(const world of['womenswear','menswear']){
 const final=finalPhotographs(projectSubject(project({composite:three}),world));
 same(final.map(v=>[v.key,v.crop,v.label]),[['front','front','Front'],['back','back','Back'],['editorial','third','Fashion pose'],['original','whole','Complete original']]);
 same(final.map(v=>photoRegion(v.image,v.crop)),[[0,1/3],[1/3,2/3],[2/3,1],[0,1]]);
 same(finalPhotographs(referenceSubject({id:'test-only',image:{...three,thirdView:'detail'}},world,'rtw')).map(v=>v.key),['front','back','detail','original']);
 same(finalPhotographs(projectSubject(project({composite:{...three,width:5300}}),world)).map(v=>v.crop),['whole']);
 same(finalPhotographs(projectSubject(project({composite:{...three,separable:false}}),world)).map(v=>v.crop),['whole']);
}
same(finalPhotographs(projectSubject(project({composite:three,editorial:image('separate-fashion')}),'womenswear')).filter(v=>v.key==='editorial').map(v=>v.image.src),['/test-only/separate-fashion.webp']);
same(photoSizes(three,'front','(max-width:767px) 90vw, 48vw'),'(max-width:767px) 270vw, 144vw');
same(photoSizes(two,'front','(max-width:767px) 90vw, 48vw'),'(max-width:767px) 90vw, 48vw');
same(finalPhotographs(projectSubject(project({composite:{...three,thirdView:undefined}}),'womenswear'))[2].label,'Third view');
console.log(`${checks} final-photography configuration checks passed`);
