import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaShare, FaWhatsapp, FaArrowRight } from 'react-icons/fa';
import { useFavorites } from '../../context/FavoritesContext';
import { trackWhatsAppClick } from '../../hooks/useAnalytics';
import { saveEnquiryLead, resolveCategoryName } from '../../hooks/useWhatsApp';
import ProductStage from '../experience/ProductStage';
import { optimizedImage } from '../../utils/media';

function ProductFeedCard({ product, whatsappNumber, onView, priority = false }) {
  const { favorites, toggleFavorite, addLiked } = useFavorites();
  const [imgIdx, setImgIdx] = useState(0);
  const [categoryName, setCategoryName] = useState('');
  const cardRef = useRef(null);
  const isFav = favorites.some((f) => f._id === product._id);
  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [product.images].filter(Boolean);

  useEffect(() => {
    if (product?.category) {
      let mounted = true;
      resolveCategoryName(product.category).then((name) => { if (mounted) setCategoryName(name || ''); }).catch(() => {});
      return () => { mounted = false; };
    }
  }, [product?.category]);

  useEffect(() => {
    if (!onView || !cardRef.current || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { onView(product._id); observer.disconnect(); }
    }, { threshold: .35 });
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [onView, product._id]);

  const displayPrice = useMemo(() => {
    const prices = product.quantityPricing?.map((t) => Number(t.price)).filter((p) => p > 0) || [];
    return prices.length ? `From ₹${Math.min(...prices)}` : (Number(product.price) > 0 ? `₹${product.price}` : 'Ask for pricing');
  }, [product]);

  const wa = String(whatsappNumber || '919372333633').replace(/\D/g, '');
  const productLink = `${window.location.origin}/products/${product._id}`;
  const message = `Hi! I'm interested in *${product.title}*\n🆔 Product ID: ${product._id}\n💰 ${displayPrice}\n`
    + (categoryName ? `📂 Category: ${categoryName}\n` : '')
    + (images[imgIdx] ? `🖼️ Image: ${images[imgIdx]}\n` : '')
    + `🔗 ${productLink}\nPlease share a quotation.`;
  const waHref = `https://wa.me/${wa}?text=${encodeURIComponent(message)}`;

  const onOrder = () => {
    trackWhatsAppClick(product._id);
    saveEnquiryLead({ productId: product._id, productName: product.title, message });
  };
  const handleShare = () => {
    if (navigator.share) navigator.share({ title: product.title, url: productLink }).catch(() => {});
    else navigator.clipboard?.writeText(productLink);
  };

  return (
    <article className="sk-feed-card" ref={cardRef}>
      <div className="sk-feed-card__header">
        <Link to={`/products/${product._id}`} className="flex min-w-0 items-center gap-2.5">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-white bg-[#eef1ec] shadow-sm">
            {images[0] && <img className="h-full w-full object-cover" src={optimizedImage(images[0], 100)} alt="" loading="lazy" decoding="async" width="40" height="40" />}
          </div>
          <div className="min-w-0">
            <h3 className="sk-feed-card__title line-clamp-1">{product.title}</h3>
            <p className="sk-feed-card__muted">{categoryName || 'Made to order'}</p>
          </div>
        </Link>
        <span className="rounded-full bg-[#f6f0e5] px-2.5 py-1 text-[10px] font-bold text-[#6f532c]">PREVIEW</span>
      </div>

      <div onDoubleClick={() => { toggleFavorite(product); addLiked?.(product); }} >
        <ProductStage images={images} title={product.title} activeIndex={imgIdx} onIndexChange={setImgIdx}
          modelUrl={product.model3dUrl || product.modelUrl || product.glbUrl} priority={priority} compact />
      </div>

      <div className="sk-feed-card__actionbar">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => toggleFavorite(product)} aria-label={isFav ? 'Remove from saved' : 'Save product'}
            className="sk-glass-button !h-9 !w-9">
            {isFav ? <FaHeart className="text-rose-500" /> : <FaRegHeart />}
          </button>
          <button type="button" aria-label={`Share ${product.title}`} onClick={handleShare} className="sk-glass-button !h-9 !w-9"><FaShare /></button>
          <Link to={`/products/${product._id}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#365b4a]">
            Details <FaArrowRight className="text-[10px]" />
          </Link>
        </div>
        <a className="sk-order-button" href={waHref} target="_blank" rel="noopener noreferrer" onClick={onOrder}>
          Enquire <FaWhatsapp className="text-base text-[#91e6b1]" />
        </a>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-[#f0f0e9] px-4 pb-4 pt-3">
        <strong className="sk-price text-lg">{displayPrice}</strong>
        {product.description && <p className="line-clamp-1 max-w-[56%] text-right text-[11px] text-[#77847a]">{product.description}</p>}
      </div>
    </article>
  );
}
export default memo(ProductFeedCard);
