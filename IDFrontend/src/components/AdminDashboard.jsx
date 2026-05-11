import { useState, useEffect } from 'react';
import {
  FaBoxOpen, FaThLarge, FaSitemap, FaImages, FaUsers, FaCog,
  FaPrayingHands, FaSignOutAlt, FaChartBar, FaChartLine, FaClipboardList,
  FaReceipt, FaMoneyBillWave, FaTasks, FaBook, FaEnvelope, FaQrcode, FaExchangeAlt, FaUserCheck,
  FaTag, FaDollarSign,
} from 'react-icons/fa';
import AnalyticsPage from '../pages/admin/AnalyticsPage';
import CategoryManager from '../pages/admin/CategoryManager';
import SubcategoryManager from '../pages/admin/SubcategoryManager';
import TitleManager from '../pages/admin/TitleManager';
import PriceManager from '../pages/admin/PriceManager';
import CreateListing from './CreateListing';
import AddUser from '../pages/addUser';
import AddConfi from '../pages/addConfi';
import AddReligion from '../pages/addReligion';
import UploadBanner from '../pages/UploadBanner';
import api from '../api';
import { DashboardLayout, PageContainer, StatCard, SurfaceCard, TopBar } from './admin/AdminUiKit';

const NAV = [
  { key: 'overview', label: 'Dashboard', Icon: FaChartBar },
  { key: 'orders', label: 'Orders', Icon: FaClipboardList },
  { key: 'receipt', label: 'Receipt', Icon: FaReceipt },
  { key: 'payment', label: 'Payment', Icon: FaMoneyBillWave },
  { key: 'followup', label: 'Followup', Icon: FaChartLine },
  { key: 'task', label: 'Task', Icon: FaTasks },
  { key: 'daybook', label: 'Day Book', Icon: FaBook },
  { key: 'sendemail', label: 'Send Email', Icon: FaEnvelope },
  { key: 'upi', label: 'UPI Payment', Icon: FaQrcode },
  { key: 't4d', label: 'Transaction 4D', Icon: FaExchangeAlt },
  { key: 'attendance', label: 'Attendance Reports', Icon: FaUserCheck },
  { key: 'analytics', label: 'Analytics', Icon: FaChartLine },
  { key: 'listings', label: 'Products', Icon: FaBoxOpen },
  { key: 'categories', label: 'Categories', Icon: FaThLarge },
  { key: 'subcategories', label: 'Subcategories', Icon: FaSitemap },
  { key: 'titles', label: 'Titles', Icon: FaTag },
  { key: 'prices', label: 'Prices', Icon: FaDollarSign },
  { key: 'religions', label: 'Religions', Icon: FaPrayingHands },
  { key: 'banners', label: 'Banners', Icon: FaImages },
  { key: 'users', label: 'Users', Icon: FaUsers },
  { key: 'confis', label: 'Settings', Icon: FaCog },
];

function Overview({ onNavigate }) {
  const [stats, setStats] = useState({});
  useEffect(() => {
    Promise.all([api.get('/api/listings'), api.get('/api/categories'), api.get('/api/subcategories'), api.get('/api/banners')])
      .then(([l, c, s, b]) => setStats({
        products: (Array.isArray(l.data) ? l.data : []).length,
        categories: (Array.isArray(c.data) ? c.data : []).length,
        subcategories: (Array.isArray(s.data) ? s.data : s.data?.result || []).length,
        banners: (Array.isArray(b.data) ? b.data : []).length,
      })).catch(() => {});
  }, []);

  return <PageContainer title="Dashboard" breadcrumb={['Admin', 'Dashboard']}>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total Products" value={stats.products} Icon={FaBoxOpen} />
      <StatCard label="Categories" value={stats.categories} Icon={FaThLarge} />
      <StatCard label="Subcategories" value={stats.subcategories} Icon={FaSitemap} />
      <StatCard label="Banners" value={stats.banners} Icon={FaImages} />
    </div>
    <SurfaceCard>
      <h3 className="mb-4 text-sm font-semibold text-gray-700">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: '+ Add Product', key: 'listings' },
          { label: '+ Add Category', key: 'categories' },
          { label: '+ Upload Banner', key: 'banners' },
          { label: 'Settings', key: 'confis' },
        ].map((a) => <button key={a.key} onClick={() => onNavigate(a.key)} className="rounded-xl border border-[#deebe1] bg-[#f6faf7] px-4 py-3 text-sm font-medium transition hover:bg-[#edf7f0]">{a.label}</button>)}
      </div>
    </SurfaceCard>
  </PageContainer>;
}

function PlaceholderPage({ title }) {
  return (
    <PageContainer title={title} breadcrumb={['Admin', title]}>
      <SurfaceCard>
        <p className="text-sm text-gray-600">
          This module is ready for integration with existing business workflows.
        </p>
      </SurfaceCard>
    </PageContainer>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('adminTab') || 'overview');
  const [collapsed, setCollapsed] = useState(false);
  const handleTab = (key) => { setActiveTab(key); localStorage.setItem('adminTab', key); };
  const handleLogout = () => { localStorage.removeItem('User_name'); localStorage.removeItem('adminTab'); localStorage.removeItem('authToken'); window.location.href = '/'; };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <Overview onNavigate={handleTab} />;
      case 'analytics': return <PageContainer title="Analytics" breadcrumb={['Admin', 'Analytics']}><AnalyticsPage /></PageContainer>;
      case 'listings': return <CreateListing />;
      case 'categories': return <CategoryManager />;
      case 'subcategories': return <SubcategoryManager />;
      case 'titles': return <TitleManager />;
      case 'prices': return <PriceManager />;
      case 'banners': return <UploadBanner />;
      case 'users': return <AddUser />;
      case 'confis': return <AddConfi />;
      case 'religions': return <AddReligion />;
      default: return <PlaceholderPage title={NAV.find((n) => n.key === activeTab)?.label || 'Module'} />;
    }
  };

  const title = NAV.find((n) => n.key === activeTab)?.label || 'Dashboard';
  const sidebar = <aside className={`fixed inset-y-0 left-0 z-50 flex ${collapsed ? 'w-[88px]' : 'w-[260px]'} flex-col border-r border-[#e6efe8] bg-white p-4 shadow-sm transition-all`}>
    <button onClick={() => setCollapsed((p) => !p)} className="mb-4 rounded-xl bg-[#f1f8f3] px-3 py-2 text-xs font-semibold text-[#4f9f73]">{collapsed ? 'Expand' : 'Collapse'}</button>
    <nav className="flex-1 space-y-1 overflow-auto pr-1">
      {NAV.map(({ key, label, Icon }) => <button key={key} onClick={() => handleTab(key)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${activeTab === key ? 'bg-[#edf7f0] text-[#2c7a50]' : 'text-gray-600 hover:bg-[#f6faf7]'}`}><Icon />{!collapsed && label}</button>)}
    </nav>
    <button onClick={handleLogout} className="mt-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600"><FaSignOutAlt />{!collapsed && 'Logout'}</button>
  </aside>;

  return <DashboardLayout sidebar={sidebar} header={<TopBar title={title} />} collapsed={collapsed}>{renderContent()}</DashboardLayout>;
}
