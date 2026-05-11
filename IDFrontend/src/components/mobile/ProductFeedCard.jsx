import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHeart, FaRegHeart, FaShare, FaRegBookmark, FaWhatsapp, FaEllipsisH } from 'react-icons/fa';
import { useFavorites } from '../../context/FavoritesContext';

function ProductFeedCard({ product, whatsappNumber }) {
  const { favorites, toggleFavorite } = useFavorites();
  const [likedFx, setLikedFx] = useState(false);
  const isFav = favorites.some((f) => f._id === product._id);
  const img = Array.isArray(product.images) ? product.images[0] : product.images;
  const wa = String(whatsappNumber || '').replace(/\D/g, '');
  const waMsg = encodeURIComponent(
    `Hi! I'm interested in:\n*${product.title}*\nPrice: ₹${product.price || 0}`
  );
  const waHref = wa ? `https://wa.me/${wa}?text=${waMsg}` : '#';

  const onDoubleTap = () => {
    toggleFavorite(product);
    setLikedFx(true);
    setTimeout(() => setLikedFx(false), 700);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/products/${product._id}`;
    if (navigator.share) {
      navigator.share({ title: product.title, url });
    } else {
      navigator.clipboard?.writeText(url);
    }
  };

  return (
    <article className="mb-2 bg-white">
      {/* Post header: item thumbnail + name (Instagram-style) */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <Link to={`/products/${product._id}`} className="flex min-w-0 items-center gap-2.5">
          <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-gray-100 ring-2 ring-gray-100">
            {img ? (
              <img src={img} alt={product.title} className="h-full w-full object-cover" loading="lazy" />
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

      {/* Full-width image */}
      <div className="relative" onDoubleClick={onDoubleTap}>
        <Link to={`/products/${product._id}`}>
          <img
            src={img}
            alt={product.title}
            className="aspect-square w-full object-cover"
            loading="lazy"
          />
        </Link>
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

      {/* Actions: icons left, wide Enquiry button right */}
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
          className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-[12px] font-semibold text-white transition-transform active:scale-95"
        >
          <FaWhatsapp className="text-[#25D366]" /> Enquiry
        </a>
      </div>

      {/* Price + description */}
      <div className="px-3 pb-3 pt-1">
        <p className="text-[13px] font-bold text-gray-900">₹{product.price || 0}</p>
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
