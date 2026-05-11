import { NavLink } from 'react-router-dom';
import { FaHome, FaThLarge, FaPhoneAlt, FaHeart, FaUser } from 'react-icons/fa';

const items = [
  { to: '/', icon: FaHome, label: 'Home' },
  { to: '/allCategories', icon: FaThLarge, label: 'Explore' },
  { to: '/contact', icon: FaPhoneAlt, label: 'Contact' },
  { to: '/favorites', icon: FaHeart, label: 'Saved' },
  { to: '/profile', icon: FaUser, label: 'Profile' },
];

export default function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 px-3 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur md:left-1/2 md:max-w-md md:-translate-x-1/2 md:rounded-t-2xl md:shadow-lg">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] transition-colors ${
                isActive ? 'font-semibold text-gray-900' : 'text-gray-400'
              }`
            }
          >
            <Icon className="text-[18px]" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
