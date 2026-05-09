import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSearch, FaWhatsapp, FaHeart, FaChevronDown } from 'react-icons/fa';
import api from '../api';

const Navbar = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [config, setConfig] = useState({ name: '', logo: '', whatsappNumber: '', phone: '' });
  const [categories, setCategories] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get('/api/confi/GetConfiList'),
      api.get('/api/categories'),
    ]).then(([confiRes, catRes]) => {
      if (confiRes.data.success && confiRes.data.result.length > 0) {
        setConfig(confiRes.data.result[0]);
      }
      const cats = Array.isArray(catRes.data) ? catRes.data : catRes.data?.result || [];
      setCategories(cats.slice(0, 8));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  const waNumber = config.whatsappNumber || config.phone || '919999999999';
  const waHref = `https://wa.me/${waNumber.replace(/\D/g, '')}?text=${encodeURIComponent('Hi! I need help with your printing services.')}`;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  return (
    <header className={`sticky top-0 z-50 w-full transition-shadow duration-300 ${scrolled ? 'shadow-md' : ''}`}>
      {/* Announcement bar */}
      <div className="bg-[#075E54] py-1.5 text-center text-xs font-medium text-white">
        Free design consultation on WhatsApp &nbsp;·&nbsp;
        <a href={waHref} target="_blank" rel="noreferrer" className="underline hover:text-green-200">
          Chat now
        </a>
      </div>

      {/* Main header */}
      <div className="bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            {config.logo && (
              <img src={config.logo} alt={config.name || 'Logo'} className="h-10 w-10 rounded-full object-cover ring-2 ring-[#25D366]/30" />
            )}
            <span className="font-serif text-xl font-bold text-gray-900">
              {config.name || 'SK Cards'}
            </span>
          </Link>

          {/* Search bar — desktop */}
          <form onSubmit={handleSearch} className="mx-4 hidden flex-1 md:flex">
            <div className="flex w-full max-w-2xl overflow-hidden rounded-xl border border-gray-200 bg-gray-50 focus-within:border-[#25D366] focus-within:ring-2 focus-within:ring-[#25D366]/20 transition-all">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search wedding cards, visiting cards, banners..."
                className="flex-1 bg-transparent px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none"
              />
              <button type="submit" className="flex items-center gap-1.5 bg-[#25D366] px-5 text-sm font-semibold text-white hover:bg-[#128C7E] transition-colors">
                <FaSearch className="text-xs" />
                <span>Search</span>
              </button>
            </div>
          </form>

          {/* Right icons */}
          <div className="ml-auto flex items-center gap-3">
            {/* Search toggle — mobile */}
            <button
              type="button"
              onClick={() => setSearchOpen((p) => !p)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 md:hidden"
              aria-label="Search"
            >
              <FaSearch />
            </button>

            {/* Favourites */}
            <Link
              to="/favorites"
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
              aria-label="Favourites"
            >
              <FaHeart />
            </Link>

            {/* WhatsApp */}
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#128C7E] transition-colors sm:flex"
            >
              <FaWhatsapp className="text-base" />
              Order Now
            </a>
            <a href={waHref} target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white sm:hidden">
              <FaWhatsapp />
            </a>

            {/* Hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen((p) => !p)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 lg:hidden"
              aria-label="Menu"
            >
              {mobileOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className={`overflow-hidden transition-all duration-300 md:hidden ${searchOpen ? 'max-h-20 border-t border-gray-100 px-4 pb-3 pt-2' : 'max-h-0'}`}>
          <form onSubmit={handleSearch} className="flex overflow-hidden rounded-xl border border-gray-200 bg-gray-50 focus-within:border-[#25D366]">
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none"
            />
            <button type="submit" className="bg-[#25D366] px-4 text-white">
              <FaSearch className="text-xs" />
            </button>
          </form>
        </div>
      </div>

      {/* Category nav bar — desktop */}
      <div className="hidden border-t border-gray-100 bg-white lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-1 scrollbar-hide sm:px-6 lg:px-8">
          <Link to="/products" className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-[#128C7E] transition-colors">
            All Products
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/subcategory/${cat.category_uuid || cat._id}`}
              className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-[#128C7E] transition-colors"
            >
              {cat.name}
            </Link>
          ))}
          <Link to="/contact" className="ml-auto shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-[#128C7E] transition-colors">
            Contact
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`overflow-hidden border-t border-gray-100 bg-white transition-all duration-300 lg:hidden ${mobileOpen ? 'max-h-screen' : 'max-h-0'}`}>
        <nav className="space-y-0.5 px-4 py-3">
          {[
            { label: 'Home', to: '/' },
            { label: 'All Products', to: '/products' },
            { label: 'Categories', to: '/allCategories' },
            { label: 'Favourites', to: '/favorites' },
            { label: 'Contact', to: '/contact' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className="block rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-[#128C7E]"
            >
              {item.label}
            </Link>
          ))}
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/subcategory/${cat.category_uuid || cat._id}`}
              onClick={() => setMobileOpen(false)}
              className="block rounded-xl px-4 py-2.5 text-sm text-gray-600 hover:bg-green-50 hover:text-[#128C7E]"
            >
              {cat.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
