// Common upload constraints, independent of storage SDK and DB.
export const MAX_VIDEO_BYTES=50*1024*1024;
const mimeExt={
 'video/mp4':new Set(['.mp4']),
 'video/webm':new Set(['.webm'])
};
export function isSupportedVideo(file){
 if(!file||typeof file.originalname!=='string')return false;
 const ext=file.originalname.trim().toLowerCase().match(/\.[a-z0-9]+$/)?.[0];
 return Boolean(mimeExt[String(file.mimetype||'').toLowerCase()]?.has(ext));
}

export function isSafeVideoLink(value,platform){
 try{
  const url=new URL(String(value||'').trim());
  if(url.protocol!=='https:')return false;
  const host=url.hostname.toLowerCase();
  if(platform==='youtube')
   return ['youtube.com','www.youtube.com','m.youtube.com','youtu.be','www.youtu.be','youtube-nocookie.com'].includes(host);
  if(platform==='instagram')
   return ['instagram.com','www.instagram.com'].includes(host) &&
    /^\/(p|reel|tv)\//.test(url.pathname);
  return false;
 }catch{return false;}
}

export function hasVideoSignature(file){
 const b=file?.buffer;
 if(!b||b.length<12)return false;
 if(file.mimetype==='video/mp4')
  return b.toString('ascii',4,8)==='ftyp';
 if(file.mimetype==='video/webm')
  return b[0]===0x1a&&b[1]===0x45&&b[2]===0xdf&&b[3]===0xa3;
 return false;
}
