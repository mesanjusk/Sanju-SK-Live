import React, { useState, useEffect } from 'react';
import api from '../api';
import { FaPlus } from 'react-icons/fa';

const PAGE_SIZE = 5;

const UploadCategory = () => {
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editName, setEditName] = useState('');

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageModalUrl, setImageModalUrl] = useState('');

  useEffect(() => {
    fetchCategories(page);
  }, [page]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchCategories = async (pageNum) => {
    try {
      const res = await api.get(`/api/categories?page=${pageNum}&limit=${PAGE_SIZE}`);
      setCategories(res.data.categories);
      setFilteredCategories(res.data.categories);
      setTotalPages(Math.ceil(res.data.total / PAGE_SIZE));
    } catch (err) {
      setError('Failed to fetch categories');
    }
  };

  const handleFileChange = (file) => {
    if (file && file.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2MB');
      setCategoryImage(null);
    } else {
      setError('');
      setCategoryImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName || !categoryImage) {
      setError('Please provide both category name and image.');
      return;
    }
    const duplicate = categories.some((cat) => cat.name.toLowerCase() === categoryName.toLowerCase());
    if (duplicate) {
      setError('Category name already exists');
      return;
    }
    const formData = new FormData();
    formData.append('name', categoryName);
    formData.append('image', categoryImage);
    try {
      await api.post('/api/categories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Category uploaded successfully!');
      setCategoryName('');
      setCategoryImage(null);
      setUploadModalOpen(false);
      fetchCategories(page);
    } catch (err) {
      setError('Error uploading category');
    }
  };

  const openEditModal = (id, currentName) => {
    setEditCategoryId(id);
    setEditName(currentName);
    setEditModalOpen(true);
  };

  const saveEdit = async () => {
    if (!editName.trim()) {
      setError('Category name cannot be empty');
      return;
    }
    try {
      await api.put(`/api/categories/${editCategoryId}`, { name: editName });
      setSuccess('Category updated');
      setEditModalOpen(false);
      fetchCategories(page);
    } catch (err) {
      setError('Failed to update category');
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/api/categories/${id}`);
      setSuccess('Category deleted');
      fetchCategories(page);
    } catch (err) {
      setError('Failed to delete category');
    }
  };

  const openImageModal = (imageUrl) => {
    setImageModalUrl(imageUrl);
    setImageModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 border rounded-md shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Categories</h2>
        <button
          onClick={() => setUploadModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus /> Add Category
        </button>
      </div>

      <input
        type="text"
        placeholder="Search categories..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setFilteredCategories(categories.filter(cat => cat.name.toLowerCase().includes(e.target.value.toLowerCase())));
        }}
        className="w-full mb-4 p-2 border rounded"
      />

      <table className="w-full table-auto border-collapse border border-gray-300 mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-3 py-2">Image</th>
            <th className="border border-gray-300 px-3 py-2">Name</th>
            <th className="border border-gray-300 px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCategories.length === 0 ? (
            <tr><td colSpan="3" className="text-center py-4">No categories found.</td></tr>
          ) : (
            filteredCategories.map(({ _id, name, imageUrl }) => (
              <tr key={_id} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-2 text-center">
                  <img
                    src={imageUrl}
                    alt={name}
                    className="h-12 w-12 object-cover inline-block rounded cursor-pointer"
                    onClick={() => openImageModal(imageUrl)}
                  />
                </td>
                <td className="border border-gray-300 p-2">{name}</td>
                <td className="border border-gray-300 p-2 text-center space-x-2">
                  <button onClick={() => openEditModal(_id, name)} className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500">Edit</button>
                  <button onClick={() => deleteCategory(_id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Upload Category Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[90%] max-w-md relative">
            <button
              onClick={() => setUploadModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
            >✖</button>
            <h4 className="text-lg font-semibold mb-4">Add New Category</h4>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Category Name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full mb-4 p-2 border rounded"
                required
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e.target.files[0])}
                className="w-full mb-4"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >Upload</button>
            </form>
          </div>
        </div>
      )}

      {/* Other modals preserved... */}
    </div>
  );
};

export default UploadCategory;
