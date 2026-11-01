import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaWhatsapp } from 'react-icons/fa';
import { useFavorites } from '../../context/FavoritesContext';
import { optimizedImage } from '../../utils/media';
import { trackWhatsAppClick } from '../../hooks/useAnalytics';
import { saveEnquiryLead } from '../../hooks/useWhatsApp';

// Image-first gallery tile aligned with Discover our collections.
// Keep actual product pricing, favourites, navigation and enquiry tracking.
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
    <article className="sk-gallery-product-card group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[17px] border border-[#ded0ee]">
      <Link to={'/products/' + id} className="sk-gallery-product-photo relative block overflow-hidden"
        aria-label={'View ' + product.title}>
        {image ? (
          <img
            src={optimizedImage(image, 340)}
            alt={product.title + ' by SANJU SK Digital in Gondia'}
            width="340" height="400" loading="lazy" decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.035]"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-3xl text-[#9977ba]"
            aria-label="Image coming soon">✦</span>
        )}
        <span className="sk-gallery-product-label absolute bottom-2 left-2 rounded-full px-2 py-1 text-[8px] font-bold tracking-wide">
          CUSTOM MADE
        </span>
      </Link>
      <button type="button" onClick={() => toggleFavorite(product)}
        aria-label={isSaved ? 'Remove ' + product.title + ' from saved' : 'Save ' + product.title}
        className="sk-gallery-product-fav absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#77549e] shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600">
        {isSaved ? <FaHeart className="text-rose-500" /> : <FaRegHeart />}
      </button>
      <div className="sk-gallery-product-caption flex min-h-[126px] flex-1 flex-col p-2 sm:p-3">
        <Link to={'/products/' + id}
          className="sk-gallery-product-title block min-h-[28px] text-[11px] font-extrabold leading-tight line-clamp-2 sm:text-[13px]">
          {product.title}
        </Link>
        <p className="sk-gallery-product-category mt-1 truncate text-[9px]">
          {categoryName || 'Personalized for you'}
        </p>
        <p className="sk-gallery-product-price mt-auto pt-1 text-[12px] font-black sm:text-[14px]">{price}</p>
        <a href={href} target="_blank" rel="noopener noreferrer" onClick={onEnquire}
          aria-label={'Enquire on WhatsApp about ' + product.title}
          className="sk-gallery-product-enquire mt-2 flex min-h-8 w-full items-center justify-center gap-1 rounded-lg px-1 text-[10px] font-extrabold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600">
          <FaWhatsapp aria-hidden="true" /> Enquire
        </a>
      </div>
    </article>
  );
}

export default memo(CompactProductCard);
