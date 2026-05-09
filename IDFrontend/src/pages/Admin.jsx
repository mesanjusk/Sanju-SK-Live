// 📁 src/pages/Admin.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api'

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [listings, setListings] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', category: '', price: '', status: 'Published' });

  useEffect(() => {
    const userNameFromState = location.state?.id;
    const user = userNameFromState || localStorage.getItem('User_name');
    setLoggedInUser(user);
    if (user) {
      fetchListings();
    } else {
      navigate("/");
    }
  }, [location.state, navigate]);

  const fetchListings = async () => {
    try {
      const response = await api.get('/api/listings');
      setListings(response.data);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to fetch listings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/listings/${id}`);
      fetchListings();
    } catch (err) {
      alert('Failed to delete item.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('User_name');
    navigate('/');
  };

  const handleAddListing = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/listings', formData);
      setFormData({ title: '', category: '', price: '', status: 'Published' });
      setShowAddForm(false);
      fetchListings();
    } catch (err) {
      alert('Failed to add listing.');
    }
  };

  const filteredListings = useMemo(() => {
    let filtered = listings.filter((item) =>
      item.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (selectedCategory) {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }
    if (statusFilter) {
      filtered = filtered.filter((item) => (item.status || 'Published') === statusFilter);
    }
    switch (sortBy) {
      case 'price-asc':
        return filtered.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return filtered.sort((a, b) => b.price - a.price);
      case 'newest':
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      default:
        return filtered;
    }
  }, [listings, searchTerm, sortBy, selectedCategory, statusFilter]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white shadow p-4 hidden sm:block">
        <h2 className="text-xl font-bold text-pink-600 mb-4">Admin Panel</h2>
        <button
          className="w-full bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
          onClick={handleLogout}
        >
          Logout
        </button>
        <nav className="mt-6 space-y-2">
          <button className="block w-full text-left hover:text-pink-600" onClick={() => setShowAddForm(false)}>All Listings</button>
          <button className="block w-full text-left hover:text-pink-600" onClick={() => setShowAddForm(true)}>Add New</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        

        {showAddForm ? (
          <form onSubmit={handleAddListing} className="max-w-xl mx-auto bg-white p-6 rounded shadow">
            <h2 className="text-lg font-bold mb-4">Add New Listing</h2>
            <input type="text" placeholder="Title" className="w-full mb-3 p-2 border rounded"
              value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            <input type="text" placeholder="Category" className="w-full mb-3 p-2 border rounded"
              value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required />
            <input type="number" placeholder="Price" className="w-full mb-3 p-2 border rounded"
              value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
            <select className="w-full mb-4 p-2 border rounded" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
            <button type="submit" className="bg-pink-600 text-white px-6 py-2 rounded hover:bg-pink-700">Submit</button>
          </form>
        ) : (
          <>
            <div className="flex flex-wrap gap-4 mb-6">
              <input
                type="text"
                placeholder="Search listings..."
                className="border border-gray-300 rounded px-4 py-2 flex-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="border border-gray-300 rounded px-4 py-2"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="">Sort By</option>
                <option value="price-asc">Price (Low → High)</option>
                <option value="price-desc">Price (High → Low)</option>
                <option value="newest">Newest First</option>
              </select>
              <select
                className="border border-gray-300 rounded px-4 py-2"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center text-gray-500">Loading...</div>
            ) : error ? (
              <div className="text-center text-red-600">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto border">
                  <thead className="bg-pink-600 text-white">
                    <tr>
                      <th className="px-4 py-2">Title</th>
                      <th className="px-4 py-2">Category</th>
                      <th className="px-4 py-2">Price</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredListings.map((item) => (
                      <tr key={item.id} className="bg-white border-b">
                        <td className="px-4 py-2">{item.title}</td>
                        <td className="px-4 py-2">{item.category}</td>
                        <td className="px-4 py-2">₹{item.price}</td>
                        <td className="px-4 py-2">{item.status || 'Published'}</td>
                        <td className="px-4 py-2 space-x-2">
                          <button className="text-sm text-blue-600 hover:underline">Edit</button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-sm text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Admin;
