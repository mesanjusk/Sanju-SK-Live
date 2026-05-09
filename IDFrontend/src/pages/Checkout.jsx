import { useState } from 'react';
import { useCart } from '../context/CartContext';
import api from '../api';
import FormStatus from '../components/common/FormStatus';

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const [form, setForm] = useState({
    name: '',
    address: '',
    contact: '',
    paymentMode: 'COD',
  });
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    const order = {
      customer: form,
      products: items.map((i) => ({ product: i.product._id, quantity: i.qty })),
      totalAmount: total,
    };

    try {
      await api.post('/api/orders', order);
      clearCart();
      setStatus({ type: 'success', message: 'Order placed successfully.' });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Could not place the order. Please try again.' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4 p-4">
      <h2 className="text-2xl font-semibold">Checkout</h2>
      <FormStatus type={status.type} message={status.message} />
      <input
        required
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full border p-2"
      />
      <input
        required
        placeholder="Address"
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
        className="w-full border p-2"
      />
      <input
        required
        placeholder="Contact Number"
        value={form.contact}
        onChange={(e) => setForm({ ...form, contact: e.target.value })}
        className="w-full border p-2"
      />
      <select
        value={form.paymentMode}
        onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
        className="w-full border p-2"
      >
        <option value="COD">Cash on Delivery</option>
        <option value="online">Online Payment</option>
      </select>
      <button type="submit" className="w-full rounded bg-pink-600 px-4 py-2 text-white">
        Place Order
      </button>
    </form>
  );
};

export default Checkout;
