import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHeart, FaRegHeart, FaShare, FaBookmark, FaWhatsapp } from 'react-icons/fa';
import { useFavorites } from '../../context/FavoritesContext';

function ProductFeedCard({ product, whatsappNumber }) {
  const { favorites, toggleFavorite } = useFavorites();
  const [likedFx, setLikedFx] = useState(false);
  const isFav = favorites.some((f) => f._id === product._id);
  const img = Array.isArray(product.images) ? product.images[0] : product.images;
  const onDoubleTap = () => { toggleFavorite(product); setLikedFx(true); setTimeout(() => setLikedFx(false), 500); };
  return (
    <article className="mx-4 mb-4 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
      <div className="relative" onDoubleClick={onDoubleTap}>
        <Link to={`/products/${product._id}`}><img src={img} alt={product.title} className="h-72 w-full object-cover" loading="lazy" /></Link>
        {likedFx && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 grid place-items-center text-5xl text-white">❤</motion.div>}
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between"><h3 className="line-clamp-1 font-semibold">{product.title}</h3><span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">{product.badge || 'NEW'}</span></div>
        <p className="line-clamp-2 text-xs text-gray-500">{product.description}</p>
        <p className="mt-2 font-semibold text-gray-900">₹{product.price || 0}</p>
        <div className="mt-3 flex items-center justify-between text-gray-700">
          <button onClick={() => toggleFavorite(product)}>{isFav ? <FaHeart className="text-red-500" /> : <FaRegHeart />}</button>
          <button><FaShare /></button>
          <button><FaBookmark /></button>
          <a href={`https://wa.me/${String(whatsappNumber || '').replace(/\D/g, '')}`} target="_blank" rel="noreferrer"><FaWhatsapp className="text-green-600" /></a>
        </div>
      </div>
    </article>
  );
}

export default memo(ProductFeedCard);
