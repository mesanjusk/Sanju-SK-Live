import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWhatsAppNumber } from '../hooks/useWhatsApp';

const unitPrice = (product, qty) => {
  const tiers = Array.isArray(product.quantityPricing) ? product.quantityPricing : [];
  const matching = tiers.filter(t => qty >= Number(t.minQty) && (!t.maxQty || qty <= Number(t.maxQty)))
    .sort((a, b) => Number(b.minQty) - Number(a.minQty))[0];
  const price = Number(matching?.price ?? product.price);
  return Number.isFinite(price) && price >= 0 ? price : null;
};

export default function Cart() {
  const { items, updateQty, removeFromCart } = useCart();
  const whatsappNumber = useWhatsAppNumber();
  const phone = String(whatsappNumber || '919372333633').replace(/\D/g, '');
  const lines = items.map(({ product, qty }, index) => {
    const estimate = unitPrice(product, qty);
    return `${index + 1}. ${product.title || 'Product'} (ID: ${product._id})\nQuantity: ${qty}\n${estimate === null ? 'Price: Please quote' : `Indicative item total: ₹${(estimate * qty).toFixed(2)}`}`;
  });
  const message = `Hello SK Digital, please confirm availability, artwork requirements, delivery charges and final price for:\n\n${lines.join('\n\n')}\n\nI understand this is a quotation request, not a confirmed order.`;
  const href = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : null;
  const estimate = items.reduce((sum, { product, qty }) => sum + (unitPrice(product, qty) ?? 0) * qty, 0);

  return (
    <main className="mx-auto min-h-[70vh] max-w-3xl px-4 py-8 pb-28">
      <h1 className="text-2xl font-bold text-[#263e32]">Your enquiry cart</h1>
      <p className="mt-2 text-sm text-gray-600">Collect products and request one quotation. No payment is collected here.</p>
      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border p-6 text-center">
          <p>Your cart is empty.</p>
          <Link to="/products" className="mt-4 inline-block font-semibold text-green-700 underline">Browse products</Link>
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-4">
            {items.map(({ product, qty }) => (
              <section key={product._id} className="flex gap-4 rounded-2xl border p-4">
                {product.images?.[0] && <img src={product.images[0]} alt="" className="h-20 w-20 rounded-lg object-cover" />}
                <div className="min-w-0 flex-1">
                  <Link className="font-semibold text-[#263e32] underline" to={`/products/${product._id}`}>{product.title}</Link>
                  <p className="mt-1 text-sm text-gray-600">{unitPrice(product, qty) === null ? 'Price on request' : `Indicative: ₹${(unitPrice(product, qty) * qty).toFixed(2)}`}</p>
                  <label className="mt-2 flex items-center gap-2 text-sm">Quantity
                    <input aria-label={`Quantity for ${product.title}`} type="number" min="1" max="100000" step="1" value={qty}
                      onChange={e => updateQty(product._id, Number(e.target.value))}
                      className="w-24 rounded-lg border px-2 py-1" />
                  </label>
                  <button type="button" onClick={() => removeFromCart(product._id)} className="mt-2 block text-sm text-red-600 underline">Remove</button>
                </div>
              </section>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-[#f2f7f0] p-5">
            <p className="font-semibold">Indicative product subtotal: ₹{estimate.toFixed(2)}</p>
            <p className="mt-1 text-xs text-gray-600">Final price, taxes, design work and shipping are confirmed by SK Digital. Cart prices are not binding.</p>
            {href && <a className="mt-4 block rounded-xl bg-[#128C7E] px-4 py-3 text-center font-bold text-white" href={href} target="_blank" rel="noopener noreferrer">Request quotation on WhatsApp</a>}
            <Link to="/products" className="mt-4 block text-center text-sm font-semibold text-green-800 underline">Continue shopping</Link>
          </div>
        </>
      )}
    </main>
  );
}
