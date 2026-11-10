import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { FaArrowLeft, FaChevronLeft, FaChevronRight, FaHeart, FaRegHeart, FaRegThumbsUp, FaThumbsUp, FaShare, FaWhatsapp, FaYoutube } from 'react-icons/fa';
import api from '../api';
import SEO from '../components/SEO';
import ProductStructuredData from '../components/ProductStructuredData';
import MobileBottomNav from '../components/mobile/MobileBottomNav';
import PinterestPinCard from '../components/mobile/PinterestPinCard';
import { uniqueDesigns } from '../components/mobile/uniqueDesigns.mjs';
import {recordDesignInterest,rankDesigns,getDesignInterests,freshFeedSeed} from '../components/mobile/interestRank.mjs';
import ProductStage from '../components/experience/ProductStage';
import { useFavorites } from '../context/FavoritesContext';
import { trackWhatsAppClick } from '../hooks/useAnalytics';
import { saveEnquiryLead, resolveCategoryName } from '../hooks/useWhatsApp';
import '../components/mobile/pinterest-storefront.css';

const idOf = value => String(value?._id || value?.category_uuid || value || '');
const getPriceForQty = (product, qty) => {
  const tiers = Array.isArray(product?.quantityPricing) ? product.quantityPricing : [];
  const matched = tiers.filter(t => qty >= Number(t.minQty) &&
    (!t.maxQty || qty <= Number(t.maxQty))).sort((a,b) => Number(b.minQty) - Number(a.minQty))[0];
  if (matched && Number(matched.price) > 0) return Number(matched.price);
  const fallback = tiers.map(t => Number(t.price)).filter(p => p > 0);
  if (fallback.length) return Math.min(...fallback);
  return Number(product?.price) > 0 ? Number(product.price) : null;
};
const getYouTubeId = url => {
  const match = String(url || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
  return match ? match[1] : null;
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initial = idOf(location.state?.product) === String(id) ? location.state.product : null;
  const [product, setProduct] = useState(initial);
  const [loading, setLoading] = useState(!initial);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const [quantity, setQuantity] = useState(25);
  const [categoryName, setCategoryName] = useState('');
  const [related, setRelated] = useState([]);
  const [showVideo, setShowVideo] = useState(false);
  const { favorites, liked, toggleFavorite, toggleLiked } = useFavorites();

  useEffect(() => {
    let active = true;
    const preview = idOf(location.state?.product) === String(id) ? location.state.product : null;
    setProduct(preview);
    if(preview)recordDesignInterest(preview);
    setLoading(!preview);
    setLoadError(false);
    setImgIdx(0);
    setRelated([]);
    window.scrollTo({top:0,behavior:'auto'});
    if (preview?.quantityPricing?.length) setQuantity(Number(preview.quantityPricing[0].minQty) || 25);
    const fetchProduct = async () => {
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          const response = await api.get('/api/listings/' + id, {timeout:18000});
          if (!active) return;
          if (!response.data?._id) throw new Error('Incomplete product details');
          setProduct(response.data);
          recordDesignInterest(response.data);
          setLoading(false);
          setLoadError(false);
          if (response.data.quantityPricing?.length) {
            setQuantity(Number(response.data.quantityPricing[0].minQty) || 25);
          }
          return;
        } catch (error) {
          if (!active) return;
          if (error?.response?.status === 404) break;
          if (attempt < 2) await new Promise(resolve=>setTimeout(resolve,1200*(attempt+1)));
        }
      }
      if (active) { setLoading(false);setLoadError(!preview); }
    };
    fetchProduct();
    return () => {active=false;};
  }, [id, reloadKey]);

  const productCategory = idOf(product?.category);
  useEffect(() => {
    if (!productCategory) return undefined;
    let active = true;
    resolveCategoryName(product?.category).then(name=>{if(active)setCategoryName(name||'');}).catch(()=>{});
    api.get('/api/listings',{timeout:14000})
      .then(response=>{
        if (!active) return;
        const products = Array.isArray(response.data) ? response.data : response.data?.result;
        if (Array.isArray(products)) setRelated(rankDesigns(
          uniqueDesigns(products.filter(item => String(item?._id) !== String(id))),
          {seed:freshFeedSeed(),interests:getDesignInterests()}).slice(0,18));
      }).catch(()=>{});
    return () => {active=false;};
  }, [productCategory, id]);

  if (loading && !product) return (
    <div className="sk-pinterest-home sk-pin-detail-page sk-public-site">
      <div className="sk-pin-detail-head"><button type="button" className="sk-pin-round-action"
        onClick={()=>navigate(-1)} aria-label="Go back"><FaArrowLeft/></button></div>
      <div className="sk-pin-detail-loading" role="status">Opening your design…</div>
    </div>
  );
  if (!product) return (
    <div className="sk-pinterest-home sk-pin-detail-page sk-public-site">
      <div className="sk-pin-detail-head"><button type="button" className="sk-pin-round-action"
        onClick={()=>navigate('/')} aria-label="Back to gallery"><FaArrowLeft/></button></div>
      <div className="sk-pin-detail-error">
        <h1>{loadError ? 'This design is temporarily unavailable' : 'Design not found'}</h1>
        <p>{loadError ? 'Our catalog is still loading. You can retry without losing your place.' :
          'Browse the current gallery to find another design.'}</p>
        <button type="button" onClick={()=>setReloadKey(x=>x+1)}>Try again</button>
        <Link to="/">Explore designs</Link>
      </div>
    </div>
  );

  const images = Array.isArray(product.images) ? product.images.filter(Boolean) :
    [product.images || product.imageUrl].filter(Boolean);
  const activeIndex = Math.min(imgIdx,Math.max(0,images.length-1));
  const image = images[activeIndex] || null;
  const isSaved = favorites.some(item=>String(item._id)===String(product._id));
  const isLiked = liked.some(item=>String(item._id)===String(product._id));
  const price = getPriceForQty(product,quantity);
  const total = price !== null ? price*quantity : null;
  const tiers = Array.isArray(product.quantityPricing) ? product.quantityPricing : [];
  const ytId = getYouTubeId(product.youtubeUrl);
  const message = 'Hi SANJU SK Digital, please quote for *' + product.title + '*\n' +
    'Design ID: ' + id + '\nQuantity: ' + quantity + '\n' +
    (price !== null ? 'Indicative unit price: ₹' + price + '\n' : '') +
    (image ? 'Design photo: ' + image + '\n' : '') +
    'Design link: https://www.sanjusk.in/products/' + id;
  const waHref = 'https://wa.me/919372333633?text=' + encodeURIComponent(message);
  const enquire = () => {
    trackWhatsAppClick(id);
    saveEnquiryLead({productId:id,productName:product.title,message});
  };
  const share = () => {
    const url = 'https://www.sanjusk.in/products/' + id;
    if (navigator.share) navigator.share({title:product.title,url}).catch(()=>{});
    else navigator.clipboard?.writeText(url)?.catch(()=>{});
  };
  const back = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };
  return (
    <>
      <SEO title={product.seoTitle || product.title}
        description={product.seoDescription || product.description || product.title}
        image={images[0]} pathname={'/products/' + id}
        noIndex={location.pathname.startsWith('/product-view/')} />
      <ProductStructuredData product={product} />
      <div className="sk-pinterest-home sk-pin-detail-page sk-public-site">
        <header className="sk-pin-detail-head">
          <button type="button" className="sk-pin-round-action" aria-label="Back to designs"
            onClick={back}><FaArrowLeft/></button>
          <span className="sk-pin-detail-seller">SANJU SK Digital · Gondia</span>
          <div className="sk-pin-detail-actions">
            <button type="button" className="sk-pin-round-action" aria-label="Share this design"
              onClick={share}><FaShare/></button>
            <button type="button" className={'sk-pin-round-action' + (isLiked?' sk-pin-detail-fav':'')}
              aria-pressed={isLiked} aria-label={isLiked?'Unlike this design':'Like this design'}
              onClick={()=>toggleLiked(product)}>
              {isLiked?<FaThumbsUp/>:<FaRegThumbsUp/>}
            </button>
            <button type="button" className={'sk-pin-round-action' + (isSaved?' sk-pin-detail-fav':'')}
              aria-pressed={isSaved} aria-label={isSaved?'Remove from saved':'Save this design'}
              onClick={()=>toggleFavorite(product)}>
              {isSaved?<FaHeart/>:<FaRegHeart/>}
            </button>
          </div>
        </header>
        <div className="sk-pin-detail-grid">
          <div>
            <div className="sk-pin-detail-visual">
              {image ? <img src={image} alt={product.title+' custom design'} className="sk-pin-detail-image"
                fetchPriority="high" decoding="async" /> :
                <div className="sk-pin-no-image">✦</div>}
              {images.length>1 && <div className="sk-pin-detail-visual-nav">
                <button type="button" aria-label="Previous photo"
                  onClick={()=>setImgIdx((activeIndex-1+images.length)%images.length)}>
                  <FaChevronLeft/>
                </button>
                <button type="button" aria-label="Next photo"
                  onClick={()=>setImgIdx((activeIndex+1)%images.length)}>
                  <FaChevronRight/>
                </button>
              </div>}
            </div>
            {images.length>1 && (
              <nav className="sk-pin-detail-thumbs" aria-label="Product photos">
                {images.map((src,i)=><button key={src+i} type="button" onClick={()=>setImgIdx(i)}
                  className={i===activeIndex?'is-current':''}
                  aria-label={'Show photo '+(i+1)} aria-current={i===activeIndex?'true':undefined}>
                  <img src={src} loading="lazy" alt="" />
                </button>)}
              </nav>
            )}
          </div>
          <section className="sk-pin-detail-info">
            <span className="sk-pin-detail-seller">{categoryName || 'Made to order'} · SANJU SK Digital</span>
            <h1>{product.title}</h1>
            {product.description && <p>{product.description}</p>}
            <div className="sk-pin-detail-fields">
              {product.size && <span>Size: {String(product.size)}</span>}
              {product.badge && <span>{String(product.badge)}</span>}
              {product.religions && <span>{String(product.religions)}</span>}
            </div>
            <p className="sk-pin-detail-price">
              {price !== null ? <><b>₹{price.toLocaleString('en-IN')}</b> per piece</> :
                <b>Price on request</b>}
            </p>
            <div className="sk-pin-detail-qty">
              <h2>Custom quantity</h2>
              {tiers.length>0 && <div>
                {tiers.map((tier,i)=><button type="button" key={i}
                  className={quantity>=Number(tier.minQty)&&(!tier.maxQty||quantity<=Number(tier.maxQty))?'is-current':''}
                  onClick={()=>setQuantity(Number(tier.minQty)||25)}>
                  {tier.minQty}{tier.maxQty?'–'+tier.maxQty:'+'} pcs
                </button>)}
              </div>}
              <label className="sk-pin-detail-qty-input">Pieces
                <input type="number" min="1" max="100000" value={quantity} step="1"
                  onChange={event=>setQuantity(Math.min(100000,Math.max(1,Number(event.target.value)||1)))} />
              </label>
              {total!==null && <p>Estimated total: <strong>₹{total.toLocaleString('en-IN')}</strong> · confirm final quotation</p>}
            </div>
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="sk-pin-detail-quote"
              onClick={enquire}><FaWhatsapp/> Request a quote</a>
            {ytId && <button type="button" className="sk-pin-detail-video-btn"
              onClick={()=>setShowVideo(true)}><FaYoutube/> Watch design video</button>}
            {(product.model3dUrl||product.modelUrl||product.glbUrl) && (
              <details className="sk-pin-detail-model">
                <summary>Explore interactive 3D view</summary>
                <ProductStage images={images} title={product.title} activeIndex={activeIndex}
                  onIndexChange={setImgIdx} modelUrl={product.model3dUrl||product.modelUrl||product.glbUrl} />
              </details>
            )}
          </section>
        </div>
        {related.length>0 && <section className="sk-pin-detail-related" aria-labelledby="sk-pin-related-heading">
          <h2 id="sk-pin-related-heading">More ideas like this</h2>
          <div className="sk-pin-masonry">
            {related.map((item,index)=><PinterestPinCard key={item._id} product={item}
              index={index} categoryName={categoryName} />)}
          </div>
        </section>}
        {showVideo&&ytId&& <div role="dialog" aria-modal="true" aria-label="Design video"
          className="sk-pin-detail-modal" onClick={()=>setShowVideo(false)}>
          <div onClick={event=>event.stopPropagation()}>
            <button type="button" onClick={()=>setShowVideo(false)}>Close video</button>
            <iframe title="Product video" src={'https://www.youtube-nocookie.com/embed/'+ytId+'?autoplay=1'}
              allow="autoplay;encrypted-media" allowFullScreen/>
          </div>
        </div>}
        <div className="sk-pin-detail-sticky-cta">
          <a href={waHref} target="_blank" rel="noopener noreferrer" onClick={enquire}>
            <FaWhatsapp/> Request a custom quote
          </a>
        </div>
        <MobileBottomNav variant="pinterest" onSearchClick={()=>navigate('/?search=1')}/>
      </div>
    </>
  );
}
