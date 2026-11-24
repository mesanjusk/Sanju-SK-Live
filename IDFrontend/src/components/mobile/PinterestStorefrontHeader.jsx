import { memo, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {isWeddingCategory} from './categoryOrder.mjs';
import {
  FaEllipsisH, FaHeart, FaSearch, FaTimes, FaWhatsapp, FaPhoneAlt, FaHome, FaCompass
} from 'react-icons/fa';

const idOf = value => String(value?._id || value?.category_uuid || value || '');
function PinterestStorefrontHeader({
  categories = [], selectedCategory, onCategorySelect, searchTerm = '',
  onSearchChange, catalogReady = false, searchOpen = false, onSearchOpen,
  whatsappNumber = '919372333633', phoneNumber = '+919372333633',
}) {
  const searchRef = useRef(null);
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = event => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const esc = event => { if (event.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [menuOpen]);
  useEffect(() => {
    if (!searchOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const raf = window.requestAnimationFrame(() => searchRef.current?.focus());
    const esc = event => {
      if (event.key === 'Escape') onSearchOpen?.(false);
    };
    document.addEventListener('keydown', esc);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.cancelAnimationFrame(raf);
      document.removeEventListener('keydown', esc);
    };
  }, [searchOpen, onSearchOpen]);

  const whatsapp = 'https://wa.me/' + String(whatsappNumber).replace(/\D/g, '') +
    '?text=' + encodeURIComponent('Hi SANJU SK Digital, I would like to discuss a custom design.');
  const firstWedding=catalogReady&&isWeddingCategory(categories[0])?categories[0]:null;
  const remainingCategories=firstWedding?categories.slice(1):categories;
  const suggested = categories.filter(category => !searchTerm.trim() ||
    category?.name?.toLowerCase().includes(searchTerm.trim().toLowerCase())).slice(0, 7);
  const goToResults = () => {
    onSearchOpen?.(false);
    window.requestAnimationFrame(() =>
      document.getElementById('sk-pin-feed')?.scrollIntoView({behavior:'smooth',block:'start'}));
  };
  const selectSuggestion = category => {
    onSearchChange?.('');
    onCategorySelect?.(category);
    onSearchOpen?.(false);
  };

  return (
    <div className={'sk-pin-top-shell'+(searchOpen?' sk-pin-search-open':'')}>
      <header className="sk-pin-header">
        <Link to="/" className="sk-pin-brand" aria-label="SANJU SK Digital homepage">
          <span className="sk-pin-brand-name">SANJU <b>SK</b>
            <small>DIGITAL · MAHI CREATION</small>
          </span>
        </Link>
        <div className="sk-pin-header-actions" ref={menuRef}>
          <Link className="sk-pin-top-action sk-pin-saved-top" to="/favorites"
            aria-label="Your saved and liked designs"><FaHeart aria-hidden="true" /></Link>
          <a href={whatsapp} target="_blank" rel="noopener noreferrer"
            className="sk-pin-top-action sk-pin-whatsapp-top"
            aria-label="Ask SANJU SK Digital on WhatsApp"><FaWhatsapp aria-hidden="true" /></a>
          <button type="button" className="sk-pin-top-action" aria-label="Open website menu"
            aria-expanded={menuOpen} aria-controls="sk-pin-overflow-menu"
            onClick={() => setMenuOpen(open => !open)}><FaEllipsisH aria-hidden="true" /></button>
          {menuOpen && <nav id="sk-pin-overflow-menu" className="sk-pin-overflow" aria-label="Site menu">
            <Link to="/" onClick={() => setMenuOpen(false)}><FaHome/> Home</Link>
            <Link to="/allCategories" onClick={() => setMenuOpen(false)}><FaCompass/> Explore categories</Link>
            <button type="button" onClick={() => {setMenuOpen(false);onSearchOpen?.(true);}}>
              <FaSearch/> Search designs
            </button>
            <Link to="/favorites" onClick={() => setMenuOpen(false)}><FaHeart/> Saved designs</Link>
            <a href={'tel:' + phoneNumber} onClick={() => setMenuOpen(false)}>
              <FaPhoneAlt/> Call our studio
            </a>
            <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact & directions</Link>
            <button type="button" onClick={() => {
              setMenuOpen(false);
              const footer = document.getElementById('sk-business-information');
              if (footer) {
                footer.open = true;
                footer.scrollIntoView({ behavior:'smooth', block:'start' });
              }
            }}>More about SANJU SK Digital</button>
          </nav>}
        </div>
      </header>
      <nav className="sk-pin-categories" aria-label="Browse design categories">
        <button type="button" disabled={!catalogReady}
          className={'sk-pin-category-tab' + (!selectedCategory ? ' is-current' : '')}
          aria-pressed={!selectedCategory}
          onClick={() => onCategorySelect?.(null)}>All</button>
        {firstWedding&&<button type="button" className={'sk-pin-category-tab'+
          (idOf(firstWedding)===idOf(selectedCategory)?' is-current':'')}
          aria-pressed={idOf(firstWedding)===idOf(selectedCategory)}
          onClick={()=>onCategorySelect?.(firstWedding)}>
          {firstWedding.name}
        </button>}
        {catalogReady ? remainingCategories.map((category, index) => (
          <button type="button" key={idOf(category) || index}
            className={'sk-pin-category-tab' +
              (idOf(category) === idOf(selectedCategory) ? ' is-current' : '')}
            aria-pressed={idOf(category) === idOf(selectedCategory)}
            onClick={() => onCategorySelect?.(category)}>{category.name || 'Designs'}</button>
        )) : Array.from({length:4},(_,i) =>
          <span className="sk-pin-tab-loading" key={i} aria-hidden="true"/>)}
      </nav>
      {searchOpen && (
        <div className="sk-pin-search-overlay" role="dialog" aria-modal="true"
          aria-labelledby="sk-pin-search-title">
          <div className="sk-pin-search-panel">
            <div className="sk-pin-search-modal-header">
              <h2 id="sk-pin-search-title">Search designs</h2>
              <button type="button" className="sk-pin-search-close"
                aria-label="Close search" onClick={() => onSearchOpen?.(false)}>
                <FaTimes aria-hidden="true" />
              </button>
            </div>
            <form className="sk-pin-search-row sk-pin-search-inline"
              role="search" onSubmit={event => {event.preventDefault();goToResults();}}>
              <FaSearch aria-hidden="true" />
              <input ref={searchRef} type="search" value={searchTerm}
                onChange={event => onSearchChange?.(event.target.value)}
                placeholder="Search wedding cards, signs, awards…"
                aria-label="Search products and designs" />
              {searchTerm && <button type="button" aria-label="Clear search"
                onClick={() => {onSearchChange?.('');searchRef.current?.focus();}}>
                <FaTimes aria-hidden="true" />
              </button>}
            </form>
            <p className="sk-pin-suggest-title">
              {searchTerm.trim() ? 'Matching collections' : 'Explore collections'}
            </p>
            <div className="sk-pin-suggest-list">
              {suggested.map(category => <button type="button" key={idOf(category)}
                onClick={() => selectSuggestion(category)}>
                <FaSearch aria-hidden="true" /> {category.name}
              </button>)}
            </div>
            <button type="button" className="sk-pin-search-results"
              onClick={goToResults}>Show {searchTerm.trim() ? 'matching' : 'all'} designs</button>
          </div>
        </div>
      )}
    </div>
  );
}
export default memo(PinterestStorefrontHeader);
