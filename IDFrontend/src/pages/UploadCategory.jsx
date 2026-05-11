import React, { useState, useEffect } from 'react';
import api from '../api'
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const API_URL = '/api/categories';

const UploadCategory = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [usedCategoryNames, setUsedCategoryNames] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryImage, setEditCategoryImage] = useState(null);
  const [editPreviewImage, setEditPreviewImage] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const user = location.state?.id || localStorage.getItem('User_name');
    if (!user) navigate('/login');
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/categories/with-usage');
      const data = Array.isArray(res.data) ? res.data : [];
      setCategories(data);
      setFilteredCategories(data);
      setUsedCategoryNames(data.map((cat) => cat.name.toLowerCase()));
    } catch (err) {
      try {
        const fallback = await api.get('/api/categories');
        const data = Array.isArray(fallback.data) ? fallback.data : [];
        setCategories(data);
        setFilteredCategories(data);
        setUsedCategoryNames(data.map((cat) => cat.name.toLowerCase()));
      } catch (fallbackErr) {
        toast.error('Failed to fetch categories.');
      }
    }
  };

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [searchTerm, categories]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const name = categoryName.trim();
    if (!name || !categoryImage) return toast.error('Name and image required.');
    if (usedCategoryNames.includes(name.toLowerCase())) return toast.error('Name already exists.');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('image', categoryImage);

    try {
      await api.post(API_URL, formData);
      toast.success('Category created.');
      setCategoryName('');
      setCategoryImage(null);
      setPreviewImage(null);
      setIsCreateModalOpen(false);
      fetchCategories();
    } catch {
      toast.error('Upload failed.');
    }
  };

  const handleFileChange = (e, type = 'create') => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'create') setPreviewImage(reader.result);
      else setEditPreviewImage(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
      type === 'create' ? setCategoryImage(file) : setEditCategoryImage(file);
    }
  };

  const openImageModal = (src) => {
    setModalImageSrc(src);
    setIsImageModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditCategoryId(cat._id);
    setEditCategoryName(cat.name);
    setEditPreviewImage(cat.imageUrl);
    setEditCategoryImage(null);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    const name = editCategoryName.trim();
    if (!name) return toast.error('Name required.');
    if (
      usedCategoryNames.includes(name.toLowerCase()) &&
      name.toLowerCase() !== categories.find((c) => c._id === editCategoryId)?.name.toLowerCase()
    ) return toast.error('Name already exists.');

    const formData = new FormData();
    formData.append('name', name);
    if (editCategoryImage) formData.append('image', editCategoryImage);

    try {
      await api.put(`${API_URL}/${editCategoryId}`, formData);
      toast.success('Category updated.');
      setIsEditModalOpen(false);
      fetchCategories();
    } catch {
      toast.error('Update failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`${API_URL}/${id}`);
      toast.success('Deleted');
      fetchCategories();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2 className="admin-title">Categories</h2>
        <div className="flex flex-wrap items-center gap-3">
          <input type="text" placeholder="Search categories…" className="admin-search"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <button onClick={() => setIsCreateModalOpen(true)} className="admin-btn-add">
            + New Category
          </button>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="admin-th w-20">Image</th>
              <th className="admin-th">Name</th>
              <th className="admin-th w-36 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.length === 0 ? (
              <tr><td colSpan={3} className="admin-empty">No categories found.</td></tr>
            ) : filteredCategories.map((cat) => (
              <tr key={cat._id}>
                <td className="admin-td">
                  <img src={cat.imageUrl} alt={cat.name}
                    className="h-12 w-12 cursor-pointer rounded-xl object-cover"
                    onClick={() => openImageModal(cat.imageUrl)} />
                </td>
                <td className="admin-td font-medium text-gray-900">{cat.name}</td>
                <td className="admin-td">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEditModal(cat)} className="admin-btn-edit">Edit</button>
                    {!cat.isUsed && (
                      <button onClick={() => handleDelete(cat._id)} className="admin-btn-del">Delete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Image preview */}
      {isImageModalOpen && (
        <div className="admin-modal-bg" onClick={() => setIsImageModalOpen(false)}>
          <img src={modalImageSrc} alt="Preview"
            className="max-h-[85vh] max-w-[85vw] rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="admin-modal-bg">
          <div className="admin-modal">
            <h3 className="admin-modal-title">New Category</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="admin-label">Category Name</label>
                <input type="text" value={categoryName} onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Wedding Cards" className="admin-input" />
              </div>
              <div>
                <label className="admin-label">Image</label>
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'create')}
                  className="admin-input py-1.5" />
              </div>
              {previewImage && <img src={previewImage} alt="Preview" className="h-24 rounded-xl object-cover" />}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="admin-btn-cancel">Cancel</button>
                <button type="submit" className="admin-btn-save">Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="admin-modal-bg">
          <div className="admin-modal">
            <h3 className="admin-modal-title">Edit Category</h3>
            <div className="space-y-4">
              <div>
                <label className="admin-label">Name</label>
                <input type="text" value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)} className="admin-input" />
              </div>
              <div>
                <label className="admin-label">Replace Image (optional)</label>
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'edit')}
                  className="admin-input py-1.5" />
              </div>
              {editPreviewImage && <img src={editPreviewImage} alt="Preview" className="h-24 rounded-xl object-cover" />}
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setIsEditModalOpen(false)} className="admin-btn-cancel">Cancel</button>
                <button onClick={handleEditSubmit} className="admin-btn-save">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadCategory;
