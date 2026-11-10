import { Link, NavLink } from 'react-router-dom';
import { FaHome, FaSearch, FaPhoneAlt, FaHeart, FaWhatsapp } from 'react-icons/fa';

// One reusable floating navigation for every public route. Search is always
// actionable, even on Saved / Liked / Contact / Product detail pages.
export default function MobileBottomNav({
  whatsappNumber = '919372333633',
  phoneNumber = '+919372333633',
  visible = true,
  variant = 'pinterest',
  onSearchClick,
}) {
  const wa = String(whatsappNumber).replace(/\D/g, '') || '919372333633';
  const digits = String(phoneNumber).replace(/\D/g, '') || '919372333633';
  const dial = 'tel:' + (digits.length === 10 ? '+91' + digits : '+' + digits);
  const chat = 'https://wa.me/' + wa + '?text=' +
    encodeURIComponent('Hi Sanju SK Digital, I would like to enquire about your products.');
  const navClass = 'sk-mobile-bottom-nav sk-floating-actions' +
    (variant === 'pinterest' ? ' sk-pin-bottom-nav' : '') +
    (visible ? ' is-visible' : ' is-hidden');

  if (variant === 'pinterest') {
    return (
      <nav className={navClass} aria-label="Home, search and saved designs" aria-hidden={!visible}>
        <div className="sk-mobile-bottom-inner">
          <NavLink to="/" end tabIndex={visible ? 0 : -1} aria-label="Explore home"
            className={({ isActive }) => 'sk-mobile-bottom-link' + (isActive ? ' is-active' : '')}>
            <FaHome aria-hidden="true"/>
          </NavLink>
          {onSearchClick ? (
            <button type="button" className="sk-mobile-bottom-link" tabIndex={visible ? 0 : -1}
              aria-label="Search designs" onClick={onSearchClick}><FaSearch aria-hidden="true"/></button>
          ) : (
            <Link to="/?search=1" className="sk-mobile-bottom-link" tabIndex={visible ? 0 : -1}
              aria-label="Search designs"><FaSearch aria-hidden="true"/></Link>
          )}
          <NavLink to="/favorites" tabIndex={visible ? 0 : -1} aria-label="Saved and liked designs"
            className={({ isActive }) => 'sk-mobile-bottom-link' + (isActive ? ' is-active' : '')}>
            <FaHeart aria-hidden="true"/>
          </NavLink>
        </div>
      </nav>
    );
  }
  return (
    <nav className={navClass} aria-label="Contact and saved designs" aria-hidden={!visible}>
      <div className="sk-mobile-bottom-inner">
        <a href={chat} target="_blank" rel="noopener noreferrer" className="sk-mobile-bottom-link"
          tabIndex={visible ? 0 : -1} aria-label="WhatsApp SANJU SK Digital"><FaWhatsapp aria-hidden="true"/></a>
        <a href={dial} className="sk-mobile-bottom-link" tabIndex={visible ? 0 : -1}
          aria-label="Call SANJU SK Digital"><FaPhoneAlt aria-hidden="true"/></a>
        <NavLink to="/favorites" tabIndex={visible ? 0 : -1} aria-label="Saved designs"
          className={({isActive}) => 'sk-mobile-bottom-link' + (isActive ? ' is-active' : '')}>
          <FaHeart aria-hidden="true"/>
        </NavLink>
      </div>
    </nav>
  );
}
