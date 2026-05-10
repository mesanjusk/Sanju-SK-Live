import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaSearch, FaHeart } from 'react-icons/fa';
import api from '../api';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState('');
  const [config, setConfig] = useState({ name: '', logo: '' });
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/confi/GetConfiList').then((res) => {
      if (res.data?.result?.[0]) setConfig(res.data.result[0]);
    }).catch(() => {});
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    setQuery('');
  };

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6">
      <motion.div layout className={`lux-card ${scrolled ? 'shadow-[0_28px_80px_-42px_rgba(46,58,47,.45)]' : ''}`}>
        <div className="lux-container flex items-center gap-3 py-4">
          <Link to="/" className="flex items-center gap-3">
            {config.logo ? <img src={config.logo} alt="Logo" className="h-11 w-11 rounded-2xl object-cover" /> : null}
            <span className="text-2xl font-semibold tracking-wide">{config.name || 'SK Luxury Studio'}</span>
          </Link>

          <form onSubmit={handleSearch} className="mx-4 hidden flex-1 lg:block">
            <div className="flex items-center gap-2 rounded-full border border-[#dbe5d8] bg-white/80 p-1.5">
              <FaSearch className="ml-2 text-[#718272]" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Search refined designs..." />
              <button className="lux-btn-primary py-2">Explore</button>
            </div>
          </form>

          <nav className="ml-auto hidden items-center gap-2 lg:flex">
            {['Home', 'Products', 'Categories', 'Contact'].map((i) => (
              <Link key={i} to={i === 'Home' ? '/' : `/${i.toLowerCase()==='categories'?'allCategories':i.toLowerCase()}`} className="rounded-full px-4 py-2 text-sm text-[#324234] transition hover:bg-white/70">{i}</Link>
            ))}
            <Link to="/favorites" className="rounded-full bg-white/80 p-3"><FaHeart /></Link>
          </nav>

          <button className="rounded-full bg-white/80 p-3 lg:hidden" onClick={() => setOpen((p) => !p)}>{open ? <FaTimes /> : <FaBars />}</button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden lg:hidden">
              <div className="px-6 pb-5">
                <form onSubmit={handleSearch} className="mb-3 flex items-center gap-2 rounded-2xl border border-[#dbe5d8] bg-white p-2">
                  <FaSearch className="text-[#718272]" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Search..." />
                </form>
                <div className="grid gap-2">
                  <Link onClick={() => setOpen(false)} to="/" className="rounded-xl bg-white/80 px-4 py-2.5">Home</Link>
                  <Link onClick={() => setOpen(false)} to="/products" className="rounded-xl bg-white/80 px-4 py-2.5">Products</Link>
                  <Link onClick={() => setOpen(false)} to="/allCategories" className="rounded-xl bg-white/80 px-4 py-2.5">Categories</Link>
                  <Link onClick={() => setOpen(false)} to="/contact" className="rounded-xl bg-white/80 px-4 py-2.5">Contact</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </header>
  );
};

export default Navbar;
