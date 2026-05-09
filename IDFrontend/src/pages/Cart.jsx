import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { items, updateQty, removeFromCart, total } = useCart();

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Shopping Cart</h2>
      {items.length === 0 && <p>Your cart is empty.</p>}
      {items.map(({ product, qty }) => (
        <div key={product._id} className="flex items-center gap-4 mb-4">
          {product.images?.[0] && (
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-16 h-16 object-cover rounded"
            />
          )}
          <div className="flex-1">
            <h3>{product.title}</h3>
            <p>₹{product.price}</p>
          </div>
          <input
            type="number"
            min="1"
            value={qty}
            onChange={e => updateQty(product._id, parseInt(e.target.value))}
            className="w-16 border p-1"
          />
          <button
            onClick={() => removeFromCart(product._id)}
            className="text-red-500"
          >
            Remove
          </button>
        </div>
      ))}
      {items.length > 0 && (
        <div className="mt-6">
          <p className="text-xl font-semibold">Total: ₹{total}</p>
          <Link
            to="/checkout"
            className="bg-pink-600 text-white px-4 py-2 rounded mt-4 inline-block"
          >
            Checkout
          </Link>
        </div>
      )}
    </div>
  );
};

export default Cart;
