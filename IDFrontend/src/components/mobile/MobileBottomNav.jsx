import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaChevronUp, FaPhoneAlt, FaHeart, FaWhatsapp } from 'react-icons/fa';

// Show three quick actions while browsing. On downward scroll they collapse
// to a small More pill; the full dock comes back on reverse scrolling.
// At the actual footer, hide the floating dock so the information bar is usable.
export default function MobileBottomNav({
  whatsappNumber = '919372333633',
  phoneNumber = '+919372333633',
  compact = false,
  atFooter = false,
}) {
  const [expanded, setExpanded] = useState(false);
  useEffect(() => { setExpanded(false); }, [compact, atFooter]);
  const wa = String(whatsappNumber).replace(/\D/g, '') || '919372333633';
  const digits = String(phoneNumber).replace(/\D/g, '') || '919372333633';
  const dial = 'tel:' + (digits.length === 10 ? '+91' + digits : '+' + digits);
  const chat = 'https://wa.me/' + wa + '?text=' +
    encodeURIComponent('Hi Sanju SK Digital, I would like to enquire about your products.');

  if (atFooter) return null;
  if (compact && !expanded) {
    return (
      <button type="button" onClick={() => setExpanded(true)}
        aria-label="Show WhatsApp, Call and Saved actions" aria-expanded={false}
        className="sk-quick-more fixed right-2 z-40">
        <FaChevronUp aria-hidden="true" /><span>More</span>
      </button>
    );
  }
  return (
    <nav aria-label="Quick contact and saved designs"
      className="sk-floating-contact-nav fixed right-2 z-40 flex items-center gap-1.5 rounded-full border border-[#dfd0ef] bg-white/90 p-1.5 shadow-[0_5px_18px_rgba(9,43,26,.18)] backdrop-blur sm:right-5"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)' }}>
      <a href={chat} target="_blank" rel="noopener noreferrer"
        aria-label="WhatsApp SANJU SK Digital"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#74529e] text-lg text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700">
        <FaWhatsapp aria-hidden="true" />
      </a>
      <a href={dial} aria-label="Call SANJU SK Digital"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0e7fb] text-lg text-[#74529e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700">
        <FaPhoneAlt aria-hidden="true" />
      </a>
      <NavLink to="/favorites" aria-label="Saved designs"
        className={({ isActive }) => 'flex h-10 w-10 items-center justify-center rounded-full text-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700 ' +
          (isActive ? 'bg-[#74529e] text-white' : 'bg-[#f3ecfa] text-[#69518c]')}>
        <FaHeart aria-hidden="true" />
      </NavLink>
      {compact && (
        <button type="button" aria-label="Collapse quick actions" onClick={() => setExpanded(false)}
          className="sk-quick-collapse flex h-8 w-5 items-center justify-center text-[#74529e]">
          <FaChevronUp aria-hidden="true" className="rotate-180" />
        </button>
      )}
    </nav>
  );
}
