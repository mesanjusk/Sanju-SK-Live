const toWebpUrl = (src = '') => {
  if (!src || src.includes('.webp')) return src;
  return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
};

const LazyImage = ({ src, fallbackSrc, alt, className = '', ...props }) => {
  const webpSrc = toWebpUrl(src);

  return (
    <picture>
      {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
      <img
        src={fallbackSrc || src}
        alt={alt}
        className={className}
        loading="lazy"
        decoding="async"
        {...props}
      />
    </picture>
  );
};

export default LazyImage;
