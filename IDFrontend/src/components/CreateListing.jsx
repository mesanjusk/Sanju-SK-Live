import { useState, useRef, useEffect } from 'react';
import api from '../api';
import { useNavigate, useLocation } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import toast, { Toaster } from 'react-hot-toast';

const CreateListing = () => {
  const navigate = useNavigate();
  const location = useLocation();
const [existingImageURLs, setExistingImageURLs] = useState([]);

  const [form, setForm] = useState({ title: '', category: '', subcategory: '', religions: '', price: '', favorite: '' });
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [dropdownData, setDropdownData] = useState({ categories: [], subcategories: [], religions: [] });
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
   const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [modalImageSrc, setModalImageSrc] = useState(null);
  

  const fileInputRef = useRef(null);

  const safeExtract = (res) => Array.isArray(res) ? res : res?.result || [];

  useEffect(() => {
    const userNameFromState = location.state?.id;
    const user = userNameFromState || localStorage.getItem('User_name');
    if (user) setLoggedInUser(user);
    else navigate('/login');
    setTimeout(() => setLoading(false), 2000);
  }, [location.state, navigate]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [categoryRes, subcategoryRes, religionRes, listingRes] = await Promise.all([
          api.get('/api/categories/with-usage'),
          api.get('/api/subcategories'),
          api.get('/api/religions/GetReligionList'),
          api.get('/api/listings')
        ]);
        setDropdownData({
          categories: safeExtract(categoryRes.data),
          subcategories: safeExtract(subcategoryRes.data),
          religions: safeExtract(religionRes.data)
        });
        setListings(listingRes.data || []);
      } catch (error) {
        toast.error('Failed to fetch dropdown or listings.');
      }
      
    };
    fetchDropdowns();
  }, []);

  const handleInputChange = (field) => (e) => {
    const value = e?.target?.value ?? e;
    if (field === 'price' && value && !/^\d*\.?\d*$/.test(value)) return;
    setForm({ ...form, [field]: value });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const filtered = files.filter(file => validTypes.includes(file.type));
    if (filtered.length !== files.length) toast('Some files were skipped.');
    if (filtered.length + images.length > 10) return toast.error('Max 10 images allowed.');
    setLoading(true);
    const newImages = [];
    for (const file of filtered) {
      const compressedBlob = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true });
      const compressedFile = new File([compressedBlob], `${Date.now()}-${file.name}`, { type: compressedBlob.type });
      newImages.push(compressedFile);
    }
    const all = [...images, ...newImages];
    setImages(all);
    setPreviewImages(all.map(file => ({ url: URL.createObjectURL(file) })));
    setLoading(false);
  };

  const removeImage = (index) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    setPreviewImages(updated.map(file => ({ url: URL.createObjectURL(file) })));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.title || !form.category || !form.subcategory || !form.price) {
    return toast.error('Fill all fields');
  }

  const formData = new FormData();
  Object.entries(form).forEach(([key, value]) => {
    formData.append(key, value);
  });

  images.forEach((img) => formData.append("images", img));

  // Include existing image URLs during update
  if (editingId && existingImageURLs.length > 0) {
    formData.append("existingImages", JSON.stringify(existingImageURLs));
  }

  try {
    if (editingId) {
      await api.put(`/api/listings/${editingId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Listing updated");
    } else {
      await api.post("/api/listings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) =>
          setUploadProgress(Math.round((e.loaded * 100) / e.total))
      });
      toast.success("Listing created");
    }

    // Reset
    setForm({ title: '', category: '', subcategory: '', religions: '', price: '', favorite: '' });
    setImages([]);
    setExistingImageURLs([]);
    setPreviewImages([]);
    fileInputRef.current.value = '';
    setUploadProgress(0);
    setEditingId(null);
    setShowModal(false);

    const updated = await api.get("/api/listings");
    setListings(updated.data || []);
  } catch (error) {
    console.error(error);
    toast.error("Submit failed.");
  }
};


  const getName = (uuid, type) => {
    const list = dropdownData[type];
    const keyMap = { categories: 'category_uuid', subcategories: 'subcategory_uuid', religions: 'religion_uuid' };
    const key = keyMap[type];
    const found = Array.isArray(list) ? list.find(item => item[key] === uuid) : null;
    return found?.name || '';
  };

   const openImageModal = (src) => {
    setModalImageSrc(src);
    setIsImageModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    await api.delete(`/api/listings/${id}`);
    setListings(listings.filter(item => item._id !== id));
    toast.success('Listing deleted');
  };

  const handleEdit = (item) => {
  setEditingId(item._id);
  setForm({
    title: item.title || '',
    category: item.category_uuid || '',
    subcategory: item.subcategory_uuid || '',
    religions: item.religion_uuid || '',
    price: item.price || '',
    favorite: item.favorite || ''
  });

  setImages([]); 
  setExistingImageURLs(item.images || []); 
  setPreviewImages(
    (item.images || []).map((url) => ({ url })) 
  );

  setShowModal(true);
};

  const filteredListings = listings.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Toaster position="top-right" />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Upload Design</h1>
        <button onClick={() => setShowModal(true)} className="bg-green-600 text-white px-4 py-2 rounded">+ New Listing</button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-xl w-full">
            <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Listing' : 'Create New Listing'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
              <input type="text" value={form.title} onChange={handleInputChange('title')} className="p-2 border rounded" placeholder="Enter title" required />
              <select value={form.category} onChange={handleInputChange('category')} className="p-2 border rounded" required>
                <option value="">Select Category</option>
                {dropdownData.categories.map(c => <option key={c.category_uuid} value={c.category_uuid}>{c.name}</option>)}
              </select>
              <select value={form.subcategory} onChange={handleInputChange('subcategory')} className="p-2 border rounded" required>
                <option value="">Select Subcategory</option>
                {dropdownData.subcategories.map(s => <option key={s.subcategory_uuid} value={s.subcategory_uuid}>{s.name}</option>)}
              </select>
              <select value={form.religions} onChange={handleInputChange('religions')} className="p-2 border rounded" required>
                <option value="">Select Religion</option>
                {dropdownData.religions.map(r => <option key={r.religion_uuid} value={r.religion_uuid}>{r.name}</option>)}
              </select>
              <input type="text" value={form.price} onChange={handleInputChange('price')} className="p-2 border rounded" placeholder="Enter price (numeric only)" required />
              <select value={form.favorite} onChange={handleInputChange('favorite')} className="p-2 border rounded" required>
                <option value="">Select Favorite</option>
                <option value="1">1</option>
                <option value="0">0</option>
              </select>
              <input type="file" ref={fileInputRef} multiple accept="image/*" onChange={handleImageUpload} className="mb-2" />
              <div className="flex gap-2 flex-wrap">
                {previewImages.map((img, idx) => (
                  <img key={idx} src={img.url} className="w-20 h-20 object-cover rounded" alt="preview" />
                ))}
              </div>
              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                  {loading ? `Uploading... ${uploadProgress}%` : editingId ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <input type="text" placeholder="Search title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="mb-4 p-2 border rounded w-full max-w-md" />

      <table className="w-full border border-gray-300 rounded-md">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Image</th>
            <th className="p-2 border">Title</th>
            <th className="p-2 border">Category</th>
           
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredListings.map((item, i) => (
            <tr key={i} className="text-center">
              <td className="p-2 border">
                 {Array.isArray(item.images) && item.images.length > 0 ? (
                    <div className="flex gap-2 justify-center">
                      {item.images.map((imgUrl, index) => (
                        <img
                          key={index}
                          src={imgUrl}
                          alt="Thumb"
                         className="h-12 mx-auto cursor-pointer" 
                         onClick={() => openImageModal(imgUrl)}
                        />
                      ))}
                    </div>
                  ) : (
                    <span>No image</span>
                  )}
              </td>
              <td className="p-2 border">{item.title}</td>
              <td className="p-2 border">{getName(item.category, 'categories')}</td>
             
              <td className="p-2 border space-x-2">
                <button onClick={() => handleEdit(item)} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">Edit</button>
                <button onClick={() => handleDelete(item._id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

       {/* Image Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50" onClick={() => setIsImageModalOpen(false)}>
          <img
            src={modalImageSrc}
            alt="Banner Full View"
            className="max-h-[90vh] max-w-[90vw] rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button className="absolute top-4 right-4 text-white text-3xl font-bold">&times;</button>
        </div>
      )}
    </div>
    
  );
};

export default CreateListing;
