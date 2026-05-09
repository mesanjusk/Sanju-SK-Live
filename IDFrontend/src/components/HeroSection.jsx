import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section
      className="relative overflow-hidden bg-gray-900 text-white"
      style={{
        backgroundImage:
          "linear-gradient(var(--overlay-strong), var(--overlay-strong)), url('https://images.unsplash.com/photo-1586074299757-dc655f18518f?auto=format&fit=crop&w=1600&q=80')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 md:py-32 animate-[fadeIn_700ms_ease-out]">
        <p className="mb-4 inline-block rounded-full bg-red-600/90 px-4 py-1 text-sm font-semibold">
          Premium Printing & Advertising Solutions
        </p>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
          Turning Celebrations Into Beautiful Paper Art
        </h1>
        <p className="mt-6 max-w-2xl text-base text-gray-200 sm:text-lg">
          Making your brand visible, vibrant, and unforgettable.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            to="/products"
            className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white shadow-sm transition-all duration-300 hover:bg-red-700 hover:shadow-lg"
          >
            Explore Products
          </Link>
          <Link
            to="/contact"
            className="rounded-lg border border-white px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-white hover:text-gray-900 hover:shadow-lg"
          >
            Get a Quote
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
