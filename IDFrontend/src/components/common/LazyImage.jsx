const toWebpUrl = (src = '') => {
  if (!src || src.includes('.webp')) return src;
  return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
};

// Injects a text watermark into Cloudinary URLs via URL transformation
const addWatermark = (src = '') => {
  if (!src || !src.includes('res.cloudinary.com')) return src;
  if (src.includes('/upload/') && !src.includes('l_text:')) {
    return src.replace(
      '/upload/',
      '/upload/l_text:Arial_22:SanjuSK.com,co_white,o_55,g_south_east,x_10,y_10/'
    );
  }
  return src;
};

const LazyImage = ({ src, fallbackSrc, alt, className = '', watermark = true, ...props }) => {
  const wmSrc = watermark ? addWatermark(src) : src;
  const webpSrc = toWebpUrl(wmSrc);

  return (
    <picture>
      {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
      <img
        src={fallbackSrc || wmSrc}
        alt={alt}
        className={className}
        loading="lazy"
        decoding="async"
        onContextMenu={(e) => e.preventDefault()}
        draggable="false"
        {...props}
      />
    </picture>
  );
};

export default LazyImage;
