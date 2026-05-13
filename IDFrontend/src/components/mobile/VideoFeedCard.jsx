import { memo, useState } from 'react';
import { FaYoutube, FaShare, FaEllipsisH, FaPlay } from 'react-icons/fa';

const getYouTubeId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/);
  return m ? m[1] : null;
};

function VideoFeedCard({ video }) {
  const [playing, setPlaying] = useState(false);
  const ytId = getYouTubeId(video.youtubeUrl);

  const handleShare = () => {
    if (navigator.share) navigator.share({ title: video.title, url: video.youtubeUrl });
    else navigator.clipboard?.writeText(video.youtubeUrl);
  };

  if (!ytId) return null;

  const thumbUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;

  return (
    <article className="mb-2 bg-white">
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

      {/* Video area */}
      <div className="relative aspect-video w-full bg-black">
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&playsinline=1&rel=0`}
            title={video.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="group relative h-full w-full"
            aria-label="Play video"
          >
            <img
              src={thumbUrl}
              alt={video.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 shadow-xl transition-transform group-active:scale-95">
                <FaPlay className="ml-1 text-2xl text-white" />
              </div>
            </div>
            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5">
              <FaYoutube className="text-xs text-red-500" />
              <span className="text-[10px] font-semibold text-white">YouTube</span>
            </div>
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
        <div className="flex items-center gap-4">
          <button onClick={handleShare} aria-label="Share" className="transition-transform active:scale-90">
            <FaShare className="text-xl text-gray-900" />
          </button>
        </div>
        <a
          href={video.youtubeUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-[12px] font-semibold text-white transition-transform active:scale-95"
        >
          Watch <FaYoutube />
        </a>
      </div>

      {/* Description */}
      {video.description && (
        <div className="px-3 pb-3 pt-1">
          <p className="line-clamp-2 text-xs leading-relaxed text-gray-500">{video.description}</p>
        </div>
      )}
    </article>
  );
}

export default memo(VideoFeedCard);
