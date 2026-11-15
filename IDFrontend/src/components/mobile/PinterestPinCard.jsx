import { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaWhatsapp } from 'react-icons/fa';
import { useFavorites } from '../../context/FavoritesContext';
import { optimizedImage } from '../../utils/media';
import {recordDesignInterest} from './interestRank.mjs';
import { trackWhatsAppClick } from '../../hooks/useAnalytics';
import { saveEnquiryLead } from '../../hooks/useWhatsApp';

function PinterestPinCard({ product, index = 0, categoryName = '', whatsappNumber = '919372333633' }) {
  const { favorites, toggleFavorite } = useFavorites();
  const location = useLocation();
  const openPin = () => {
    if (location.pathname === '/') {
      try { sessionStorage.setItem('sk-home-scroll-position', String(Math.max(0, window.scrollY))); } catch {}
    }
    recordDesignInterest(product);
  };
  const id = String(product?._id || '');
  if (!id) return null;
  const image = Array.isArray(product.images) ? product.images.find(Boolean) : product.images || product.imageUrl;
  const isSaved = favorites.some(item => String(item._id) === id);
  // The smallest eligible tier is the advertised unit price for this design.
  const tiers = (Array.isArray(product.quantityPricing) ? product.quantityPricing : [])
    .filter(tier => Number(tier.price) > 0 && Number(tier.minQty) > 0)
    .sort((a,b)=>Number(a.minQty)-Number(b.minQty));
  const price = tiers.length ? Number(tiers[0].price)
    : Number(product.price) > 0 ? Number(product.price) : null;
  const priceQty = tiers[0] ? Number(tiers[0].minQty) : 1;
  const url = '/products/' + id;
  const message = 'Hi SANJU SK Digital, I would like a quote for ' + product.title +
    '. Design ID: ' + id + '. https://www.sanjusk.in' + url;
  const whatsapp = 'https://wa.me/' + String(whatsappNumber).replace(/\D/g, '') + '?text=' + encodeURIComponent(message);
  const enquire = () => {
    recordDesignInterest(product,'enquire');
    trackWhatsAppClick(id);
    saveEnquiryLead({productId:id,productName:product.title,message});
  };
  return (
    <article className={'sk-pin-card sk-pin-shape-' + (index % 5)}>
      <div className="sk-pin-cover-wrap">
        <Link to={url} state={{ product }} onClick={openPin} className="sk-pin-cover" aria-label={'Open ' + product.title}>
          {image ? <img src={optimizedImage(image, 540)}
            alt={product.title + ' custom design by SANJU SK Digital, Gondia'}
            loading={index < 3 ? 'eager' : 'lazy'} decoding="async" width="480" height="600"/> :
            <span className="sk-pin-no-image" aria-label="Image unavailable">✦</span>}
        </Link>
        <a href={whatsapp} target="_blank" rel="noopener noreferrer"
          className="sk-pin-hover-quote" onClick={enquire}>
          <FaWhatsapp aria-hidden="true" /> Request quote
        </a>
        <button type="button" className={'sk-pin-save' + (isSaved ? ' is-saved' : '')}
          aria-label={isSaved ? 'Remove design from saved' : 'Save this design'}
          aria-pressed={isSaved} onClick={() => {recordDesignInterest(product,'save');toggleFavorite(product);}}>
          {isSaved ? <FaHeart/> : <FaRegHeart/>}
        </button>
      </div>
      <div className="sk-pin-under">
        <div className="sk-pin-card-text">
          <Link to={url} state={{ product }} onClick={openPin} className="sk-pin-card-title">{product.title}</Link>
        </div>
        <Link to={url} state={{ product }} onClick={openPin}
          className="sk-pin-card-unit-price"
          aria-label={price !== null ? '₹' + price + ' per piece at ' + priceQty + ' pieces' : 'Ask price for ' + product.title}
          title={price !== null ? 'Per piece for ' + priceQty + '+ pcs' : 'Ask for price'}>
          {price !== null ? <><span aria-hidden="true">₹</span><strong>{price.toLocaleString('en-IN')}</strong></>
            : <strong className="sk-pin-ask-price">Quote</strong>}
        </Link>
      </div>
    </article>
  );
}
export default memo(PinterestPinCard);
