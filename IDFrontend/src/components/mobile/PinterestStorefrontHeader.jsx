import { memo, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEllipsisH, FaHeart, FaSearch, FaTimes, FaWhatsapp, FaPhoneAlt, FaHome } from 'react-icons/fa';

const idOf = value => String(value?._id || value?.category_uuid || value || '');

function PinterestStorefrontHeader({
  categories = [], selectedCategory, onCategorySelect, searchTerm = '',
  onSearchChange, catalogReady = false, searchOpen = false, onSearchOpen,
  whatsappNumber = '919372333633', phoneNumber = '+919372333633',
}) {
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);
  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = event => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const onEscape = event => { if (event.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', onEscape);
    };
  }, [menuOpen]);
  const whatsapp = 'https://wa.me/' + String(whatsappNumber).replace(/\D/g, '') +
    '?text=' + encodeURIComponent('Hi SANJU SK Digital, I would like to discuss a custom design.');
  return (
    <div className="sk-pin-top-shell">
      <header className="sk-pin-header">
        <Link to="/" className="sk-pin-brand" aria-label="SANJU SK Digital home">
          <img className="sk-pin-brand-final-logo" src="/images/sk-digital-final.svg"
            alt="SK Digital logo" width="59" height="43" />
          <span className="sk-pin-brand-name">SANJU <b>SK</b><small>DIGITAL · MAHI CREATION</small></span>
        </Link>
        <div className="sk-pin-header-actions" ref={menuRef}>
          <a href={whatsapp} target="_blank" rel="noopener noreferrer"
            className="sk-pin-top-action" aria-label="Request a custom design via WhatsApp">
            <FaWhatsapp aria-hidden="true"/>
          </a>
          <button type="button" className="sk-pin-top-action" aria-label="Open website menu"
            aria-expanded={menuOpen} aria-controls="sk-pin-overflow-menu"
            onClick={() => setMenuOpen(open => !open)}>
            <FaEllipsisH aria-hidden="true"/>
          </button>
          {menuOpen && (
            <nav id="sk-pin-overflow-menu" className="sk-pin-overflow" aria-label="Site menu">
              <Link to="/" onClick={() => setMenuOpen(false)}><FaHome/> Home</Link>
              <button type="button" onClick={() => {setMenuOpen(false);onSearchOpen?.(true);}}><FaSearch/> Search designs</button>
              <Link to="/favorites" onClick={() => setMenuOpen(false)}><FaHeart/> Saved designs</Link>
              <a href={'tel:' + phoneNumber}><FaPhoneAlt/> Call our studio</a>
              <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact & directions</Link>
              <button type="button" onClick={() => {
                setMenuOpen(false);
                const footer = document.getElementById('sk-business-information');
                if (footer) { footer.open = true; footer.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
              }}>More about SANJU SK Digital</button>
            </nav>
          )}
        </div>
      </header>
      {searchOpen && (
        <div className="sk-pin-search-row" role="search">
          <FaSearch aria-hidden="true" />
          <input ref={inputRef} type="search" value={searchTerm} disabled={!catalogReady}
            onChange={event => onSearchChange?.(event.target.value)}
            placeholder={catalogReady ? 'Find wedding cards, signage, gifts…' : 'Preparing designs…'}
            aria-label="Search custom designs"/>
          <button type="button" aria-label="Close search" onClick={() => {
            onSearchChange?.('');onSearchOpen?.(false);
          }}><FaTimes aria-hidden="true"/></button>
        </div>
      )}
      <nav className="sk-pin-categories" aria-label="Browse design categories">
        <button type="button" disabled={!catalogReady}
          className={'sk-pin-category-tab' + (!selectedCategory ? ' is-current' : '')}
          aria-pressed={!selectedCategory}
          onClick={() => onCategorySelect?.(null)}>All</button>
        {catalogReady ? categories.map((cat, index) => (
          <button type="button" key={idOf(cat) || index}
            className={'sk-pin-category-tab' + (idOf(cat) === idOf(selectedCategory) ? ' is-current' : '')}
            aria-pressed={idOf(cat) === idOf(selectedCategory)}
            onClick={() => onCategorySelect?.(cat)}>
            {cat.name || 'Designs'}
          </button>
        )) : Array.from({length:4},(_,i)=><span className="sk-pin-tab-loading" key={i} aria-hidden="true"/>)}
      </nav>
    </div>
  );
}
export default memo(PinterestStorefrontHeader);
