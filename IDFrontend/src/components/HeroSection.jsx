import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaWhatsapp, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import api from '../api';

const HeroSection = ({ whatsappNumber = '919999999999' }) => {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    api.get('/api/banners')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setBanners(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((p) => (p + 1) % Math.max(banners.length, 1));
    }, 4000);
  };

  useEffect(() => {
    if (banners.length > 1) startTimer();
    return () => clearInterval(timerRef.current);
  }, [banners.length]);

  const goTo = (idx) => {
    setCurrent(idx);
    startTimer();
  };

  const waHref = `https://wa.me/${String(whatsappNumber).replace(/\D/g, '')}?text=${encodeURIComponent('Hi! I would like to place an order.')}`;

  if (loading) {
    return (
      <div className="h-[320px] animate-pulse bg-gray-100 md:h-[480px]" />
    );
  }

  if (banners.length === 0) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-br from-[#075E54] via-[#128C7E] to-[#25D366] py-24 text-white md:py-36">
        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6">
          <span className="mb-4 inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm">
            Premium Printing & Advertising Solutions
          </span>
          <h1 className="mt-4 font-serif text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
            Turning Celebrations Into<br className="hidden sm:block" /> Beautiful Paper Art
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-white/80 sm:text-lg">
            Wedding cards, visiting cards, flex banners &amp; more — designed with love, delivered with care.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/products" className="btn-whatsapp text-base">
              Explore Products
            </Link>
            <a href={waHref} target="_blank" rel="noreferrer" className="btn-outline border-white text-white hover:bg-white hover:text-[#128C7E]">
              <FaWhatsapp className="text-lg" />
              Order on WhatsApp
            </a>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full bg-white/5" />
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-black">
      {/* Slides */}
      <div className="relative h-[260px] sm:h-[380px] md:h-[500px] lg:h-[560px]">
        {banners.map((banner, idx) => (
          <div
            key={banner._id}
            className={`absolute inset-0 transition-opacity duration-700 ${idx === current ? 'opacity-100' : 'opacity-0'}`}
          >
            <img
              src={banner.imageUrl}
              alt={banner.altText || banner.name || `Banner ${idx + 1}`}
              className="h-full w-full object-cover"
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          </div>
        ))}

        {/* Overlay CTA */}
        <div className="absolute bottom-8 left-0 right-0 z-10 flex justify-center gap-3 px-4 sm:bottom-10">
          <Link
            to="/products"
            className="rounded-xl bg-white/95 px-5 py-2.5 text-sm font-semibold text-[#128C7E] shadow-lg backdrop-blur-sm hover:bg-white transition-colors"
          >
            Explore Products
          </Link>
          <a
            href={waHref}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-[#128C7E] transition-colors"
          >
            <FaWhatsapp className="text-base" />
            Order Now
          </a>
        </div>

        {/* Prev / Next */}
        {banners.length > 1 && (
          <>
            <button
              onClick={() => goTo((current - 1 + banners.length) % banners.length)}
              className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors"
              aria-label="Previous"
            >
              <FaChevronLeft className="text-xs" />
            </button>
            <button
              onClick={() => goTo((current + 1) % banners.length)}
              className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors"
              aria-label="Next"
            >
              <FaChevronRight className="text-xs" />
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 sm:bottom-5">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === current ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSection;
