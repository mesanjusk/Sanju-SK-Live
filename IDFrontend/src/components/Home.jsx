import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowRight, FaChevronDown, FaPlay } from 'react-icons/fa';
import api from '../api';
import {trackAnalyticsEvent} from '../hooks/useAnalytics';
import seo from '../config/local-seo.json';
import PinterestStorefrontHeader from './mobile/PinterestStorefrontHeader';
import EndlessPinterestFeed from './mobile/EndlessPinterestFeed';
import {readCatalogRows,isCatalogCacheFresh,rememberCatalogRows,clearCatalogCache}
  from './mobile/catalogSessionCache.mjs';
import { uniqueDesigns } from './mobile/uniqueDesigns.mjs';
import {freshFeedSeed,getDesignInterests,rankDesigns,productId,categoryId} from './mobile/interestRank.mjs';
import './mobile/festive-home.css';
import './mobile/pinterest-storefront.css';
import {orderStoreCategories,landingKeyword} from './mobile/categoryOrder.mjs';
import VideoFeedCard from './mobile/VideoFeedCard';
import MobileBottomNav from './mobile/MobileBottomNav';
import CatalogLoadingState from './mobile/CatalogLoadingState';
import FAQSection from './FAQSection';
import LocalContactFooter from './LocalContactFooter';
import ServiceGallery from './ServiceGallery';

const idOf = (value) => String(value?._id || value?.category_uuid || value || '');
// Stable while visiting product pages; reset/randomized on each full reload.
const HOME_FEED_SEED=freshFeedSeed();
const LANDING_KEYWORD=landingKeyword(typeof window!=='undefined'?window.location.search:'',
  typeof document!=='undefined'?document.referrer:'');
