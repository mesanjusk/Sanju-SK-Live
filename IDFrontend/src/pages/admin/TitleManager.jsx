// Folder: src/pages/admin/CategoryManager.jsx
import { useState, useEffect } from 'react';
import api from '../../api'

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);

  const fetchCategories = async () => {
    const res = await api.get('/api/categories');
    setCategories(res.data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('image', image);
    await api.post('/api/categories', formData);
    fetchCategories();
    setName('');
    setImage(null);
  };

  const handleDelete = async (id) => {
    await api.delete(`/api/categories/${id}`);
    fetchCategories();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Category Manager</h1>
      <form onSubmit={handleUpload} className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
          className="w-full"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Category
        </button>
      </form>
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Image</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat._id}>
              <td className="border p-2">
                <img src={cat.imageUrl} alt={cat.name} className="w-12 h-12 object-cover rounded" />
              </td>
              <td className="border p-2">{cat.name}</td>
              <td className="border p-2">
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
