import { memo } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaSearch, FaWhatsapp } from 'react-icons/fa';
import './pinterest-storefront.css';

// Same SK mark, brand typography and quick actions as the discovery home.
function MobileHeader(){
  return (
    <header className="sk-pin-header sk-public-header">
      <Link to="/" className="sk-pin-brand" aria-label="SANJU SK Digital home">
        <img className="sk-pin-brand-final-logo" src="/images/sk-digital-final.svg"
          width="59" height="43" alt="SK Digital logo"/>
        <span className="sk-pin-brand-name">SANJU <b>SK</b><small>DIGITAL · MAHI CREATION</small></span>
      </Link>
      <nav className="sk-pin-header-actions" aria-label="Quick actions">
        <Link className="sk-pin-top-action" to="/?search=1" aria-label="Search designs"><FaSearch/></Link>
        <Link className="sk-pin-top-action" to="/favorites" aria-label="Saved and liked designs"><FaHeart/></Link>
        <a className="sk-pin-top-action" href="https://wa.me/919372333633" target="_blank"
          rel="noopener noreferrer" aria-label="Chat on WhatsApp"><FaWhatsapp/></a>
      </nav>
    </header>
  );
}
export default memo(MobileHeader);
