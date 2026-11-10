import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaChevronDown, FaPlay } from 'react-icons/fa';
import api from '../api';
import seo from '../config/local-seo.json';
import PinterestHeader from './mobile/PinterestHeader';
import PinterestPin from './mobile/PinterestPin';
import './mobile/festive-home.css';
import './mobile/pinterest-home.css';
import CategorySeoBlurb from './mobile/CategorySeoBlurb';
import VideoFeedCard from './mobile/VideoFeedCard';
import MobileBottomNav from './mobile/MobileBottomNav';
import CatalogLoadingState from './mobile/CatalogLoadingState';
import FAQSection from './FAQSection';
import LocalContactFooter from './LocalContactFooter';
import ServiceGallery from './ServiceGallery';

const idOf = (value) => String(value?._id || value?.category_uuid || value || '');

export default function Home() {
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [videos, setVideos] = useState([]);
  const [config, setConfig] = useState({});
  // Load categories and products independently, but do not expose clickable
  // category controls until both API responses are ready.
  const [catalogStatus, setCatalogStatus] = useState({ listings: 'loading', categories: 'loading' });
  const [catalogRetry, setCatalogRetry] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(12);
  const [showVideos, setShowVideos] = useState(false);
  const [showBottomNav, setShowBottomNav] = useState(true);
  const deferredSearch = useDeferredValue(searchTerm);
  const loadMoreRef = useRef(null);
  // All public enquiry links use the verified Gondia business WhatsApp number.
  const whatsappNumber = String(seo.phone || '+919372333633').replace(/\D/g, '');
  const phoneNumber = seo.phone;

  useEffect(() => {
    let active = true;
    const pendingTimers = [];
    const pause = ms => new Promise(resolve => {
      const timer = window.setTimeout(resolve, ms);
      pendingTimers.push(timer);
    });
    // Render's cold-start can delay either endpoint. One bounded retry avoids
    // treating slow backend responses as empty categories or zero products.
    const loadCatalogPart = async (key, url, setRows) => {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const response = await api.get(url, { timeout: 14000 });
          if (!active) return;
          const rows = Array.isArray(response.data) ? response.data : response.data?.result;
          if (!Array.isArray(rows)) throw new Error('Unexpected catalog API response');
          setRows(rows);
          setCatalogStatus(previous => ({ ...previous, [key]: 'ready' }));
          return;
        } catch {
          if (!active) return;
          if (attempt === 0) await pause(1600);
          else setCatalogStatus(previous => ({ ...previous, [key]: 'error' }));
        }
      }
    };
    loadCatalogPart('listings', '/api/listings', setListings);
    loadCatalogPart('categories', '/api/categories', setCategories);
    api.get('/api/subcategories', { timeout: 12000 })
      .then(res => { if (active) setSubcategories(Array.isArray(res.data) ? res.data : res.data?.result || []); })
      .catch(() => {});
    api.get('/api/confi/GetConfiList', { timeout: 12000 })
      .then(res => { if (active) setConfig(res.data?.result?.[0] || {}); })
      .catch(() => {});
    api.get('/api/videos', { timeout: 12000 })
      .then(res => { if (active) setVideos(Array.isArray(res.data) ? res.data : res.data?.result || []); })
      .catch(() => {});
    return () => {
      active = false;
      pendingTimers.forEach(window.clearTimeout);
    };
  }, [catalogRetry]);

  const catalogReady = catalogStatus.listings === 'ready' && catalogStatus.categories === 'ready';
  const catalogFailed = catalogStatus.listings === 'error' || catalogStatus.categories === 'error';
  const catalogPending = catalogStatus.listings === 'loading' || catalogStatus.categories === 'loading';
  const retryCatalog = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setCatalogStatus({ listings: 'loading', categories: 'loading' });
    setCatalogRetry(value => value + 1);
  };

  const categoryById = useMemo(() => {
    const index = new Map();
    for (const category of categories) {
      if (category._id) index.set(String(category._id), category);
      if (category.category_uuid) index.set(String(category.category_uuid), category);
    }
    return index;
  }, [categories]);

  const groupedProducts = useMemo(() => {
    const sections = categories.map((category, i) => ({
      id: idOf(category) || 'category-' + i,
      category, name: category.name || 'Collection',
      products: [],
    }));
    const byId = new Map();
    sections.forEach((section) => {
      if (section.category._id) byId.set(String(section.category._id), section);
      if (section.category.category_uuid) byId.set(String(section.category.category_uuid), section);
    });
    const otherProducts = [];
    for (const product of listings) {
      const bucket = byId.get(idOf(product.category));
      if (bucket) bucket.products.push(product);
      else otherProducts.push(product);
    }
    const populated = sections.filter(section => section.products.length > 0);
    if (otherProducts.length) populated.push({
      id: 'other', category: null, name: populated.length ? 'More designs' : 'Latest creations',
      products: otherProducts,
    });
    return populated;
  }, [categories, listings]);

  const visibleSubcategories = useMemo(() => {
    if (!selectedCategory) return [];
    const ids = [selectedCategory._id, selectedCategory.category_uuid].filter(Boolean).map(String);
    return subcategories.filter(sub => ids.includes(idOf(sub.categoryId)));
  }, [subcategories, selectedCategory]);

  const filteredProducts = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    const ids = selectedCategory
      ? [selectedCategory._id, selectedCategory.category_uuid].filter(Boolean).map(String)
      : null;
    return listings.filter((product) => {
      const categoryId = idOf(product.category);
      if (ids && !ids.includes(categoryId)) return false;
      if (selectedSubcategory) {
        const subId = idOf(product.subcategory);
        const selectedId = idOf(selectedSubcategory);
        if (subId !== selectedId && product.subcategory !== selectedSubcategory.name) return false;
      }
      if (!query) return true;
      const categoryName = categoryById.get(categoryId)?.name || product.category?.name || '';
      const searchable = [product.title, product.description, categoryName].filter(Boolean).join(' ').toLowerCase();
      return searchable.includes(query);
    });
  }, [listings, deferredSearch, selectedCategory, selectedSubcategory, categoryById]);

  const focused = Boolean(selectedCategory || deferredSearch.trim());
  const feedProducts = focused ? filteredProducts : listings;

  useEffect(() => { setVisibleCount(16); }, [selectedCategory, selectedSubcategory, deferredSearch]);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('focus') === 'search')
      document.getElementById('sk-pinterest-search')?.focus();
  }, []);
  useEffect(() => {
    if (visibleCount >= feedProducts.length || !loadMoreRef.current) return undefined;
    if (!('IntersectionObserver' in window)) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisibleCount(count => Math.min(count + 16, feedProducts.length));
    }, { rootMargin: '350px 0px', threshold: 0 });
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [visibleCount, feedProducts.length]);

  // Scroll-aware shopping bar: disappears as customers browse down, reappears
  // as they scroll up or approach the start/end. No floating More/Top buttons.
  useEffect(() => {
    let previousY = Math.max(0, window.scrollY);
    let directionTravel = 0;
    let animationFrame = 0;
    const update = () => {
      animationFrame = 0;
      const y = Math.max(0, window.scrollY);
      const delta = y - previousY;
      previousY = y;
      if (Math.sign(delta) !== Math.sign(directionTravel)) directionTravel = 0;
      directionTravel += delta;
      const bottom = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      if (y < 150 || y >= bottom - 110) {
        directionTravel = 0;
        setShowBottomNav(true);
      } else if (directionTravel > 40) {
        directionTravel = 0;
        setShowBottomNav(false);
      } else if (directionTravel < -24) {
        directionTravel = 0;
        setShowBottomNav(true);
      }
    };
    const onScroll = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const handleTabCategorySelect = (category) => {
    if (!catalogReady) return;
    setSearchTerm('');
    setSelectedSubcategory(null);
    setSelectedCategory(category || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToProducts = () => {
    requestAnimationFrame(() => document.getElementById('sk-products')?.scrollIntoView({
      behavior: 'smooth', block: 'start',
    }));
  };
  const handleCategorySelect = (category) => {
    if (!catalogReady) return;
    setSearchTerm('');
    setSelectedSubcategory(null);
    setSelectedCategory(prev => category && prev && idOf(prev) === idOf(category) ? null : category);
    if (category) scrollToProducts();
  };
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };
  const showCategory = (category) => {
    if (!catalogReady) return;
    setSearchTerm('');
    setSelectedSubcategory(null);
    setSelectedCategory(category);
    scrollToProducts();
  };

  return (
    <div className="sk-pinterest-site sk-storefront min-h-screen">
      <PinterestHeader
        categories={categories}
        selectedCategory={selectedCategory}
        catalogReady={catalogReady}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onCategorySelect={handleTabCategorySelect}
        whatsappNumber={whatsappNumber}
        phoneNumber={phoneNumber}
      />
      <main id="sk-products" className="sk-pinterest-main" aria-label="Design inspiration gallery">
        {!catalogReady ? (
          <CatalogLoadingState error={catalogFailed && !catalogPending} onRetry={retryCatalog} />
        ) : (
          <>
            {focused && (
              <div className="sk-pinterest-filter-meta">
                <h1>{selectedCategory?.name || 'Search designs'}</h1>
                <span>{feedProducts.length} designs</span>
                <button type="button" onClick={() => {
                  setSelectedCategory(null);setSelectedSubcategory(null);setSearchTerm('');
                }}>Clear</button>
              </div>
            )}
            {selectedCategory && <CategorySeoBlurb name={selectedCategory.name} />}
            {feedProducts.length ? (
              <>
                <div className="sk-pinterest-masonry" aria-label="Browse designs">
                  {feedProducts.slice(0, visibleCount).map((product, index) => (
                    <PinterestPin key={product._id} product={product}
                      index={index} whatsappNumber={whatsappNumber}
                      categoryName={categoryById.get(idOf(product.category))?.name || product.category?.name || ''} />
                  ))}
                </div>
                {visibleCount < feedProducts.length && (
                  <div ref={loadMoreRef} className="sk-pinterest-load-more">
                    <button type="button" onClick={() => setVisibleCount(value => Math.min(value + 16, feedProducts.length))}>
                      See more designs
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="sk-pinterest-empty">
                No designs matched your selection. Try another search or category.
              </div>
            )}
          </>
        )}
      </main>
      <footer id="sk-store-footer" className="sk-store-footer" aria-label="SANJU SK Digital business information">
        <details id="sk-business-information" className="sk-store-footer-details group">
          <summary className="sk-store-footer-summary">
            <span>More about SANJU SK Digital</span>
            <FaChevronDown aria-hidden="true" className="sk-store-footer-chevron" />
          </summary>
          <div className="sk-store-footer-expanded">
            <section className="sk-pinterest-seo-intro" aria-labelledby="sk-studio-heading">
              <p className="sk-pinterest-studio-kicker">GONDIA DESIGN STUDIO · SINCE 2006</p>
              <h2 id="sk-studio-heading">Wedding cards, signage &amp; <em>flex printing in Gondia.</em></h2>
              <p>Laser-cut wedding invitations, 3D LED acrylic signs, corporate awards and banners — designed for Gondia and delivered across nearby cities.</p>
            </section>
        <div className="sk-store-footer-heading">
          <div className="sk-store-footer-mark" aria-hidden="true">SK</div>
          <div>
            <p className="sk-store-footer-brand">SANJU SK Digital <span>· Mahi Creation</span></p>
            <p className="sk-store-footer-caption">Personalised printing & gifting from Gondia, Maharashtra</p>
          </div>
        </div>
        <nav className="sk-footer-quick-links" aria-label="Popular printing services">
          <a href="/wedding-card-printing-gondia/">Wedding cards</a>
          <a href="/3d-led-sign-boards-gondia/">3D signs</a>
          <a href="/custom-trophies-awards-gondia/">Awards</a>
          <a href="/flex-banner-printing-gondia/">Flex printing</a>
        </nav>
            <ServiceGallery />
            {videos.length > 0 && (
              <section className="sk-store-footer-video" aria-label="Latest design videos">
                <button type="button" onClick={() => setShowVideos(v => !v)}
                  aria-expanded={showVideos} className="sk-store-footer-video-toggle">
                  <span><FaPlay aria-hidden="true" /> Watch recent design videos</span>
                  <FaChevronDown aria-hidden="true" className={showVideos ? 'rotate-180' : ''} />
                </button>
                {showVideos && (
                  <div className="sk-store-footer-video-list">
                    {videos.slice(0, 2).map(video => <VideoFeedCard key={video._id} video={video} />)}
                  </div>
                )}
              </section>
            )}
            <section className="sk-store-footer-info" aria-label="Services and ordering guidance">
              <h2>Custom printing, made easy</h2>
              <p>Browse our real product photos, share a design on WhatsApp and tell us the quantity,
                size and deadline. We prepare a quotation and confirm the artwork before production.</p>
              <p>Visit our Gondia studio or enquire from Nagpur, Balaghat and nearby cities.</p>
              <a href="/contact">Contact our Gondia studio <FaArrowRight aria-hidden="true" /></a>
            </section>
            <FAQSection />
            <LocalContactFooter />
        <div className="sk-store-footer-bottom">
          <span>Made with ♥ in Gondia, Maharashtra · Since 2006</span>
        </div>
          </div>
        </details>
      </footer>
      <MobileBottomNav visible={showBottomNav} />
    </div>
  );
}
