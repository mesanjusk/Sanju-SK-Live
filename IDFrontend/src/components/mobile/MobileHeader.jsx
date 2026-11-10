import { memo, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEllipsisH, FaHome, FaSearch, FaHeart, FaWhatsapp, FaPhoneAlt } from 'react-icons/fa';

// Consistent white/charcoal/gold header for every public shopping page.
function MobileHeader({ title = '' }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = event => { if (!menuRef.current?.contains(event.target)) setMenuOpen(false); };
    const onEscape = event => { if (event.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', onEscape);
    };
  }, [menuOpen]);
  return (
    <header className="sk-public-header">
      <div className="sk-public-header-inner">
        <Link to="/" className="sk-pin-brand" aria-label="SANJU SK Digital homepage">
          <img className="sk-pin-brand-final-logo" src="/images/sk-digital-final.svg"
            alt="" width="59" height="43" />
          <span className="sk-pin-brand-name">SANJU <b>SK</b>
            <small>DIGITAL · MAHI CREATION</small>
          </span>
        </Link>
        <div ref={menuRef} className="sk-public-header-actions">
          <a href="https://wa.me/919372333633" target="_blank" rel="noopener noreferrer"
            aria-label="WhatsApp SANJU SK Digital" className="sk-pin-top-action">
            <FaWhatsapp aria-hidden="true"/>
          </a>
          <button type="button" className="sk-pin-top-action" aria-label="Open website menu"
            aria-expanded={menuOpen} aria-controls="sk-public-header-menu"
            onClick={() => setMenuOpen(open => !open)}>
            <FaEllipsisH aria-hidden="true"/>
          </button>
          {menuOpen && (
            <nav id="sk-public-header-menu" className="sk-pin-overflow" aria-label="Website menu">
              <Link to="/" onClick={() => setMenuOpen(false)}><FaHome/> Browse designs</Link>
              <Link to="/?search=1" onClick={() => setMenuOpen(false)}><FaSearch/> Search designs</Link>
              <Link to="/favorites" onClick={() => setMenuOpen(false)}><FaHeart/> Saved & liked</Link>
              <Link to="/allCategories" onClick={() => setMenuOpen(false)}>All categories</Link>
              <Link to="/contact" onClick={() => setMenuOpen(false)}><FaPhoneAlt/> Contact studio</Link>
            </nav>
          )}
        </div>
      </div>
      {title && <p className="sk-public-header-context">{title}</p>}
    </header>
  );
}
export default memo(MobileHeader);
