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
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Religion</h2>

      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Search name..."
          className="flex-1 p-2 border border-gray-300 rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + New Religion
        </button>
      </div>

      <table className="w-full border border-gray-300 rounded-md">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredReligions.map((rel) => (
            <tr key={rel._id} className="text-center">
              <td className="p-2 border">{rel.name}</td>
              <td className="p-2 border space-x-2">
                <button
                  onClick={() => openEditModal(rel)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                {!rel.isUsed && (
                  <button
                    onClick={() => handleDelete(rel._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-xl font-semibold mb-4">New Religion</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <input
                type="text"
                value={religionName}
                onChange={(e) => setReligionName(e.target.value)}
                placeholder="Religion Name"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
             
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                 Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Edit Religion</h3>
            <input
              type="text"
              value={editReligionName}
              onChange={(e) => setEditReligionName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
            />
           
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddReligion;
