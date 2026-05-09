import React, { useState, useEffect } from 'react';
import api from '../api'
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const API_URL = '/api/religions';

const AddReligion = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [religions, setReligions] = useState([]);
  const [filteredReligions, setFilteredReligions] = useState([]);
  const [usedReligionNames, setUsedReligionNames] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [religionName, setReligionName] = useState('');

  const [editReligionId, setEditReligionId] = useState(null);
  const [editReligionName, setEditReligionName] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const user = location.state?.id || localStorage.getItem('User_name');
    if (!user) navigate('/login');
    fetchReligions();
  }, []);

  const fetchReligions = async () => {
    try {
      const res = await api.get(`${API_URL}/GetReligionList`);
     const data = Array.isArray(res.data.result) ? res.data.result : [];
    setReligions(data);
    setFilteredReligions(data);
    setUsedReligionNames(data.map((rel) => rel.name.toLowerCase()));
    } catch (err) {
      toast.error('Failed to fetch religions.');
    }
  };

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredReligions(religions);
    } else {
      const filtered = religions.filter((rel) =>
        rel.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredReligions(filtered);
    }
  }, [searchTerm, religions]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const name = religionName.trim();
    if (!name) return toast.error('Name  required.');
    if (usedReligionNames.includes(name.toLowerCase())) return toast.error('Name already exists.');

    const formData = new FormData();
    formData.append('name', name);

    try {
      await api.post(API_URL, formData);
      toast.success('Religion created.');
      setReligionName('');
      setIsCreateModalOpen(false);
      fetchReligions();
    } catch {
      toast.error('Upload failed.');
    }
  };


  const openEditModal = (cat) => {
    setEditReligionId(cat._id);
    setEditReligionName(cat.name);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    const name = editReligionName.trim();
    if (!name) return toast.error('Name required.');
    if (
      usedReligionNames.includes(name.toLowerCase()) &&
      name.toLowerCase() !== religions.find((c) => c._id === editReligionId)?.name.toLowerCase()
    ) return toast.error('Name already exists.');

    const formData = new FormData();
    formData.append('name', name);

    try {
      await api.put(`${API_URL}/${editReligionId}`, { name });
      toast.success('Religion updated.');
      setIsEditModalOpen(false);
      fetchReligions();
    } catch {
      toast.error('Update failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this Religion?')) return;
    try {
      await api.delete(`${API_URL}/${id}`);
      toast.success('Deleted');
      fetchReligions();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2 className="admin-title">Religions / Occasions</h2>
        <div className="flex flex-wrap items-center gap-3">
          <input type="text" placeholder="Search…" className="admin-search"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <button onClick={() => setIsCreateModalOpen(true)} className="admin-btn-add">+ New Religion</button>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="admin-th">Name</th>
              <th className="admin-th w-36 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReligions.length === 0 ? (
              <tr><td colSpan={2} className="admin-empty">No religions found.</td></tr>
            ) : filteredReligions.map((rel) => (
              <tr key={rel._id}>
                <td className="admin-td font-medium text-gray-900">{rel.name}</td>
                <td className="admin-td">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEditModal(rel)} className="admin-btn-edit">Edit</button>
                    {!rel.isUsed && (
                      <button onClick={() => handleDelete(rel._id)} className="admin-btn-del">Delete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isCreateModalOpen && (
        <div className="admin-modal-bg">
          <div className="admin-modal">
            <h3 className="admin-modal-title">New Religion / Occasion</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="admin-label">Name</label>
                <input type="text" value={religionName} onChange={(e) => setReligionName(e.target.value)}
                  placeholder="e.g. Hindu, Christian, Islamic…" className="admin-input" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="admin-btn-cancel">Cancel</button>
                <button type="submit" className="admin-btn-save">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="admin-modal-bg">
          <div className="admin-modal">
            <h3 className="admin-modal-title">Edit Religion</h3>
            <div className="space-y-4">
              <div>
                <label className="admin-label">Name</label>
                <input type="text" value={editReligionName}
                  onChange={(e) => setEditReligionName(e.target.value)} className="admin-input" />
              </div>
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

export default AddReligion;
