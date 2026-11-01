import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaWhatsapp } from 'react-icons/fa';
import { useFavorites } from '../../context/FavoritesContext';
import { optimizedImage } from '../../utils/media';
import { trackWhatsAppClick } from '../../hooks/useAnalytics';
import { saveEnquiryLead } from '../../hooks/useWhatsApp';

function CompactProductCard({ product, whatsappNumber, categoryName = '' }) {
  const { favorites, toggleFavorite } = useFavorites();
  const images = Array.isArray(product.images)
    ? product.images.filter(Boolean)
    : [product.images || product.imageUrl].filter(Boolean);
  const image = images[0];
  const id = String(product._id || '');
  const isSaved = favorites.some((item) => String(item._id) === id);
  const price = useMemo(() => {
    const tiers = (product.quantityPricing || [])
      .map((tier) => Number(tier.price))
      .filter((value) => Number.isFinite(value) && value > 0);
    if (tiers.length) return 'From ₹' + Math.min(...tiers).toLocaleString('en-IN');
    const single = Number(product.price);
    return Number.isFinite(single) && single > 0
      ? '₹' + single.toLocaleString('en-IN') : 'Get a quote';
  }, [product.price, product.quantityPricing]);
  const wa = String(whatsappNumber || '919372333633').replace(/\D/g, '') || '919372333633';
  const message = 'Hi Sanju SK Digital, I am inquiring about ' + product.title +
    '. Product ID: ' + id + (categoryName ? '. Category: ' + categoryName : '') +
    '. Please share photos, pricing and delivery details. ' +
    'https://www.sanjusk.in/products/' + id;
  const href = 'https://wa.me/' + wa + '?text=' + encodeURIComponent(message);
  const onEnquire = () => {
    trackWhatsAppClick(id);
    saveEnquiryLead({ productId: id, productName: product.title, message });
  };

  return (
    <article className="relative min-w-0 overflow-hidden rounded-[14px] border border-[#e5eae2] bg-white shadow-[0_8px_26px_-20px_rgba(29,70,47,.35)]">
      <Link to={'/products/' + id} className="block">
        <div className="relative aspect-square overflow-hidden bg-[#f5f6f1]">
          {image ? (
            <img
              src={optimizedImage(image, 300)}
              alt={product.title + ' by SANJU SK Digital in Gondia'}
              width="300" height="300" loading="lazy" decoding="async"
              className="h-full w-full object-contain transition-transform duration-300 hover:scale-[1.035]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-3xl text-[#a5b7aa]" aria-label="Image coming soon">✦</div>
          )}
          <span className="absolute bottom-1 left-1 rounded bg-white/90 px-1 py-0.5 text-[7px] font-bold tracking-wide text-[#315d46] shadow-sm">CUSTOM MADE</span>
        </div>
      </Link>
      <button
        type="button" onClick={() => toggleFavorite(product)}
        aria-label={isSaved ? 'Remove ' + product.title + ' from saved' : 'Save ' + product.title}
        className="absolute right-1 top-1 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-[#315945] shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
      >
        {isSaved ? <FaHeart className="text-rose-500" /> : <FaRegHeart />}
      </button>
      <div className="p-2">
        <Link to={'/products/' + id} className="block min-h-[34px] text-[10px] sm:text-[12px] font-extrabold leading-[1.35] text-[#243d34] line-clamp-2">
          {product.title}
        </Link>
        <p className="mt-1 min-h-[13px] truncate text-[9px] text-[#799084]">{categoryName || 'Personalized for you'}</p>
        <p className="mt-1 text-[11px] font-black sm:text-[14px] text-[#204f38]">{price}</p>
        <a href={href} target="_blank" rel="noopener noreferrer" onClick={onEnquire}
          aria-label={'Enquire on WhatsApp about ' + product.title}
          className="mt-2 flex h-8 w-full items-center justify-center gap-1 rounded-lg bg-[#176a43] px-1 text-[10px] font-extrabold text-white hover:bg-[#115636] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600">
          <FaWhatsapp aria-hidden="true" /> Enquire
        </a>
      </div>
    </article>
  );
}

export default memo(CompactProductCard);
