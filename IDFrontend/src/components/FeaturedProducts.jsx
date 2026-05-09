import ProductCard from './ProductCard';

const FeaturedProducts = ({ products = [], visibleCount = 8, onLoadMore }) => {
  const visibleProducts = products.slice(0, visibleCount);

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Featured Products
          </h2>
          <p className="mt-3 text-gray-600">
            Popular picks designed for promotions, events, and everyday branding.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product._id || product.listing_uuid}
              product={product}
            />
          ))}
        </div>

        {products.length > visibleCount && (
          <div className="mt-10 text-center">
            <button
              onClick={onLoadMore}
              className="rounded-lg border border-red-600 px-6 py-3 font-semibold text-red-600 transition-all duration-300 hover:bg-red-600 hover:text-white hover:shadow-lg"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;