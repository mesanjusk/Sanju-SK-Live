import { memo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaSearch, FaWhatsapp } from 'react-icons/fa';
import api from '../../api';

function MobileHeader() {
  const [config, setConfig] = useState({});

  useEffect(() => {
    api.get('/api/confi/GetConfiList')
      .then((res) => setConfig(res.data?.result?.[0] || {}))
      .catch(() => {});
  }, []);

  const wa = String(config.whatsappNumber || config.phone || '919999999999').replace(/\D/g, '');

  return (
    <header className="sticky top-0 z-40 bg-white px-4 pb-2 pt-[max(env(safe-area-inset-top),0.75rem)]">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between">
        <Link to="/products" aria-label="Search" className="rounded-full p-2 text-gray-900 active:scale-95">
          <FaSearch className="text-lg" />
        </Link>
        <Link to="/" className="font-serif text-xl font-bold italic tracking-tight text-gray-900">
          {config.name || 'SK Digital'}
        </Link>
        <div className="flex items-center gap-1">
          <Link to="/favorites" aria-label="Favorites" className="rounded-full p-2 text-gray-900 active:scale-95">
            <FaHeart className="text-lg" />
          </Link>
          <a
            href={`https://wa.me/${wa}`}
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp"
            className="rounded-full p-2 active:scale-95"
          >
            <FaWhatsapp className="text-xl text-[#25D366]" />
          </a>
        </div>
      </div>
    </header>
  );
}

export default memo(MobileHeader);
