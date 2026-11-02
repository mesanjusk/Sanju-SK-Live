import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaArrowUp, FaChevronDown, FaPlay, FaThLarge } from 'react-icons/fa';
import api from '../api';
import seo from '../config/local-seo.json';
import FestiveStorefrontHero from './mobile/FestiveStorefrontHero';
import { getCategoryTheme } from './mobile/categoryThemes';
import CompactProductCard from './mobile/CompactProductCard';
import CategoryProductCarousel from './mobile/CategoryProductCarousel';
import VideoFeedCard from './mobile/VideoFeedCard';
import MobileBottomNav from './mobile/MobileBottomNav';
import LoadingSkeleton from './common/LoadingSkeleton';
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
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(12);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showVideos, setShowVideos] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const deferredSearch = useDeferredValue(searchTerm);
  const loadMoreRef = useRef(null);
  const whatsappNumber = config.whatsappNumber || config.phone || '919372333633';
  const phoneNumber = seo.phone;
  const activeTheme = getCategoryTheme(selectedCategory?.name);
  const merchStyles = {
    '--sk-theme-bg': activeTheme.background,
    '--sk-theme-accent': activeTheme.accent,
    '--sk-theme-ink': activeTheme.ink,
    '--sk-theme-soft': activeTheme.soft,
  };
  const bulkQuoteUrl = 'https://wa.me/' + String(whatsappNumber).replace(/\\D/g, '') +
    '?text=' + encodeURIComponent('Hi Sanju SK Digital, please share a bulk order quotation and production timeline.');

  useEffect(() => {
    let active = true;
    let retryTimer;
    const loadProducts = async () => {
      try {
        const response = await api.get('/api/listings', { timeout: 12000 });
        if (!active) return;
        const rows = Array.isArray(response.data) ? response.data : response.data?.result;
        if (!Array.isArray(rows)) throw new Error('Unexpected product API format');
        setListings(rows);
      } catch {
        if (active) retryTimer = setTimeout(loadProducts, 20000);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadProducts();
    api.get('/api/categories', { timeout: 12000 })
      .then(res => { if (active) setCategories(Array.isArray(res.data) ? res.data : res.data?.result || []); })
      .catch(() => {});
    api.get('/api/subcategories', { timeout: 12000 })
      .then(res => { if (active) setSubcategories(Array.isArray(res.data) ? res.data : res.data?.result || []); })
      .catch(() => {});
    api.get('/api/confi/GetConfiList', { timeout: 12000 })
      .then(res => { if (active) setConfig(res.data?.result?.[0] || {}); })
      .catch(() => {});
    api.get('/api/videos', { timeout: 12000 })
      .then(res => { if (active) setVideos(Array.isArray(res.data) ? res.data : res.data?.result || []); })
      .catch(() => {});
    return () => { active = false; clearTimeout(retryTimer); };
  }, []);

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
  const visibleSections = showAllCategories ? groupedProducts : groupedProducts.slice(0, 6);

  useEffect(() => { setVisibleCount(12); }, [selectedCategory, selectedSubcategory, deferredSearch]);
  useEffect(() => {
    if (!focused || visibleCount >= filteredProducts.length || !loadMoreRef.current) return undefined;
    if (!('IntersectionObserver' in window)) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisibleCount(count => Math.min(count + 12, filteredProducts.length));
    }, { rootMargin: '350px 0px', threshold: 0 });
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [focused, visibleCount, filteredProducts.length]);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 620);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleTabCategorySelect = (category) => {
    setSearchTerm('');
    setSelectedSubcategory(null);
    setSelectedCategory(category || null);
  };

  const scrollToProducts = () => {
    requestAnimationFrame(() => document.getElementById('sk-products')?.scrollIntoView({
      behavior: 'smooth', block: 'start',
    }));
  };
  const handleCategorySelect = (category) => {
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
    setSearchTerm('');
    setSelectedSubcategory(null);
    setSelectedCategory(category);
    scrollToProducts();
  };

  return (
    <div className={'sk-storefront sk-festive-home sk-theme-' + activeTheme.key + ' min-h-screen pb-24'} style={merchStyles}>
      <FestiveStorefrontHero
        listings={listings}
        categories={categories}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        selectedCategory={selectedCategory}
        theme={activeTheme}
        onCategorySelect={handleCategorySelect}
        onTabCategorySelect={handleTabCategorySelect}
        whatsappNumber={whatsappNumber}
        phoneNumber={phoneNumber}
      />
      <main className="mx-auto w-full max-w-6xl py-1">
        {visibleSubcategories.length > 0 && (
          <section className="sk-subcategory-section px-4 py-3 sm:px-6" aria-label="Browse subcategories">
            <div className="sk-subcategory-title">
              <h2>Explore {selectedCategory?.name} styles</h2>
              <span>Pick your favourite</span>
            </div>
            <div className="sk-subcategory-rail">
              <button type="button" onClick={() => setSelectedSubcategory(null)}
                aria-pressed={!selectedSubcategory}
                className={'sk-subcategory-card' + (!selectedSubcategory ? ' is-active' : '')}>
                <span className="sk-subcategory-image"><FaThLarge aria-hidden="true" /></span>
                <span>All styles</span>
              </button>
              {visibleSubcategories.map((sub) => {
                const pic = sub.imageUrl || sub.image || (Array.isArray(sub.images) ? sub.images[0] : null);
                const active = idOf(sub) === idOf(selectedSubcategory);
                return (
                  <button type="button" key={idOf(sub)} onClick={() => setSelectedSubcategory(sub)}
                    aria-pressed={active} className={'sk-subcategory-card' + (active ? ' is-active' : '')}>
                    <span className="sk-subcategory-image">
                      {pic ? <img src={pic} alt={sub.name + ' design category'} loading="lazy" decoding="async" />
                        : <FaThLarge aria-hidden="true" />}
                    </span>
                    <span>{sub.name}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <div id="sk-products" className="scroll-mt-4 px-4 pb-6 sm:px-6">
          {loading && listings.length === 0 ? (
            <section aria-label="Loading collections" className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
              {[0, 1, 2, 3, 4, 5].map(key => <LoadingSkeleton key={key} />)}
            </section>
          ) : focused ? (
            <section aria-labelledby="focused-products-heading" className="mt-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#9877b6]">YOUR SELECTION</p>
                  <h2 id="focused-products-heading" className="mt-1 text-xl font-extrabold text-[#49315f]">
                    {selectedCategory?.name || 'Search results'}
                  </h2>
                  <p className="text-xs text-[#8a7996]">{filteredProducts.length} designs {deferredSearch.trim() ? 'matching your search' : 'available'}</p>
                </div>
                <button type="button" onClick={() => { setSelectedCategory(null); setSelectedSubcategory(null); setSearchTerm(''); }}
                  className="rounded-full border border-[#ded2eb] bg-white px-4 py-2 text-xs font-bold text-[#715496]">
                  ← All categories
                </button>
              </div>
              {filteredProducts.length ? (
                <>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {filteredProducts.slice(0, visibleCount).map((product) => (
                      <CompactProductCard key={product._id} product={product}
                        categoryName={categoryById.get(idOf(product.category))?.name || ''}
                        whatsappNumber={whatsappNumber} />
                    ))}
                  </div>
                  {filteredProducts.length > visibleCount && (
                    <div ref={loadMoreRef} className="mt-5 text-center">
                      <button type="button" onClick={() => setVisibleCount(n => Math.min(n + 12, filteredProducts.length))}
                        className="rounded-full border border-[#d8c8ec] bg-[#f0e8fc] px-6 py-2.5 text-sm font-extrabold text-[#74559f]">
                        Load more designs ({filteredProducts.length - visibleCount} remaining)
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-2xl border border-[#e5dcef] bg-white p-7 text-center text-sm text-[#567462]">
                  No designs matched. Try a different category or search.
                </div>
              )}
            </section>
          ) : groupedProducts.length ? (
            <div className="space-y-5 pt-3">
              {visibleSections.map(section => (
                <section key={section.id} aria-labelledby={'category-' + section.id}>
                  <div className="mb-3 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-[.17em] text-[#9779b3]">HANDPICKED FOR YOU</p>
                      <h2 id={'category-' + section.id} className="mt-1 text-lg font-extrabold text-[#463359] sm:text-xl">{section.name}</h2>
                      <p className="text-[11px] text-[#857491]">{section.products.length} designs</p>
                    </div>
                    {section.category ? (
                      <button type="button" onClick={() => showCategory(section.category)}
                        className="inline-flex shrink-0 items-center gap-1 text-xs font-extrabold text-[#74559f]">
                        View all <FaArrowRight aria-hidden="true" className="text-[10px]" />
                      </button>
                    ) : (
                      <Link to="/products" className="text-xs font-extrabold text-[#74559f]">View all →</Link>
                    )}
                  </div>
                  <CategoryProductCarousel section={section} whatsappNumber={whatsappNumber} />
                  {section.products.length >= 3 && (
                    <a href={bulkQuoteUrl} target="_blank" rel="noopener noreferrer"
                      className="sk-merch-bulk-link">Need multiple pieces? Request a bulk quote <FaArrowRight aria-hidden="true" /></a>
                  )}
                </section>
              ))}
              {groupedProducts.length > 6 && (
                <div className="pb-1 text-center">
                  <button type="button" onClick={() => setShowAllCategories(v => !v)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#dfd0f0] bg-[#fffaff] px-4 py-2 text-xs font-extrabold text-[#785a9d] shadow-sm">
                    {showAllCategories ? 'Show fewer categories' : 'Explore all ' + groupedProducts.length + ' categories'}
                    <FaChevronDown aria-hidden="true" className={showAllCategories ? 'rotate-180' : ''} />
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>

      </main>
      <ServiceGallery />
        {videos.length > 0 && (
          <section className="mx-auto mb-3 w-[calc(100%-28px)] max-w-md rounded-xl border border-[#dbe5d8] bg-[#fffaff] px-3 py-3 shadow-sm" aria-label="Design inspiration videos">
            <button type="button" onClick={() => setShowVideos(v => !v)}
              aria-expanded={showVideos}
              className="flex w-full items-center justify-between gap-2 text-left text-xs font-extrabold text-[#594276]">
              <span className="inline-flex items-center gap-2"><FaPlay aria-hidden="true" /> Watch our latest design videos</span>
              <FaChevronDown aria-hidden="true" className={showVideos ? 'rotate-180' : ''} />
            </button>
            {showVideos && <div className="mt-3 space-y-3">{videos.slice(0, 2).map(video =>
              <VideoFeedCard key={video._id} video={video} />)}</div>}
          </section>
        )}

      <details id="sk-business-information" className="group mx-auto mb-5 mt-2 w-full max-w-[280px] px-2 open:max-w-2xl">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl border border-[#e4dbef] bg-[#fffaff] px-3 py-2.5 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
          <span>
            <span className="block text-[10px] font-extrabold uppercase tracking-[.15em] text-[#8765a9]">MORE ABOUT US</span>
            <span className="mt-1 block text-sm font-extrabold text-[#4b355f]">Services, FAQs & store information</span>
            <span className="mt-1 hidden text-[11px] leading-4 text-[#8b7d96] group-open:block">Opening hours, directions and ordering guidance</span>
          </span>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f3edfc] text-[#7a57a3] transition-transform group-open:rotate-180">
            <FaChevronDown aria-hidden="true" />
          </span>
        </summary>
        <div className="pt-2">
          <section aria-label="SK Digital printing and invitation services" className="mx-auto my-3 max-w-2xl">
            <div className="rounded-2xl border border-[#e8def1] bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-[#4a355f]">Wedding cards, digital invitations & corporate gifts</h2>
              <p className="mt-2 text-sm leading-6 text-[#796b86]">
                Explore local design and print services from SANJU SK Digital – Mahi Creation, Gondia.
              </p>
              <nav aria-label="Explore SANJU SK Digital services" className="mt-4 grid gap-3 text-sm font-semibold text-[#694f87] sm:grid-cols-2">
                <a href="/wedding-card-printing-gondia/" className="underline underline-offset-4">Wedding cards in Gondia</a>
                <a href="/digital-wedding-invitations/" className="underline underline-offset-4">Digital invitations</a>
                <a href="/corporate-gifting-gondia/" className="underline underline-offset-4">Corporate gifts</a>
                <a href="/3d-led-sign-boards-gondia/" className="underline underline-offset-4">3D LED sign boards</a>
                <a href="/custom-trophies-awards-gondia/" className="underline underline-offset-4">Trophies and awards</a>
                <a href="/flex-banner-printing-gondia/" className="underline underline-offset-4">Flex banner printing</a>
              </nav>
            </div>
          </section>
          <section className="mx-auto mb-3 max-w-2xl" aria-label="How to order custom printing in Gondia">
            <div className="rounded-2xl border border-[#e8deef] bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-[#4a355f]">Custom printing, made easy</h2>
              <p className="mt-2 text-sm leading-6 text-[#82758c]">
                Browse our product photos, share your preferred design on WhatsApp, and tell us the quantity,
                size and deadline. We'll prepare a quotation and confirm artwork before production.
                Visit Krishnapura Ward, Gondia, or enquire from Nagpur and Balaghat.
              </p>
              <a href="/contact" className="mt-3 inline-block text-sm font-bold text-[#715496] underline">Contact our Gondia studio</a>
            </div>
          </section>
          <FAQSection />
          <LocalContactFooter />
        </div>
      </details>
      {showBackToTop && (
        <button type="button" className="sk-back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
          <FaArrowUp aria-hidden="true" /><span>Top</span>
        </button>
      )}
      <MobileBottomNav whatsappNumber={whatsappNumber} phoneNumber={phoneNumber} />
    </div>
  );
}
