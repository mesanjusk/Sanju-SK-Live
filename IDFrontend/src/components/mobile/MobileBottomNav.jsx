import { NavLink } from 'react-router-dom';
import { FaPhoneAlt, FaHeart, FaWhatsapp } from 'react-icons/fa';

// Compact floating pill, with the existing scroll-aware visibility behaviour.
 // The footer is no longer occupied by a full-width fixed navigation bar.
export default function MobileBottomNav({ whatsappNumber = '919372333633', phoneNumber = '+919372333633', visible = true }) {
  const wa = String(whatsappNumber).replace(/\D/g, '') || '919372333633';
  const digits = String(phoneNumber).replace(/\D/g, '') || '919372333633';
  const dial = 'tel:' + (digits.length === 10 ? '+91' + digits : '+' + digits);
  const chat = 'https://wa.me/' + wa + '?text=' +
    encodeURIComponent('Hi Sanju SK Digital, I would like to enquire about your products.');
  return (
    <nav className={'sk-mobile-bottom-nav sk-floating-actions' + (visible ? ' is-visible' : ' is-hidden')}
      aria-label="Contact and saved designs" aria-hidden={!visible}>
      <div className="sk-mobile-bottom-inner">
        <a href={chat} target="_blank" rel="noopener noreferrer"
          className="sk-mobile-bottom-link" tabIndex={visible ? 0 : -1} aria-label="WhatsApp SANJU SK Digital">
          <FaWhatsapp aria-hidden="true" />
        </a>
        <a href={dial} className="sk-mobile-bottom-link" tabIndex={visible ? 0 : -1}
          aria-label="Call SANJU SK Digital">
          <FaPhoneAlt aria-hidden="true" />
        </a>
        <NavLink to="/favorites" aria-label="Saved designs" tabIndex={visible ? 0 : -1}
          className={({isActive}) => 'sk-mobile-bottom-link' + (isActive ? ' is-active' : '')}>
          <FaHeart aria-hidden="true" />
        </NavLink>
      </div>
    </nav>
  );
}
