import { useState, useEffect } from 'react';
import {
  FaBoxOpen, FaThLarge, FaSitemap, FaImages, FaUsers, FaCog,
  FaPrayingHands, FaBars, FaTimes, FaSignOutAlt, FaChartBar,
  FaWhatsapp, FaChartLine,
} from 'react-icons/fa';
import AnalyticsPage from '../pages/admin/AnalyticsPage';
import CreateListing from './CreateListing';
import AllListing from './allLisiting';
import AddUser from '../pages/addUser';
import AddConfi from '../pages/addConfi';
import AddReligion from '../pages/addReligion';
import UploadCategory from '../pages/UploadCategory';
import UploadSubcategory from '../pages/UploadSubcategory';
import UploadBanner from '../pages/UploadBanner';
import api from '../api';

const NAV = [
  { key: 'overview',      label: 'Overview',     Icon: FaChartBar },
  { key: 'analytics',     label: 'Analytics',    Icon: FaChartLine },
  { key: 'listings',      label: 'Products',      Icon: FaBoxOpen },
  { key: 'categories',    label: 'Categories',    Icon: FaThLarge },
  { key: 'subcategories', label: 'Subcategories', Icon: FaSitemap },
  { key: 'religions',     label: 'Religions',     Icon: FaPrayingHands },
  { key: 'banners',       label: 'Banners',       Icon: FaImages },
  { key: 'users',         label: 'Users',         Icon: FaUsers },
  { key: 'confis',        label: 'Settings',      Icon: FaCog },
];

function StatCard({ label, value, Icon, color }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value ?? '—'}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl text-white ${color}`}>
          <Icon />
        </div>
      </div>
    </div>
  );
}

function Overview({ onNavigate }) {
  const [stats, setStats] = useState({});

  useEffect(() => {
    Promise.all([
      api.get('/api/listings'),
      api.get('/api/categories'),
      api.get('/api/subcategories'),
      api.get('/api/banners'),
    ]).then(([l, c, s, b]) => {
      setStats({
        products:      (Array.isArray(l.data) ? l.data : []).length,
        categories:    (Array.isArray(c.data) ? c.data : []).length,
        subcategories: (Array.isArray(s.data) ? s.data : s.data?.result || []).length,
        banners:       (Array.isArray(b.data) ? b.data : []).length,
      });
    }).catch(() => {});
  }, []);

  return (
    <div>
      <h2 className="mb-6 font-serif text-2xl font-bold text-gray-900">Dashboard Overview</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Products"   value={stats.products}      Icon={FaBoxOpen}   color="bg-[#25D366]" />
        <StatCard label="Categories"       value={stats.categories}    Icon={FaThLarge}   color="bg-blue-500" />
        <StatCard label="Subcategories"    value={stats.subcategories} Icon={FaSitemap}   color="bg-purple-500" />
        <StatCard label="Banners"          value={stats.banners}       Icon={FaImages}    color="bg-amber-500" />
      </div>

      <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-gray-800">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: '+ Add Product',   key: 'listings' },
            { label: '+ Add Category',  key: 'categories' },
            { label: '+ Upload Banner', key: 'banners' },
            { label: '⚙ Settings',     key: 'confis' },
          ].map((a) => (
            <button
              key={a.key}
              onClick={() => onNavigate(a.key)}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 hover:border-[#25D366] hover:bg-green-50 hover:text-[#128C7E] transition-all"
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('adminTab') || 'overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleTab = (key) => {
    setActiveTab(key);
    localStorage.setItem('adminTab', key);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('User_name');
    localStorage.removeItem('adminTab');
    localStorage.removeItem('authToken');
    window.location.href = '/';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':      return <Overview onNavigate={handleTab} />;
      case 'analytics':     return <AnalyticsPage />;
      case 'listings':      return <CreateListing />;
      case 'alllistings':   return <AllListing />;
      case 'categories':    return <UploadCategory />;
      case 'subcategories': return <UploadSubcategory />;
      case 'banners':       return <UploadBanner />;
      case 'users':         return <AddUser />;
      case 'confis':        return <AddConfi />;
      case 'religions':     return <AddReligion />;
      default:              return <Overview onNavigate={handleTab} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile toggle */}
      <button
        className="fixed left-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-md lg:hidden"
        onClick={() => setSidebarOpen((p) => !p)}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed z-40 flex h-full w-60 flex-col bg-[#075E54] text-white shadow-xl transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#25D366]">
            <FaWhatsapp className="text-base" />
          </div>
          <span className="font-serif text-lg font-bold">SK Admin</span>
        </div>
        <div className="mx-4 border-t border-white/10" />

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-white/40">Management</p>
          {NAV.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => handleTab(key)}
              className={`mb-0.5 flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === key
                  ? 'bg-[#25D366] text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="shrink-0 text-sm" />
              {label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-4 pb-5">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-red-500/20 hover:text-white transition-all"
          >
            <FaSignOutAlt className="shrink-0 text-sm" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex min-h-screen flex-1 flex-col overflow-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3.5 pl-16 shadow-sm lg:pl-6">
          <div>
            <h1 className="text-sm font-semibold text-gray-900 capitalize">
              {NAV.find((n) => n.key === activeTab)?.label || 'Dashboard'}
            </h1>
            <p className="text-xs text-gray-400">SK Cards Admin Panel</p>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-green-50 px-3 py-1.5 text-xs font-semibold text-[#128C7E] hover:bg-green-100 transition-colors"
          >
            View Store ↗
          </a>
        </header>

        <div className="flex-1 p-5 lg:p-7">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
