import {useEffect,useState} from 'react';
import {optimizedImage} from '../../utils/media';
import {DEFAULT_GALLERY_HEIGHT_RATIO,largestGalleryHeightRatio} from './galleryAspect.mjs';

const measured=new Map();
const pending=new Map();
const MAX_CACHED_GALLERIES=120;

function probeImage(src) {
  return new Promise(resolve=>{
    const img=new Image();
    let complete=false;
    const finish=dimensions=>{
      if(complete)return;
      complete=true;
      clearTimeout(timeout);
      img.onload=null;
      img.onerror=null;
      resolve(dimensions);
    };
    const timeout=setTimeout(()=>finish(null),10000);
    img.onload=()=>finish({width:img.naturalWidth,height:img.naturalHeight});
    img.onerror=()=>finish(null);
    // Cloudinary: read intrinsic proportions using a tiny 96px derivative
    // rather than downloading every full-resolution product photo at once.
    img.src=optimizedImage(src,96);
  });
}

function measureGallery(key,images) {
  if(measured.has(key)) return Promise.resolve(measured.get(key));
  if(pending.has(key))return pending.get(key);
  const task=Promise.all(images.map(probeImage)).then(dimensions=>{
    const ratio=largestGalleryHeightRatio(dimensions);
    if(measured.size>=MAX_CACHED_GALLERIES)measured.delete(measured.keys().next().value);
    measured.set(key,ratio);
    return ratio;
  }).finally(()=>pending.delete(key));
  pending.set(key,task);
  return task;
}

export default function useStableGalleryAspect(images,productId) {
  const sources=images.filter(src=>typeof src==='string'&&src.trim());
  const key=JSON.stringify([String(productId||''),sources]);
  const cached=measured.get(key);
  const [state,setState]=useState(()=>({
    key,ratio:cached??DEFAULT_GALLERY_HEIGHT_RATIO
  }));
  useEffect(()=>{
    if(!sources.length){
      setState({key,ratio:DEFAULT_GALLERY_HEIGHT_RATIO});
      return undefined;
    }
    let active=true;
    if(measured.has(key)) {
      setState({key,ratio:measured.get(key)});
      return undefined;
    }
    setState({key,ratio:DEFAULT_GALLERY_HEIGHT_RATIO});
    measureGallery(key,sources).then(ratio=>{
      if(active)setState({key,ratio});
    }).catch(()=>{});
    return ()=>{active=false;};
  },[key]);
  return state.key===key?state.ratio:(cached??DEFAULT_GALLERY_HEIGHT_RATIO);
}
