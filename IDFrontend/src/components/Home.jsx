import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';
import api from '../api';
import MobileHeader from './mobile/MobileHeader';
import StoryCategories from './mobile/StoryCategories';
import ProductFeedCard from './mobile/ProductFeedCard';
import MobileBottomNav from './mobile/MobileBottomNav';
import FloatingActionButtons from './mobile/FloatingActionButtons';
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

  const featured = useMemo(() => listings.slice(0, 12), [listings]);

  return (
    <div className="min-h-screen bg-[#fafafa] pb-24">
      <MobileHeader />
      <main className="mx-auto w-full max-w-2xl space-y-3 py-2">
        <section className="mx-4 overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
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

        <StoryCategories categories={categories.slice(0, 12)} onSelect={(cat) => navigate(`/subcategory/${cat.category_uuid || cat._id}`)} />

        <section>
          {loading ? <div className="mt-6 grid gap-4">{[...Array(4)].map((_,i)=><LoadingSkeleton key={i} />)}</div> : <div className="mt-2">{featured.map((p) => <ProductFeedCard key={p._id} product={p} whatsappNumber={config.whatsappNumber || config.phone} />)}</div>}
        </section>
      </main>
      <FloatingActionButtons whatsappNumber={config.whatsappNumber || config.phone} />
      <MobileBottomNav />
    </div>
  );
}
