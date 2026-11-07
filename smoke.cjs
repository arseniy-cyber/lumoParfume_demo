const vm = require('vm');
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'assets');
for (const page of ['index','catalog','brands','brand','product','favorites','cart','selection','about']) {
  const nodes = {};
  const mk = key => {
    if (!nodes[key]) nodes[key] = {innerHTML:'', textContent:'', value:'', classList:{add(){},remove(){},toggle(){}}, setAttribute(){}, addEventListener(){}, querySelector(){return null}, querySelectorAll(){return []}, focus(){}};
    return nodes[key];
  };
  const doc = {body:{dataset:{page},classList:{add(){},remove(){},toggle(){}}},documentElement:{style:{setProperty(){}}},querySelector:s=>mk(s),querySelectorAll:s=>[],addEventListener(){}};
  const ctx = {window:{addEventListener(){},scrollY:0,innerHeight:900},document:doc,location:{search:page==='product'?'?id=toskovat-9':page==='brand'?'?brand=toskovat':'',pathname:'/'+page+'.html',origin:'http://test'},localStorage:{getItem(){return null},setItem(){}},URLSearchParams,matchMedia(){return{matches:true}},IntersectionObserver:class{observe(){}unobserve(){}},setTimeout(){},clearTimeout(){},console};
  ctx.window.document=doc;
  vm.createContext(ctx);
  for (const file of ['data.js','photos.js','enrichment.js','app.js']) {
    try {vm.runInContext(fs.readFileSync(path.join(dir,file),'utf8'),ctx,{filename:file});}
    catch(e){console.error(page,'FAILED',e.stack);process.exitCode=1;break;}
  }
  let html=mk('#app').innerHTML;
  console.log(page,'HTML',html.length,'errorTokens',(html.match(/undefined|null(?=<)/g)||[]).length,'noteimgs',(html.match(/note-portraits/g)||[]).length,'hero overlays',(html.match(/hero-bottle|hero-product/g)||[]).length);
  if(page==='product')console.log('brand story',html.includes('История дома'),'scent story',html.includes('История'),'photo',html.includes('note-collages'));
}
