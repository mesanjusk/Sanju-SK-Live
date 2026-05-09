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
    <div className="admin-page">
      <Toaster position="top-right" />
      <div className="admin-header">
        <h2 className="admin-title">Banners</h2>
        <div className="flex flex-wrap items-center gap-3">
          <input type="text" placeholder="Search banners…" className="admin-search"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <button onClick={() => setNewBannerModalOpen(true)} className="admin-btn-add">+ New Banner</button>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="admin-th w-28">Preview</th>
              <th className="admin-th">Name</th>
              <th className="admin-th w-36 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBanners.length === 0 ? (
              <tr><td colSpan={3} className="admin-empty">No banners found.</td></tr>
            ) : filteredBanners.map((ban) => (
              <tr key={ban._id}>
                <td className="admin-td">
                  <img src={ban.imageUrl} alt={ban.name}
                    className="h-14 w-24 cursor-pointer rounded-xl object-cover"
                    onClick={() => setPreviewImage(ban.imageUrl)} />
                </td>
                <td className="admin-td font-medium text-gray-900">{ban.name}</td>
                <td className="admin-td">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditModal({ open: true, id: ban._id, name: ban.name })} className="admin-btn-edit">Edit</button>
                    <button onClick={() => handleDelete(ban._id)} className="admin-btn-del">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Image preview */}
      {previewImage && (
        <div className="admin-modal-bg" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} alt="Preview"
            className="max-h-[85vh] max-w-[90vw] rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Edit name modal */}
      {editModal.open && (
        <div className="admin-modal-bg">
          <div className="admin-modal">
            <h3 className="admin-modal-title">Edit Banner Name</h3>
            <div className="space-y-4">
              <div>
                <label className="admin-label">Name</label>
                <input value={editModal.name}
                  onChange={(e) => setEditModal((p) => ({ ...p, name: e.target.value }))}
                  className="admin-input" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setEditModal({ open: false, id: null, name: '' })} className="admin-btn-cancel">Cancel</button>
                <button onClick={handleEditSubmit} className="admin-btn-save">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New banner modal */}
      {newBannerModalOpen && (
        <div className="admin-modal-bg">
          <div className="admin-modal">
            <h3 className="admin-modal-title">New Banner</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="admin-label">Banner Name</label>
                <input type="text" value={bannerName} onChange={(e) => setBannerName(e.target.value)}
                  placeholder="e.g. Summer Sale" className="admin-input" />
              </div>
              <div>
                <label className="admin-label">Images (max 4 MB each)</label>
                <input type="file" multiple accept="image/*" onChange={handleFileChange}
                  className="admin-input py-1.5" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setNewBannerModalOpen(false)} className="admin-btn-cancel">Cancel</button>
                <button type="submit" disabled={isLoading} className="admin-btn-save">
                  {isLoading ? 'Uploading…' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadBanner;
