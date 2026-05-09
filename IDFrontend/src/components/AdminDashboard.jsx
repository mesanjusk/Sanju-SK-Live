import React, { useState, useEffect } from 'react';
import UploadCategory from '../pages/UploadCategory';
import UploadSubcategory from '../pages/UploadSubcategory';
import UploadBanner from '../pages/UploadBanner';
import CreateListing from './CreateListing';
import AllListing from './allLisiting';
import AddUser from '../pages/addUser';
import AddConfi from '../pages/addConfi';
import AddReligion from '../pages/addReligion';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const savedTab = localStorage.getItem('adminTab');
    const savedSidebar = localStorage.getItem('sidebarOpen');
    if (savedTab) setActiveTab(savedTab);
    if (savedSidebar !== null) setSidebarOpen(savedSidebar === 'true');
  }, []);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    localStorage.setItem('adminTab', tabKey);
    setSidebarOpen(false); // Auto-close sidebar on tab change
    localStorage.setItem('sidebarOpen', false);
  };

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem('sidebarOpen', newState);
  };

  const handleLogout = () => {
    localStorage.removeItem('User_name');
    localStorage.removeItem('adminTab');
    localStorage.removeItem('sidebarOpen');
    window.location.href = '/';
  };

  const tabs = [
    { key: 'listings', label: '📁 Item' },
    { key: 'categories', label: '📂 Categories' },
    { key: 'subcategories', label: '📁 Subcategories' },
    
    { key: 'religions', label: '🛐 Religions' },   
    
    { key: 'confis', label: '⚙️ Configuration' },
    { key: 'banners', label: '📁 Banners' },
    { key: 'users', label: '👥 Users' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Toggle Button */}
      <button
        className="sm:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-md shadow-md"
        onClick={toggleSidebar}
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed z-40 sm:static top-0 left-0 h-full w-64 bg-white shadow-lg p-4 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
        }`}
      >
        <h2 className="text-xl font-bold text-blue-600 mb-6">🛠 Dashboard</h2>
        <nav className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`block w-full text-left px-4 py-2 rounded ${
                activeTab === tab.key ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="mt-6 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
        >
          🔒 Logout
        </button>
      </aside>

      {/* Overlay when sidebar is open on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 sm:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6">
        
        <div className="min-h-screen p-6 ">
          {activeTab === 'categories' && <UploadCategory />}
          {activeTab === 'subcategories' && <UploadSubcategory />}
          {activeTab === 'banners' && <UploadBanner />}
          {activeTab === 'listings' && <CreateListing />}
          {activeTab === 'allListing' && <AllListing />}
          {activeTab === 'users' && <AddUser />}
          {activeTab === 'confis' && <AddConfi />}
          {activeTab === 'religions' && <AddReligion />}
        </div>
      </main>
    </div>
  );
}
