import { NavLink } from 'react-router-dom';
import { FaHome, FaSearch, FaUserCircle } from 'react-icons/fa';

export default function MobileBottomNav({ visible = true }) {
  const goToSearch = () => {
    document.getElementById('sk-pinterest-search')?.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <nav aria-label="Pinterest-style mobile navigation"
      aria-hidden={!visible} className={'sk-pin-bottom-dock'+(visible?' is-visible':' is-hidden')}>
      <NavLink to="/" end aria-label="Home" tabIndex={visible ? 0 : -1}
        className={({isActive}) => 'sk-pin-bottom-icon'+(isActive?' is-active':'')}>
        <FaHome aria-hidden="true" />
      </NavLink>
      <button type="button" onClick={goToSearch} aria-label="Search designs"
        tabIndex={visible ? 0 : -1} className="sk-pin-bottom-icon">
        <FaSearch aria-hidden="true" />
      </button>
      <NavLink to="/favorites" aria-label="Saved designs" tabIndex={visible ? 0 : -1}
        className={({isActive}) => 'sk-pin-bottom-icon'+(isActive?' is-active':'')}>
        <FaUserCircle aria-hidden="true" />
      </NavLink>
    </nav>
  );
}
