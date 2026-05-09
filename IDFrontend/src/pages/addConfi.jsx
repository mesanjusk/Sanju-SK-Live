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
    <div className="admin-page">
      <Toaster position="top-right" />

      <div className="admin-header">
        <h2 className="admin-title">Store Settings</h2>
        <div className="flex flex-wrap items-center gap-3">
          <input type="text" placeholder="Search…" className="admin-search"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <button onClick={() => { resetForm(); setShowModal(true); }} className="admin-btn-add">
            <FaPlus className="text-xs" /> Add Config
          </button>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="admin-th w-16">Logo</th>
              <th className="admin-th">Name</th>
              <th className="admin-th">Phone</th>
              <th className="admin-th hidden sm:table-cell">WhatsApp</th>
              <th className="admin-th hidden md:table-cell">Email</th>
              <th className="admin-th w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="admin-empty">No configuration saved yet.</td></tr>
            ) : filtered.map((item) => (
              <tr key={item._id}>
                <td className="admin-td">
                  {item.logo
                    ? <img src={item.logo} alt="logo" className="h-11 w-11 cursor-pointer rounded-xl object-cover" onClick={() => setModalImageSrc(item.logo)} />
                    : <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-400 text-lg">🏪</div>
                  }
                </td>
                <td className="admin-td font-semibold text-gray-900">{item.name}</td>
                <td className="admin-td text-gray-600">{item.phone}</td>
                <td className="admin-td hidden sm:table-cell text-gray-600">{item.whatsappNumber || '—'}</td>
                <td className="admin-td hidden md:table-cell text-gray-600">{item.email}</td>
                <td className="admin-td">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(item)} className="admin-btn-edit"><FaEdit /></button>
                    <button onClick={() => handleDelete(item._id)} className="admin-btn-del"><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Logo preview */}
      {modalImageSrc && (
        <div className="admin-modal-bg" onClick={() => setModalImageSrc(null)}>
          <img src={modalImageSrc} alt="Logo" className="max-h-[80vh] max-w-[80vw] rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Edit / Add modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-xl rounded-3xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="font-serif text-xl font-bold text-gray-900">{editingId ? 'Edit Configuration' : 'Add Configuration'}</h3>
              <button onClick={resetForm} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="admin-label">Store Name *</label>
                  <input value={form.name} onChange={handleInput('name')} className="admin-input" placeholder="SANJU SK Digital" required />
                </div>
                <div>
                  <label className="admin-label">Phone Number</label>
                  <input value={form.phone} onChange={handleInput('phone')} className="admin-input" placeholder="+91 99999 99999" />
                </div>
                <div>
                  <label className="admin-label">WhatsApp Number</label>
                  <input value={form.whatsappNumber} onChange={handleInput('whatsappNumber')} className="admin-input" placeholder="919999999999" />
                </div>
                <div>
                  <label className="admin-label">Email</label>
                  <input value={form.email} onChange={handleInput('email')} className="admin-input" placeholder="hello@example.com" />
                </div>
                <div className="sm:col-span-2">
                  <label className="admin-label">Address</label>
                  <textarea value={form.address} onChange={handleInput('address')} className="admin-input resize-none" rows={2} placeholder="Shop address…" />
                </div>

                <div className="sm:col-span-2">
                  <p className="admin-label">Social Media Links</p>
                </div>
                <div>
                  <label className="admin-label">Facebook URL</label>
                  <input value={form.fb} onChange={handleInput('fb')} className="admin-input" placeholder="https://facebook.com/…" />
                </div>
                <div>
                  <label className="admin-label">Instagram URL</label>
                  <input value={form.insta} onChange={handleInput('insta')} className="admin-input" placeholder="https://instagram.com/…" />
                </div>
                <div>
                  <label className="admin-label">YouTube URL</label>
                  <input value={form.youtube} onChange={handleInput('youtube')} className="admin-input" placeholder="https://youtube.com/@…" />
                </div>
                <div>
                  <label className="admin-label">LinkedIn URL</label>
                  <input value={form.linkedIn} onChange={handleInput('linkedIn')} className="admin-input" placeholder="https://linkedin.com/in/…" />
                </div>
                <div>
                  <label className="admin-label">Twitter / X URL</label>
                  <input value={form.twitter} onChange={handleInput('twitter')} className="admin-input" placeholder="https://twitter.com/…" />
                </div>

                <div className="sm:col-span-2">
                  <label className="admin-label">Store Logo</label>
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="admin-input py-1.5" />
                  <div className="mt-2 flex gap-2">
                    {previewImages.map((img, i) => (
                      <img key={i} src={img.url} className="h-16 w-16 rounded-xl object-cover ring-2 ring-green-200" alt="logo preview" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button type="button" onClick={resetForm} className="admin-btn-cancel">Cancel</button>
                <button type="submit" disabled={loading} className="admin-btn-save">
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
