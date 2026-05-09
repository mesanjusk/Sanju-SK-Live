const ContactPreview = () => {
  return (
    <section className="py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-3xl font-bold text-gray-900">Start Your Next Print Project</h2>
          <p className="mt-3 text-gray-600">Tell us what you need and we’ll get back with the best pricing and timeline.</p>

          <form className="mt-6 space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-red-600"
            />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-red-600"
            />
            <textarea
              rows="4"
              placeholder="Project Requirements"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-red-600"
            />
            <button
              type="button"
              className="w-full rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-red-700 hover:shadow-lg"
            >
              Submit Enquiry
            </button>
          </form>
        </div>

        <div className="overflow-hidden rounded-xl shadow-sm">
          <img
            src="https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?auto=format&fit=crop&w=1100&q=80"
            alt="Printing workspace"
            className="h-full w-full object-cover transition-all duration-300 hover:scale-105"
          />
        </div>
      </div>
    </section>
  );
};

export default ContactPreview;
