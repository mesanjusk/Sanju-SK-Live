import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import MobileBottomNav from '../components/mobile/MobileBottomNav';
import { FaWhatsapp, FaHeart, FaShare, FaYoutube, FaChevronLeft, FaChevronRight, FaArrowLeft } from 'react-icons/fa';
import api from '../api';
import ProductStage from '../components/experience/ProductStage';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { useFavorites } from '../context/FavoritesContext';
import SEO from '../components/SEO';
import { trackWhatsAppClick } from '../hooks/useAnalytics';
import { useWhatsAppNumber, saveEnquiryLead, resolveCategoryName } from '../hooks/useWhatsApp';

const getPriceForQty = (product, qty) => {
  const tiers = product?.quantityPricing;
  if (!Array.isArray(tiers) || tiers.length === 0) return product?.price ?? 0;
  const matched = tiers
    .filter((t) => qty >= t.minQty && (!t.maxQty || qty <= t.maxQty))
    .sort((a, b) => b.minQty - a.minQty)[0];
  if (matched) return matched.price;
  // qty is below all tiers — show the cheapest tier price
  return Math.min(...tiers.map((t) => Number(t.price)));
};

const getYouTubeId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
  return m ? m[1] : null;
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(25);
  const [showVideo, setShowVideo] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const whatsappNumber = useWhatsAppNumber();
  const { favorites, toggleFavorite } = useFavorites();

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setLoadError(false);
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          const response = await api.get(`/api/listings/${id}`, { timeout: 30000 });
          if (!active) return;
          setProduct(response.data);
          const tiers = response.data?.quantityPricing;
          if (Array.isArray(tiers) && tiers.length > 0) setQty(tiers[0].minQty);
          if (response.data?.category) {
            resolveCategoryName(response.data.category).then(name => {
              if (active) setCategoryName(name);
            }).catch(() => {});
          }
          setLoading(false);
          return;
        } catch (error) {
          if (!active) return;
          if (error?.response?.status === 404) {
            setProduct(null);
            setLoadError(false);
            setLoading(false);
            return;
          }
          if (attempt < 4) await new Promise(resolve => setTimeout(resolve, Math.min(2500*(attempt+1), 9000)));
        }
      }
      if (active) { setLoading(false); setLoadError(true); }
    };
    load();
    return () => { active = false; };
  }, [id, reloadKey]);

  if (loading) {
    return (
      <div className="sk-detail-shell pb-36">
        <div className="flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-3">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700">
            <FaArrowLeft className="text-sm" />
          </button>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-10">
          <LoadingSkeleton count={4} />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="sk-detail-shell flex min-h-[65vh] flex-col items-center justify-center px-5 text-center">
        <h2 className="text-xl font-extrabold text-[#2e4738]">The product is temporarily unavailable</h2>
        <p className="mt-3 max-w-sm text-sm text-[#647469]">Our product server is waking up. Your product listing has not been removed.</p>
        <button type="button" onClick={() => setReloadKey(n => n + 1)}
          className="sk-order-button mt-5">Try again</button>
        <Link to="/products" className="mt-4 text-sm font-semibold text-[#3d604c] underline">Browse other products</Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <div className="text-5xl">😕</div>
        <h2 className="mt-4 font-serif text-2xl font-bold text-gray-700">Product Not Found</h2>
        <button onClick={() => navigate(-1)} className="mt-6 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white">
          Go Back
        </button>
      </div>
    );
  }

  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [product.images].filter(Boolean);
  const price = getPriceForQty(product, qty);
  const total = price * qty;
  const isFav = favorites.some((f) => f._id === product._id);
  const ytId = getYouTubeId(product.youtubeUrl);
  const hasTiers = Array.isArray(product.quantityPricing) && product.quantityPricing.length > 0;

  const waNumber = String(whatsappNumber || '919372333633').replace(/\D/g, '');
  const waMsgText =
    `Hi! I want to order:\n*${product.title}*\n` +
    `🆔 Product ID: ${product._id}\n` +
    `📦 Quantity: ${qty}\n` +
    `💰 Price per piece: ₹${price}\n` +
    `💵 Total: ₹${total}\n` +
    (categoryName ? `📂 Category: ${categoryName}\n` : '') +
    (images[imgIdx] ? `🖼️ Image: ${images[imgIdx]}\n` : '') +
    `🔗 Product link: ${window.location.href}`;
  const waMsg = encodeURIComponent(waMsgText);
  const waHref = waNumber ? `https://wa.me/${waNumber}?text=${waMsg}` : '#';

  const handleWAClick = () => {
    trackWhatsAppClick(product._id);
    saveEnquiryLead({ productId: product._id, productName: product.title, message: waMsgText });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <>
      <SEO
        title={product.seoTitle || product.title}
        description={product.seoDescription || product.description}
        pathname={`/products/${id}`}
        noIndex={location.pathname.startsWith('/product-view/')}
      />

      <div className="min-h-screen bg-white pb-24">
        {/* Instagram-style back header */}
        <div className="sk-detail-back">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 active:scale-95"
            aria-label="Go back"
          >
            <FaArrowLeft className="text-sm" />
          </button>
          <h1 className="flex-1 line-clamp-1 text-sm font-semibold text-gray-900">{product.title}</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(product)}
              className={`flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 transition-colors ${isFav ? 'text-red-500' : 'text-gray-700'}`}
              aria-label="Favourite"
            >
              <FaHeart className="text-sm" />
            </button>
            <button
              onClick={handleShare}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 active:scale-95"
              aria-label="Share"
            >
              <FaShare className="text-sm" />
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-3 py-5 sm:px-6 lg:px-8">
          <div className="grid items-start gap-6 lg:grid-cols-2">
            {/* Interactive stage: perspective photos; true 3D only when a model URL exists. */}
            <div className="space-y-3">
              <ProductStage images={images} title={product.title}
                activeIndex={imgIdx} onIndexChange={setImgIdx}
                modelUrl={product.model3dUrl || product.modelUrl || product.glbUrl} />
              <p className="px-1 text-xs leading-5 text-[#6b7b6c]">
                Explore each actual product photo with depth and zoom.
                {product.model3dUrl || product.modelUrl || product.glbUrl
                  ? ' An interactive 3D model is also available.'
                  : ' Photo perspective is illustrative; sizing and colours may vary by screen.'}
              </p>
              {ytId && (
                <button type="button" onClick={() => setShowVideo(true)}
                  className="sk-order-button !w-full !bg-[#733f3d]">
                  <FaYoutube className="text-base" /> Watch actual product video
                </button>
              )}
              {showVideo && ytId && (
                <div role="dialog" aria-modal="true" aria-label="Product video"
                  className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-4"
                  onClick={() => setShowVideo(false)}>
                  <div className="relative w-full max-w-3xl" onClick={(event) => event.stopPropagation()}>
                    <button type="button" onClick={() => setShowVideo(false)}
                      aria-label="Close video" className="absolute -top-11 right-0 rounded-full bg-white px-4 py-2 text-black">Close</button>
                    <div className="aspect-video overflow-hidden rounded-xl">
                      <iframe src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1`}
                        title="Product Video" allow="autoplay; encrypted-media"
                        allowFullScreen className="h-full w-full" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="sk-detail-panel flex flex-col gap-5">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-[#263e32] sm:text-3xl">{product.title}</h2>
                {product.description && (
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">{product.description}</p>
                )}
              </div>

              {/* Quantity pricing tiers — shown first so user can pick qty before seeing price */}
              {hasTiers && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-700">Select Quantity</h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {product.quantityPricing.map((tier, i) => {
                      const isActive = qty >= tier.minQty && (!tier.maxQty || qty <= tier.maxQty);
                      return (
                        <button
                          key={i}
                          onClick={() => setQty(tier.minQty)}
                          className={`rounded-xl border p-2.5 text-center transition-all ${
                            isActive
                              ? 'border-gray-900 bg-gray-900 text-white ring-1 ring-gray-900'
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <div className={`text-xs ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>
                            {tier.minQty}{tier.maxQty ? `–${tier.maxQty}` : '+'} pcs
                          </div>
                          <div className={`mt-0.5 text-sm font-bold ${isActive ? 'text-white' : 'text-gray-900'}`}>
                            ₹{tier.price}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Price */}
              <div className="rounded-2xl border border-[#dce7dc] bg-[#f2f6f0] p-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">₹{price}</span>
                  <span className="text-sm text-gray-500">per piece</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-gray-600">Total: ₹{total}</p>
              </div>

              {/* Quantity input */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">Quantity</h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center overflow-hidden rounded-xl border border-gray-200">
                    <button
                      onClick={() => setQty((q) => Math.max(hasTiers ? product.quantityPricing[0].minQty : 25, q - 25))}
                      className="px-4 py-2.5 text-lg text-gray-500 hover:bg-gray-50"
                    >−</button>
                    <span className="min-w-[48px] px-2 text-center font-bold text-gray-900">{qty}</span>
                    <button
                      onClick={() => setQty((q) => q + 25)}
                      className="px-4 py-2.5 text-lg text-gray-500 hover:bg-gray-50"
                    >+</button>
                  </div>
                  <span className="text-sm text-gray-500">pieces</span>
                </div>
              </div>

              {/* Metadata chips */}
              <div className="flex flex-wrap gap-2">
                {product.size && (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">Size: {product.size}</span>
                )}
                {product.religions && (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">{product.religions}</span>
                )}
                {product.badge && (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">{product.badge}</span>
                )}
              </div>

              {/* WhatsApp order button */}
              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                onClick={handleWAClick}
                className="sk-order-button !py-4 !text-base"
              >
                <FaWhatsapp className="text-xl" />
                Order on WhatsApp — ₹{total}
              </a>

              {ytId && (
                <button
                  onClick={() => setShowVideo(true)}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  <FaYoutube className="text-lg" /> Watch Product Video
                </button>
              )}

              {product.instagramUrl && (
                <a
                  href={product.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  View on Instagram →
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Sticky bottom CTA on mobile */}
        <div className="fixed inset-x-0 bottom-[calc(65px+env(safe-area-inset-bottom))] z-30 border-t border-[#e3e8db] bg-white/95 px-4 py-2 shadow-[0_-10px_25px_#183f3213] backdrop-blur-lg lg:hidden">
          <a
            href={waHref}
            target="_blank"
            rel="noreferrer"
            onClick={handleWAClick}
            className="sk-order-button !flex !w-full !py-3.5 !text-sm"
          >
            <FaWhatsapp className="text-lg" />
            Order on WhatsApp — ₹{total}
          </a>
        </div>

        <MobileBottomNav />
      </div>
    </>
  );
}
