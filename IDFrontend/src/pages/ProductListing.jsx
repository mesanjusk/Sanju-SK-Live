import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import api from '../api';

const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/api/products'),
          api.get('/api/categories'),
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filtered = products
    .filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => (category ? p.category === category : true));

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'price-asc') return a.price - b.price;
    if (sort === 'price-desc') return b.price - a.price;
    return 0;
  });

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row">
        <input
          type="text"
          placeholder="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border p-2"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="border p-2">
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="border p-2">
          <option value="">Sort By</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductListing;
