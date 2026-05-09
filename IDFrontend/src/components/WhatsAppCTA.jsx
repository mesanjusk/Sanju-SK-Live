import { useEffect, useState } from 'react';
import { FaWhatsapp, FaTimes } from 'react-icons/fa';
import api from '../api';
import { trackWhatsAppClick } from '../hooks/useAnalytics';

const WhatsAppCTA = () => {
  const [waNumber, setWaNumber] = useState('919999999999');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    api.get('/api/confi/GetConfiList')
      .then((res) => {
        if (res.data?.success && res.data.result.length > 0) {
          const c = res.data.result[0];
          const num = c.whatsappNumber || c.phone || '919999999999';
          setWaNumber(String(num).replace(/\D/g, ''));
        }
      })
      .catch(() => {});
  }, []);

  if (!visible) return null;

  const href = `https://wa.me/${waNumber}?text=${encodeURIComponent('Hi! I need help with an order from your website.')}`;

  return (
    <div className="fixed bottom-6 right-5 z-50 flex flex-col items-end gap-2">
      {/* Tooltip */}
      <div className="animate-fade-in rounded-xl bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-lg ring-1 ring-gray-100">
        Chat with us 👋
      </div>

      {/* Main button */}
      <div className="relative">
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] wa-pulse" />
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label="Chat on WhatsApp"
          onClick={() => trackWhatsAppClick()}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl hover:bg-[#128C7E] transition-colors"
        >
          <FaWhatsapp className="text-2xl" />
        </a>
        {/* Dismiss */}
        <button
          onClick={() => setVisible(false)}
          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-500 text-white hover:bg-gray-700 transition-colors"
          aria-label="Dismiss"
        >
          <FaTimes className="text-[9px]" />
        </button>
      </div>
    </div>
  );
};

export default WhatsAppCTA;
