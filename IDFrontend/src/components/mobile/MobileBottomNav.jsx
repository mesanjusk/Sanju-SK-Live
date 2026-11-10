import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaSearch, FaPhoneAlt, FaHeart, FaWhatsapp } from 'react-icons/fa';
import './pinterest-storefront.css';

// The same floating Home/Search/Saved dock on every public page.
// Explicit contact mode remains available for legacy integrations.
export default function MobileBottomNav({
  whatsappNumber='919372333633',phoneNumber='+919372333633',
  visible=true,variant='pinterest',onSearchClick
}){
  const navigate=useNavigate(),location=useLocation();
  const wa=String(whatsappNumber).replace(/\D/g,'')||'919372333633';
  const digits=String(phoneNumber).replace(/\D/g,'')||'919372333633';
  const dial='tel:'+(digits.length===10?'+91'+digits:'+'+digits);
  const chat='https://wa.me/'+wa+'?text='+encodeURIComponent('Hi Sanju SK Digital, I would like to enquire about your products.');
  const isHome=location.pathname==='/' && !new URLSearchParams(location.search).has('search');
  if(variant === 'pinterest'){
    return (
      <nav className={'sk-mobile-bottom-nav sk-floating-actions sk-pin-bottom-nav'+(visible?' is-visible':' is-hidden')}
        aria-label="Home, search and saved designs" aria-hidden={!visible}>
        <div className="sk-mobile-bottom-inner">
          <Link to="/" className={'sk-mobile-bottom-link'+(isHome?' is-active':'')}
            tabIndex={visible?0:-1} aria-label="Explore home" aria-current={isHome?'page':undefined}>
            <FaHome aria-hidden="true"/>
          </Link>
          <button type="button" className="sk-mobile-bottom-link" tabIndex={visible?0:-1}
            aria-label="Search designs" onClick={()=>onSearchClick?onSearchClick():navigate('/?search=1')}>
            <FaSearch aria-hidden="true"/>
          </button>
          <NavLink to="/favorites" aria-label="Saved and liked designs" tabIndex={visible?0:-1}
            className={({isActive})=>'sk-mobile-bottom-link'+(isActive?' is-active':'')}>
            <FaHeart aria-hidden="true"/>
          </NavLink>
        </div>
      </nav>
    );
  }
  return (
    <nav className={'sk-mobile-bottom-nav sk-floating-actions'+(visible?' is-visible':' is-hidden')}
      aria-label="Contact and saved designs" aria-hidden={!visible}>
      <div className="sk-mobile-bottom-inner">
        <a href={chat} target="_blank" rel="noopener noreferrer" className="sk-mobile-bottom-link"
          tabIndex={visible?0:-1} aria-label="WhatsApp SANJU SK Digital"><FaWhatsapp aria-hidden="true"/></a>
        <a href={dial} className="sk-mobile-bottom-link" tabIndex={visible?0:-1}
          aria-label="Call SANJU SK Digital"><FaPhoneAlt aria-hidden="true"/></a>
        <NavLink to="/favorites" aria-label="Saved designs" tabIndex={visible?0:-1}
          className={({isActive})=>'sk-mobile-bottom-link'+(isActive?' is-active':'')}>
          <FaHeart aria-hidden="true"/>
        </NavLink>
      </div>
    </nav>
  );
}
