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
    <div className="admin-page">
      <Toaster position="top-right" />
      <div className="admin-header">
        <h2 className="admin-title">Users</h2>
        <div className="flex flex-wrap items-center gap-3">
          <input type="text" placeholder="Search users…" className="admin-search"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <button onClick={() => setIsAddModalOpen(true)} className="admin-btn-add">+ New User</button>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="admin-th">Username</th>
              <th className="admin-th">Mobile</th>
              <th className="admin-th w-36 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr><td colSpan={3} className="admin-empty">No users found.</td></tr>
            ) : filteredUsers.map((user) => (
              <tr key={user._id}>
                <td className="admin-td font-medium text-gray-900">{user.User_name}</td>
                <td className="admin-td text-gray-500">{user.Mobile_number}</td>
                <td className="admin-td">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(user)} className="admin-btn-edit">Edit</button>
                    <button onClick={() => handleDelete(user._id)} className="admin-btn-del">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit modal */}
      {showModal && (
        <div className="admin-modal-bg">
          <div className="admin-modal">
            <h3 className="admin-modal-title">Edit User</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="admin-label">Username</label>
                <input type="text" value={form.User_name} onChange={handleInputChange('User_name')}
                  placeholder="Username" className="admin-input" required />
              </div>
              <div>
                <label className="admin-label">Mobile Number</label>
                <input type="text" value={form.Mobile_number} onChange={handleInputChange('Mobile_number')}
                  placeholder="Mobile" className="admin-input" required />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="admin-btn-cancel">Cancel</button>
                <button type="submit" className="admin-btn-save">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add modal */}
      {isAddModalOpen && (
        <div className="admin-modal-bg">
          <div className="admin-modal">
            <h3 className="admin-modal-title">Add New User</h3>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="admin-label">Username</label>
                <input type="text" value={User_name} onChange={(e) => setUser_Name(e.target.value)}
                  placeholder="Username" className="admin-input" />
              </div>
              <div>
                <label className="admin-label">Password</label>
                <input type="password" value={Password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password" className="admin-input" />
              </div>
              <div>
                <label className="admin-label">Mobile Number</label>
                <input type="text" value={Mobile_number} onChange={(e) => setMobile_Number(e.target.value)}
                  placeholder="Mobile" className="admin-input" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="admin-btn-cancel">Cancel</button>
                <button type="submit" className="admin-btn-save">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
