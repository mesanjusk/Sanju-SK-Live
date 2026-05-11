import { useState, useEffect } from 'react';
import api from '../../api';

export default function PriceManager() {
  const [prices, setPrices] = useState([]);
  const [price, setPrice] = useState('');

  const fetchPrices = async () => {
    const res = await api.get('/api/prices/GetPriceList');
    setPrices(res.data?.result || []);
  };

  useEffect(() => { fetchPrices(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const res = await api.post('/api/prices/add', { price: Number(price) });
    if (res.data === 'exist') {
      alert('Price already exists');
    } else {
      setPrice('');
      fetchPrices();
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/api/prices/${id}`);
    fetchPrices();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Price Manager</h1>
      <form onSubmit={handleAdd} className="mb-6 space-y-4">
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Price
        </button>
      </form>
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Price</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {prices.map((p) => (
            <tr key={p._id}>
              <td className="border p-2">₹{p.price}</td>
              <td className="border p-2">
                <button onClick={() => handleDelete(p._id)} className="text-red-600 hover:underline">
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
