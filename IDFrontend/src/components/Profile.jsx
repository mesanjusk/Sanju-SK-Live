import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaWhatsapp, FaInstagram, FaThLarge } from 'react-icons/fa';
import { BsGrid3X3, BsBookmark, BsPersonBoundingBox } from 'react-icons/bs';
import api from '../api';
import MobileBottomNav from './mobile/MobileBottomNav';
import LoadingSkeleton from './common/LoadingSkeleton';

export default function Profile() {
  const [config, setConfig] = useState({});
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    Promise.all([api.get('/api/confi/GetConfiList'), api.get('/api/listings')])
      .then(([conf, l]) => {
        setConfig(conf.data?.result?.[0] || {});
        setListings(Array.isArray(l.data) ? l.data : []);
      }).finally(() => setLoading(false));
  }, []);

  const wa = String(config.whatsappNumber || config.phone || '919999999999').replace(/\D/g, '');
  const postCount = listings.length;
  const initials = (config.name || 'S').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
        <span className="text-base font-semibold text-gray-900">
          {config.name || 'SK Digital'}
        </span>
        <div className="flex items-center gap-3 text-gray-700">
          <FaThLarge className="text-base" />
        </div>
      </header>

      {/* Profile Info */}
      <div className="px-4 pb-3 pt-5">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="h-20 w-20 flex-shrink-0 rounded-full bg-gradient-to-br from-pink-500 via-orange-400 to-yellow-400 p-[2px]">
            <div className="h-full w-full overflow-hidden rounded-full bg-white p-[2px]">
              {config.logo ? (
                <img src={config.logo} alt={config.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-2xl font-bold text-gray-500">
                  {initials}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-1 justify-around">
            <div className="text-center">
              <p className="text-base font-bold text-gray-900">{postCount}</p>
              <p className="text-xs text-gray-500">posts</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-gray-900">{config.followers || '4.5K'}</p>
              <p className="text-xs text-gray-500">followers</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-gray-900">{config.following || '180'}</p>
              <p className="text-xs text-gray-500">following</p>
            </div>
          </div>
        </div>

        {/* Name + Bio */}
        <div className="mt-3 space-y-0.5">
          <p className="text-sm font-semibold text-gray-900">{config.name || 'Sanju SK Digital'}</p>
          {config.bio && <p className="text-sm text-gray-700">{config.bio}</p>}
          {config.location && (
            <p className="text-xs text-gray-500">📍 {config.location}</p>
          )}
          {config.website && (
            <a href={config.website} target="_blank" rel="noreferrer" className="text-xs font-medium text-blue-600">
              {config.website}
            </a>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-3 flex gap-2">
          <a
            href={`https://wa.me/${wa}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#25D366] py-2 text-sm font-semibold text-white"
          >
            <FaWhatsapp /> Message
          </a>
          {config.insta ? (
            <a
              href={config.insta}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 py-2 text-sm font-semibold text-gray-700"
            >
              <FaInstagram /> Instagram
            </a>
          ) : (
            <Link
              to="/contact"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 py-2 text-sm font-semibold text-gray-700"
            >
              Contact
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex flex-1 items-center justify-center py-3 transition-colors ${
            activeTab === 'posts' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-400'
          }`}
        >
          <BsGrid3X3 className="text-lg" />
        </button>
        <button
          onClick={() => setActiveTab('tagged')}
          className={`flex flex-1 items-center justify-center py-3 transition-colors ${
            activeTab === 'tagged' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-400'
          }`}
        >
          <BsPersonBoundingBox className="text-lg" />
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex flex-1 items-center justify-center py-3 transition-colors ${
            activeTab === 'saved' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-400'
          }`}
        >
          <BsBookmark className="text-lg" />
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-3 gap-[2px] p-[2px]">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <p className="mt-16 text-center text-sm text-gray-400">No posts yet</p>
      ) : (
        <div className="grid grid-cols-3 gap-[2px]">
          {listings.map((p) => {
            const img = Array.isArray(p.images) ? p.images[0] : p.images;
            return (
              <Link key={p._id} to={`/products/${p._id}`} className="block">
                <div className="aspect-square overflow-hidden bg-gray-100">
                  {img ? (
                    <img
                      src={img}
                      alt={p.title}
                      className="h-full w-full object-cover transition-opacity duration-200"
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
      )}

      {/* Site Info */}
      <div className="mt-6 px-4 pb-4 text-center text-xs text-gray-400">
        <p>© {new Date().getFullYear()} {config.name || 'SK Digital'}. All rights reserved.</p>
        {config.email && <p className="mt-1">{config.email}</p>}
      </div>

      <MobileBottomNav />
    </div>
  );
}
