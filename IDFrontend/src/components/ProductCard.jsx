import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaWhatsapp, FaHeart, FaRegHeart, FaArrowRight } from 'react-icons/fa';
import { useFavorites } from '../context/FavoritesContext';
import { trackWhatsAppClick } from '../hooks/useAnalytics';
import { useWhatsAppNumber, saveEnquiryLead, resolveCategoryName } from '../hooks/useWhatsApp';
import ProductStage from './experience/ProductStage';

export default function ProductCard({ product }) {
  const [img, setImg] = useState(0);
  const [categoryName, setCategoryName] = useState('');
  const { favorites, toggleFavorite } = useFavorites();
  const images = Array.isArray(product?.images) ? product.images.filter(Boolean) : [product?.images].filter(Boolean);
  const isFav = favorites.some((f) => f._id === product?._id);
  const wa = useWhatsAppNumber() || '919372333633';

  useEffect(() => {
    if (!product?.category) return;
    let active = true;
    resolveCategoryName(product.category).then(name => { if (active) setCategoryName(name || ''); }).catch(() => {});
    return () => { active = false; };
  }, [product?.category]);

  const price = useMemo(() => {
    const prices = product?.quantityPricing?.map(t => Number(t.price)).filter(p => p > 0) || [];
    return prices.length ? `From ₹${Math.min(...prices)}` : (Number(product?.price) > 0 ? `₹${product.price}` : 'Ask for price');
  }, [product]);
  const productLink = `${window.location.origin}/products/${product?._id}`;
  const message = `Hi, I am interested in *${product?.title}*\nProduct ID: ${product?._id}\n${price}\n`
    + (categoryName ? `Category: ${categoryName}\n` : '')
    + (images[img] ? `Image: ${images[img]}\n` : '') + `Product: ${productLink}`;
  const waHref = `https://wa.me/${String(wa).replace(/\D/g,'')}?text=${encodeURIComponent(message)}`;
  const enquire = () => {
    trackWhatsAppClick(product?._id);
    saveEnquiryLead({ productId:product?._id, productName:product?.title, message });
  };

  return (
    <article className="sk-catalog-card">
      <div className="relative">
        <ProductStage images={images} title={product?.title} compact
          activeIndex={img} onIndexChange={setImg}
          modelUrl={product?.model3dUrl || product?.modelUrl || product?.glbUrl} />
        <button type="button" aria-label={isFav ? 'Remove saved product' : 'Save product'}
          className="sk-glass-button !absolute !right-3 !top-14 !z-[5] !h-9 !w-9"
          onClick={() => toggleFavorite(product)}>
          {isFav ? <FaHeart className="text-rose-600" /> : <FaRegHeart />}
        </button>
      </div>
      <div className="sk-catalog-card__body">
        <p className="sk-feed-card__muted">{categoryName || 'Custom made · Gondia'}</p>
        <Link to={`/products/${product?._id}`} className="mt-1 block">
          <h3 className="line-clamp-2 text-lg font-extrabold tracking-tight text-[#294133]">{product?.title}</h3>
        </Link>
        <p className="mt-2 line-clamp-2 min-h-[30px] text-xs leading-5 text-[#738174]">
          {product?.description || 'Crafted for your occasion. Explore the images and request a custom quotation.'}
        </p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <strong className="sk-price text-lg">{price}</strong>
          <a href={waHref} target="_blank" rel="noopener noreferrer" onClick={enquire} className="sk-order-button"><FaWhatsapp /> Enquire</a>
        </div>
        <Link to={`/products/${product?._id}`} className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-[#49694e]">
          View photos & details <FaArrowRight />
        </Link>
      </div>
    </article>
  );
}
