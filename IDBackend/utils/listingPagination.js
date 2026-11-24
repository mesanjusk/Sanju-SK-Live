// Optional paginated storefront API; legacy /api/listings stays an array for admin.
export const DEFAULT_PAGE_SIZE=18;
export const MAX_PAGE_SIZE=30;
const esc=s=>String(s).replace(/[-/\\^$*+?.()|[\]{}]/g,'\\$&');
const positiveInt=(value,fallback,max)=>{
 const number=Number(value);
 return Number.isSafeInteger(number)&&number>0 ? Math.min(number,max) : fallback;
};
export function parseListingPage(query={}){
 const page=positiveInt(query.page,1,1000);
 const limit=positiveInt(query.limit,DEFAULT_PAGE_SIZE,MAX_PAGE_SIZE);
 const direction=query.direction==='asc'?1:-1;
 const categories=String(query.category||'').split(',').map(s=>s.trim()).filter(Boolean).slice(0,4);
 const subcategory=String(query.subcategory||'').trim().slice(0,100);
 const subcategoryName=String(query.subcategoryName||'').trim().slice(0,100);
 const search=String(query.search||'').trim().slice(0,80);
 const filter={active:{$ne:false}};
 if(categories.length)filter.category=categories.length===1?categories[0]:{$in:categories};
 if(subcategory){
  filter.subcategory=subcategoryName?{$in:[subcategory,subcategoryName]}:subcategory;
 }
 if(query.religion)filter.religions=String(query.religion).slice(0,80);
 if(search){
  const regex=new RegExp(esc(search),'i');
  filter.$or=[{title:regex},{description:regex},{category:regex},{subcategory:regex}];
 }
 const sort=query.sort==='price-asc'?{price:1,_id:1}:
   query.sort==='price-desc'?{price:-1,_id:-1}:
   {createdAt:direction,_id:direction};
 return {page,limit,skip:(page-1)*limit,filter,sort};
}
