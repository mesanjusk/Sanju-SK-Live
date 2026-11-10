// Per-tab, privacy-conscious recommendations. No customer contact details.
const KEY='sk_design_interests_v1';
export const productId=p=>String(p?._id||p?.id||'').trim();
export const categoryId=p=>String(p?.category?._id||p?.category?.category_uuid||p?.category||'').trim();
const stop=new Set('custom design designs and for the new made gondia digital card printing with from this that'.split(' '));
const tokens=s=>new Set(String(s||'').toLowerCase().split(/[^a-z0-9]+/).filter(x=>x.length>2&&!stop.has(x)).slice(0,50));
export function freshFeedSeed(){
  if(typeof crypto!=='undefined'&&crypto.getRandomValues){const a=new Uint32Array(1);crypto.getRandomValues(a);return String(a[0]);}
  return String(Math.random());
}
export function getDesignInterests(){
  try{const rows=JSON.parse(sessionStorage.getItem(KEY)||'[]');return Array.isArray(rows)?rows.slice(0,8):[];}catch{return [];}
}
export function recordDesignInterest(product,action='open'){
  const id=productId(product);if(!id||typeof window==='undefined')return;
  const row={id,title:String(product.title||'').slice(0,140),description:String(product.description||'').slice(0,120),
    category:categoryId(product),subcategory:String(product.subcategory?._id||product.subcategory||'').slice(0,90),
    weight:action==='enquire'?1.8:action==='save'?1.5:1};
  const next=[row,...getDesignInterests().filter(r=>r.id!==id)].slice(0,8);
  try{sessionStorage.setItem(KEY,JSON.stringify(next));}catch{}
  window.dispatchEvent(new Event('sk-design-interest'));
}
const hash=s=>{let n=2166136261;for(let i=0;i<s.length;i++)n=Math.imul(n^s.charCodeAt(i),16777619);return(n>>>0)/4294967296;};
export function similarityScore(item,history){
  const id=productId(item),cat=categoryId(item),sub=String(item.subcategory?._id||item.subcategory||'');
  const text=tokens([item.title,item.description,item.size].filter(Boolean).join(' '));
  let max=0;
  history.forEach((h,i)=>{
    if(!h||h.id===id)return;
    let score=0;
    if(cat&&h.category===cat)score+=24;
    if(sub&&h.subcategory===sub)score+=12;
    for(const w of tokens(h.title+' '+h.description))if(text.has(w))score+=3;
    max=Math.max(max,score*Number(h.weight||1)*(1-i*.08));
  });
  return max;
}
export function rankDesigns(products,{seed='0',interests=[],aiIds=[]}={}){
  const gemini=new Map(aiIds.map((id,i)=>[String(id),i]));
  return [...products].sort((a,b)=>{
    const score=p=>{
      const id=productId(p);
      return similarityScore(p,interests)+
        (gemini.has(id)?90-Math.min(gemini.get(id),50):0)+hash(seed+'|'+id)*20;
    };
    return score(b)-score(a);
  });
}
