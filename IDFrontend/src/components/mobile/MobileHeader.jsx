import { memo } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegUserCircle, FaSearch } from 'react-icons/fa';

function MobileHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/90 px-4 pb-3 pt-[max(env(safe-area-inset-top),0.75rem)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between">
        <Link to="/products" aria-label="Search" className="rounded-full p-2 text-gray-700 active:scale-95">
          <FaSearch />
        </Link>
        <Link to="/" className="text-base font-semibold tracking-tight text-gray-900">PrintSocial</Link>
        <div className="flex items-center gap-1">
          <Link to="/favorites" aria-label="Favorites" className="rounded-full p-2 text-gray-700 active:scale-95"><FaHeart /></Link>
          <Link to="/profile" aria-label="Profile" className="rounded-full p-2 text-gray-700 active:scale-95"><FaRegUserCircle /></Link>
        </div>
      </div>
    </header>
  );
}

export default memo(MobileHeader);
