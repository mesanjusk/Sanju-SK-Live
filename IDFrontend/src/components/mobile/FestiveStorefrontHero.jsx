import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowRight, FaBoxOpen, FaEllipsisV, FaGift, FaHeart, FaHome, FaLightbulb,
  FaPalette, FaPhoneAlt, FaPrint, FaRegEnvelope, FaSearch, FaThLarge, FaTimes,
  FaTrophy, FaUser, FaWhatsapp
} from 'react-icons/fa';
import { optimizedImage } from '../../utils/media';
import './festive-home.css';

// These are service-page links only. Real catalog categories always take priority.
const SERVICE_LINKS = [
  { id: 'wedding', label: 'Wedding Cards', href: '/wedding-card-printing-gondia/', Icon: FaRegEnvelope, tint: '#e7c9aa' },
  { id: 'gifting', label: 'Corporate Gifting', href: '/corporate-gifting-gondia/', Icon: FaGift, tint: '#e9d7bf' },
  { id: 'invitations', label: 'Digital Invitations', href: '/digital-wedding-invitations/', Icon: FaRegEnvelope, tint: '#d8e5da' },
  { id: 'printing', label: 'Printing Enquiries', href: '/contact', Icon: FaPrint, tint: '#e0d7cf' }
];

const TINTS = ['#e7c9aa', '#e9d7bf', '#d8e5da', '#e0d7cf', '#dce2ed'];
const imageOf = (item) => {
  const image = Array.isArray(item?.images) ? item.images.find(Boolean) : item?.images;
  return image || item?.imageUrl || null;
};

const iconFor = (name = '') => {
  if (/wedding|card|invitation/i.test(name)) return FaRegEnvelope;
  if (/gift|hamper|mug/i.test(name)) return FaGift;
  if (/sign|acrylic|neon|led|glow/i.test(name)) return FaLightbulb;
  if (/award|troph|memento/i.test(name)) return FaTrophy;
  return FaPrint;
};

