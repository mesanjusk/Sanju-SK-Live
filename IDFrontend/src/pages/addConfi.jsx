import { useState, useRef, useEffect } from 'react';
import api from '../api';
import { useNavigate, useLocation } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import toast, { Toaster } from 'react-hot-toast';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const emptyForm = {
  name: '', email: '', phone: '', whatsappNumber: '',
  address: '', fb: '', insta: '', youtube: '', twitter: '', linkedIn: '',
};

const AddConfi = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(emptyForm);
  const [logo, setLogo] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [config, setConfig] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalImageSrc, setModalImageSrc] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const user = location.state?.id || localStorage.getItem('User_name');
    if (!user) navigate('/login');
    api.get('/api/confi/GetConfiList')
      .then((res) => setConfig(Array.isArray(res.data?.result) ? res.data.result : []))
      .catch(() => {});
  }, []);

  const handleInput = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const valid = files.filter((f) => ['image/jpeg','image/png','image/webp'].includes(f.type));
    setLoading(true);
    const compressed = [];
    for (const file of valid) {
      const blob = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 400, useWebWorker: true });
      compressed.push(new File([blob], `logo-${Date.now()}.${file.name.split('.').pop()}`, { type: blob.type }));
    }
    setLogo(compressed);
    setPreviewImages(compressed.map((f) => ({ url: URL.createObjectURL(f) })));
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return toast.error('Name and phone are required.');
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    logo.forEach((img) => formData.append('logo', img));
    try {
      if (editingId) {
        await api.put(`/api/confi/${editingId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Settings updated');
      } else {
        await api.post('/api/confi/add', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (ev) => setUploadProgress(Math.round((ev.loaded * 100) / ev.total)),
        });
        toast.success('Settings saved');
      }
      resetForm();
      const res = await api.get('/api/confi/GetConfiList');
      setConfig(Array.isArray(res.data?.result) ? res.data.result : []);
    } catch { toast.error('Save failed.'); }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setLogo([]);
    setPreviewImages([]);
    setUploadProgress(0);
    setEditingId(null);
    setShowModal(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name:           item.name || '',
      email:          item.email || '',
      phone:          item.phone || '',
      whatsappNumber: item.whatsappNumber || '',
      address:        item.address || '',
      fb:             item.fb || '',
      insta:          item.insta || '',
      youtube:        item.youtube || '',
      twitter:        item.twitter || '',
      linkedIn:       item.linkedIn || '',
    });
    setPreviewImages(item.logo ? [{ url: item.logo }] : []);
    setLogo([]);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this configuration?')) return;
    await api.delete(`/api/confi/${id}`);
    setConfig(config.filter((c) => c._id !== id));
    toast.success('Deleted');
  };

  const filtered = config.filter((c) => c.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      <Toaster position="top-right" />

      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold text-gray-900">Store Settings</h2>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-sm font-semibold text-white hover:bg-[#128C7E] transition-colors"
        >
          <FaPlus className="text-xs" /> Add Config
        </button>
      </div>

      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 w-full max-w-sm rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#25D366]"
      />

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 text-left">Logo</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">WhatsApp</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  {item.logo && <img src={item.logo} alt="logo" className="h-12 w-12 cursor-pointer rounded-xl object-cover" onClick={() => setModalImageSrc(item.logo)} />}
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                <td className="px-4 py-3 text-gray-600">{item.phone}</td>
                <td className="px-4 py-3 text-gray-600">{item.whatsappNumber || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{item.email}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(item)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100"><FaEdit className="text-xs" /></button>
                    <button onClick={() => handleDelete(item._id)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100"><FaTrash className="text-xs" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-gray-400">No configuration saved yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Image modal */}
      {modalImageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setModalImageSrc(null)}>
          <img src={modalImageSrc} alt="Logo" className="max-h-[80vh] max-w-[80vw] rounded-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-8">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="font-serif text-xl font-bold text-gray-900">{editingId ? 'Edit Configuration' : 'Add Configuration'}</h3>
              <button onClick={resetForm} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Store Name *</label>
                  <input value={form.name} onChange={handleInput('name')} className="input-field" placeholder="SK Cards" required />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Phone Number</label>
                  <input value={form.phone} onChange={handleInput('phone')} className="input-field" placeholder="+91 99999 99999" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">WhatsApp Number</label>
                  <input value={form.whatsappNumber} onChange={handleInput('whatsappNumber')} className="input-field" placeholder="919999999999 (with country code)" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Email</label>
                  <input value={form.email} onChange={handleInput('email')} className="input-field" placeholder="hello@example.com" />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Address</label>
                  <textarea value={form.address} onChange={handleInput('address')} className="input-field resize-none" rows={2} placeholder="Shop address..." />
                </div>

                <div className="sm:col-span-2">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Social Media Links</p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Facebook URL</label>
                  <input value={form.fb} onChange={handleInput('fb')} className="input-field" placeholder="https://facebook.com/..." />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Instagram URL</label>
                  <input value={form.insta} onChange={handleInput('insta')} className="input-field" placeholder="https://instagram.com/..." />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">YouTube Channel URL</label>
                  <input value={form.youtube} onChange={handleInput('youtube')} className="input-field" placeholder="https://youtube.com/@..." />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">LinkedIn URL</label>
                  <input value={form.linkedIn} onChange={handleInput('linkedIn')} className="input-field" placeholder="https://linkedin.com/in/..." />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Twitter / X URL</label>
                  <input value={form.twitter} onChange={handleInput('twitter')} className="input-field" placeholder="https://twitter.com/..." />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Store Logo</label>
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="text-sm" />
                  <div className="mt-2 flex gap-2">
                    {previewImages.map((img, i) => (
                      <img key={i} src={img.url} className="h-16 w-16 rounded-xl object-cover ring-2 ring-[#25D366]/30" alt="logo preview" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button type="button" onClick={resetForm} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading} className="rounded-xl bg-[#25D366] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#128C7E] disabled:opacity-60 transition-colors">
                  {loading ? `Saving… ${uploadProgress}%` : editingId ? 'Update' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddConfi;
