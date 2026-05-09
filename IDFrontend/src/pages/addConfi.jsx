import { useState, useRef, useEffect } from 'react';
import api from '../api'
import { useNavigate, useLocation } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import toast, { Toaster } from 'react-hot-toast';

const AddConfi = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', fb: '', insta: '', twitter: '', linkedIn: '' });
  const [logo, setLogo] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [config, setConfig] = useState([]);
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

    api.get('/api/confi/GetConfiList')
  .then(res => {
    const result = res.data?.result || res.data || [];
    setConfig(Array.isArray(result) ? result : []);
  })

    setTimeout(() => setLoading(false), 2000);
  }, [location.state, navigate]);


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
    if (filtered.length + logo.length > 10) return toast.error('Max 10 images allowed.');
    setLoading(true);
    const newImages = [];
    for (const file of filtered) {
      const compressedBlob = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true });
      const compressedFile = new File([compressedBlob], `${Date.now()}-${file.name}`, { type: compressedBlob.type });
      newImages.push(compressedFile);
    }
    const all = [...logo, ...newImages];
    setLogo(all);
    setPreviewImages(all.map(file => ({ url: URL.createObjectURL(file) })));
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.address) {
      return toast.error('Fill all fields');
    }

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    logo.forEach(img => formData.append('logo', img));

    try {
      if (editingId) {
        await api.put(`/api/confi/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Config updated');
      } else {
        await api.post('/api/confi/add', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total))
        });
        toast.success('Config added');
      }

      setForm({ name: '', email: '', phone: '', address: '', fb: '', insta: '', twitter: '', linkedIn: '' });
      setLogo([]);
      setPreviewImages([]);
      setUploadProgress(0);
      fileInputRef.current.value = '';
      
    } catch (err) {
      toast.error('Submit failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this config?')) return;
    await api.delete(`/api/confi/${id}`);
    setConfig(config.filter(item => item._id !== id));
    toast.success('Config deleted');
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name,
      email: item.email,
      phone: item.phone,
      address: item.address,
      fb: item.fb,
      insta: item.insta,
      twitter: item.twitter,
      linkedIn: item.linkedIn
    });
    setPreviewImages(item.logo ? [{ url: item.logo }] : []);
    setShowModal(true);
  };

   const openImageModal = (src) => {
    setModalImageSrc(src);
    setIsImageModalOpen(true);
  };

  const filteredConfig = config.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Toaster position="top-right" />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Configuration</h1>
        <button onClick={() => setShowModal(true)} className="bg-green-600 text-white px-4 py-2 rounded">+ New Config</button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-xl w-full">
            <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Config' : 'Add Configuration'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
              <input type="text" value={form.name} onChange={handleInputChange('name')} className="p-2 border rounded" placeholder="Enter name" required />
             <input type="text" value={form.email} onChange={handleInputChange('email')} className="p-2 border rounded" placeholder="Enter email" required />
             <input type="text" value={form.phone} onChange={handleInputChange('phone')} className="p-2 border rounded" placeholder="Enter Mobile No." required />
             <input type="text" value={form.address} onChange={handleInputChange('address')} className="p-2 border rounded" placeholder="Enter address" required />
             <input type="text" value={form.fb} onChange={handleInputChange('fb')} className="p-2 border rounded" placeholder="Enter fb link" />
             <input type="text" value={form.insta} onChange={handleInputChange('insta')} className="p-2 border rounded" placeholder="Enter insta link" />
             <input type="text" value={form.twitter} onChange={handleInputChange('twitter')} className="p-2 border rounded" placeholder="Enter twitter link" />
              <input type="text" value={form.linkedIn} onChange={handleInputChange('linkedIn')} className="p-2 border rounded" placeholder="Enter linkedIn link" />
              <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="mb-2" />
              <div className="flex gap-2 flex-wrap">
                {previewImages.map((img, idx) => <img key={idx} src={img.url} className="w-20 h-20 object-cover rounded" alt="preview" />)}
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

      <input type="text" placeholder="Search name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="mb-4 p-2 border rounded w-full max-w-md" />

      <table className="min-w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-3 py-2">Logo</th>
            <th className="px-3 py-2">Name</th>
            <th className="px-3 py-2">Mobile</th>
            <th className="px-3 py-2">Email</th>
            <th className="px-3 py-2">Address</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredConfig.map((item, i) => (
            <tr key={i} className="border-t text-sm text-center">
              <td className="p-2 border">
                 <img
        src={item.logo}
        alt={item.name}
        className="h-12 mx-auto cursor-pointer"
        onClick={() => openImageModal(item.logo)}
      />
              </td>
              <td className="p-2 border">{item.name}</td>
              <td className="p-2 border">{item.phone}</td>
              <td className="p-2 border">{item.email}</td>
              <td className="p-2 border">{item.address}</td>
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
            alt="Config Full View"
            className="max-h-[90vh] max-w-[90vw] rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button className="absolute top-4 right-4 text-white text-3xl font-bold">&times;</button>
        </div>
      )}
    </div>
  );
};

export default AddConfi;