function FestiveStorefrontHero({
  listings = [], categories = [], searchTerm = '', onSearchChange,
  selectedCategory, onCategorySelect, whatsappNumber, phoneNumber
}) {
  // Join the catalog on the exact category ID saved in each listing.
  // Order collections by actual product count, then preserve the admin order.
  const collections = useMemo(() => {
    if (!categories.length) return SERVICE_LINKS.map((item) => ({ ...item, subtitle: 'Explore service' }));
    return categories.map((category, index) => {
      const ids = [category._id, category.category_uuid].filter(Boolean).map(String);
      const products = listings.filter((product) => ids.includes(String(product.category?._id || product.category || '')));
      const image = imageOf(products.find((product) => imageOf(product))) || category.imageUrl;
      return {
        id: String(category._id || category.category_uuid || index),
        label: category.name,
        short: category.name,
        subtitle: products.length ? products.length + ' designs' : 'Explore category',
        image: image ? optimizedImage(image, 300) : null,
        category, count: products.length, index, Icon: iconFor(category.name),
        tint: TINTS[index % TINTS.length]
      };
    }).sort((a, b) => b.count - a.count || a.index - b.index);
  }, [listings, categories]);

  const featured = collections[0];
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onPointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const onKeyDown = (event) => { if (event.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);
  const wa = String(whatsappNumber || '919372333633').replace(/\D/g, '');
  const dialDigits = String(phoneNumber || '919372333633').replace(/\D/g, '');
  const dialHref = 'tel:' + (dialDigits.length === 10 ? '+91' + dialDigits : '+' + dialDigits);
  const displayPhone = dialDigits === '919372333633' ? '+91 93723 33633' : '+' + dialDigits;
  const quoteUrl = 'https://wa.me/' + wa + '?text=' +
    encodeURIComponent('Hello SANJU SK Digital! I would like a custom printing or gifting quotation.');

  const chooseCategory = (item) => onCategorySelect?.(item?.category || null);
  const submitSearch = (event) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
      document.getElementById('sk-products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderTab = (item) => {
    const { id, label, short, Icon, href, category } = item;
    const active = category && selectedCategory?._id === category._id;
    const content = <><Icon aria-hidden="true" /><span>{short || label}</span></>;
    return href
      ? <Link key={id} to={href} className="sk-festive-tab" title={label}>{content}</Link>
      : <button key={id} type="button" onClick={() => chooseCategory(item)}
          className={'sk-festive-tab ' + (active ? 'is-active' : '')}
          aria-label={'Browse ' + label} aria-pressed={!!active}>{content}</button>;
  };

  const renderTile = (item) => {
    const { id, label, subtitle, Icon, image, tint, href } = item;
    const content = <>
      <span className="sk-festive-tile-top">
        <span className="sk-festive-tile-title">{label}</span>
        <span className="sk-festive-tile-subtitle">{subtitle}</span>
      </span>
      <span className="sk-festive-tile-media">
        {image ? <img src={image} alt={label + ' designs at SANJU SK Digital in Gondia'} loading="lazy" decoding="async"
          width="240" height="160" /> : <Icon className="sk-festive-tile-fallback" aria-hidden="true" />}
      </span>
      <span className="sk-festive-tile-arrow"><FaArrowRight aria-hidden="true" /></span>
    </>;
    const style = { '--sk-tile-tint': tint };
    return href
      ? <Link key={id} to={href} className="sk-festive-tile" style={style} aria-label={'Explore ' + label}>{content}</Link>
      : <button key={id} type="button" onClick={() => chooseCategory(item)}
          className="sk-festive-tile" style={style} aria-label={'Browse ' + label}>{content}</button>;
  };

  return (
    <>
      <div className="sk-festive-dark">
        <header className="sk-festive-header sk-festive-container">
          <div className="sk-festive-header-row">
            <Link to="/" className="sk-festive-brand" aria-label="SANJU SK Digital homepage">
              <span className="sk-festive-brand-mark">SK</span>
              <span className="sk-festive-brand-name">
                SANJU <strong>SK</strong>
                <small>DIGITAL · MAHI CREATION</small>
              </span>
            </Link>
            <div className="sk-festive-search sk-festive-header-search" role="search">
              <FaSearch className="sk-festive-search-icon" aria-hidden="true" />
              <input type="search" value={searchTerm} onChange={(event) => onSearchChange?.(event.target.value)}
                onKeyDown={submitSearch} placeholder="Search products"
                aria-label="Search SK Digital products" />
              {searchTerm && <button type="button" onClick={() => onSearchChange?.('')}
                aria-label="Clear search"><FaTimes /></button>}
            </div>
            <div className="sk-festive-header-actions relative" ref={menuRef}>
              <button type="button" className="sk-festive-action"
                aria-label="Open website navigation" aria-haspopup="true"
                aria-expanded={menuOpen} aria-controls="sk-top-navigation"
                onClick={() => setMenuOpen(open => !open)}>
                <FaEllipsisV aria-hidden="true" />
              </button>
              {menuOpen && (
                <nav id="sk-top-navigation" aria-label="Website navigation"
                  className="sk-header-overflow-menu">
                  {[
                    { to: '/', label: 'Home', Icon: FaHome },
                    { to: '/allCategories', label: 'Explore categories', Icon: FaThLarge },
                    { to: '/contact', label: 'Contact us', Icon: FaPhoneAlt },
                    { to: '/favorites', label: 'Saved designs', Icon: FaHeart },
                    { to: '/profile', label: 'My profile', Icon: FaUser },
                  ].map(({ to, label, Icon }) => (
                    <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                      className="sk-header-overflow-link">
                      <Icon aria-hidden="true" /><span>{label}</span>
                    </Link>
                  ))}
                </nav>
              )}
            </div>
          </div>
          <div className="sk-festive-location-line">
            <p className="sk-festive-location">Made with <FaHeart aria-label="love" /> in <strong>Gondia, Maharashtra</strong></p>
            <a href={dialHref} className="sk-festive-top-phone" aria-label={'Call ' + displayPhone}>
              <FaPhoneAlt aria-hidden="true" />{displayPhone}
            </a>
          </div>
        </header>

        <nav className="sk-festive-tabs sk-festive-container" aria-label="Product categories">
          <button type="button" onClick={() => chooseCategory(null)}
            className={'sk-festive-tab ' + (!selectedCategory ? 'is-active' : '')}
            aria-pressed={!selectedCategory}>
            <FaThLarge aria-hidden="true" /><span>All</span>
          </button>
          {collections.map(renderTab)}
        </nav>

        <section className="sk-festive-showcase sk-festive-container" aria-labelledby="sk-festive-title">
          <div className="sk-festive-showcase-copy">
            <p className="sk-festive-kicker"><span className="sk-festive-sparkle">✦</span> GONDIA DESIGN STUDIO · SINCE 2006</p>
            <h1 id="sk-festive-title">Wedding cards, signage &amp; <em>flex printing in Gondia.</em></h1>
            <p>Laser-cut wedding invitations, 3D LED acrylic signs, corporate awards and banners — designed for Gondia and delivered across nearby cities.</p>
            {featured?.category
              ? <button type="button" onClick={() => chooseCategory(featured)}
                  className="sk-festive-primary-cta">Explore designs <FaArrowRight aria-hidden="true" /></button>
              : <Link to="/products" className="sk-festive-primary-cta">
                  Explore designs <FaArrowRight aria-hidden="true" /></Link>}
          </div>
          <div className="sk-festive-showcase-art" aria-hidden="true">
            <span className="sk-festive-orb" />
            <span className="sk-festive-art-sparkle sk-festive-art-sparkle-a">✧</span>
            <span className="sk-festive-art-sparkle sk-festive-art-sparkle-b">✦</span>
            <div className="sk-festive-art-card">
              {featured?.image ? <img src={featured.image} alt="" width="240" height="280"
                fetchPriority="high" decoding="async" /> : <FaRegEnvelope />}
            </div>
          </div>
        </section>

        <section className="sk-festive-picks sk-festive-container" aria-label="Shop by category">
          <div className="sk-festive-picks-heading">
            <h2>Discover our collections</h2><span>Swipe to explore <FaArrowRight aria-hidden="true" /></span>
          </div>
          <div className="sk-festive-tiles">
            {collections.map(renderTile)}
          </div>
        </section>

        <div className="sk-festive-quote sk-festive-container">
          <a href={quoteUrl} target="_blank" rel="noopener noreferrer"
            className="sk-festive-quote-bar">
            <span className="sk-festive-quote-icon"><FaPalette aria-hidden="true" /></span>
            <span><strong>Have something special in mind?</strong><small>Let's create it together · Get a quote</small></span>
            <FaArrowRight className="sk-festive-quote-arrow" aria-hidden="true" />
          </a>
        </div>
        <div className="sk-festive-scallop" aria-hidden="true" />
      </div>
      <div className="sk-festive-benefits" aria-label="Our services">
        <span><FaRegEnvelope aria-hidden="true" /> Custom designs</span>
        <span><FaBoxOpen aria-hidden="true" /> Made to order</span>
        <span><FaGift aria-hidden="true" /> Corporate gifting</span>
      </div>
    </>
  );
}

export default memo(FestiveStorefrontHero);
