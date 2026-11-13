import { NavLink } from 'react-router-dom';
import { FaHome, FaCompass, FaHeart, FaWhatsapp, FaPhoneAlt } from 'react-icons/fa';

const pages = [
  {to:'/',label:'Home feed',Icon:FaHome,end:true},
  {to:'/allCategories',label:'Explore designs',Icon:FaCompass},
  {to:'/favorites',label:'Saved and liked',Icon:FaHeart},
];
export default function PinterestDesktopRail() {
  return (
    <aside className="sk-pin-desktop-rail" aria-label="Desktop shopping navigation">
      <nav className="sk-pin-rail-main" aria-label="Browse SanjuSK">
        <NavLink to="/" className="sk-pin-rail-logo" aria-label="SANJU SK Digital Home">
          <img src="/images/sk-digital-final.svg" width="51" height="48" alt="SK Digital"/>
        </NavLink>
        {pages.map(({to,label,Icon,end}) => <NavLink key={to} to={to} end={end}
          title={label}
          className={({isActive})=>'sk-pin-rail-link'+(isActive?' is-current':'')}
          aria-label={label}><Icon aria-hidden="true"/><span>{label}</span></NavLink>)}
      </nav>
      <nav className="sk-pin-rail-bottom" aria-label="Contact options">
        <a className="sk-pin-rail-link" href="https://wa.me/919372333633"
          target="_blank" rel="noopener noreferrer" title="WhatsApp quotation"
          aria-label="WhatsApp quotation"><FaWhatsapp aria-hidden="true"/><span>WhatsApp</span></a>
        <NavLink className={({isActive})=>'sk-pin-rail-link'+(isActive?' is-current':'')}
          to="/contact" title="Contact studio" aria-label="Contact studio"><FaPhoneAlt aria-hidden="true"/><span>Contact</span></NavLink>
      </nav>
    </aside>
  );
}
