import { useState, useEffect } from 'react';
import api from '../../api';

export default function SubcategoryManager() {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [image, setImage] = useState(null);

  const fetchAll = async () => {
    const [subRes, catRes] = await Promise.all([
      api.get('/api/subcategories'),
      api.get('/api/categories'),
    ]);
    setSubcategories(Array.isArray(subRes.data) ? subRes.data : subRes.data?.result || []);
    setCategories(Array.isArray(catRes.data) ? catRes.data : []);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('categoryId', categoryId);
    formData.append('image', image);
    await api.post('/api/subcategories', formData);
    setName('');
    setCategoryId('');
    setImage(null);
    fetchAll();
  };

  const handleDelete = async (id) => {
    await api.delete(`/api/subcategories/${id}`);
    fetchAll();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Subcategory Manager</h1>
      <form onSubmit={handleUpload} className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Subcategory Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
          className="w-full"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Subcategory
        </button>
      </form>
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Image</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Category</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {subcategories.map((sub) => (
            <tr key={sub._id}>
              <td className="border p-2">
                <img src={sub.imageUrl} alt={sub.name} className="w-12 h-12 object-cover rounded" />
              </td>
              <td className="border p-2">{sub.name}</td>
              <td className="border p-2">{sub.categoryId?.name || '—'}</td>
              <td className="border p-2">
                <button onClick={() => handleDelete(sub._id)} className="text-red-600 hover:underline">
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
