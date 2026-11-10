import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEllipsisH, FaHeart, FaRegHeart, FaWhatsapp, FaShareAlt } from 'react-icons/fa';
import { useFavorites } from '../../context/FavoritesContext';
import { optimizedImage } from '../../utils/media';
import { saveEnquiryLead } from '../../hooks/useWhatsApp';
import { trackWhatsAppClick } from '../../hooks/useAnalytics';

export default function PinterestPin({product,index=0,whatsappNumber,categoryName=''}) {
  const [menuOpen,setMenuOpen]=useState(false);
  const {favorites,toggleFavorite}=useFavorites();
  const id=String(product._id||'');
  const image=Array.isArray(product.images)?product.images.find(Boolean):product.images||product.imageUrl;
  const isSaved=favorites.some(p=>String(p._id)===id);
  const message='Hi SANJU SK Digital, please share customisation options and price for '+product.title+
    '. Product ID: '+id+'. https://www.sanjusk.in/products/'+id;
  const href='https://wa.me/'+String(whatsappNumber||'919372333633').replace(/\D/g,'')+'?text='+encodeURIComponent(message);
  const onWhatsApp=()=>{trackWhatsAppClick(id);saveEnquiryLead({productId:id,productName:product.title,message});};
  const share=()=>{
    const url='https://www.sanjusk.in/products/'+id;
    if(navigator.share) navigator.share({title:product.title,url}).catch(()=>{});
    else navigator.clipboard?.writeText(url).catch(()=>{});
  };
  return <article className={'sk-pin-card sk-pin-variation-'+index%5}>
    <div className="sk-pin-image-wrap">
      <Link to={'/products/'+id} aria-label={'Open '+product.title} className="sk-pin-image-link">
        {image?<img src={optimizedImage(image,520)} alt={product.title+' — SANJU SK Digital Gondia'}
          width="520" height={index%3===0?"660":"540"} loading={index<4?'eager':'lazy'} decoding="async"/>:
          <span className="sk-pin-fallback" aria-label="Image unavailable">✦</span>}
      </Link>
      <button type="button" className={'sk-pin-save'+(isSaved?' is-saved':'')}
        onClick={()=>toggleFavorite(product)} aria-label={isSaved?'Remove saved design':'Save design'}>
        {isSaved?<FaHeart aria-hidden="true"/>:<FaRegHeart aria-hidden="true"/>}
      </button>
    </div>
    <div className="sk-pin-caption">
      <Link to={'/products/'+id} className="sk-pin-title">{product.title}</Link>
      <button className="sk-pin-more" type="button" aria-label={'More options for '+product.title}
        aria-expanded={menuOpen} onClick={()=>setMenuOpen(v=>!v)}><FaEllipsisH aria-hidden="true"/></button>
    </div>
    {menuOpen&&<div className="sk-pin-menu" role="group" aria-label={'Actions for '+product.title}>
      {categoryName&&<span className="sk-pin-menu-category">{categoryName}</span>}
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={onWhatsApp}><FaWhatsapp/> Enquire</a>
      <button type="button" onClick={share}><FaShareAlt/> Share</button>
    </div>}
  </article>;
}
