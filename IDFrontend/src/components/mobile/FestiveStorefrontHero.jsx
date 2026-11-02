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
  { id: 'wedding', label: 'Wedding Cards', href: '/wedding-card-printing-gondia/', Icon: FaRegEnvelope, tint: '#e8ddf6' },
  { id: 'gifting', label: 'Corporate Gifting', href: '/corporate-gifting-gondia/', Icon: FaGift, tint: '#e8e1f5' },
  { id: 'invitations', label: 'Digital Invitations', href: '/digital-wedding-invitations/', Icon: FaRegEnvelope, tint: '#e5ddf2' },
  { id: 'printing', label: 'Printing Enquiries', href: '/contact', Icon: FaPrint, tint: '#f1e9f8' }
];

const TINTS = ['#e8ddf6', '#e8e1f5', '#e5ddf2', '#f1e9f8', '#e3dbf2'];
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
  onCategorySelect, onTabCategorySelect, selectedCategory, theme, whatsappNumber, phoneNumber
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

  const featured = selectedCategory
    ? collections.find((item) => item.category &&
      String(item.category._id || item.category.category_uuid) === String(selectedCategory._id || selectedCategory.category_uuid)) || collections[0]
    : collections[0];
  // Duplicate only the visual carousel sequence to make its slow autoplay seamless.
  // The repeated controls are excluded from keyboard and screen-reader navigation.
  const carouselRef = useRef(null);
  const lastInteractionRef = useRef(0);
  const pauseCarousel = () => { lastInteractionRef.current = Date.now(); };

  useEffect(() => {
    const track = carouselRef.current;
    if (!track || collections.length < 2) return undefined;
    track.scrollLeft = 0;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const hoverCapable = window.matchMedia?.('(hover: hover)');
    let isVisible = true;
    let lastFrame = 0;
    let frameId;
    const observer = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(([entry]) => { isVisible = Boolean(entry?.isIntersecting); }, { threshold: 0.05 })
      : null;
    observer?.observe(track);

    const move = (now) => {
      const elapsed = lastFrame ? Math.min(now - lastFrame, 64) : 0;
      lastFrame = now;
      const canMove = isVisible && document.visibilityState === 'visible' &&
        !reducedMotion?.matches && Date.now() - lastInteractionRef.current > 11000 &&
        !track.contains(document.activeElement) &&
        !(hoverCapable?.matches && track.matches(':hover'));
      if (canMove) {
        const first = track.querySelector('.sk-festive-tile');
        if (first) {
          const gap = parseFloat(window.getComputedStyle(track).columnGap || '10') || 10;
          const cycleWidth = (first.getBoundingClientRect().width + gap) * collections.length;
          if (cycleWidth > track.clientWidth) {
            const next = track.scrollLeft + elapsed * 0.065; // about 65px/sec
            track.scrollLeft = next >= cycleWidth ? next - cycleWidth : next;
          }
        }
      }
      frameId = window.requestAnimationFrame(move);
    };
    frameId = window.requestAnimationFrame(move);
    return () => {
      window.cancelAnimationFrame(frameId);
      observer?.disconnect();
    };
  }, [collections.length]);

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
  const chooseTab = (item) => onTabCategorySelect?.(item?.category || null);
  const themeTitle = selectedCategory?.name || 'Custom printing in Gondia';
  const promotionalText = theme?.promo || 'Custom-made for moments that matter';
  const promoMessage = 'Hi Sanju SK Digital, please send me options and a quotation for ' + themeTitle + '.';
  const promoQuoteUrl = 'https://wa.me/' + wa + '?text=' + encodeURIComponent(promoMessage);
  const submitSearch = (event) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
      document.getElementById('sk-products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderTile = (item, repeated = false) => {
    const { id, label, subtitle, Icon, image, tint, href } = item;
    const content = <>
      <span className="sk-festive-tile-media">
        {image ? <img src={image} alt={repeated ? '' : label + ' designs at SANJU SK Digital in Gondia'}
          loading="lazy" decoding="async" width="320" height="300" />
          : <Icon className="sk-festive-tile-fallback" aria-hidden="true" />}
      </span>
      <span className="sk-festive-tile-top">
        <span className="sk-festive-tile-title">{label}</span>
        <span className="sk-festive-tile-subtitle">{subtitle}</span>
      </span>
      <span className="sk-festive-tile-arrow"><FaArrowRight aria-hidden="true" /></span>
    </>;
    const props = {
      key: id + (repeated ? '-loop' : ''),
      className: 'sk-festive-tile',
      style: { '--sk-tile-tint': tint },
      'aria-hidden': repeated ? true : undefined,
      tabIndex: repeated ? -1 : undefined,
    };
    return href
      ? <Link {...props} to={href} aria-label={repeated ? undefined : 'Explore ' + label}>{content}</Link>
      : <button {...props} type="button" onClick={() => chooseCategory(item)}
          aria-label={repeated ? undefined : 'Browse ' + label}>{content}</button>;
  };

  return (
    <>
      <div className="sk-festive-sticky-shell">
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
        <nav className="sk-shopping-tabs sk-festive-container" aria-label="Shop by category">
          <button type="button" className={'sk-shopping-tab' + (!selectedCategory ? ' is-active' : '')}
            aria-pressed={!selectedCategory} onClick={() => chooseTab(null)}>
            <FaThLarge aria-hidden="true" /><span>All</span>
          </button>
          {collections.map((item) => {
            const active = Boolean(selectedCategory && item.category &&
              String(item.category._id || item.category.category_uuid) === String(selectedCategory._id || selectedCategory.category_uuid));
            const TabIcon = item.Icon;
            return item.href
              ? <Link key={item.id} to={item.href} className="sk-shopping-tab" aria-label={'Explore ' + item.label}>
                  <TabIcon aria-hidden="true" /><span>{item.label}</span>
                </Link>
              : <button key={item.id} type="button" className={'sk-shopping-tab' + (active ? ' is-active' : '')}
                  aria-pressed={active} onClick={() => chooseTab(item)}>
                  <TabIcon aria-hidden="true" /><span>{item.label}</span>
                </button>;
          })}
        </nav>
      </div>
      <div className="sk-festive-dark">
        <section className="sk-festive-showcase sk-festive-container" aria-labelledby="sk-festive-title">
          <div className="sk-festive-showcase-copy">
            <p className="sk-festive-kicker"><span className="sk-festive-sparkle">✦</span> GONDIA DESIGN STUDIO · SINCE 2006</p>
            {selectedCategory ? (
              <>
                <h1 id="sk-festive-title">{selectedCategory.name} <em>made for you in Gondia.</em></h1>
                <p>{theme?.strapline || 'Explore personalized designs'} · Send your size and quantity for a custom quote.</p>
              </>
            ) : (
              <>
                <h1 id="sk-festive-title">Wedding cards, signage &amp; <em>flex printing in Gondia.</em></h1>
                <p>Laser-cut wedding invitations, 3D LED acrylic signs, corporate awards and banners — designed for Gondia and delivered across nearby cities.</p>
              </>
            )}
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

        <section className="sk-merch-feature sk-festive-container" aria-label="Featured custom work">
          <div className="sk-merch-feature-inner">
            <div className="sk-merch-feature-copy">
              <span className="sk-merch-feature-kicker">DESIGNED & MADE IN GONDIA</span>
              <h2>{promotionalText}</h2>
              <p>{selectedCategory ? theme?.strapline : 'Wedding invitations, custom signage, awards and printing — tailored to your brief.'}</p>
              <a href={promoQuoteUrl} target="_blank" rel="noopener noreferrer">
                Request a custom quote <FaArrowRight aria-hidden="true" />
              </a>
            </div>
            <div className="sk-merch-feature-visual" aria-hidden="true">
              {featured?.image ? <img src={featured.image} alt="" loading="lazy" decoding="async" width="230" height="250" />
                : <FaPalette />}
            </div>
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

        <section className="sk-festive-picks sk-festive-container" aria-label="Shop by category">
          <div className="sk-festive-picks-heading">
            <h2>Discover our collections</h2><span>Swipe to explore <FaArrowRight aria-hidden="true" /></span>
          </div>
          <div ref={carouselRef} className="sk-festive-tiles" role="region"
            aria-label="Featured collections; swipe left or right to browse"
            onTouchStart={pauseCarousel} onPointerDown={pauseCarousel}
            onWheel={pauseCarousel} onKeyDown={pauseCarousel}
            onFocusCapture={pauseCarousel}>
            {collections.map(item => renderTile(item))}
            {collections.length > 1 && collections.map(item => renderTile(item, true))}
          </div>
          <div className="sk-festive-carousel-dots" aria-hidden="true" />
        </section>

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
