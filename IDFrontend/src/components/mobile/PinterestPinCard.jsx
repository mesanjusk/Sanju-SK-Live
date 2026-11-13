import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEllipsisH, FaHeart, FaRegHeart, FaWhatsapp, FaLink } from 'react-icons/fa';
import { useFavorites } from '../../context/FavoritesContext';
import { optimizedImage } from '../../utils/media';
import {recordDesignInterest} from './interestRank.mjs';
import { trackWhatsAppClick } from '../../hooks/useAnalytics';
import { saveEnquiryLead } from '../../hooks/useWhatsApp';

function PinterestPinCard({ product, index = 0, categoryName = '', whatsappNumber = '919372333633' }) {
  const { favorites, liked, toggleFavorite, toggleLiked } = useFavorites();
  const [menuOpen, setMenuOpen] = useState(false);
  const id = String(product?._id || '');
  if (!id) return null;
  const image = Array.isArray(product.images) ? product.images.find(Boolean) : product.images || product.imageUrl;
  const isSaved = favorites.some(item => String(item._id) === id);
  const isLiked = liked.some(item => String(item._id) === id);
  const levels = (Array.isArray(product.quantityPricing) ? product.quantityPricing : [])
    .map(tier => Number(tier.price)).filter(price => Number.isFinite(price) && price > 0);
  const price = levels.length ? 'From ₹' + Math.min(...levels).toLocaleString('en-IN')
    : Number(product.price) > 0 ? 'From ₹' + Number(product.price).toLocaleString('en-IN') : '';
  const url = '/products/' + id;
  const message = 'Hi SANJU SK Digital, I would like a quote for ' + product.title +
    '. Design ID: ' + id + '. https://www.sanjusk.in' + url;
  const whatsapp = 'https://wa.me/' + String(whatsappNumber).replace(/\D/g, '') + '?text=' + encodeURIComponent(message);
  const enquire = () => {
    recordDesignInterest(product,'enquire');
    trackWhatsAppClick(id);
    saveEnquiryLead({productId:id,productName:product.title,message});
    setMenuOpen(false);
  };
  const copy = () => {
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText('https://www.sanjusk.in' + url);
    setMenuOpen(false);
  };
  return (
    <article className={'sk-pin-card sk-pin-shape-' + (index % 5)}>
      <div className="sk-pin-cover-wrap">
        <Link to={url} state={{ product }} onClick={() => recordDesignInterest(product)} className="sk-pin-cover" aria-label={'Open ' + product.title}>
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
          <Link to={url} state={{ product }} onClick={() => recordDesignInterest(product)} className="sk-pin-card-title">{product.title}</Link>
          {price && <p>{price}</p>}
        </div>
        <div className="sk-pin-menu-container">
          <button type="button" className="sk-pin-card-menu" aria-label={'Actions for ' + product.title}
            aria-expanded={menuOpen} onClick={() => setMenuOpen(open => !open)}>
            <FaEllipsisH/>
          </button>
          {menuOpen && (
            <div className="sk-pin-card-actions">
              <button type="button" onClick={() => {recordDesignInterest(product,'save');toggleFavorite(product);setMenuOpen(false);}}>
                <FaHeart/> {isSaved ? 'Unsave' : 'Save design'}
              </button>
              <button type="button" onClick={() => {recordDesignInterest(product,'like');toggleLiked(product);setMenuOpen(false);}}>
                {isLiked ? <FaHeart/> : <FaRegHeart/>} {isLiked ? 'Unlike design' : 'Like design'}
              </button>
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" onClick={enquire}>
                <FaWhatsapp/> Request quote
              </a>
              <button type="button" onClick={copy}><FaLink/> Copy link</button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
export default memo(PinterestPinCard);
