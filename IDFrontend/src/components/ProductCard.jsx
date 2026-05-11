import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaWhatsapp, FaHeart } from 'react-icons/fa';
import LazyImage from './common/LazyImage';
import { useFavorites } from '../context/FavoritesContext';
import { trackWhatsAppClick } from '../hooks/useAnalytics';
import { useWhatsAppNumber, saveEnquiryLead, resolveCategoryName } from '../hooks/useWhatsApp';

const ProductCard = ({ product }) => {
  const [img, setImg] = useState(0);
  const [categoryName, setCategoryName] = useState('');
  const { favorites, toggleFavorite } = useFavorites();
  const isFav = favorites.some((f) => f._id === product?._id);
  const images = product?.images || [];
  const wa = useWhatsAppNumber();

  useEffect(() => {
    if (product?.category) {
      resolveCategoryName(product.category).then(setCategoryName);
    }
  }, [product?.category]);

  const productLink = `${window.location.origin}/products/${product?._id}`;

  const msgText =
    `Hi! I'm interested in *${product?.title}*\n` +
    `🆔 Product ID: ${product?._id || ''}\n` +
    `💰 Price: ₹${product?.price || 0}\n` +
    (categoryName ? `📂 Category: ${categoryName}\n` : '') +
    (images[0] ? `🖼️ Image: ${images[0]}\n` : '') +
    `🔗 Link: ${productLink}\n` +
    `\nPlease share more details.`;

  const waHref = wa
    ? `https://wa.me/${wa}?text=${encodeURIComponent(msgText)}`
    : '#';

  const handleWAClick = () => {
    trackWhatsAppClick(product?._id);
    saveEnquiryLead({
      productId: product?._id,
      productName: product?.title,
      message: msgText,
    });
  };

  return (
    <motion.article whileHover={{ y: -6 }} className="lux-card group overflow-hidden">
      <div className="relative">
        <Link to={`/products/${product?._id}`}>
          {images[img]
            ? <LazyImage src={images[img]} alt={product?.title} className="h-64 w-full object-cover transition duration-500 group-hover:scale-105" />
            : <div className="h-64 bg-[#eef5eb]" />}
        </Link>
        <button
          onClick={() => toggleFavorite(product)}
          className={`absolute right-4 top-4 rounded-full p-2 ${isFav ? 'bg-[#2E3A2F] text-white' : 'bg-white/80'}`}
        >
          <FaHeart />
        </button>
      </div>
      <div className="p-5">
        <h3 className="text-2xl font-semibold">{product?.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-[#607061]">
          {product?.description || 'Curated luxury print design with premium finishing options.'}
        </p>
        <div className="mt-4 flex items-end justify-between">
          <span className="text-2xl font-bold">₹{product?.price || 0}</span>
          <a
            href={waHref}
            target="_blank"
            rel="noreferrer"
            onClick={handleWAClick}
            className="lux-btn-primary !px-4 !py-2"
          >
            <FaWhatsapp />Enquire
          </a>
        </div>
        {images.length > 1 && (
          <div className="mt-3 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setImg(i)}
                className={`h-1.5 rounded-full ${i === img ? 'w-8 bg-[#9db69a]' : 'w-3 bg-[#d9e5d5]'}`}
              />
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
};

export default ProductCard;
