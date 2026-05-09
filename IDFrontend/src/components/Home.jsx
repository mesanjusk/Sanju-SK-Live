import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaWhatsapp, FaArrowRight } from 'react-icons/fa';
import api from '../api';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import Footer from './Footer';
import ProductCard from './ProductCard';
import WhyChooseUs from './WhyChooseUs';
import Testimonials from './Testimonials';
import ServicesGrid from './ServicesGrid';
import StatsCounter from './StatsCounter';
import GMBSection from './GMBSection';
import FAQSection from './FAQSection';
import ContactPreview from './ContactPreview';
import LoadingSkeleton from './common/LoadingSkeleton';

export default function Home() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/listings'),
      api.get('/api/categories'),
      api.get('/api/confi/GetConfiList'),
    ]).then(([listRes, catRes, confiRes]) => {
      setListings(Array.isArray(listRes.data) ? listRes.data : []);
      setCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data?.result || []);
      if (confiRes.data?.success && confiRes.data.result.length > 0) {
        setConfig(confiRes.data.result[0]);
      }
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categoriesByUuid = useMemo(() => {
    const map = new Map();
    categories.forEach((c) => { if (c?.category_uuid) map.set(c.category_uuid, c); });
    return map;
  }, [categories]);

  const categoryCards = useMemo(() => {
    const seen = new Set();
    return listings
      .filter((l) => l?.category && !seen.has(l.category) && seen.add(l.category))
      .map((l) => {
        const cat = categoriesByUuid.get(l.category);
        return { id: cat?._id || l.category, title: cat?.name || l.category, imageUrl: cat?.imageUrl || l.images?.[0] || '', categoryUuid: l.category };
      });
  }, [listings, categoriesByUuid]);

  const featuredProducts = useMemo(() => listings.slice(0, 8), [listings]);
  const newArrivals = useMemo(() => [...listings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4), [listings]);

  const waNumber = String(config.whatsappNumber || config.phone || '919999999999').replace(/\D/g, '');
  const waHref = `https://wa.me/${waNumber}?text=${encodeURIComponent('Hi! I need help with a printing order.')}`;

  return (
    <div className="bg-white">
      <Navbar />
      <HeroSection whatsappNumber={config.whatsappNumber || config.phone} />

      {/* ── How it works ── */}
      <section className="border-b border-gray-100 bg-gradient-to-r from-[#f0fdf4] to-white py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid grid-cols-3 gap-4 text-center sm:gap-8">
            {[
              { step: '1', icon: '🔍', title: 'Browse', desc: 'Find your perfect design' },
              { step: '2', icon: '💬', title: 'WhatsApp Us', desc: 'Send your order details' },
              { step: '3', icon: '🎉', title: 'Receive', desc: 'Get your prints delivered' },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#25D366]/10 text-2xl">
                  {s.icon}
                </div>
                <div className="mt-2 text-sm font-bold text-gray-800">{s.title}</div>
                <div className="mt-0.5 hidden text-xs text-gray-500 sm:block">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services Grid ── */}
      <ServicesGrid />

      {/* ── Stats Counter ── */}
      <StatsCounter />

      {/* ── Categories ── */}
      {(loading || categoryCards.length > 0) && (
        <section className="py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between">
              <div>
                <span className="section-tag">Collections</span>
                <h2 className="section-title mt-4">Shop by Category</h2>
                <p className="mt-2 text-sm text-gray-500">Find the right print for every need.</p>
              </div>
              <Link to="/allCategories" className="hidden items-center gap-1 text-sm font-semibold text-[#128C7E] hover:text-[#075E54] sm:flex">
                View all <FaArrowRight className="text-xs" />
              </Link>
            </div>

            {loading ? (
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {[...Array(6)].map((_, i) => <LoadingSkeleton key={i} />)}
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {categoryCards.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => navigate(`/subcategory/${cat.categoryUuid}`)}
                    className="group flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm transition-all duration-300 hover:border-[#25D366]/30 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="h-16 w-16 overflow-hidden rounded-xl bg-green-50">
                      {cat.imageUrl ? (
                        <img src={cat.imageUrl} alt={cat.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl">📇</div>
                      )}
                    </div>
                    <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-gray-800 group-hover:text-[#128C7E] transition-colors">{cat.title}</h3>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Trending Products ── */}
      <section className="bg-gray-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <span className="section-tag">Popular</span>
              <h2 className="section-title mt-4">Trending Products</h2>
              <p className="mt-2 text-sm text-gray-500">Our most popular printing designs.</p>
            </div>
            <Link to="/products" className="hidden items-center gap-1 text-sm font-semibold text-[#128C7E] hover:text-[#075E54] sm:flex">
              View all <FaArrowRight className="text-xs" />
            </Link>
          </div>

          {loading ? (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(4)].map((_, i) => <LoadingSkeleton key={i} />)}
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featuredProducts.map((p) => (
                <ProductCard key={p._id} product={p} whatsappNumber={config.whatsappNumber || config.phone} />
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <Link to="/products" className="btn-outline inline-flex items-center gap-2">
              View All Products <FaArrowRight className="text-xs" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── New Arrivals ── */}
      {newArrivals.length > 0 && (
        <section className="py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center gap-3">
              <span className="rounded-full bg-[#25D366] px-3 py-1 text-xs font-bold text-white">NEW</span>
              <h2 className="font-serif text-2xl font-bold text-gray-900">New Arrivals</h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {newArrivals.map((p) => (
                <ProductCard key={p._id} product={p} whatsappNumber={config.whatsappNumber || config.phone} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Why Choose Us ── */}
      <WhyChooseUs />

      {/* ── Testimonials ── */}
      <Testimonials />

      {/* ── WhatsApp CTA Banner ── */}
      <section className="bg-gradient-to-r from-[#075E54] to-[#128C7E] py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="mb-4 flex justify-center text-5xl text-[#25D366]">
            <FaWhatsapp />
          </div>
          <h2 className="font-serif text-3xl font-bold text-white">Need a Custom Design?</h2>
          <p className="mt-3 text-white/80">
            Chat with us on WhatsApp and we'll create the perfect print for your occasion.
          </p>
          <a
            href={waHref}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 font-bold text-[#128C7E] shadow-lg hover:bg-green-50 transition-colors"
          >
            <FaWhatsapp className="text-xl text-[#25D366]" />
            Start WhatsApp Chat
          </a>
        </div>
      </section>

      {/* ── Google My Business & Reviews ── */}
      <GMBSection config={config} />

      {/* ── FAQ ── */}
      <FAQSection />

      <ContactPreview />
      <Footer />
    </div>
  );
}
