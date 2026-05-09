import React, { useState, useEffect } from 'react';
import api from '../api'
import { useNavigate } from "react-router-dom";

const UploadSubcategory = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('');
  const [subcategories, setSubcategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [viewImageModal, setViewImageModal] = useState({ open: false, imageUrl: '' });
  const [editModal, setEditModal] = useState({ open: false, subcategory: null });
  const [editName, setEditName] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editImage, setEditImage] = useState(null);
  const [editIsLoading, setEditIsLoading] = useState(false);

  useEffect(() => {
    const userNameFromState = location.state?.id;
    const user = userNameFromState || localStorage.getItem('User_name');
    setLoggedInUser(user);
    if (user) {
      fetchCategories();
      fetchSubcategories();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchCategories = () => {
    api
      .get('/api/categories/with-usage')
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('Error fetching categories:', err));
  };

  const fetchSubcategories = () => {
    api
      .get('/api/subcategories')
      .then((res) => setSubcategories(res.data))
      .catch((err) => console.error('Error fetching subcategories:', err));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setIsLoading(true);

    if (!name || !image || !categoryId) {
      setStatus('❌ Please provide name, image, and select a category.');
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('categoryId', categoryId);
    formData.append('image', image);

    try {
      await api.post('/api/subcategories', formData);
      setStatus('✅ Subcategory uploaded successfully!');
      setName('');
      setImage(null);
      setCategoryId('');
      fetchSubcategories();
    } catch (error) {
      console.error('Upload error:', error);
      setStatus('❌ Failed to upload subcategory.');
    } finally {
      setIsLoading(false);
      setModalOpen(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this subcategory?');
    if (!confirmed) return;
    try {
      await api.delete(`/api/subcategories/${id}`);
      fetchSubcategories();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const openImageModal = (imageUrl) => {
    setViewImageModal({ open: true, imageUrl });
  };

  const closeImageModal = () => {
    setViewImageModal({ open: false, imageUrl: '' });
  };

  const openEditModal = (sub) => {
    setEditModal({ open: true, subcategory: sub });
    setEditName(sub.name);
    setEditCategoryId(sub.categoryId?.category_uuid || sub.categoryId);
    setEditImage(null);
  };

  const closeEditModal = () => {
    setEditModal({ open: false, subcategory: null });
    setEditName('');
    setEditCategoryId('');
    setEditImage(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditIsLoading(true);

    if (!editName || !editCategoryId) {
      alert('Name and category are required.');
      setEditIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', editName);
    formData.append('categoryId', editCategoryId);
    if (editImage) {
      formData.append('image', editImage);
    }

    try {
      await api.put(`/api/subcategories/${editModal.subcategory._id}`, formData);
      fetchSubcategories();
      closeEditModal();
    } catch (error) {
      console.error('Edit error:', error);
      alert('Failed to update subcategory.');
    } finally {
      setEditIsLoading(false);
    }
  };

  const filteredSubcategories = subcategories.filter(sub =>
    sub.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2 className="admin-title">Subcategories</h2>
        <div className="flex flex-wrap items-center gap-3">
          <input type="text" placeholder="Search subcategories…" className="admin-search"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <button onClick={() => setModalOpen(true)} className="admin-btn-add">+ New Subcategory</button>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="admin-th w-20">Image</th>
              <th className="admin-th">Name</th>
              <th className="admin-th">Category</th>
              <th className="admin-th w-36 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubcategories.length === 0 ? (
              <tr><td colSpan={4} className="admin-empty">No subcategories found.</td></tr>
            ) : filteredSubcategories.map((sub) => (
              <tr key={sub._id}>
                <td className="admin-td">
                  <img src={sub.imageUrl} alt={sub.name}
                    className="h-12 w-12 cursor-pointer rounded-xl object-cover"
                    onClick={() => openImageModal(sub.imageUrl)} />
                </td>
                <td className="admin-td font-medium text-gray-900">{sub.name}</td>
                <td className="admin-td text-gray-500">
                  {categories.find(cat => cat.category_uuid === sub.categoryId)?.name || '—'}
                </td>
                <td className="admin-td">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEditModal(sub)} className="admin-btn-edit">Edit</button>
                    {!sub.isUsed && (
                      <button onClick={() => handleDelete(sub._id)} className="admin-btn-del">Delete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Image preview */}
      {viewImageModal.open && (
        <div className="admin-modal-bg" onClick={closeImageModal}>
          <img src={viewImageModal.imageUrl} alt="Subcategory"
            className="max-h-[85vh] max-w-[85vw] rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Create Modal */}
      {modalOpen && (
        <div className="admin-modal-bg">
          <div className="admin-modal">
            <h3 className="admin-modal-title">New Subcategory</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="admin-label">Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Hindu Wedding" className="admin-input" required />
              </div>
              <div>
                <label className="admin-label">Category</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                  className="admin-select" required>
                  <option value="">— Select Category —</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.category_uuid}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="admin-label">Image</label>
                <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])}
                  className="admin-input py-1.5" required />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="admin-btn-cancel">Cancel</button>
                <button type="submit" disabled={isLoading} className="admin-btn-save">
                  {isLoading ? 'Uploading…' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.open && (
        <div className="admin-modal-bg" onClick={closeEditModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="admin-modal-title">Edit Subcategory</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="admin-label">Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                  className="admin-input" required />
              </div>
              <div>
                <label className="admin-label">Category</label>
                <select value={editCategoryId} onChange={(e) => setEditCategoryId(e.target.value)}
                  className="admin-select" required>
                  <option value="">— Select Category —</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.category_uuid}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="admin-label">Replace Image (optional)</label>
                <input type="file" accept="image/*" onChange={(e) => setEditImage(e.target.files[0])}
                  className="admin-input py-1.5" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeEditModal} className="admin-btn-cancel">Cancel</button>
                <button type="submit" disabled={editIsLoading} className="admin-btn-save">
                  {editIsLoading ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadSubcategory;
