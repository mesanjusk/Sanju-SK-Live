import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowRight, FaBoxOpen, FaGift, FaHeart, FaLightbulb, FaMapMarkerAlt,
  FaPalette, FaPrint, FaRegEnvelope, FaSearch, FaThLarge, FaTimes,
  FaTrophy, FaWhatsapp
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
  selectedCategory, onCategorySelect, whatsappNumber
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
        image: image ? optimizedImage(image, 480) : null,
        category, count: products.length, index, Icon: iconFor(category.name),
        tint: TINTS[index % TINTS.length]
      };
    }).sort((a, b) => b.count - a.count || a.index - b.index).slice(0, 12);
  }, [listings, categories]);

  const featured = collections[0];
  const wa = String(whatsappNumber || '919372333633').replace(/\D/g, '');
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
      <span className="sk-festive-tile-title">{label}</span>
      <span className="sk-festive-tile-subtitle">{subtitle}</span>
      {image ? <img src={image} alt="" loading="lazy" decoding="async"
        width="180" height="160" /> : <Icon className="sk-festive-tile-fallback" aria-hidden="true" />}
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
            <div className="sk-festive-header-actions">
              <Link to="/favorites" aria-label="Saved designs" className="sk-festive-action"><FaHeart /></Link>
              <a href={quoteUrl} target="_blank" rel="noopener noreferrer"
                aria-label="Chat with SK Digital on WhatsApp" className="sk-festive-action"><FaWhatsapp /></a>
            </div>
          </div>
          <p className="sk-festive-location"><FaMapMarkerAlt aria-hidden="true" /> Made with care in <strong>Gondia, Maharashtra</strong></p>
          <div className="sk-festive-search" role="search">
            <FaSearch className="sk-festive-search-icon" aria-hidden="true" />
            <input type="search" value={searchTerm} onChange={(event) => onSearchChange?.(event.target.value)}
              onKeyDown={submitSearch} placeholder="Search wedding cards, gifts, printing..."
              aria-label="Search SK Digital products" />
            {searchTerm && <button type="button" onClick={() => onSearchChange?.('')}
              aria-label="Clear search"><FaTimes /></button>}
          </div>
        </header>

        <nav className="sk-festive-tabs sk-festive-container" aria-label="Product categories">
          <button type="button" onClick={() => chooseCategory(null)}
            className={'sk-festive-tab ' + (!selectedCategory ? 'is-active' : '')}
            aria-pressed={!selectedCategory}>
            <FaThLarge aria-hidden="true" /><span>All</span>
          </button>
          {collections.slice(0, 8).map(renderTab)}
        </nav>

        <section className="sk-festive-showcase sk-festive-container" aria-labelledby="sk-festive-title">
          <div className="sk-festive-showcase-copy">
            <p className="sk-festive-kicker"><span className="sk-festive-sparkle">✦</span> THE CELEBRATION EDIT</p>
            <h1 id="sk-festive-title">Beautiful things for <em>every occasion.</em></h1>
            <p>From the first invitation to the finishing touch — design, printing & thoughtful gifting under one roof.</p>
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
            <h2>Discover our collections</h2><span>{categories.length ? 'From our real catalog' : 'Explore our services'}</span>
          </div>
          <div className="sk-festive-tiles">
            {collections.slice(0, 4).map(renderTile)}
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
