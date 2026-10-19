/* Pure metadata fixtures, never imported by public data or shipped as photographs. */
import assert from'node:assert/strict';
import{build}from'esbuild';
const compiled=await build({stdin:{contents:"export {projectSubject} from './src/data/portfolio';export {finalPhotographs} from './src/data/final-photography';",resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm'});
const{projectSubject,finalPhotographs}=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
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
console.log(`${checks} final-photography configuration checks passed`);
