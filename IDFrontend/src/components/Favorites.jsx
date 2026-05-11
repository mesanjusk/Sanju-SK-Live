import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaRegBookmark } from 'react-icons/fa';
import { BsGrid3X3, BsHeart } from 'react-icons/bs';
import { useFavorites } from '../context/FavoritesContext';
import MobileHeader from './mobile/MobileHeader';
import MobileBottomNav from './mobile/MobileBottomNav';

function PostGrid({ items, emptyMsg }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full border-2 border-gray-300">
          <FaRegHeart className="text-3xl text-gray-400" />
        </div>
        <p className="text-base font-semibold text-gray-700">Nothing here yet</p>
        <p className="mt-1 text-sm text-gray-400">{emptyMsg}</p>
        <Link to="/" className="mt-5 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white">
          Browse Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-[2px]">
      {items.map((p) => {
        const img = Array.isArray(p.images) ? p.images[0] : p.images;
        return (
          <Link key={p._id} to={`/products/${p._id}`} className="block">
            <div className="aspect-square overflow-hidden bg-gray-100">
              {img ? (
                <img
                  src={img}
                  alt={p.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="h-full w-full bg-gray-200" />
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function Favorites() {
  const { favorites, liked, toggleFavorite } = useFavorites();
  const [tab, setTab] = useState('saved');

  return (
    <div className="min-h-screen bg-white pb-24">
      <MobileHeader />

      {/* Header */}
      <div className="px-4 py-3">
        <h1 className="text-base font-bold text-gray-900">Activity</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setTab('saved')}
          className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
            tab === 'saved' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-400'
          }`}
        >
          <FaRegBookmark className="text-base" /> Saved
          {favorites.length > 0 && (
            <span className="rounded-full bg-gray-900 px-1.5 py-0.5 text-[10px] text-white">
              {favorites.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('liked')}
          className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
            tab === 'liked' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-400'
          }`}
        >
          <FaHeart className={`text-base ${tab === 'liked' ? 'text-red-500' : ''}`} /> Liked
          {liked.length > 0 && (
            <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] text-white">
              {liked.length}
            </span>
          )}
        </button>
      </div>

      {tab === 'saved' && (
        <PostGrid items={favorites} emptyMsg="Save posts by tapping the ♡ icon" />
      )}
      {tab === 'liked' && (
        <PostGrid items={liked} emptyMsg="Double-tap any post to like it" />
      )}

      <MobileBottomNav />
    </div>
  );
}
