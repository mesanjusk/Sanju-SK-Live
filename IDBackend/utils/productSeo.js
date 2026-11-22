export function slugify(value) {
 return String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
  .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,70).replace(/-+$/g,'')||'custom-design';
}
export function slugForListing(title,id) {
 const suffix=String(id||'').replace(/[^a-f0-9]/gi,'').slice(-12).toLowerCase();
 if (!suffix) throw new Error('Saved MongoDB id required for stable slug');
 return slugify(title)+'-'+suffix;
}
export function listingPath(p){return '/products/'+(p.slug||slugForListing(p.title,p._id));}
export function withSeoSlug(p){return p && !p.slug?{...p,slug:slugForListing(p.title,p._id)}:p;}
export async function backfillListingSlugs(Listing) {
 const missing={$or:[{slug:{$exists:false}},{slug:null},{slug:''}]};
 const cursor=Listing.find(missing).select('_id title').lean().cursor();
 let batch=[],updated=0;
 for await(const p of cursor){
  batch.push({updateOne:{filter:{_id:p._id,...missing},update:{$set:{slug:slugForListing(p.title,p._id)}}}});
  if(batch.length===200){const r=await Listing.bulkWrite(batch,{ordered:false});updated+=r.modifiedCount;batch=[];}
 }
 if(batch.length){const r=await Listing.bulkWrite(batch,{ordered:false});updated+=r.modifiedCount;}
 return updated;
}
