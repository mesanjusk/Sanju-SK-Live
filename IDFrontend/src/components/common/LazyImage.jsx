const toWebpUrl = (src = '') => {
  if (!src || src.includes('.webp')) return src;
  // Only replace extension at the very end of the URL path (before any query string)
  return src.replace(/\.(jpg|jpeg|png)(\?.*)?$/i, '.webp$2');
};

// Injects a safe Cloudinary text watermark (no special chars that break URL parsing)
const addWatermark = (src = '') => {
  if (!src || !src.includes('res.cloudinary.com')) return src;
  if (src.includes('/upload/') && !src.includes('l_text:')) {
    return src.replace(
      '/upload/',
      '/upload/l_text:Arial_20:SanjuSK,co_white,o_50,g_south_east,x_8,y_8/'
    );
  }
  return src;
};

const LazyImage = ({ src, fallbackSrc, alt, className = '', watermark = true, ...props }) => {
  const wmSrc = watermark ? addWatermark(src) : src;
  const webpSrc = toWebpUrl(wmSrc);

  return (
    <picture>
      {webpSrc && webpSrc !== wmSrc && <source srcSet={webpSrc} type="image/webp" />}
      <img
        src={fallbackSrc || wmSrc || src}
        alt={alt}
        className={className}
        loading="lazy"
        decoding="async"
        onContextMenu={(e) => e.preventDefault()}
        draggable="false"
        onError={(e) => {
          // If the watermarked URL fails, fall back to the original URL
          if (src && e.target.src !== src) {
            e.target.onerror = null;
            e.target.src = src;
          }
        }}
        {...props}
      />
    </picture>
  );
};

export default LazyImage;
