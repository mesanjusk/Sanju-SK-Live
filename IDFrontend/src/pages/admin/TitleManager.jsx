import { useState, useEffect } from 'react';
import api from '../../api';

export default function TitleManager() {
  const [titles, setTitles] = useState([]);
  const [name, setName] = useState('');

  const fetchTitles = async () => {
    const res = await api.get('/api/titles/GetTitleList');
    setTitles(res.data?.result || []);
  };

  useEffect(() => { fetchTitles(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const res = await api.post('/api/titles/add', { name });
    if (res.data === 'exist') {
      alert('Title already exists');
    } else {
      setName('');
      fetchTitles();
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/api/titles/${id}`);
    fetchTitles();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Title Manager</h1>
      <form onSubmit={handleAdd} className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Title Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Title
        </button>
      </form>
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {titles.map((t) => (
            <tr key={t._id}>
              <td className="border p-2">{t.name}</td>
              <td className="border p-2">
                <button onClick={() => handleDelete(t._id)} className="text-red-600 hover:underline">
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
