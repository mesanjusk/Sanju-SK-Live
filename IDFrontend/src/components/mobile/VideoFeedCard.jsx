import { memo, useEffect, useRef, useState } from 'react';
import { FaInstagram, FaPlay } from 'react-icons/fa';

const getYouTubeId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/);
  return m ? m[1] : null;
};

// ─── YouTube card: clean autoplay embed, zero visible UI ─────────────────────
function YouTubeCard({ video }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  const ytId = getYouTubeId(video.youtubeUrl);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  if (!ytId) return null;

  // controls=0 hides play bar; modestbranding=1 removes YT logo; rel=0 no suggestions
  const src = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&modestbranding=1&rel=0&showinfo=0&playsinline=1&disablekb=1`;

  return (
    <article ref={ref} className="mb-2 overflow-hidden bg-black">
      <div className="aspect-video w-full">
        {visible ? (
          <iframe
            src={src}
            title={video.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-900">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
              <FaPlay className="ml-1 text-2xl text-white/60" />
            </div>
          </div>
        )}
      </div>
      {video.description && (
        <p className="px-3 py-2 text-xs text-gray-400 line-clamp-1">{video.description}</p>
      )}
    </article>
  );
}

// ─── Instagram card: can't embed — show branded preview + open link ───────────
function InstagramCard({ video }) {
  // Extract post/reel shortcode for thumbnail attempt
  const match = video.instagramUrl?.match(/instagram\.com\/(?:p|reel|tv)\/([\w-]+)/);
  const shortcode = match?.[1];

  return (
    <article className="mb-2 overflow-hidden bg-white">
      {/* Gradient header bar — Instagram brand colours */}
      <div className="h-1 w-full bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af]" />

      <a
        href={video.instagramUrl}
        target="_blank"
        rel="noreferrer"
        className="block"
      >
        {/* Preview area */}
        <div className="relative flex aspect-square w-full items-center justify-center bg-gradient-to-br from-[#f58529]/10 via-[#dd2a7b]/10 to-[#8134af]/10">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] shadow-lg">
              <FaInstagram className="text-4xl text-white" />
            </div>
            <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] px-5 py-2 shadow">
              <FaPlay className="text-xs text-white" />
              <span className="text-sm font-bold text-white">Watch on Instagram</span>
            </div>
          </div>
          {/* Tap anywhere hint */}
          <p className="absolute bottom-3 left-0 right-0 text-center text-[10px] text-gray-400">
            Tap to open in Instagram
          </p>
        </div>
      </a>

      {/* Title + description */}
      <div className="px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <FaInstagram className="shrink-0 text-sm text-[#dd2a7b]" />
          <p className="line-clamp-1 text-[13px] font-semibold text-gray-900">{video.title}</p>
        </div>
        {video.description && (
          <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{video.description}</p>
        )}
      </div>
    </article>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────
function VideoFeedCard({ video }) {
  if (video.platform === 'instagram') return <InstagramCard video={video} />;
  return <YouTubeCard video={video} />;
}

export default memo(VideoFeedCard);
