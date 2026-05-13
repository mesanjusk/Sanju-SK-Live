import { memo, useEffect, useRef, useState } from 'react';
import { FaYoutube, FaShare, FaEllipsisH } from 'react-icons/fa';

const getYouTubeId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/);
  return m ? m[1] : null;
};

function VideoFeedCard({ video }) {
  const [visible, setVisible] = useState(false);
  const cardRef = useRef(null);
  const ytId = getYouTubeId(video.youtubeUrl);

  // Auto-load iframe when card enters viewport
  useEffect(() => {
    if (!cardRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const handleShare = () => {
    if (navigator.share) navigator.share({ title: video.title, url: video.youtubeUrl });
    else navigator.clipboard?.writeText(video.youtubeUrl);
  };

  if (!ytId) return null;

  // youtube-nocookie.com avoids tracking cookies and is less likely to be blocked
  const embedSrc = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1&loop=1&playlist=${ytId}`;

  return (
    <article ref={cardRef} className="mb-2 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
            <FaYoutube className="text-lg text-red-600" />
          </div>
          <div className="min-w-0">
            <p className="line-clamp-1 text-[13px] font-semibold leading-tight text-gray-900">
              {video.title}
            </p>
            <p className="text-[11px] leading-tight text-gray-400">YouTube Video</p>
          </div>
        </div>
        <button className="flex-shrink-0 p-1 text-gray-500" aria-label="More options">
          <FaEllipsisH className="text-sm" />
        </button>
      </div>

      {/* Video — aspect-video for landscape, aspect-[9/16] for Shorts */}
      <div className="relative aspect-video w-full bg-black">
        {visible ? (
          <iframe
            src={embedSrc}
            title={video.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <FaYoutube className="text-5xl text-red-500 opacity-40" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
        <button onClick={handleShare} aria-label="Share" className="transition-transform active:scale-90">
          <FaShare className="text-xl text-gray-900" />
        </button>
        <a
          href={video.youtubeUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-[12px] font-semibold text-white transition-transform active:scale-95"
        >
          Watch on YouTube <FaYoutube />
        </a>
      </div>

      {video.description && (
        <div className="px-3 pb-3 pt-1">
          <p className="line-clamp-2 text-xs leading-relaxed text-gray-500">{video.description}</p>
        </div>
      )}
    </article>
  );
}

export default memo(VideoFeedCard);
