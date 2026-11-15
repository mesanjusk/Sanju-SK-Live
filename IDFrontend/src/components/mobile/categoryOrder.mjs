// The Wedding tab is permanent. Other tabs follow each landing's campaign/search
// intent first, then a deterministic per-landing shuffle. Never reorder on SPA back.
const tidy=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export const isWeddingCategory=category=>/\b(wedding|shaadi|marriage|vivah)\b/.test(tidy(category?.name));
export function landingKeyword(search='',referrer=''){
  const params=new URLSearchParams(String(search).replace(/^\?/,''));
  const candidates=['utm_term','q','search','keyword','s','utm_campaign'];
  let text=candidates.map(k=>params.get(k)).find(Boolean)||'';
  if(!text && referrer){
    try{
      const url=new URL(referrer);
      if(['google','bing','yahoo','duckduckgo'].some(host=>url.hostname.toLowerCase().includes(host))){
        text=['q','p','query'].map(k=>url.searchParams.get(k)).find(Boolean)||'';
      }
    }catch{}
  }
  return tidy(text).slice(0,80);
}
const hash=s=>{
  let n=2166136261;
  for(let i=0;i<s.length;i++)n=Math.imul(n^s.charCodeAt(i),16777619);
  return n>>>0;
};
export function orderStoreCategories(categories,{seed='0',keyword=''}={}){
  const wedding=[],other=[];
  for(const category of categories||[])(isWeddingCategory(category)?wedding:other).push(category);
  const words=tidy(keyword).split(' ').filter(w=>w.length>2);
  const relevance=category=>{
    const name=tidy(category?.name);
    if(!words.length)return 0;
    return words.reduce((score,word)=>{
      if(name.includes(word))return score+3;
      if(word.includes(name) && name.length>3)return score+1;
      return score;
    },0);
  };
  // Stable tie-breaking under the same initial landing; a new reload gets
  // a different seed. Only Wedding always precedes the rest.
  const key=c=>String(c._id||c.category_uuid||c.name||'');
  wedding.sort((a,b)=>hash(seed+'|'+key(a))-hash(seed+'|'+key(b)));
  other.sort((a,b)=>relevance(b)-relevance(a)||
    hash(seed+'|'+key(a))-hash(seed+'|'+key(b)));
  return [...wedding,...other];
}
