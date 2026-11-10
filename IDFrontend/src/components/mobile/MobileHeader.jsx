import { memo } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaSearch, FaWhatsapp } from 'react-icons/fa';
import './pinterest-storefront.css';

function MobileHeader() {
  return (
    <header className="sk-pin-header sk-public-header">
      <Link to="/" className="sk-pin-brand" aria-label="SANJU SK Digital homepage">
        <img className="sk-pin-brand-final-logo" src="/images/sk-digital-final.svg"
          alt="SK Digital logo" width="59" height="43" />
        <span className="sk-pin-brand-name">SANJU <b>SK</b>
          <small>DIGITAL · MAHI CREATION</small></span>
      </Link>
      <nav className="sk-public-header-actions" aria-label="Quick website actions">
        <Link to="/?search=1" aria-label="Search designs" className="sk-pin-top-action"><FaSearch/></Link>
        <Link to="/favorites" aria-label="Saved and liked designs" className="sk-pin-top-action"><FaHeart/></Link>
        <a href="https://wa.me/919372333633" target="_blank" rel="noopener noreferrer"
          aria-label="WhatsApp SANJU SK Digital" className="sk-pin-top-action"><FaWhatsapp/></a>
      </nav>
    </header>
  );
}
export default memo(MobileHeader);
