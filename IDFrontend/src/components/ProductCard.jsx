import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaWhatsapp, FaHeart, FaEye } from 'react-icons/fa';
import LazyImage from './common/LazyImage';
import { useFavorites } from '../context/FavoritesContext';

const getPriceForQty = (product, qty) => {
  const tiers = product?.quantityPricing;
  if (!Array.isArray(tiers) || tiers.length === 0) return product?.price ?? 0;
  const matched = tiers
    .filter((t) => qty >= t.minQty && (!t.maxQty || qty <= t.maxQty))
    .sort((a, b) => b.minQty - a.minQty)[0];
  return matched ? matched.price : product?.price ?? 0;
};

const BADGE_CLASS = {
  NEW:     'badge-new',
  POPULAR: 'badge-popular',
  HOT:     'badge-hot',
  'HOT DEAL': 'badge-hot',
};

const ProductCard = ({ product, whatsappNumber }) => {
  const [qty, setQty] = useState(product?.quantityPricing?.[0]?.minQty || 1);
  const [imgIdx, setImgIdx] = useState(0);
  const { favorites, toggleFavorite } = useFavorites();

  const isFav = favorites.some((f) => f._id === product?._id);
  const images = Array.isArray(product?.images) ? product.images : [];
  const price = getPriceForQty(product, qty);
  const productLink = `/products/${product?._id}`;
  const badge = product?.badge?.toUpperCase();
  const badgeClass = BADGE_CLASS[badge] || 'badge-new';

  const waNumber = String(whatsappNumber || '919999999999').replace(/\D/g, '');
  const waMsg = encodeURIComponent(
    `Hi! I want to order *${product?.title}*\nQty: ${qty}\nPrice: ₹${price} each\nTotal: ₹${price * qty}\nProduct ID: ${product?._id}`
  );
  const waHref = `https://wa.me/${waNumber}?text=${waMsg}`;

  const hasTiers = Array.isArray(product?.quantityPricing) && product.quantityPricing.length > 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50">
        <Link to={productLink}>
          {images[imgIdx] ? (
            <LazyImage
              src={images[imgIdx]}
              alt={product?.title || 'Product'}
              className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-52 w-full items-center justify-center text-sm text-gray-400">
              No image
            </div>
          )}
        </Link>

        {/* Badge */}
        {badge && (
          <span className={`absolute left-3 top-3 ${badgeClass}`}>{badge}</span>
        )}

        {/* Favourite */}
        <button
          onClick={() => toggleFavorite(product)}
          className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full shadow-sm backdrop-blur-sm transition-all duration-200 ${
            isFav ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-400 hover:text-red-500'
          }`}
          aria-label="Toggle favourite"
        >
          <FaHeart className="text-xs" />
        </button>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setImgIdx(i)}
                className={`h-1.5 rounded-full transition-all ${i === imgIdx ? 'w-5 bg-[#25D366]' : 'w-1.5 bg-white/70'}`}
                aria-label={`Photo ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Quick view */}
        <Link
          to={productLink}
          className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-2 bg-[#128C7E]/95 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0"
        >
          <FaEye className="text-xs" />
          View Details
        </Link>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <Link to={productLink}>
          <h3 className="line-clamp-1 font-serif text-base font-semibold text-gray-900 hover:text-[#128C7E] transition-colors">
            {product?.title}
          </h3>
        </Link>
        {product?.description && (
          <p className="mt-1 line-clamp-2 text-xs text-gray-500">{product.description}</p>
        )}

        {/* Price */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-xl font-bold text-[#128C7E]">₹{price}</span>
          <span className="text-xs text-gray-400">per piece</span>
        </div>

        {/* Quantity tiers */}
        {hasTiers && (
          <div className="mt-2 flex flex-wrap gap-1">
            {product.quantityPricing.map((tier, i) => (
              <button
                key={i}
                onClick={() => setQty(tier.minQty)}
                className={`rounded-lg border px-2 py-0.5 text-xs font-medium transition-all ${
                  qty >= tier.minQty && (!tier.maxQty || qty <= tier.maxQty)
                    ? 'border-[#25D366] bg-[#25D366]/10 text-[#128C7E]'
                    : 'border-gray-200 text-gray-500 hover:border-[#25D366]'
                }`}
              >
                {tier.minQty}{tier.maxQty ? `–${tier.maxQty}` : '+'} pcs · ₹{tier.price}
              </button>
            ))}
          </div>
        )}

        {/* Qty input */}
        <div className="mt-3 flex items-center gap-2">
          <label className="text-xs text-gray-500">Qty:</label>
          <div className="flex items-center overflow-hidden rounded-lg border border-gray-200">
            <button
              onClick={() => setQty((q) => Math.max(hasTiers ? product.quantityPricing[0].minQty : 1, q - 1))}
              className="px-2.5 py-1 text-sm text-gray-500 hover:bg-gray-50"
            >
              −
            </button>
            <span className="min-w-[32px] px-1 py-1 text-center text-sm font-semibold">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="px-2.5 py-1 text-sm text-gray-500 hover:bg-gray-50"
            >
              +
            </button>
          </div>
          <span className="ml-auto text-xs font-semibold text-gray-700">
            Total: ₹{price * qty}
          </span>
        </div>

        {/* WhatsApp order button */}
        <a
          href={waHref}
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#128C7E] transition-colors active:scale-95"
        >
          <FaWhatsapp className="text-base" />
          Order on WhatsApp
        </a>
      </div>
    </article>
  );
};

export default ProductCard;
