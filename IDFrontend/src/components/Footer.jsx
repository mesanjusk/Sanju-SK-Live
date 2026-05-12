import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaInstagram, FaWhatsapp, FaEnvelope, FaChevronDown, FaChevronUp, FaThLarge } from 'react-icons/fa';
import api from '../api';

export default function Footer() {
  const [config, setConfig] = useState({});
  const [categories, setCategories] = useState([]);
  const [showCats, setShowCats] = useState(false);
  const navigate = useNavigate();
  const year = useMemo(() => new Date().getFullYear(), []);
  const wa = String(config.whatsappNumber || config.phone || '919999999999').replace(/\D/g, '');

  useEffect(() => {
    api.get('/api/confi/GetConfiList')
      .then((res) => setConfig(res.data?.result?.[0] || {}))
      .catch(() => {});
    api.get('/api/categories')
      .then((res) => setCategories(Array.isArray(res.data) ? res.data : res.data?.result || []))
      .catch(() => {});
  }, []);

  const handleCatClick = (cat) => {
    navigate(`/allCategories`, { state: { preselect: cat._id } });
    setShowCats(false);
  };

  return (
    <footer className="px-3 pb-3 sm:px-6">
      <div className="lux-card overflow-hidden">
        <div className="lux-container grid gap-10 py-12 lg:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <h3 className="text-4xl font-semibold">{config.name || 'SK Luxury Studio'}</h3>
            <p className="mt-3 max-w-md text-sm text-[#516252]">
              A modern design atelier for premium invitations, print identities, and visual storytelling with editorial elegance.
            </p>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-[0.18em] text-[#6a7a6b]">Navigate</h4>
            <div className="mt-4 grid gap-2 text-sm">
              <Link to="/products">Products</Link>
              <Link to="/favorites">Favorites</Link>
              <Link to="/contact">Contact</Link>
              {/* Explore / Categories — expandable */}
              <button
                onClick={() => setShowCats((v) => !v)}
                className="flex items-center gap-1.5 text-left font-medium text-[#2E3A2F] hover:underline"
              >
                <FaThLarge className="text-xs" />
                Explore Categories
                {showCats ? <FaChevronUp className="ml-auto text-xs" /> : <FaChevronDown className="ml-auto text-xs" />}
              </button>

              {showCats && (
                <div className="mt-2 flex flex-wrap gap-2 pl-1">
                  <button
                    onClick={() => { navigate('/allCategories'); setShowCats(false); }}
                    className="rounded-full border border-[#9db69a] px-3 py-1 text-xs font-medium text-[#2E3A2F] hover:bg-[#eef5eb]"
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => handleCatClick(cat)}
                      className="rounded-full border border-[#9db69a] px-3 py-1 text-xs font-medium text-[#2E3A2F] hover:bg-[#eef5eb] transition-colors"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-[0.18em] text-[#6a7a6b]">Connect</h4>
            <div className="mt-4 flex flex-wrap gap-2">
              <a className="lux-btn-soft" href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">
                <FaWhatsapp /> WhatsApp
              </a>
              {config.insta && (
                <a className="lux-btn-soft" href={config.insta} target="_blank" rel="noreferrer">
                  <FaInstagram /> Instagram
                </a>
              )}
              {config.email && (
                <a className="lux-btn-soft" href={`mailto:${config.email}`}>
                  <FaEnvelope />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="lux-divider" />
        <div className="lux-container flex flex-col gap-2 py-4 text-xs text-[#697869] sm:flex-row sm:justify-between">
          <span>© {year} {config.name || 'SK Luxury Studio'}.</span>
          <Link to="/login">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
