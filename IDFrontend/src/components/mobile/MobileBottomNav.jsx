import { NavLink } from 'react-router-dom';
import { FaHome, FaThLarge, FaSearch, FaHeart, FaUser } from 'react-icons/fa';

const items = [
  { to: '/', icon: FaHome, label: 'Home' },
  { to: '/allCategories', icon: FaThLarge, label: 'Categories' },
  { to: '/products', icon: FaSearch, label: 'Search' },
  { to: '/favorites', icon: FaHeart, label: 'Favorites' },
  { to: '/login', icon: FaUser, label: 'Profile' },
];

export default function MobileBottomNav() {
  return <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/90 px-3 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur md:left-1/2 md:max-w-md md:-translate-x-1/2 md:rounded-2xl md:border md:shadow-lg"> <div className="mx-auto flex max-w-md items-center justify-around">{items.map(({ to, icon: Icon, label }) => <NavLink key={to} to={to} className={({ isActive }) => `flex flex-col items-center gap-1 px-2 py-1 text-[11px] ${isActive ? 'text-green-600' : 'text-gray-500'}`}><Icon className="text-base" />{label}</NavLink>)}</div></nav>;
}
