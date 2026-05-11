import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaWhatsapp, FaHeart, FaShare, FaYoutube, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import api from '../api';
import LazyImage from '../components/common/LazyImage';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { useFavorites } from '../context/FavoritesContext';
import SEO from '../components/SEO';
import { trackWhatsAppClick } from '../hooks/useAnalytics';
import { useWhatsAppNumber, saveEnquiryLead } from '../hooks/useWhatsApp';

const getPriceForQty = (product, qty) => {
  const tiers = product?.quantityPricing;
  if (!Array.isArray(tiers) || tiers.length === 0) return product?.price ?? 0;
  const matched = tiers
    .filter((t) => qty >= t.minQty && (!t.maxQty || qty <= t.maxQty))
    .sort((a, b) => b.minQty - a.minQty)[0];
  return matched ? matched.price : product?.price ?? 0;
};

const getYouTubeId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
  return m ? m[1] : null;
};

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [showVideo, setShowVideo] = useState(false);
  const whatsappNumber = useWhatsAppNumber();
  const { favorites, toggleFavorite } = useFavorites();

  useEffect(() => {
    api.get(`/api/listings/${id}`)
      .then((prodRes) => {
        setProduct(prodRes.data);
        const tiers = prodRes.data?.quantityPricing;
        if (Array.isArray(tiers) && tiers.length > 0) setQty(tiers[0].minQty);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <LoadingSkeleton count={4} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <div className="text-5xl">😕</div>
        <h2 className="mt-4 font-serif text-2xl font-bold text-gray-700">Product Not Found</h2>
        <Link to="/products" className="mt-6 btn-whatsapp">Back to Products</Link>
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
  const waMsgText = `Hi! I want to order:\n*${product.title}*\nQuantity: ${qty}\nPrice per piece: ₹${price}\nTotal: ₹${total}\n\nProduct link: ${window.location.href}`;
  const waMsg = encodeURIComponent(waMsgText);
  const waHref = waNumber ? `https://wa.me/${waNumber}?text=${waMsg}` : '#';

  const handleWAClick = () => {
    trackWhatsAppClick(product._id);
    saveEnquiryLead({ productId: product._id, productName: product.title, message: waMsgText });
  };

  const shareUrl = window.location.href;
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.title, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied!');
    }
  };

  return (
    <>
      <SEO
        title={product.seoTitle || product.title}
        description={product.seoDescription || product.description}
        keywords={product.seoKeywords}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-2 text-sm text-gray-500">
              <Link to="/" className="hover:text-[#128C7E]">Home</Link>
              <span>/</span>
              <Link to="/products" className="hover:text-[#128C7E]">Products</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium line-clamp-1">{product.title}</span>
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            {/* ── Image Gallery ── */}
            <div className="space-y-3">
              {/* Main image */}
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
                    <button onClick={() => setImgIdx((p) => (p - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow hover:bg-white">
                      <FaChevronLeft className="text-xs" />
                    </button>
                    <button onClick={() => setImgIdx((p) => (p + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow hover:bg-white">
                      <FaChevronRight className="text-xs" />
                    </button>
                  </>
                )}

                {ytId && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow-lg hover:bg-red-700 transition-colors"
                  >
                    <FaYoutube className="text-base" /> Watch Video
                  </button>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${i === imgIdx ? 'border-[#25D366] ring-2 ring-[#25D366]/20' : 'border-transparent hover:border-gray-300'}`}
                    >
                      <img src={img} alt={`Thumb ${i + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* YouTube embed modal */}
              {showVideo && ytId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setShowVideo(false)}>
                  <div className="relative w-full max-w-3xl px-4" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setShowVideo(false)} className="absolute -top-10 right-4 text-white text-2xl">&times;</button>
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

            {/* ── Product Info ── */}
            <div className="flex flex-col gap-5">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h1 className="font-serif text-2xl font-bold text-gray-900 sm:text-3xl">{product.title}</h1>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => toggleFavorite(product)} className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all ${isFav ? 'border-red-500 bg-red-50 text-red-500' : 'border-gray-200 text-gray-400 hover:border-red-400 hover:text-red-400'}`} aria-label="Favourite">
                      <FaHeart className="text-sm" />
                    </button>
                    <button onClick={handleShare} className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:border-[#25D366] hover:text-[#25D366] transition-all" aria-label="Share">
                      <FaShare className="text-sm" />
                    </button>
                  </div>
                </div>

                {product.description && (
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">{product.description}</p>
                )}
              </div>

              {/* Price */}
              <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#128C7E]">₹{price}</span>
                  <span className="text-sm text-gray-500">per piece</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-[#128C7E]">Total: ₹{total}</p>
              </div>

              {/* Quantity pricing tiers */}
              {hasTiers && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-700">Quantity Pricing</h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {product.quantityPricing.map((tier, i) => (
                      <button
                        key={i}
                        onClick={() => setQty(tier.minQty)}
                        className={`rounded-xl border p-2.5 text-center transition-all ${qty >= tier.minQty && (!tier.maxQty || qty <= tier.maxQty) ? 'border-[#25D366] bg-[#25D366]/10 ring-1 ring-[#25D366]' : 'border-gray-200 hover:border-[#25D366]/50'}`}
                      >
                        <div className="text-xs text-gray-500">{tier.minQty}{tier.maxQty ? `–${tier.maxQty}` : '+'} pcs</div>
                        <div className="mt-0.5 text-sm font-bold text-[#128C7E]">₹{tier.price}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity input */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">Quantity</h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center overflow-hidden rounded-xl border border-gray-200">
                    <button onClick={() => setQty((q) => Math.max(hasTiers ? product.quantityPricing[0].minQty : 1, q - 1))} className="px-4 py-2.5 text-lg text-gray-500 hover:bg-gray-50 transition-colors">−</button>
                    <span className="min-w-[48px] px-2 text-center font-bold text-gray-900">{qty}</span>
                    <button onClick={() => setQty((q) => q + 1)} className="px-4 py-2.5 text-lg text-gray-500 hover:bg-gray-50 transition-colors">+</button>
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
                  <span className="rounded-full bg-[#25D366]/10 px-3 py-1 text-xs font-medium text-[#128C7E]">{product.badge}</span>
                )}
              </div>

              {/* WhatsApp order button */}
              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                onClick={handleWAClick}
                className="flex items-center justify-center gap-3 rounded-2xl bg-[#25D366] py-4 text-base font-bold text-white shadow-lg hover:bg-[#128C7E] transition-colors active:scale-95"
              >
                <FaWhatsapp className="text-xl" />
                Order on WhatsApp — ₹{total}
              </a>

              {/* YouTube button if no in-image display */}
              {ytId && (
                <button
                  onClick={() => setShowVideo(true)}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-red-200 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <FaYoutube className="text-lg" /> Watch Product Video
                </button>
              )}

              {/* Instagram */}
              {product.instagramUrl && (
                <a href={product.instagramUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-gray-500 hover:text-pink-600 transition-colors">
                  View on Instagram →
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Sticky bottom bar on mobile */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white px-4 py-3 shadow-2xl lg:hidden">
          <a
            href={waHref}
            target="_blank"
            rel="noreferrer"
            onClick={handleWAClick}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 font-bold text-white hover:bg-[#128C7E] transition-colors"
          >
            <FaWhatsapp className="text-lg" />
            Order on WhatsApp — ₹{total}
          </a>
        </div>
      </div>
    </>
  );
}