const RETURN_KEY='sk-home-browse-v2';
function consumeBrowseState(){
  try{const data=JSON.parse(sessionStorage.getItem(RETURN_KEY)||'null');
    sessionStorage.removeItem(RETURN_KEY);
    return data&&Date.now()-data.at<5*60*1000?data:null;
  }catch{return null;}
}

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [listings, setListings] = useState(() => readCatalogRows('listings') || []);
  const [categories, setCategories] = useState(() => readCatalogRows('categories') || []);
  const [subcategories, setSubcategories] = useState(() => readCatalogRows('subcategories') || []);
  const [videos, setVideos] = useState(() => readCatalogRows('videos') || []);
  const [config, setConfig] = useState({});
  // Load categories and products independently, but do not expose clickable
  // category controls until both API responses are ready.
  const [catalogStatus, setCatalogStatus] = useState(() => ({
    listings: readCatalogRows('listings') !== null ? 'ready' : 'loading',
    categories: readCatalogRows('categories') !== null ? 'ready' : 'loading',
  }));
  const [catalogRetry, setCatalogRetry] = useState(0);
  const [feedSeed] = useState(() => HOME_FEED_SEED);
  const [returnView] = useState(consumeBrowseState);
  const browseRef=useRef(null);
  const [interests,setInterests] = useState(getDesignInterests);
  const [aiIds,setAiIds] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  useEffect(()=>()=>{
    try{sessionStorage.setItem(RETURN_KEY,JSON.stringify({...browseRef.current,at:Date.now()}));
      sessionStorage.setItem('sk-home-scroll-position',String(Math.max(0,window.scrollY)));}catch{}
  },[]);
  const [searchTerm, setSearchTerm] = useState(returnView?.query||'');
  browseRef.current={categoryId:idOf(selectedCategory),subcategoryId:idOf(selectedSubcategory),query:searchTerm};
  const [searchOpen, setSearchOpen] = useState(() =>
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('search'));
  const handleSearchVisibility = useCallback((open) => {
    setSearchOpen(open);
    if (!open && new URLSearchParams(location.search).has('search')) {
      const params = new URLSearchParams(location.search);
      params.delete('search');
      navigate({pathname:'/',search:params.toString() ? '?' + params.toString() : ''},
        {replace:true});
    }
  }, [location.search, navigate]);
  const [showVideos, setShowVideos] = useState(false);
  const [showBottomNav, setShowBottomNav] = useState(true);
  const deferredSearch = useDeferredValue(searchTerm);
  // All public enquiry links use the verified Gondia business WhatsApp number.
  const whatsappNumber = String(seo.phone || '+919372333633').replace(/\D/g, '');
  const phoneNumber = seo.phone;
  // One consistent public color system across categories; only imagery varies.
  const merchStyles = {
    '--sk-theme-bg': '#ffffff',
    '--sk-theme-accent': '#e60023',
    '--sk-theme-ink': '#202020',
    '--sk-theme-soft': '#f3f3f3',
  };

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
      // On returning from a pin, reuse the warmed catalog immediately.
      if(catalogRetry===0 && isCatalogCacheFresh(key)) return;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const response = await api.get(url, { timeout: 14000 });
          if (!active) return;
          const rows = Array.isArray(response.data) ? response.data : response.data?.result;
          if (!Array.isArray(rows)) throw new Error('Unexpected catalog API response');
          rememberCatalogRows(key, rows);
          setRows(rows);
          setCatalogStatus(previous => ({ ...previous, [key]: 'ready' }));
          return;
        } catch {
          if (!active) return;
          if (attempt === 0) await pause(1600);
          else setCatalogStatus(previous => ({
            ...previous,
            [key]: readCatalogRows(key) !== null ? 'ready' : 'error'
          }));
        }
      }
    };
    loadCatalogPart('listings', '/api/listings', setListings);
    loadCatalogPart('categories', '/api/categories', setCategories);
    if(!isCatalogCacheFresh('subcategories'))api.get('/api/subcategories', { timeout: 12000 })
      .then(res => {
        if (!active) return;
        const rows=Array.isArray(res.data) ? res.data : res.data?.result || [];
        rememberCatalogRows('subcategories',rows);
        setSubcategories(rows);
      }).catch(() => {});
    api.get('/api/confi/GetConfiList', { timeout: 12000 })
      .then(res => { if (active) setConfig(res.data?.result?.[0] || {}); })
      .catch(() => {});
    if(!isCatalogCacheFresh('videos'))api.get('/api/videos', { timeout: 12000 })
      .then(res => {
        if (!active) return;
        const rows=Array.isArray(res.data) ? res.data : res.data?.result || [];
        rememberCatalogRows('videos',rows);
        setVideos(rows);
      }).catch(() => {});
    return () => {
      active = false;
      pendingTimers.forEach(window.clearTimeout);
    };
  }, [catalogRetry]);

  const catalogReady = catalogStatus.listings === 'ready' && catalogStatus.categories === 'ready';
  const catalogFailed = catalogStatus.listings === 'error' || catalogStatus.categories === 'error';
  const catalogPending = catalogStatus.listings === 'loading' || catalogStatus.categories === 'loading';
  const retryCatalog = () => {
    clearCatalogCache();
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setCatalogStatus({ listings: 'loading', categories: 'loading' });
    setCatalogRetry(value => value + 1);
  };

  const orderedCategories=useMemo(()=>orderStoreCategories(categories,
    {seed:feedSeed,keyword:LANDING_KEYWORD}),[categories,feedSeed]);
  useEffect(()=>{
    if(!returnView || !catalogReady)return;
    if(returnView.categoryId){
      const cat=categories.find(c=>idOf(c)===returnView.categoryId||String(c.category_uuid||'')===returnView.categoryId);
      if(cat)setSelectedCategory(cat);
    }
    if(returnView.subcategoryId){
      const sub=subcategories.find(c=>idOf(c)===returnView.subcategoryId);
      if(sub)setSelectedSubcategory(sub);
    }
  },[catalogReady,categories,subcategories,returnView]);
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

  const distinctProducts = useMemo(() => uniqueDesigns(filteredProducts), [filteredProducts]);
  // Each visitor's page load starts with a new shuffled order; selections
  // promote real related designs without introducing duplicate records.
  const orderedProducts = useMemo(()=>rankDesigns(distinctProducts,{seed:feedSeed,interests,aiIds,keyword:LANDING_KEYWORD}),
    [distinctProducts,feedSeed,interests,aiIds]);
  useEffect(()=>{
    const onInterest=()=>{setInterests(getDesignInterests());setAiIds([]);};
    window.addEventListener('sk-design-interest',onInterest);
    window.addEventListener('pageshow',onInterest);
    return ()=>{window.removeEventListener('sk-design-interest',onInterest);
      window.removeEventListener('pageshow',onInterest);};
  },[]);
  useEffect(()=>{
    if(!catalogReady||!interests.length||distinctProducts.length<2)return undefined;
    const controller=new AbortController();
    const timer=window.setTimeout(async()=>{
      try{
        const candidates=rankDesigns(distinctProducts,{seed:feedSeed,interests}).slice(0,48);
        const response=await fetch('/api/recommendations',{
          method:'POST',signal:controller.signal,headers:{'Content-Type':'application/json'},
          body:JSON.stringify({interests:interests.slice(0,4),
            candidates:candidates.map(p=>({id:productId(p),
              title:String(p.title||'').slice(0,130),
              category:categoryById.get(categoryId(p))?.name||String(p.category?.name||''),
              description:String(p.description||'').slice(0,120)}))})
        });
        if(!response.ok)return;
        const json=await response.json();
        if(!controller.signal.aborted&&json.mode==='gemini'&&Array.isArray(json.ids)){
          setAiIds(json.ids.map(String).slice(0,16));
        }
      }catch{/* Local similarity ranking remains in use. */}
    },350);
    return ()=>{window.clearTimeout(timer);controller.abort();};
  },[catalogReady,distinctProducts,feedSeed,interests,categoryById]);


  // Keep the reader's position after leaving a pin; the catalog is already cached.
  useEffect(() => {
    if(!catalogReady || !listings.length) return undefined;
    let saved=0;
    try {
      saved=Number(sessionStorage.getItem('sk-home-scroll-position')||0);
      sessionStorage.removeItem('sk-home-scroll-position');
    }catch{}
    if(!Number.isFinite(saved)||saved<100)return undefined;
    let timer=0;
    const frame=window.requestAnimationFrame(()=>{
      window.scrollTo({top:saved,behavior:'instant'});
      timer=window.setTimeout(()=>window.scrollTo({top:saved,behavior:'instant'}),120);
    });
    return ()=>{window.cancelAnimationFrame(frame);window.clearTimeout(timer);};
  },[catalogReady]);

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
    if(category)trackAnalyticsEvent('category_view',{categoryId:idOf(category),categoryName:category.name});
    if (!catalogReady) return;
    setSearchTerm('');
    setSelectedSubcategory(null);
    setSelectedCategory(category || null);
    requestAnimationFrame(() => document.getElementById('sk-pin-feed')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const scrollToProducts = () => {
    requestAnimationFrame(() => document.getElementById('sk-products')?.scrollIntoView({
      behavior: 'smooth', block: 'start',
    }));
  };
  const handleCategorySelect = (category) => {
    if(category)trackAnalyticsEvent('category_view',{categoryId:idOf(category),categoryName:category.name});
    if (!catalogReady) return;
    setSearchTerm('');
    setSelectedSubcategory(null);
    setSelectedCategory(prev => category && prev && idOf(prev) === idOf(category) ? null : category);
    if (category) scrollToProducts();
  };
  useEffect(()=>{
    const term=searchTerm.trim();
    if(term.length<3)return undefined;
    const timer=window.setTimeout(()=>trackAnalyticsEvent('search',{keyword:term}),950);
    return ()=>window.clearTimeout(timer);
  },[searchTerm]);
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
    <div className="sk-storefront sk-festive-home sk-pinterest-home sk-public-site" style={merchStyles}>
      <PinterestStorefrontHeader
        categories={orderedCategories}
        selectedCategory={selectedCategory}
        onCategorySelect={handleTabCategorySelect}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        catalogReady={catalogReady}
        searchOpen={searchOpen}
        onSearchOpen={handleSearchVisibility}
        whatsappNumber={whatsappNumber}
        phoneNumber={phoneNumber}
      />
      <main id="sk-pin-feed" className="sk-pin-feed-wrap">
        {selectedCategory && visibleSubcategories.length > 0 && (
          <nav className="sk-pin-subcategories" aria-label="Filter by design style">
            <button type="button" onClick={() => setSelectedSubcategory(null)}
              className={!selectedSubcategory ? 'is-active' : ''} aria-pressed={!selectedSubcategory}>
              All styles
            </button>
            {visibleSubcategories.map((sub) => (
              <button type="button" key={idOf(sub)}
                className={idOf(selectedSubcategory) === idOf(sub) ? 'is-active' : ''}
                aria-pressed={idOf(selectedSubcategory) === idOf(sub)}
                onClick={() => setSelectedSubcategory(sub)}>{sub.name}</button>
            ))}
          </nav>
        )}
        {catalogReady && (
          <div className="sk-pin-feed-heading">
            <h2>{selectedCategory ? selectedCategory.name : deferredSearch.trim() ? 'Search results' : interests.length ? 'Inspired by your selections' : 'Discover designs'}</h2>
            <span>{distinctProducts.length} designs</span>
          </div>
        )}
        {!catalogReady ? (
          <CatalogLoadingState error={catalogFailed && !catalogPending} onRetry={retryCatalog} />
        ) : distinctProducts.length ? (
          <EndlessPinterestFeed
            key={(selectedCategory ? idOf(selectedCategory) : 'all') + '|' +
              (selectedSubcategory ? idOf(selectedSubcategory) : 'all') + '|' +
              deferredSearch.trim().toLowerCase() + '|' + catalogRetry}
            products={orderedProducts} categoryById={categoryById}
            whatsappNumber={whatsappNumber} />
        ) : (
          <div className="sk-pin-end-note">
            No designs matched. Try another category or a different search.
          </div>
        )}
      </main>
      <footer id="sk-store-footer" className="sk-store-footer" aria-label="SANJU SK Digital business information">
        <details id="sk-business-information" className="sk-store-footer-details group">
          <summary className="sk-store-footer-summary">
            <span>More about SANJU SK Digital</span>
            <FaChevronDown aria-hidden="true" className="sk-store-footer-chevron" />
          </summary>
          <div className="sk-store-footer-expanded">
            <section className="sk-pin-about-intro" aria-label="About our Gondia printing studio">
              <p className="sk-pin-kicker">GONDIA DESIGN STUDIO · SINCE 2006</p>
              <h1>Wedding cards, signage &amp; <em>flex printing in Gondia.</em></h1>
              <p>Laser-cut wedding invitations, 3D LED acrylic signs, corporate awards and banners — designed for Gondia and delivered across nearby cities.</p>
              <a href={'https://wa.me/' + whatsappNumber + '?text=' +
                encodeURIComponent('Hi SANJU SK Digital, please share a quotation for custom printing.')}>
                Request a custom quote <FaArrowRight aria-hidden="true"/>
              </a>
            </section>
        <div className="sk-store-footer-heading">
          <img className="sk-store-footer-final-logo" src="/images/sk-digital-final.svg"
            alt="SK Digital logo" width="65" height="47" loading="lazy" />
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
          <a href="/track-order">Track order</a>
          <a href="/order-information">Ordering information</a>
          <a href="/order-information#analytics-preferences">
            Analytics preferences
          </a>
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
      <MobileBottomNav whatsappNumber={whatsappNumber} phoneNumber={phoneNumber}
        visible={showBottomNav} variant="pinterest" onSearchClick={() => handleSearchVisibility(true)} />
    </div>
  );
}
