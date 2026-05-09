const Category = ({ uniqueCategories = [], selectedCategory, setSelectedCategory }) => {
  return (
    <div className="px-3 py-2">
      {uniqueCategories.length === 0 ? (
        <div className="text-gray-500">No categories available</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {uniqueCategories.map((category) => {
            const isSelected = selectedCategory === category;
            const label = category || 'Unknown';
            const initial = category?.[0]?.toUpperCase() || '?';

            return (
              <button
                key={category}
                type="button"
                className={`group relative overflow-hidden rounded-xl border bg-white text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                  isSelected ? 'border-red-600 ring-1 ring-red-600' : 'border-gray-100'
                }`}
                onClick={() => setSelectedCategory(isSelected ? null : category)}
              >
                <div className="relative aspect-square w-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-red-700 opacity-90" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 transition-all duration-300 group-hover:opacity-100" />
                  <div className="relative z-10 flex h-full flex-col items-center justify-center p-3 text-white">
                    <span className="mb-2 flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/20 text-2xl font-bold backdrop-blur-sm">
                      {initial}
                    </span>
                    <span className="line-clamp-2 text-sm font-semibold">{label}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Category;
