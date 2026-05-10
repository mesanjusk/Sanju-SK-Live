import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';
import api from '../api';
import Navbar from './Navbar';
import Footer from './Footer';
import ProductCard from './ProductCard';
import LoadingSkeleton from './common/LoadingSkeleton';

export default function Home() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/api/listings'), api.get('/api/categories'), api.get('/api/confi/GetConfiList')])
      .then(([l, c, conf]) => {
        setListings(Array.isArray(l.data) ? l.data : []);
        setCategories(Array.isArray(c.data) ? c.data : c.data?.result || []);
        setConfig(conf.data?.result?.[0] || {});
      }).finally(() => setLoading(false));
  }, []);

  const featured = useMemo(() => listings.slice(0, 6), [listings]);

  return (
    <div className="pb-8">
      <Navbar />
      <main className="lux-container space-y-16 py-8">
        <section className="lux-card relative overflow-hidden p-8 sm:p-14">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#d6e7d0]/70 blur-2xl" />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs uppercase tracking-[0.24em] text-[#6d7e6d]">Luxury Print Atelier</p>
            <h1 className="lux-title mt-3">Crafting timeless invitations with modern editorial elegance.</h1>
            <p className="lux-subtitle">A premium handcrafted visual experience inspired by boutique studios, wedding maisons, and designer portfolio aesthetics.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products" className="lux-btn-primary">Explore Collection <FaArrowRight /></Link>
              <a href={`https://wa.me/${String(config.whatsappNumber || config.phone || '919999999999').replace(/\D/g,'')}`} className="lux-btn-soft">Design Consultation</a>
            </div>
          </motion.div>
        </section>

        <section>
          <div className="mb-6 flex items-end justify-between">
            <div><h2 className="text-5xl font-semibold">Curated Categories</h2><p className="mt-2 text-sm text-[#617062]">Bento-inspired layout for a premium discovery flow.</p></div>
            <Link className="text-sm" to="/allCategories">View all</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 8).map((cat, i) => (
              <motion.button whileHover={{ scale: 1.02 }} key={cat._id || i} onClick={() => navigate(`/subcategory/${cat.category_uuid || cat._id}`)} className={`lux-card p-5 text-left ${i % 3 === 0 ? 'lg:col-span-2' : ''}`}>
                <div className="h-36 overflow-hidden rounded-2xl bg-[#e9f2e6]">{cat.imageUrl && <img src={cat.imageUrl} alt={cat.name} className="h-full w-full object-cover" />}</div>
                <h3 className="mt-4 text-2xl font-semibold">{cat.name}</h3>
              </motion.button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-5xl font-semibold">Featured Pieces</h2>
          {loading ? <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[...Array(3)].map((_,i)=><LoadingSkeleton key={i} />)}</div> : <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{featured.map((p) => <ProductCard key={p._id} product={p} whatsappNumber={config.whatsappNumber || config.phone} />)}</div>}
        </section>
      </main>
      <Footer />
    </div>
  );
}
