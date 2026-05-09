import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api'
import toast, { Toaster } from 'react-hot-toast';

export default function AddUser() {
  const navigate = useNavigate();
  const location = useLocation();
const [form, setForm] = useState({ User_name: '', Password: '', Mobile_number: '' });
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [User_name, setUser_Name] = useState('');
  const [Password, setPassword] = useState('');
  const [Mobile_number, setMobile_Number] = useState('');

  useEffect(() => {
    const userFromState = location.state?.id;
    const storedUser = userFromState || localStorage.getItem('User_name');
    if (!storedUser) {
      navigate('/login');
    } else {
      setLoggedInUser(storedUser);
      fetchUsers();
    }
  }, [location.state, navigate]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/users/GetUserList');
      const result = res.data?.result || res.data || [];
      setUsers(result);
      setFilteredUsers(result);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/users/addUser', {
        User_name,
        Password,
        Mobile_number,
      });

      if (res.data === 'exist') {
        setError('User already exists');
      } else if (res.data === 'notexist') {
        setSuccess('User added successfully');
        setUser_Name('');
        setPassword('');
        setMobile_Number('');
        fetchUsers();
        setIsAddModalOpen(false);
      }
    } catch (e) {
      console.error(e);
      setError('Error adding user');
    }
  };

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }
    const filtered = users.filter((user) =>
      user.User_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleInputChange = (field) => (e) => {
    const value = e?.target?.value ?? e;
    setForm({ ...form, [field]: value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!form.User_name || !form.Mobile_number) {
    return toast.error('Fill all fields');
  }

  const formData = new FormData();
  Object.entries(form).forEach(([k, v]) => formData.append(k, v));

  try {
    if (editingId) {
      await api.put(`/api/users/updateUser/${editingId}`, {
         User_name: form.User_name,
        Mobile_number: form.Mobile_number,
      });
      toast.success('User updated');
      setShowModal(false);        
      setEditingId(null);        
      fetchUsers();              
    }
  } catch (err) {
    toast.error('Submit failed.');
    console.error(err);
  }
};



   const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    await api.delete(`/api/users/${id}`);
    setUsers(users.filter(item => item._id !== id));
    toast.success('User deleted');
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      User_name: item.User_name,
      Password: item.Password,
      Mobile_number: item.Mobile_number,
    });
    setShowModal(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold">Add User</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + New User
        </button>
      </div>
{showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-xl w-full">
            <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit User' : 'Add User'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
              <input type="text" value={form.User_name} onChange={handleInputChange('User_name')} className="p-2 border rounded" placeholder="Enter name" required />
            <input type="text" value={form.Password} onChange={handleInputChange('Password')} className="p-2 border rounded" placeholder="Enter password" required />
             <input type="text" value={form.Mobile_number} onChange={handleInputChange('Mobile_number')} className="p-2 border rounded" placeholder="Enter number" required />
              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <input
        type="text"
        placeholder="Search users..."
        className="w-full mb-4 p-2 border border-gray-300 rounded-md"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}
      {success && <p className="text-green-500 mb-2 text-sm">{success}</p>}

      <table className="w-full border text-center">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Mobile</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <tr key={user._id}>
                <td className="p-2 border">{user.User_name}</td>
                <td className="p-2 border">{user.Mobile_number}</td>
                 <td className="p-2 border space-x-2">
                <button onClick={() => handleEdit(user)} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">Edit</button>
                <button onClick={() => handleDelete(user._id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
              </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2" className="p-4 text-gray-500">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Add New User</h3>
            <form onSubmit={submit} className="space-y-3">
              <input
                type="text"
                placeholder="User Name"
                value={User_name}
                onChange={(e) => setUser_Name(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <input
                type="password"
                placeholder="Password"
                value={Password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Mobile Number"
                value={Mobile_number}
                onChange={(e) => setMobile_Number(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-1 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
