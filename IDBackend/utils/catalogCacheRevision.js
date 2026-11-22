// MongoDB-backed cache revision shared by separate Node/Render instances.
// A dedicated CLI process cannot clear another process's JS memory directly;
// each XML endpoint reads this single small indexed document before using cache.
import CatalogCacheRevision from '../models/CatalogCacheRevision.js';
export const CATALOG_CACHE_ID='listings';
export async function readCatalogCacheRevision(){
 const row=await CatalogCacheRevision.findById(CATALOG_CACHE_ID)
  .select('revision').lean().maxTimeMS(5000);
 return Number(row?.revision||0);
}
export async function bumpCatalogCacheRevision(){
 const row=await CatalogCacheRevision.findByIdAndUpdate(
  CATALOG_CACHE_ID,{$inc:{revision:1}},
  {upsert:true,new:true,setDefaultsOnInsert:true,runValidators:true});
 return Number(row.revision);
}
