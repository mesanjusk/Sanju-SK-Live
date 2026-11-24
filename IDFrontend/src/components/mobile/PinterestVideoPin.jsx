import {memo,useEffect,useRef,useState} from 'react';
import {FaInstagram,FaPlay,FaPause,FaVolumeMute,FaVolumeUp,FaYoutube} from 'react-icons/fa';

function youtubeId(value=''){
 const url=String(value);
 const match=url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
 return match?.[1]||null;
}
function PinterestVideoPin({video}){
 const cardRef=useRef(null);
 const playerRef=useRef(null);
 const [inView,setInView]=useState(false);
 const [paused,setPaused]=useState(false);
 const [activated,setActivated]=useState(false);
 const [userPlayed,setUserPlayed]=useState(false);
 const [muted,setMuted]=useState(true);
 const [failed,setFailed]=useState(false);
 const [reduceMotion]=useState(()=>typeof window!=='undefined'&&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
 const uploaded=video.platform==='upload'&&/^https:\/\//.test(video.videoUrl||'');
 const yt=video.platform==='youtube'?youtubeId(video.youtubeUrl):null;
 const instagram=video.platform==='instagram';
 useEffect(()=>{
  if(!cardRef.current)return;
  if(typeof IntersectionObserver==='undefined'){
   setInView(true);return;
  }
  const observer=new IntersectionObserver(([entry])=>{
   setInView(entry.isIntersecting&&entry.intersectionRatio>=.35);
  },{rootMargin:'110px 0px',threshold:[0,.35,.65]});
  observer.observe(cardRef.current);
  return ()=>observer.disconnect();
 },[]);
 useEffect(()=>{if(inView)setActivated(true);},[inView]);
 const play=Boolean(inView&&!paused&&(!reduceMotion||userPlayed));
 useEffect(()=>{
  if(!uploaded||!playerRef.current||!activated)return;
  const node=playerRef.current;
  node.muted=muted;
  if(play)node.play().catch(()=>setPaused(true));
  else node.pause();
 },[uploaded,activated,play,muted]);
 const togglePlay=()=>{
  if(reduceMotion&&!userPlayed){setUserPlayed(true);setPaused(false);}
  else setPaused(current=>!current);
 };
 const link=instagram?video.instagramUrl:video.youtubeUrl;
 return(
  <article ref={cardRef} className="sk-pin-card sk-video-pin"
    aria-label={'Video: '+video.title}>
   <div className="sk-video-pin-cover">
    {uploaded ? (
     <>
      <video ref={playerRef} className="sk-video-pin-player"
       src={activated?video.videoUrl:undefined}
       poster={video.posterUrl||undefined}
       muted={muted} playsInline loop preload="none"
       onClick={togglePlay} onError={()=>setFailed(true)}
       aria-label={'Play '+video.title}/>
      {failed&&<div className="sk-video-pin-fallback">Video unavailable</div>}
      <button type="button" className="sk-video-pin-play"
       onClick={togglePlay} aria-label={play?'Pause video':'Play video'}>
       {play?<FaPause aria-hidden="true"/>:<FaPlay aria-hidden="true"/>}
      </button>
      <button type="button" className="sk-video-pin-sound"
       onClick={()=>setMuted(current=>!current)}
       aria-label={muted?'Unmute video':'Mute video'}>
       {muted?<FaVolumeMute aria-hidden="true"/>:<FaVolumeUp aria-hidden="true"/>}
      </button>
     </>
    ):yt ? (
     inView&&!reduceMotion?(
      <iframe className="sk-video-pin-player"
       src={'https://www.youtube-nocookie.com/embed/'+yt+
        '?autoplay=1&mute=1&loop=1&playlist='+yt+'&controls=1&playsinline=1&rel=0'}
       title={video.title} loading="lazy"
       referrerPolicy="strict-origin-when-cross-origin"
       allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen/>
     ):(
      <a className="sk-video-pin-external" href={video.youtubeUrl} target="_blank" rel="noreferrer">
       <img src={'https://img.youtube.com/vi/'+yt+'/hqdefault.jpg'}
        alt="" loading="lazy"/><FaYoutube aria-hidden="true" className="sk-video-pin-provider"/>
       <span className="sk-video-pin-watch">Watch video</span>
      </a>
     )
    ):(
     <a className="sk-video-pin-external sk-video-pin-instagram"
      href={link} target="_blank" rel="noopener noreferrer"
      aria-label={'Watch '+video.title+' on Instagram'}>
      <FaInstagram aria-hidden="true" className="sk-video-pin-provider"/>
      <span className="sk-video-pin-watch">Watch on Instagram</span>
     </a>
    )}
    <span className="sk-video-pin-label">Video</span>
   </div>
   <div className="sk-pin-under sk-video-pin-under">
    <span className="sk-pin-card-title">{video.title}</span>
   </div>
  </article>
 );
}
export default memo(PinterestVideoPin);
