import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MobileBottomNav from '../components/mobile/MobileBottomNav';
import { FaWhatsapp, FaHeart, FaShare, FaYoutube, FaChevronLeft, FaChevronRight, FaArrowLeft } from 'react-icons/fa';
import api from '../api';
import LazyImage from '../components/common/LazyImage';
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
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [showVideo, setShowVideo] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const whatsappNumber = useWhatsAppNumber();
  const { favorites, toggleFavorite } = useFavorites();

  useEffect(() => {
    api.get(`/api/listings/${id}`)
      .then((prodRes) => {
        setProduct(prodRes.data);
        const tiers = prodRes.data?.quantityPricing;
        if (Array.isArray(tiers) && tiers.length > 0) setQty(tiers[0].minQty);
        if (prodRes.data?.category) {
          resolveCategoryName(prodRes.data.category).then(setCategoryName);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-24">
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

  const images = Array.isArray(product.images) ? product.images : [];
  const price = getPriceForQty(product, qty);
  const total = price * qty;
  const isFav = favorites.some((f) => f._id === product._id);
  const ytId = getYouTubeId(product.youtubeUrl);
  const hasTiers = Array.isArray(product.quantityPricing) && product.quantityPricing.length > 0;

  const waNumber = String(whatsappNumber || '').replace(/\D/g, '');
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
        keywords={product.seoKeywords}
      />

      <div className="min-h-screen bg-white pb-24">
        {/* Instagram-style back header */}
        <div className="sticky top-0 z-40 flex items-center gap-3 bg-white px-4 py-3">
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

        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Image Gallery */}
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-2xl bg-gray-100">
                {images[imgIdx] ? (
                  <LazyImage
                    src={images[imgIdx]}
                    alt={`${product.title} - photo ${imgIdx + 1}`}
                    className="h-[340px] w-full object-cover sm:h-[420px]"
                  />
                ) : (
                  <div className="flex h-[340px] items-center justify-center text-gray-400">No image</div>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setImgIdx((p) => (p - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow hover:bg-white"
                    >
                      <FaChevronLeft className="text-xs" />
                    </button>
                    <button
                      onClick={() => setImgIdx((p) => (p + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow hover:bg-white"
                    >
                      <FaChevronRight className="text-xs" />
                    </button>
                  </>
                )}

                {ytId && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow-lg hover:bg-red-700"
                  >
                    <FaYoutube className="text-base" /> Watch Video
                  </button>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                        i === imgIdx ? 'border-gray-900 ring-2 ring-gray-900/20' : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${i + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {showVideo && ytId && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                  onClick={() => setShowVideo(false)}
                >
                  <div className="relative w-full max-w-3xl px-4" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setShowVideo(false)} className="absolute -top-10 right-4 text-2xl text-white">&times;</button>
                    <div className="aspect-video overflow-hidden rounded-2xl">
                      <iframe
                        src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                        title="Product Video"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        className="h-full w-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="font-serif text-2xl font-bold text-gray-900 sm:text-3xl">{product.title}</h2>
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
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
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
                      onClick={() => setQty((q) => Math.max(hasTiers ? product.quantityPricing[0].minQty : 1, q - 1))}
                      className="px-4 py-2.5 text-lg text-gray-500 hover:bg-gray-50"
                    >−</button>
                    <span className="min-w-[48px] px-2 text-center font-bold text-gray-900">{qty}</span>
                    <button
                      onClick={() => setQty((q) => q + 1)}
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
                className="flex items-center justify-center gap-3 rounded-2xl bg-[#25D366] py-4 text-base font-bold text-white shadow-lg hover:bg-[#128C7E] active:scale-95"
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
        <div className="fixed inset-x-0 bottom-0 z-40 bg-white px-4 py-3 lg:hidden">
          <a
            href={waHref}
            target="_blank"
            rel="noreferrer"
            onClick={handleWAClick}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 font-bold text-white hover:bg-[#128C7E] active:scale-95"
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
