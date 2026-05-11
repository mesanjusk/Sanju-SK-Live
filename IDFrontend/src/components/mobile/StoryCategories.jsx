import { memo } from 'react';

function StoryCategories({ categories = [], onSelect }) {
  return (
    <section className="overflow-x-auto px-4 py-3 scrollbar-hide">
      <div className="mx-auto flex max-w-2xl snap-x gap-3">
        {categories.map((cat, i) => (
          <button key={cat._id || i} onClick={() => onSelect?.(cat)} className="snap-start text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-pink-500 via-orange-400 to-green-500 p-[2px]">
              <div className="h-full w-full overflow-hidden rounded-full bg-white p-[2px]">
                {cat.imageUrl ? <img src={cat.imageUrl} alt={cat.name} className="h-full w-full rounded-full object-cover" loading="lazy" /> : <div className="h-full w-full rounded-full bg-gray-100" />}
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
