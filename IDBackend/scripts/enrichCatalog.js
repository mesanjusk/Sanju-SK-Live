// Safe-by-default product SEO enrichment.
// Examples: node scripts/enrichCatalog.js --examples
//           node scripts/enrichCatalog.js --preview-api
//           MONGO_URI=... node scripts/enrichCatalog.js --dry-run
// Apply ONLY after explicit review: --apply --confirm=I_APPROVE_ENRICHMENT
import {writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {createSeoPreview} from '../utils/enrichListingSeo.js';

const args=process.argv.slice(2);
const has=name=>args.includes(name);
const flag=name=>args.find(x=>x.startsWith(name+'='))?.slice(name.length+1);
const sampleLimit=Math.max(1,Math.min(50,Number(flag('--limit')||15)));
const BASE='https://sanju-sk-live.onrender.com';
const isWrite=has('--apply')||has('--rollback');
if(isWrite&&flag('--confirm')!=='I_APPROVE_ENRICHMENT'){
 console.error('REFUSING database writes. Requires --confirm=I_APPROVE_ENRICHMENT after reviewing a dry-run.');
 process.exit(2);
}
if(has('--apply')&&has('--rollback'))throw Error('Choose only one write mode');

function demo(){
 const rows=[
 ['Icard','Office Stationery','ID Cards'],
 ['Housie','Wedding Cards','Wedding Activities'],
 ['Housie Tickets','Wedding Cards','Wedding Activities'],
 ['Cutout','Event Printing','Photo Cutouts'],
 ['Cones','Wedding Accessories','Mehendi'],
 ['Tag','Corporate Stationery','Gift Tags'],
 ['Badges','Corporate Stationery','Event Badges'],
 ['Floral','Wedding Cards','Designer Invitations'],
 ['Acrylic','Wedding Cards','Acrylic Invitations'],
 ['Acrylic','Signage','Name Plates'],
 ['Welcome Board','Wedding Signage','Welcome Boards'],
 ['Playing Cards','Wedding Accessories','Party Games'],
 ['Memento','Corporate Gifts','Awards'],
 ['Visiting Cards','Business Printing','Stationery'],
 ['Envelopes','Wedding Cards','Envelopes']
 ];
 const categories=[],subcategories=[],products=[];
 rows.forEach(([title,cat,sub],i)=>{
  const _id='507f1f77bcf86cd7994390'+String(i+1).padStart(2,'0');
  const cid=String(100+i),sid=String(300+i);
  categories.push({_id:cid,name:cat});subcategories.push({_id:sid,name:sub});
  products.push({_id,title,description:title,category:cid,subcategory:sid,
   slug:'unchanged-demo-slug-'+String(i+1).padStart(2,'0'),price:450,
   quantityPricing:[{minQty:100,price:450}],images:['https://example.com/design.jpg']});
 });
 return {products,categories,subcategories};
}
async function fetchJson(path){
 let last;
 for(let attempt=0;attempt<3;attempt++){
  try{
   const res=await fetch(BASE+path,{signal:AbortSignal.timeout(19000)});
   if(!res.ok)throw Error(path+' status '+res.status);
   const body=await res.json();
   if(!Array.isArray(body))throw Error(path+' did not return an array');
   return body;
  }catch(e){last=e;}
 }
 throw last;
}
async function remotePreview(){
 const [products,categories,subcategories]=await Promise.all([
  fetchJson('/api/listings'),fetchJson('/api/categories'),fetchJson('/api/subcategories')
 ]);
 return {products,categories,subcategories};
}
function diverse(rows,limit){
 const first=[],more=[],categories=new Set();
 for(const row of rows){
  const category=String(row.category||'');
  if(!categories.has(category)){first.push(row);categories.add(category);}
  else more.push(row);
 }
 return [...first,...more].slice(0,limit);
}
function display(rows,products,mode){
 const samples=diverse(rows,sampleLimit);
 console.log('SEO PREVIEW MODE:',mode);
 console.log('NO MONGODB WRITES IN DRY-RUN OR EXAMPLES MODES');
 console.log('Total catalog documents:',products.length);
 console.log('Eligible title/description proposals:',rows.length);
 console.log('Showing',samples.length,'category-diverse Before -> After pairs.');
 samples.forEach((r,i)=>{
  console.log('\n['+String(i+1).padStart(2,'0')+'] '+r.category+(r.subcategory?' > '+r.subcategory:''));
  console.log('Slug (PRESERVED):',r.slug);
  console.log('Title before:',r.beforeTitle);
  console.log('Title after :',r.afterTitle);
  console.log('Desc before :',r.beforeDescription||'(empty)');
  console.log('Desc after  :',r.afterDescription||'(empty)');
 });
}
async function databaseModels(){
 if(!process.env.MONGO_URI)throw Error('MONGO_URI required for direct MongoDB preview or approved apply');
 if(!process.env.MONGO_URI){try{await import('dotenv/config');}catch{}}
 const mongoose=(await import('mongoose')).default;
 const Listing=(await import('../models/Listing.js')).default;
 const Category=(await import('../models/Category.js')).default;
 const Subcategory=(await import('../models/Subcategory.js')).default;
 const {bumpCatalogCacheRevision}=await import('../utils/catalogCacheRevision.js');
 await mongoose.connect(process.env.MONGO_URI,{serverSelectionTimeoutMS:12000});
 return {mongoose,Listing,Category,Subcategory,bumpCatalogCacheRevision};
}
async function directData(models){
 const [products,categories,subcategories]=await Promise.all([
  models.Listing.find({}).select('_id title description slug originalTitle originalDescription category subcategory material size customizationDetails price quantityPricing badge seoKeywords active published').lean(),
  models.Category.find({}).select('_id name').lean(),
  models.Subcategory.find({}).select('_id name').lean()
 ]);
 return {products,categories,subcategories};
}
async function applyRows(models,rows,products){
 const eligible=new Map(products.map(p=>[String(p._id),p]));
 const updates=rows.map(row=>{
  const original=eligible.get(row.id);
  if(!original||typeof original.slug!=='string'||original.slug!==row.slug)throw Error('Source slug mismatch '+row.id);
  const filter={_id:original._id,title:row.beforeTitle,slug:row.slug,
   originalTitle:{$exists:false}};
  if(Object.hasOwn(original,'description'))filter.description=original.description;
  else filter.description={$exists:false};
  const fields={
   title:row.afterTitle,originalTitle:row.beforeTitle,
   originalDescription:original.description||'',seoEnrichmentVersion:'v1',
   seoEnrichedAt:new Date(),updatedAt:new Date()
  };
  if(row.changeDescription)fields.description=row.afterDescription;
  return {updateOne:{filter,update:{$set:fields}}};
 });
 const stamp=new Date().toISOString().replace(/[:.]/g,'-');
 const filename='seo-enrichment-backup-'+stamp+'.json';
 // Abort if the backup cannot be written BEFORE any MongoDB update.
 await writeFile(filename,JSON.stringify({createdAt:new Date().toISOString(),rows},null,2),{flag:'wx',mode:0o600});
 console.log('Rollback audit backup:',filename);
 let modified=0;
 try{
  for(let start=0;start<updates.length;start+=100){
   const batch=updates.slice(start,start+100);
   const result=await models.Listing.bulkWrite(batch,{ordered:false});
   modified+=result.modifiedCount||0;
   if(result.modifiedCount)await models.bumpCatalogCacheRevision();
  }
 }finally{
  if(modified)await models.bumpCatalogCacheRevision();
 }
 const changed=await models.Listing.find({_id:{$in:rows.map(r=>r.id)}})
  .select('_id slug title originalTitle').lean();
 const byId=new Map(changed.map(p=>[String(p._id),p]));
 for(const row of rows){
  const actual=byId.get(row.id);
  if(!actual||actual.slug!==row.slug)throw Error('CRITICAL: Slug changed or missing for '+row.id);
 }
 console.log('APPLY SUMMARY:',JSON.stringify({
  considered:rows.length,updated:modified,skippedByOptimisticGuards:rows.length-modified,
  slugChanges:0,cacheRevisionBumped:modified>0
 }));
 return modified;
}
async function rollback(models){
 const docs=await models.Listing.find({seoEnrichmentVersion:'v1',originalTitle:{$exists:true}})
  .select('_id slug title description originalTitle originalDescription').lean();
 const backupName='seo-rollback-backup-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';
 await writeFile(backupName,JSON.stringify(docs,null,2),{flag:'wx',mode:0o600});
 let updated=0;
 for(let i=0;i<docs.length;i+=100){
  const batch=docs.slice(i,i+100).map(p=>({updateOne:{
   filter:{_id:p._id,slug:p.slug,title:p.title,seoEnrichmentVersion:'v1'},
   update:{$set:{title:p.originalTitle,description:p.originalDescription||'',updatedAt:new Date()},
    $unset:{originalTitle:'',originalDescription:'',seoEnrichmentVersion:'',seoEnrichedAt:''}}
  }}));
  const result=await models.Listing.bulkWrite(batch,{ordered:false});
  updated+=result.modifiedCount||0;
  if(result.modifiedCount)await models.bumpCatalogCacheRevision();
 }
 console.log('ROLLBACK:',{updated,backupName,slugChanges:0});
}
async function verifyPublicXml(){
 const {spawnSync}=await import('node:child_process');
 for(const route of ['/feeds/google-merchant.xml','/sitemap-products.xml']){
  try{
   const res=await fetch('https://www.sanjusk.in'+route,{signal:AbortSignal.timeout(18000)});
   if(!res.ok)throw Error('HTTP '+res.status);
   const xml=await res.text();
   const result=spawnSync('python3',['-c',"import sys,xml.etree.ElementTree as ET; ET.fromstring(sys.stdin.read());print('valid XML')"],
    {input:xml,encoding:'utf8'});
   if(result.status!==0)throw Error(result.stderr||String(result.error));
   console.log('PUBLIC XML VERIFIED',route,xml.length,'bytes');
  }catch(error){
   console.error('PUBLIC XML NOT VERIFIED',route,error.message);
  }
 }
}
let models;
try{
 let data,mode;
 if(has('--examples')){data=demo();mode='illustrative examples (NOT live MongoDB)';}
 else if(has('--preview-api')){data=await remotePreview();mode='read-only live public catalog API';}
 else{
  models=await databaseModels();
  if(has('--rollback')){await rollback(models);await verifyPublicXml();process.exitCode=0;}
  else {data=await directData(models);mode=isWrite?'approved direct MongoDB write':'read-only direct MongoDB dry-run';}
 }
 if(data){
  const rows=createSeoPreview(data.products,data.categories,data.subcategories);
  display(rows,data.products,mode);
  if(has('--apply')){
   if(!models)throw Error('No direct database connection; refusing apply');
   const count=await applyRows(models,rows,data.products);
   if(count)await verifyPublicXml();
  }
 }
}catch(e){console.error('SEO enrich error:',e.message);process.exitCode=1;}
finally{if(models)await models.mongoose.disconnect();}
