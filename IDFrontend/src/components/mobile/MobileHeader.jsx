import { memo } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaSearch, FaWhatsapp } from 'react-icons/fa';

function MobileHeader() {
  return (
    <header className="sk-storefront-header sticky top-0 z-40 px-3 pb-2 pt-[max(env(safe-area-inset-top),0.5rem)]">
      <div className="sk-shell flex items-center justify-between gap-2">
        <Link to="/products" aria-label="Search products" className="sk-glass-button"><FaSearch /></Link>
        <Link to="/" className="min-w-0 text-center">
          <span className="sk-brand-wordmark block">SANJU SK <span className="font-normal">Digital</span></span>
          <span className="sk-brand-subline block">Mahi Creation · Gondia</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <Link to="/favorites" aria-label="Saved products" className="sk-glass-button"><FaHeart /></Link>
          <a href="https://wa.me/919372333633" target="_blank" rel="noopener noreferrer"
            aria-label="Chat on WhatsApp" className="sk-glass-button"><FaWhatsapp className="text-[#199c57]" /></a>
        </div>
      </div>
    </header>
  );
}
export default memo(MobileHeader);
