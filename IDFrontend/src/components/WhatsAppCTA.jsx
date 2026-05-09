import { SITE_META } from '../config/site';

const WhatsAppCTA = () => {
  const href = `https://wa.me/${SITE_META.whatsappNumber}?text=${encodeURIComponent(
    'Hi, I need help with my order on Sanju SK.'
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 rounded-full bg-green-500 px-4 py-3 font-semibold text-white shadow-lg transition hover:bg-green-600"
    >
      WhatsApp
    </a>
  );
};

export default WhatsAppCTA;
