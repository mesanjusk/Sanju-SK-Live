import { memo, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEllipsisH, FaHeart, FaSearch, FaTimes, FaWhatsapp, FaPhoneAlt, FaHome, FaCompass } from 'react-icons/fa';

const idOf = value => String(value?._id || value?.category_uuid || value || '');
function PinterestStorefrontHeader({
  categories = [], selectedCategory, onCategorySelect, searchTerm = '',
  onSearchChange, catalogReady = false, searchOpen = false, onSearchOpen,
  whatsappNumber = '919372333633', phoneNumber = '+919372333633',
}) {
  const searchRef = useRef(null);
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);
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
  const whatsapp = 'https://wa.me/' + String(whatsappNumber).replace(/\D/g, '') +
    '?text=' + encodeURIComponent('Hi SANJU SK Digital, I would like to discuss a custom design.');
  const suggested = categories.filter(cat => cat?.name?.toLowerCase().includes(searchTerm.toLowerCase().trim()))
    .slice(0, 6);
  const chooseSuggested = category => {
    onSearchChange?.('');
    onSearchOpen?.(false);
    setSearchFocused(false);
    onCategorySelect?.(category);
  };
  const searchBox = (mobile) => (
    <div className={'sk-pin-search-row sk-pin-search-inline' + (searchFocused ? ' has-focus' : '')}
      role="search">
      <FaSearch aria-hidden="true" />
      <input ref={mobile ? searchRef : undefined} type="search" value={searchTerm}
        disabled={!catalogReady} onChange={event => onSearchChange?.(event.target.value)}
        onFocus={() => { setSearchFocused(true); onSearchOpen?.(true); }}
        onKeyDown={event => { if (event.key === 'Escape') {
          onSearchChange?.('');setSearchFocused(false);onSearchOpen?.(false);event.target.blur();
        }}}
        placeholder={catalogReady ? 'Search wedding cards, signs, gifts and more' : 'Preparing designs…'}
        aria-label="Search custom designs"/>
      {searchTerm && <button type="button" aria-label="Clear search"
        onClick={() => onSearchChange?.('')}><FaTimes aria-hidden="true"/></button>}
    </div>
  );
  return (
    <div className="sk-pin-top-shell">
      <header className="sk-pin-header">
        <Link to="/" className="sk-pin-brand" aria-label="SANJU SK Digital homepage">
          <img className="sk-pin-brand-final-logo" src="/images/sk-digital-final.svg"
            alt="SK Digital logo" width="59" height="43" />
          <span className="sk-pin-brand-name">SANJU <b>SK</b>
            <small>DIGITAL · MAHI CREATION</small></span>
        </Link>
        <div className="sk-pin-desktop-search">{searchBox(false)}</div>
        <div className="sk-pin-header-actions" ref={menuRef}>
          <Link className="sk-pin-top-action sk-pin-saved-top" to="/favorites"
            aria-label="Your saved and liked designs"><FaHeart aria-hidden="true"/></Link>
          <a href={whatsapp} target="_blank" rel="noopener noreferrer"
            className="sk-pin-top-action sk-pin-whatsapp-top"
            aria-label="Request a custom design via WhatsApp">
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
              <Link to="/allCategories" onClick={() => setMenuOpen(false)}><FaCompass/> Explore categories</Link>
              <button type="button" onClick={() => {setMenuOpen(false);onSearchOpen?.(true);setSearchFocused(true);searchRef.current?.focus();}}>
                <FaSearch/> Search designs
              </button>
              <Link to="/favorites" onClick={() => setMenuOpen(false)}><FaHeart/> Saved and liked designs</Link>
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
      <div className="sk-pin-mobile-search">{searchBox(true)}</div>
      {searchFocused && catalogReady && (
        <div className="sk-pin-suggestions" onMouseDown={event => event.preventDefault()}>
          <div className="sk-pin-suggest-title">{searchTerm ? 'Matching collections' : 'Explore popular collections'}</div>
          <div className="sk-pin-suggest-list">
            {suggested.map(cat => <button type="button" key={idOf(cat)}
              onClick={() => chooseSuggested(cat)}><FaSearch aria-hidden="true"/>{cat.name}</button>)}
            {searchTerm && <button type="button" onClick={() => {
              setSearchFocused(false);onSearchOpen?.(false);searchRef.current?.blur();
              document.getElementById('sk-pin-feed')?.scrollIntoView({behavior:'smooth'});
            }}><FaSearch aria-hidden="true"/>Show results for “{searchTerm}”</button>}
          </div>
          <button type="button" className="sk-pin-suggest-close" onClick={() => {
            setSearchFocused(false);onSearchOpen?.(false);
          }}>Close</button>
        </div>
      )}
      <nav className="sk-pin-categories" aria-label="Browse design categories">
        <button type="button" disabled={!catalogReady}
          className={'sk-pin-category-tab' + (!selectedCategory ? ' is-current' : '')}
          aria-pressed={!selectedCategory}
          onClick={() => {setSearchFocused(false);onCategorySelect?.(null);}}>For you</button>
        {catalogReady ? categories.map((cat, index) => (
          <button type="button" key={idOf(cat) || index}
            className={'sk-pin-category-tab' + (idOf(cat) === idOf(selectedCategory) ? ' is-current' : '')}
            aria-pressed={idOf(cat) === idOf(selectedCategory)}
            onClick={() => {setSearchFocused(false);onCategorySelect?.(cat);}}>
            {cat.name || 'Designs'}
          </button>
        )) : Array.from({length:4},(_,i)=><span className="sk-pin-tab-loading" key={i} aria-hidden="true"/>)}
      </nav>
    </div>
  );
}
export default memo(PinterestStorefrontHeader);
