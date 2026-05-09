import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaWhatsapp, FaChevronLeft, FaChevronRight, FaPlay } from 'react-icons/fa';
import api from '../api';

const CYCLING_WORDS = [
  'Wedding Cards',
  'Visiting Cards',
  'Trophy & Awards',
  'Corporate Gifts',
  'Flex Banners',
  'Custom Printing',
  'Your Imagination',
];

const STATS = [
  { value: '5,000+', label: 'Happy Clients' },
  { value: '50+',    label: 'Categories' },
  { value: '10+',    label: 'Years Experience' },
  { value: '100%',   label: 'Satisfaction' },
];

function CyclingText() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((p) => (p + 1) % CYCLING_WORDS.length);
        setVisible(true);
      }, 400);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className="inline-block text-gold-gradient transition-opacity duration-400"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {CYCLING_WORDS[idx]}
    </span>
  );
}

export default function HeroSection({ whatsappNumber }) {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    api.get('/api/banners')
      .then((r) => setBanners(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => setCurrent((p) => (p + 1) % banners.length), 4500);
    }
    return () => clearInterval(timerRef.current);
  }, [banners.length]);

  const goTo = (i) => {
    setCurrent(i);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCurrent((p) => (p + 1) % banners.length), 4500);
  };

  const waNum = String(whatsappNumber || '919999999999').replace(/\D/g, '');
  const waHref = `https://wa.me/${waNum}?text=${encodeURIComponent('Hi! I would like to place an order.')}`;

  /* ── No banners: full premium fallback ── */
  if (!loading && banners.length === 0) {
    return (
      <section className="grain relative overflow-hidden bg-gradient-hero py-24 text-white md:py-36">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#25D366]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#C9A227]/15 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6">
          {/* Tag */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white/90 backdrop-blur-sm">
            ✦ One Stop Solution
          </div>

          {/* H1 */}
          <h1 className="text-balance font-serif text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            We Create Beautiful<br />
            <CyclingText />
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
            SANJU SK Digital – Mahi Creation. Your imagination, we bring to life.
            Wedding cards to corporate gifts — all under one roof.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a href={waHref} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 rounded-2xl bg-[#25D366] px-7 py-3.5 font-bold text-white shadow-wa hover:bg-[#128C7E] hover:shadow-wa-lg transition-all duration-300 hover:-translate-y-0.5">
              <FaWhatsapp className="text-xl" /> Order on WhatsApp
            </a>
            <Link to="/products"
              className="flex items-center gap-2 rounded-2xl border-2 border-white/40 px-7 py-3.5 font-bold text-white backdrop-blur-sm hover:border-white hover:bg-white/10 transition-all duration-300">
              Browse Catalogue
            </Link>
          </div>

          {/* Gold accent line */}
          <div className="mx-auto mt-12 flex items-center justify-center gap-3">
            <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-[#C9A227]/50" />
            <span className="text-xs font-semibold uppercase tracking-widest text-[#C9A227]">Trusted Since 2014</span>
            <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-[#C9A227]/50" />
          </div>
        </div>

        {/* Stat strip */}
        <div className="relative z-10 mt-16 border-t border-white/10">
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-0 sm:grid-cols-4">
            {STATS.map((s, i) => (
              <div key={i} className={`flex flex-col items-center py-6 ${i < 3 ? 'border-r border-white/10' : ''}`}>
                <span className="counter-number text-3xl font-bold text-[#25D366] sm:text-4xl">{s.value}</span>
                <span className="mt-1 text-xs font-medium uppercase tracking-wide text-white/60">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  /* ── Skeleton ── */
  if (loading) return <div className="h-[360px] animate-pulse bg-gray-100 sm:h-[500px]" />;

  /* ── Banner carousel ── */
  return (
    <section>
      <div className="relative overflow-hidden bg-black">
        <div className="relative h-[280px] sm:h-[400px] md:h-[520px] lg:h-[600px]">
          {banners.map((b, i) => (
            <div key={b._id} className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0'}`}>
              <img src={b.imageUrl} alt={b.altText || b.name || `Banner ${i+1}`}
                className="h-full w-full object-cover" loading={i === 0 ? 'eager' : 'lazy'} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            </div>
          ))}

          {/* Headline overlay */}
          <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-10">
            <h2 className="font-serif text-2xl font-bold text-white drop-shadow-lg sm:text-4xl">
              We Create <span className="text-[#25D366]">{CYCLING_WORDS[current % CYCLING_WORDS.length]}</span>
            </h2>
            <div className="mt-4 flex gap-3">
              <a href={waHref} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 rounded-2xl bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white shadow-wa hover:bg-[#128C7E] transition-colors">
                <FaWhatsapp /> Order Now
              </a>
              <Link to="/products"
                className="flex items-center gap-2 rounded-2xl border border-white/50 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-colors">
                View All
              </Link>
            </div>
          </div>

          {/* Arrows */}
          {banners.length > 1 && (<>
            <button onClick={() => goTo((current - 1 + banners.length) % banners.length)}
              className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors">
              <FaChevronLeft className="text-xs" />
            </button>
            <button onClick={() => goTo((current + 1) % banners.length)}
              className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors">
              <FaChevronRight className="text-xs" />
            </button>
          </>)}

          {/* Dots */}
          {banners.length > 1 && (
            <div className="absolute bottom-3 right-4 z-20 flex gap-1.5 sm:bottom-5">
              {banners.map((_, i) => (
                <button key={i} onClick={() => goTo(i)}
                  className={`h-1.5 rounded-full transition-all ${i === current ? 'w-6 bg-[#25D366]' : 'w-1.5 bg-white/50'}`} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stat strip below carousel */}
      <div className="bg-[#075E54]">
        <div className="mx-auto grid max-w-4xl grid-cols-2 sm:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={i} className={`flex flex-col items-center py-5 ${i < 3 ? 'border-r border-white/10' : ''}`}>
              <span className="counter-number text-2xl font-bold text-[#25D366] sm:text-3xl">{s.value}</span>
              <span className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-white/60">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
