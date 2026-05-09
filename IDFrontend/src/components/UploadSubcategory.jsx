import { useState, useEffect, useRef } from 'react';
import api from '../api';

const UploadSubcategory = () => {
  const [subcategoryName, setSubcategoryName] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [allSubcategories, setAllSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/subcategories');
      setAllSubcategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subcategoryName || !image) {
      alert("Please provide both name and image.");
      return;
    }

    const formData = new FormData();
    formData.append('name', subcategoryName);
    formData.append('image', image);

    setLoading(true);

    try {
      await api.post('/api/subcategories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert("Subcategory uploaded!");
      setSubcategoryName('');
      setImage(null);
      setPreview(null);
      inputRef.current.value = '';
      fetchCategories();
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">Upload New SubCategory</h1>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow max-w-md space-y-4">
        <input
          type="text"
          value={subcategoryName}
          onChange={(e) => setSubcategoryName(e.target.value)}
          placeholder="Subcategory Name"
          className="w-full p-2 border rounded"
        />

        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          onChange={handleImageChange}
          className="w-full p-2 border rounded"
        />

        {preview && (
          <div className="mt-2">
            <img src={preview} alt="Preview" className="w-40 h-40 object-cover rounded" />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload Category"}
        </button>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">All SubCategories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {allSubcategories.map((cat) => (
            <div key={cat._id} className="bg-white p-2 shadow rounded text-center">
              <img src={cat.imageUrl} alt={cat.name} className="w-full h-32 object-cover rounded mb-2" />
              <p className="font-medium">{cat.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UploadSubcategory;
