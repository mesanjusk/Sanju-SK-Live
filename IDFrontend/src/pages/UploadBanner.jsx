import React, { useState, useEffect } from 'react';
import api from '../api'
import { useNavigate, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const API_URL = '/api/banners';

const UploadBanner = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [bannerName, setBannerName] = useState('');
  const [bannerImages, setBannerImages] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [editModal, setEditModal] = useState({ open: false, id: null, name: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [newBannerModalOpen, setNewBannerModalOpen] = useState(false);

  useEffect(() => {
    const userFromState = location.state?.id;
    const storedUser = userFromState || localStorage.getItem('User_name');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setLoggedInUser(storedUser);
    fetchBanners();
  }, [location.state, navigate]);

  const fetchBanners = async () => {
    try {
      const res = await api.get(API_URL);
      setBanners(res.data.reverse());
    } catch (err) {
      toast.error('Error fetching banners');
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => file.size <= 4 * 1024 * 1024);
    if (validFiles.length !== files.length) {
      toast.error('Some files exceed 4MB and were excluded.');
    }
    setBannerImages(validFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bannerName || bannerImages.length === 0) {
      toast.error('Please provide a name and at least one image.');
      return;
    }

    setIsLoading(true);
    const uploads = bannerImages.map(async (image) => {
      const formData = new FormData();
      formData.append('name', bannerName);
      formData.append('image', image);
      return api.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    });

    try {
      await Promise.all(uploads);
      toast.success('Banners uploaded successfully!');
      setBannerName('');
      setBannerImages([]);
      setNewBannerModalOpen(false);
      fetchBanners();
    } catch (err) {
      toast.error('Upload failed.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      await api.delete(`${API_URL}/${id}`);
      toast.success('Banner deleted');
      fetchBanners();
    } catch (err) {
      toast.error('Delete failed');
      console.error('Delete error:', err);
    }
  };

  const handleEditSubmit = async () => {
    if (!editModal.name.trim()) return;
    try {
      await api.put(`${API_URL}/${editModal.id}`, { name: editModal.name });
      toast.success('Banner name updated');
      setEditModal({ open: false, id: null, name: '' });
      fetchBanners();
    } catch (err) {
      toast.error('Edit failed');
      console.error('Edit error:', err);
    }
  };

  const filteredBanners = banners.filter((ban) =>
    ban.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Upload Banner</h2>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={() => setNewBannerModalOpen(true)}
        >
          + New Banner
        </button>
      </div>

      <input
        type="text"
        placeholder="Search banners..."
        className="w-full p-2 mb-4 border border-gray-300 rounded"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Image</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBanners.map((ban) => (
              <tr key={ban._id} className="text-center">
                <td className="p-2 border">
                  <img
                    src={ban.imageUrl}
                    alt={ban.name}
                    className="h-12 mx-auto cursor-pointer"
                    onClick={() => setPreviewImage(ban.imageUrl)}
                  />
                </td>
                <td className="p-2 border">{ban.name}</td>
                <td className="p-2 border space-x-2">
                  <button
                    className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500"
                    onClick={() => setEditModal({ open: true, id: ban._id, name: ban.name })}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    onClick={() => handleDelete(ban._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredBanners.length === 0 && (
              <tr>
                <td colSpan="3" className="p-4 text-center text-gray-500">
                  No banners found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white p-4 rounded shadow-lg max-w-lg">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 text-gray-500 text-lg"
            >✖</button>
            <img src={previewImage} alt="Preview" className="max-h-[75vh] mx-auto" />
          </div>
        </div>
      )}

      {editModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg space-y-4 w-full max-w-md">
            <h2 className="text-lg font-semibold">Edit Banner Name</h2>
            <input
              value={editModal.name}
              onChange={(e) => setEditModal((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full border p-2 rounded"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditModal({ open: false, id: null, name: '' })}
                className="px-3 py-1 border rounded"
              >Cancel</button>
              <button
                onClick={handleEditSubmit}
                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
              >Save</button>
            </div>
          </div>
        </div>
      )}

      {newBannerModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg space-y-4 w-full max-w-md">
            <h2 className="text-lg font-semibold">New Banner</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={bannerName}
                onChange={(e) => setBannerName(e.target.value)}
                placeholder="Banner Name"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewBannerModalOpen(false)}
                  className="px-3 py-1 border rounded"
                >Cancel</button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                >Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadBanner;
