import { NavLink } from 'react-router-dom';
import { FaPhoneAlt, FaHeart, FaWhatsapp } from 'react-icons/fa';

// Primary contact actions stay one tap away, with only three visible icons.
export default function MobileBottomNav({ whatsappNumber = '919372333633', phoneNumber = '+919372333633' }) {
  const wa = String(whatsappNumber).replace(/\D/g, '') || '919372333633';
  const digits = String(phoneNumber).replace(/\D/g, '') || '919372333633';
  const dial = 'tel:' + (digits.length === 10 ? '+91' + digits : '+' + digits);
  const chat = 'https://wa.me/' + wa + '?text=' +
    encodeURIComponent('Hi Sanju SK Digital, I would like to enquire about your products.');

  return (
    <nav aria-label="Quick contact and saved designs"
      className="sk-floating-contact-nav fixed left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full border border-[#c8dcca] bg-white/95 px-3 py-2 shadow-[0_8px_30px_rgba(9,43,26,.22)] backdrop-blur"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}>
      <a href={chat} target="_blank" rel="noopener noreferrer"
        aria-label="WhatsApp SANJU SK Digital"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-[#176a43] text-xl text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
        <FaWhatsapp aria-hidden="true" />
      </a>
      <a href={dial} aria-label="Call SANJU SK Digital"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e7f3e9] text-xl text-[#176a43] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
        <FaPhoneAlt aria-hidden="true" />
      </a>
      <NavLink to="/favorites" aria-label="Saved designs"
        className={({ isActive }) => 'flex h-11 w-11 items-center justify-center rounded-full text-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ' +
          (isActive ? 'bg-[#176a43] text-white' : 'bg-[#f2f3ef] text-[#325c45]')}>
        <FaHeart aria-hidden="true" />
      </NavLink>
    </nav>
  );
}
