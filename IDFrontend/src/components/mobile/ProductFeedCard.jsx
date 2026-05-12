import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHeart, FaRegHeart, FaShare, FaRegBookmark, FaWhatsapp, FaEllipsisH } from 'react-icons/fa';
import { useFavorites } from '../../context/FavoritesContext';
import { trackWhatsAppClick } from '../../hooks/useAnalytics';
import { saveEnquiryLead, resolveCategoryName } from '../../hooks/useWhatsApp';

function ProductFeedCard({ product, whatsappNumber, onView }) {
  const { favorites, toggleFavorite, addLiked } = useFavorites();
  const [likedFx, setLikedFx] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [categoryName, setCategoryName] = useState('');
  const touchStartX = useRef(null);
  const cardRef = useRef(null);
  const isFav = favorites.some((f) => f._id === product._id);
  const images = Array.isArray(product.images)
    ? product.images.filter(Boolean)
    : [product.images].filter(Boolean);

  // Resolve category name once
  useEffect(() => {
    if (product?.category) {
      resolveCategoryName(product.category).then(setCategoryName);
    }
  }, [product?.category]);

  // Notify parent when card enters viewport (for scroll gate)
  useEffect(() => {
    if (!onView || !cardRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { onView(product._id); observer.disconnect(); } },
      { threshold: 0.4 }
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [onView, product._id]);

  const displayPrice = useMemo(() => {
    const tiers = product.quantityPricing;
    if (Array.isArray(tiers) && tiers.length > 0) {
      const prices = tiers.map((t) => Number(t.price)).filter((p) => p > 0);
      if (prices.length > 0) return { label: `From ₹${Math.min(...prices)}`, hasRange: true };
    }
    return { label: `₹${product.price || 0}`, hasRange: false };
  }, [product]);

  const wa = String(whatsappNumber || '').replace(/\D/g, '');
  const productLink = `${window.location.origin}/products/${product._id}`;
  const waMsgText =
    `Hi! I'm interested in *${product.title}*\n` +
    `🆔 Product ID: ${product._id || ''}\n` +
    `💰 Price: ${displayPrice.label}\n` +
    (categoryName ? `📂 Category: ${categoryName}\n` : '') +
    (images[0] ? `🖼️ Image: ${images[0]}\n` : '') +
    `🔗 Link: ${productLink}\n` +
    `\nPlease share more details.`;
  const waHref = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(waMsgText)}` : '#';

  const handleWAClick = () => {
    trackWhatsAppClick(product._id);
    saveEnquiryLead({ productId: product._id, productName: product.title, message: waMsgText });
  };

  const onDoubleTap = () => {
    toggleFavorite(product);
    addLiked?.(product);
    setLikedFx(true);
    setTimeout(() => setLikedFx(false), 700);
  };

  const handleShare = () => {
    const url = productLink;
    if (navigator.share) navigator.share({ title: product.title, url });
    else navigator.clipboard?.writeText(url);
  };

  // Touch swipe for carousel
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) setImgIdx((i) => Math.min(i + 1, images.length - 1));
    else if (diff < -50) setImgIdx((i) => Math.max(i - 1, 0));
    touchStartX.current = null;
  };

  return (
    <article ref={cardRef} className="mb-2 bg-white">
      {/* Post header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <Link to={`/products/${product._id}`} className="flex min-w-0 items-center gap-2.5">
          <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-gray-100 ring-2 ring-gray-100">
            {images[0] ? (
              <img
                src={images[0]}
                alt={product.title}
                className="h-full w-full object-cover"
                loading="lazy"
                onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="h-full w-full bg-gray-200" />
            )}
          </div>
          <div className="min-w-0">
            <p className="line-clamp-1 text-[13px] font-semibold leading-tight text-gray-900">
              {product.title}
            </p>
            {product.badge && (
              <p className="text-[11px] leading-tight text-gray-400">{product.badge}</p>
            )}
          </div>
        </Link>
        <button className="flex-shrink-0 p-1 text-gray-500" aria-label="More options">
          <FaEllipsisH className="text-sm" />
        </button>
      </div>

      {/* Image — carousel if multiple */}
      <div
        className="relative"
        onDoubleClick={onDoubleTap}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Link to={`/products/${product._id}`}>
          {images.length > 0 ? (
            <img
              src={images[imgIdx] ?? images[0]}
              alt={product.title}
              className="aspect-square w-full object-cover select-none"
              loading="lazy"
              draggable="false"
              onContextMenu={(e) => e.preventDefault()}
              onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="aspect-square w-full bg-gray-100 flex items-center justify-center text-gray-300 text-xs">
              No image
            </div>
          )}
        </Link>

        {/* Dot indicator for multiple images */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setImgIdx(i)}
                className={`rounded-full transition-all ${
                  i === imgIdx ? 'h-2 w-5 bg-white' : 'h-2 w-2 bg-white/60'
                }`}
              />
            ))}
          </div>
        )}

        {/* Multiple images badge top-right */}
        {images.length > 1 && (
          <span className="absolute right-2.5 top-2.5 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white">
            {imgIdx + 1}/{images.length}
          </span>
        )}

        {likedFx && (
          <motion.div
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 1.3, opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <FaHeart className="text-7xl text-white drop-shadow-lg" />
          </motion.div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
        <div className="flex items-center gap-4">
          <button
            onClick={() => toggleFavorite(product)}
            aria-label="Save"
            className="transition-transform active:scale-90"
          >
            {isFav
              ? <FaHeart className="text-xl text-red-500" />
              : <FaRegHeart className="text-xl text-gray-900" />
            }
          </button>
          <button onClick={handleShare} aria-label="Share" className="transition-transform active:scale-90">
            <FaShare className="text-xl text-gray-900" />
          </button>
          <button aria-label="Bookmark" className="transition-transform active:scale-90">
            <FaRegBookmark className="text-xl text-gray-900" />
          </button>
        </div>
        <a
          href={waHref}
          target="_blank"
          rel="noreferrer"
          onClick={handleWAClick}
          className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-[12px] font-semibold text-white transition-transform active:scale-95"
        >
          Order <FaWhatsapp className="text-[#25D366]" />
        </a>
      </div>

      {/* Price + description */}
      <div className="px-3 pb-3 pt-1">
        <p className="text-[13px] font-bold text-gray-900">
          {displayPrice.label}
          {displayPrice.hasRange && (
            <span className="ml-1 text-[11px] font-normal text-gray-400">· volume pricing</span>
          )}
        </p>
        {product.description && (
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-gray-500">
            {product.description}
          </p>
        )}
      </div>
    </article>
  );
}

export default memo(ProductFeedCard);
