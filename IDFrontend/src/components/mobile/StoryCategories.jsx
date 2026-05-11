import { memo } from 'react';

function StoryCategories({ categories = [], onSelect, selectedId }) {
  return (
    <section className="overflow-x-auto border-b border-gray-100 px-4 py-3 scrollbar-hide">
      <div className="mx-auto flex max-w-2xl snap-x gap-4">
        {/* All */}
        <button onClick={() => onSelect?.(null)} className="flex-shrink-0 snap-start text-center">
          <div className={`mx-auto h-16 w-16 rounded-full p-[2px] ${!selectedId ? 'bg-gradient-to-br from-pink-500 via-orange-400 to-yellow-400' : 'bg-gray-200'}`}>
            <div className="h-full w-full overflow-hidden rounded-full bg-white p-[2px]">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-50 text-[11px] font-semibold text-gray-600">
                All
              </div>
            </div>
          </div>
          <p className="mt-1 w-16 truncate text-[11px] text-gray-700">All</p>
        </button>

        {categories.map((cat, i) => (
          <button
            key={cat._id || i}
            onClick={() => onSelect?.(cat)}
            className="flex-shrink-0 snap-start text-center"
          >
            <div className={`mx-auto h-16 w-16 rounded-full p-[2px] ${selectedId === cat._id ? 'bg-gradient-to-br from-pink-500 via-orange-400 to-yellow-400' : 'bg-gray-200'}`}>
              <div className="h-full w-full overflow-hidden rounded-full bg-white p-[2px]">
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.name} className="h-full w-full rounded-full object-cover" loading="lazy" />
                ) : (
                  <div className="h-full w-full rounded-full bg-gray-100" />
                )}
              </div>
            </div>
            <p className="mt-1 w-16 truncate text-[11px] text-gray-700">{cat.name}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

export default memo(StoryCategories);
