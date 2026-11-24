import express from 'express';
import multer from 'multer';
import Video from '../models/Video.js';
import cloudinary from '../utils/cloudinary.js';
import {MAX_VIDEO_BYTES,isSupportedVideo,isSafeVideoLink} from '../utils/videoUploadValidation.js';

const router=express.Router();
const directUpload=multer({
 storage:multer.memoryStorage(),
 limits:{fileSize:MAX_VIDEO_BYTES,files:1},
 fileFilter(_req,file,callback){
  if(!isSupportedVideo(file)){
   return callback(new Error('Only MP4 and WebM videos can be uploaded'));
  }
  callback(null,true);
 }
}).single('video');

function uploadToCloudinary(buffer){
 return new Promise((resolve,reject)=>{
  const stream=cloudinary.uploader.upload_stream({
   resource_type:'video',folder:'sk-feed-videos',
   overwrite:false,unique_filename:true
  },(error,result)=>{
   if(error||!result?.secure_url||!result.public_id)
    return reject(error||new Error('Video host returned no secure URL'));
   resolve(result);
  });
  stream.on('error',reject);
  stream.end(buffer);
 });
}

// GET /api/videos — public discovery. Existing admin consumers still receive an array.
router.get('/',async(_req,res)=>{
 try{
  const videos=await Video.find().sort({createdAt:-1,_id:-1}).lean().maxTimeMS(12000);
  res.set('Cache-Control','no-store');
  res.json(videos);
 }catch(error){
  console.error('Error fetching videos',error);
  res.status(503).json({message:'Videos temporarily unavailable'});
 }
});

// POST /api/videos/upload — protected by index.js canManageProducts gate.
// Stream directly to Cloudinary (not Render local disk); max 50MB, MP4/WebM.
router.post('/upload',(req,res,next)=>{
 directUpload(req,res,error=>{
  if(error){
   const tooLarge=error.code==='LIMIT_FILE_SIZE';
   return res.status(tooLarge?413:400).json({message:tooLarge?
    'Maximum video size is 50 MB':error.message});
  }
  next();
 });
},async(req,res)=>{
 if(!req.file)return res.status(400).json({message:'Select an MP4 or WebM video'});
 const title=String(req.body.title||'').trim().slice(0,140);
 const description=String(req.body.description||'').trim().slice(0,600);
 if(!title)return res.status(400).json({message:'Video title is required'});
 let uploaded;
 try{
  uploaded=await uploadToCloudinary(req.file.buffer);
  const posterUrl=cloudinary.url(uploaded.public_id,{
   secure:true,resource_type:'video',format:'jpg',
   transformation:[{start_offset:'0',width:640,crop:'limit'}]
  });
  const video=await Video.create({
   title,description,platform:'upload',videoUrl:uploaded.secure_url,
   posterUrl,cloudinaryPublicId:uploaded.public_id,
   duration:Number(uploaded.duration||0)
  });
  res.status(201).json(video);
 }catch(error){
  console.error('Video upload failed',error);
  if(uploaded?.public_id){
   try{await cloudinary.uploader.destroy(uploaded.public_id,{resource_type:'video'});}
   catch(cleanupError){console.error('Failed to clean orphaned video',cleanupError);}
  }
  res.status(502).json({message:'Video could not be uploaded or saved'});
 }
});

// POST /api/videos — URL entries retained for YouTube and Instagram.
router.post('/',async(req,res)=>{
 try{
  const title=String(req.body.title||'').trim().slice(0,140);
  const platform=req.body.platform||'youtube';
  if(!title)return res.status(400).json({message:'Title is required'});
  if(!['youtube','instagram'].includes(platform))
   return res.status(400).json({message:'Use /api/videos/upload for video files'});
  const youtubeUrl=String(req.body.youtubeUrl||'').trim().slice(0,500);
  const instagramUrl=String(req.body.instagramUrl||'').trim().slice(0,500);
  if(!isSafeVideoLink(platform==='youtube'?youtubeUrl:instagramUrl,platform))
   return res.status(400).json({message:'Enter a valid HTTPS YouTube or Instagram reel URL'});
  const video=await Video.create({title,youtubeUrl,instagramUrl,platform,
   description:String(req.body.description||'').trim().slice(0,600)});
  res.status(201).json(video);
 }catch(error){
  console.error('Error creating video',error);
  res.status(500).json({message:'Server error'});
 }
});

// Edit video metadata without allowing clients to replace hosted asset URLs/IDs.
router.put('/:id',async(req,res)=>{
 try{
  const current=await Video.findById(req.params.id);
  if(!current)return res.status(404).json({message:'Video not found'});
  const title=String(req.body.title||'').trim().slice(0,140);
  if(!title)return res.status(400).json({message:'Title is required'});
  current.title=title;
  current.description=String(req.body.description||'').trim().slice(0,600);
  if(current.platform!=='upload'){
   const platform=req.body.platform||current.platform;
   if(!['youtube','instagram'].includes(platform))
    return res.status(400).json({message:'File uploads cannot be set via edit'});
   current.platform=platform;
   current.youtubeUrl=String(req.body.youtubeUrl||'').trim().slice(0,500);
   current.instagramUrl=String(req.body.instagramUrl||'').trim().slice(0,500);
   if(!isSafeVideoLink(platform==='youtube'?current.youtubeUrl:current.instagramUrl,platform))
    return res.status(400).json({message:'Enter a valid HTTPS YouTube or Instagram reel URL'});
  }
  await current.save();
  res.json(current);
 }catch(error){
  console.error('Error updating video',error);
  res.status(500).json({message:'Server error'});
 }
});

router.delete('/:id',async(req,res)=>{
 try{
  const video=await Video.findByIdAndDelete(req.params.id);
  if(!video)return res.status(404).json({message:'Video not found'});
  if(video.platform==='upload'&&video.cloudinaryPublicId){
   try{await cloudinary.uploader.destroy(video.cloudinaryPublicId,{resource_type:'video'});}
   catch(error){console.error('Video deleted from catalog but CDN cleanup failed',error);}
  }
  res.json({message:'Video deleted'});
 }catch(error){
  console.error('Error deleting video',error);
  res.status(500).json({message:'Server error'});
 }
});
export default router;
