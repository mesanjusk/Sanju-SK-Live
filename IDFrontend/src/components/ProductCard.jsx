import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import LazyImage from './common/LazyImage';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const badge = product?.badge;
  const productLink = product?.detailPath || `/products/${product?._id}`;

  return (
    <article className="group overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
      <Link to={productLink} className="block">
        <div className="relative">
          {product?.images?.[0] ? (
            <LazyImage
              src={product.images[0]}
              alt={product?.title || 'Product image'}
              className="h-48 w-full rounded-t-xl object-cover"
            />
          ) : (
            <div className="flex h-48 w-full items-center justify-center rounded-t-xl bg-gray-100 text-sm text-gray-500">
              No image available
            </div>
          )}

          {badge && (
            <span className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
              {badge}
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link to={productLink}>
          <h3 className="line-clamp-1 text-lg font-bold text-gray-800">{product?.title}</h3>
        </Link>

        <p className="mt-2 line-clamp-2 text-sm text-gray-600">{product?.description}</p>

        <div className="mt-4">
          <span className="text-xl font-bold text-red-600">₹{product?.price}</span>
        </div>

        <button
          onClick={() => addToCart(product)}
          className="mt-4 w-full rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white transition-all duration-300 hover:bg-red-700 active:scale-95"
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
