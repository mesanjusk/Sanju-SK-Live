import { useEffect, useState } from 'react';
import { FaBars, FaShoppingCart, FaTimes, FaUserCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';

const menuItems = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/products' },
  { label: 'Categories', to: '/allCategories' },
  { label: 'Favourites', to: '/favorites' },
  { label: 'Contact', to: '/contact' },
];

const Navbar = () => {
  const { items } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [config, setConfig] = useState({ name: 'SK Cards', logo: '' });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await api.get('/api/confi/GetConfiList');
        if (response.data.success && response.data.result.length > 0) {
          setConfig(response.data.result[0]);
        }
      } catch (error) {
        console.error('Failed to fetch configuration:', error);
      }
    };

    fetchConfig();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-800">
          {config.logo ? (
            <img src={config.logo} alt={config.name || 'Logo'} className="h-9 w-9 rounded-full object-cover" />
          ) : null}
          <span>{config.name || 'SK Cards'}</span>
        </Link>

        <nav className="hidden flex-1 justify-center md:flex">
          <ul className="flex items-center gap-7">
            {menuItems.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className="group relative text-sm font-medium text-gray-700 transition-all duration-300 hover:text-red-600"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-red-600 transition-all duration-300 group-hover:w-full" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative text-xl text-gray-700 transition-all duration-300 hover:text-red-600">
            <FaShoppingCart />
            {items.length > 0 && (
              <span className="absolute -right-2 -top-2 rounded-full bg-red-600 px-1.5 py-0.5 text-xs text-white">
                {items.length}
              </span>
            )}
          </Link>
          <Link
            to="/login"
            className="hidden text-2xl text-gray-700 transition-all duration-300 hover:text-red-600 md:block"
          >
            <FaUserCircle />
          </Link>
          <button
            type="button"
            className="text-xl text-gray-700 md:hidden"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden border-t border-gray-100 bg-white transition-all duration-300 md:hidden ${
          isMobileMenuOpen ? 'max-h-80 py-2' : 'max-h-0 py-0'
        }`}
      >
        <ul className="space-y-1 px-4">
          {menuItems.map((item) => (
            <li key={item.label}>
              <Link
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-300 hover:bg-gray-50 hover:text-red-600"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-300 hover:bg-gray-50 hover:text-red-600"
            >
              Profile
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Navbar;
