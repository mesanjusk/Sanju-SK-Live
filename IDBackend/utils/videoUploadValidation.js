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
