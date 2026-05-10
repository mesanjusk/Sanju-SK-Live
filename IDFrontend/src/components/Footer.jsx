import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import api from '../api';

export default function Footer() {
  const [config, setConfig] = useState({});
  useEffect(() => {
    api.get('/api/confi/GetConfiList').then((res) => setConfig(res.data?.result?.[0] || {})).catch(() => {});
  }, []);
  const year = useMemo(() => new Date().getFullYear(), []);
  const wa = String(config.whatsappNumber || config.phone || '919999999999').replace(/\D/g, '');

  return (
    <footer className="px-3 pb-3 sm:px-6">
      <div className="lux-card overflow-hidden">
        <div className="lux-container grid gap-10 py-12 lg:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <h3 className="text-4xl font-semibold">{config.name || 'SK Luxury Studio'}</h3>
            <p className="mt-3 max-w-md text-sm text-[#516252]">A modern design atelier for premium invitations, print identities, and visual storytelling with editorial elegance.</p>
          </div>
          <div>
            <h4 className="text-sm uppercase tracking-[0.18em] text-[#6a7a6b]">Navigate</h4>
            <div className="mt-4 grid gap-2 text-sm">
              <Link to="/products">Products</Link><Link to="/allCategories">Categories</Link><Link to="/favorites">Favorites</Link><Link to="/contact">Contact</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm uppercase tracking-[0.18em] text-[#6a7a6b]">Connect</h4>
            <div className="mt-4 flex gap-2">
              <a className="lux-btn-soft" href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer"><FaWhatsapp /> WhatsApp</a>
              {config.insta && <a className="lux-btn-soft" href={config.insta}><FaInstagram /> Instagram</a>}
              {config.email && <a className="lux-btn-soft" href={`mailto:${config.email}`}><FaEnvelope /></a>}
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
