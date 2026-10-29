import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowRight, FaBoxOpen, FaGift, FaHeart, FaLightbulb, FaMapMarkerAlt,
  FaPalette, FaPrint, FaRegEnvelope, FaSearch, FaThLarge, FaTimes,
  FaTrophy, FaWhatsapp
} from 'react-icons/fa';
import { optimizedImage } from '../../utils/media';
import './festive-home.css';

const COLLECTIONS = [
  {
    id: 'wedding', label: 'Wedding Cards', short: 'Wedding',
    subtitle: 'Beautiful beginnings', Icon: FaRegEnvelope,
    terms: /wedding|invitation|shaadi|card|lagna/i, tint: '#e7c9aa'
  },
  {
    id: 'gifting', label: 'Corporate Gifts', short: 'Gifting',
    subtitle: 'Thoughtful surprises', Icon: FaGift,
    terms: /gift|hamper|mug|corporate|keychain/i, tint: '#e9d7bf'
  },
  {
    id: 'signage', label: 'Glow Signage', short: 'Signage',
    subtitle: 'Make a statement', Icon: FaLightbulb,
    terms: /sign|acrylic|led|neon|glow|board/i, tint: '#d8e5da'
  },
  {
    id: 'printing', label: 'Print & Packaging', short: 'Printing',
    subtitle: 'Made for your brand', Icon: FaPrint,
    terms: /print|flex|banner|label|sticker|brochure|stationery/i, tint: '#e0d7cf'
  },
  {
    id: 'awards', label: 'Awards & Trophies', short: 'Awards',
    subtitle: 'Celebrate achievement', Icon: FaTrophy,
    terms: /troph|award|memento|medal/i, tint: '#d8e2dc'
  }
];

const imageOf = (item) => {
  const image = Array.isArray(item?.images) ? item.images.find(Boolean) : item?.images;
  return image || item?.imageUrl || null;
};

function FestiveStorefrontHero({
  listings = [], categories = [], searchTerm = '', onSearchChange,
  activeCollection, onCollectionSelect, whatsappNumber
}) {
  const collections = useMemo(() => COLLECTIONS.map((item) => {
    const category = categories.find((cat) => item.terms.test(cat.name || ''));
    const matchingProduct = listings.find((product) => {
      if (!imageOf(product)) return false;
      const productCategoryId = product.category?._id || product.category;
      const belongsToCategory = category &&
        (productCategoryId === category._id || productCategoryId === category.category_uuid);
      return belongsToCategory ||
        item.terms.test([product.title, product.description].filter(Boolean).join(' '));
    });
    const image = imageOf(matchingProduct) || imageOf(category);
    return { ...item, image: image ? optimizedImage(image, 480) : null };
  }), [listings, categories]);

  const wedding = collections[0];
  const wa = String(whatsappNumber || '919372333633').replace(/\D/g, '');
  const quoteUrl = 'https://wa.me/' + wa + '?text=' +
    encodeURIComponent('Hello SANJU SK Digital! I would like a custom printing or gifting quotation.');

  const chooseCollection = (id) => onCollectionSelect?.(id);
  const submitSearch = (event) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
      document.getElementById('sk-products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

        <nav className="sk-festive-tabs sk-festive-container" aria-label="Popular product collections">
          <button type="button" onClick={() => chooseCollection(null)}
            className={'sk-festive-tab ' + (!activeCollection ? 'is-active' : '')}
            aria-pressed={!activeCollection}>
            <FaThLarge aria-hidden="true" /><span>All</span>
          </button>
          {collections.map(({ id, short, Icon }) => (
            <button key={id} type="button" onClick={() => chooseCollection(id)}
              className={'sk-festive-tab ' + (activeCollection === id ? 'is-active' : '')}
              aria-pressed={activeCollection === id}>
              <Icon aria-hidden="true" /><span>{short}</span>
            </button>
          ))}
        </nav>

        <section className="sk-festive-showcase sk-festive-container" aria-labelledby="sk-festive-title">
          <div className="sk-festive-showcase-copy">
            <p className="sk-festive-kicker"><span className="sk-festive-sparkle">✦</span> THE CELEBRATION EDIT</p>
            <h1 id="sk-festive-title">Beautiful things for <em>every occasion.</em></h1>
            <p>From the first invitation to the finishing touch — design, printing & thoughtful gifting under one roof.</p>
            <button type="button" onClick={() => chooseCollection('wedding')}
              className="sk-festive-primary-cta">Explore designs <FaArrowRight aria-hidden="true" /></button>
          </div>
          <div className="sk-festive-showcase-art" aria-hidden="true">
            <span className="sk-festive-orb" />
            <span className="sk-festive-art-sparkle sk-festive-art-sparkle-a">✧</span>
            <span className="sk-festive-art-sparkle sk-festive-art-sparkle-b">✦</span>
            <div className="sk-festive-art-card">
              {wedding.image ? <img src={wedding.image} alt="" width="240" height="280"
                fetchPriority="high" decoding="async" /> : <FaRegEnvelope />}
            </div>
          </div>
        </section>

        <section className="sk-festive-picks sk-festive-container" aria-label="Shop by occasion">
          <div className="sk-festive-picks-heading">
            <h2>Discover our collections</h2><span>Handpicked for you</span>
          </div>
          <div className="sk-festive-tiles">
            {collections.slice(0, 4).map(({ id, label, subtitle, Icon, image, tint }) => (
              <button key={id} type="button" onClick={() => chooseCollection(id)}
                className="sk-festive-tile" style={{ '--sk-tile-tint': tint }}
                aria-label={'Explore ' + label}>
                <span className="sk-festive-tile-title">{label}</span>
                <span className="sk-festive-tile-subtitle">{subtitle}</span>
                {image ? <img src={image} alt="" loading="lazy" decoding="async"
                  width="180" height="160" /> : <Icon className="sk-festive-tile-fallback" aria-hidden="true" />}
                <span className="sk-festive-tile-arrow"><FaArrowRight aria-hidden="true" /></span>
              </button>
            ))}
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
