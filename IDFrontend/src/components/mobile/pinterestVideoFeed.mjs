function safeLink(value,platform){
 try{
  const url=new URL(value);
  if(url.protocol!=='https:')return false;
  if(platform==='youtube')
   return ['youtube.com','www.youtube.com','m.youtube.com','youtu.be','www.youtu.be','youtube-nocookie.com'].includes(url.hostname);
  return ['instagram.com','www.instagram.com'].includes(url.hostname)&&
   /^\/(p|reel|tv)\//.test(url.pathname);
 }catch{return false;}
}
// Deterministic, finite mixing of real uploaded/link videos among product pins.
// Products stay in their original order and no video or product is duplicated.
export function interleavePinterestVideos(products=[],videos=[],interval=8){
 const result=[];
 const eligible=videos.filter(v=>v?._id&&(
   (v.platform==='upload'&&/^https:\/\//.test(v.videoUrl||''))||
   (v.platform==='youtube'&&safeLink(v.youtubeUrl,'youtube'))||
   (v.platform==='instagram'&&safeLink(v.instagramUrl,'instagram'))
 ));
 const seen=new Set();
 let v=0;
 products.forEach((product,i)=>{
  result.push({kind:'product',key:'product:'+String(product._id),product});
  if((i+1)%interval!==0) return;
  while(v<eligible.length){
   const video=eligible[v++];
   const id=String(video._id);
   if(seen.has(id))continue;
   seen.add(id);
   result.push({kind:'video',key:'video:'+id,video});
   break;
  }
 });
 return result;
}
