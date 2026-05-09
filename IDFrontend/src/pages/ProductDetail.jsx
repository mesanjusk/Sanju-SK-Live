import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';
import LazyImage from '../components/common/LazyImage';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    api.get(`/api/products/${id}`).then((res) => setProduct(res.data));
  }, [id]);

  if (!product) return <div className="p-4">Loading product...</div>;

  return (
    <div className="p-4">
      {product.images?.[0] && (
        <LazyImage
          src={product.images[0]}
          alt={product.title}
          className="mx-auto w-full max-w-md rounded"
        />
      )}
      <h2 className="mt-4 text-2xl font-semibold">{product.title}</h2>
      <p className="mt-2 text-gray-700">{product.description}</p>
      <p className="mt-2 text-xl font-bold">₹{product.price}</p>
      <button
        onClick={() => addToCart(product)}
        className="mt-4 rounded bg-pink-600 px-4 py-2 text-white"
      >
        Add to Cart
      </button>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(window.location.href)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-4 text-green-600 underline"
      >
        Share on WhatsApp
      </a>
    </div>
  );
};

export default ProductDetail;
