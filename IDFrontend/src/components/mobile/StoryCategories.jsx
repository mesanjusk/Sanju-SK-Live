import { memo } from 'react';
import { optimizedImage } from '../../utils/media';

function StoryCategories({ categories = [], onSelect, selectedId }) {
  return (
    <section aria-label="Browse collections" className="sk-story-row overflow-x-auto px-4 py-3 scrollbar-hide">
      <div className="sk-shell flex snap-x gap-3.5">
        <button type="button" onClick={() => onSelect?.(null)}
          className="sk-story-item flex-shrink-0 snap-start text-center" aria-pressed={!selectedId}>
          <div className={`sk-story-item__outer ${!selectedId ? 'is-selected' : ''}`}>
            <div className="sk-story-item__inner flex items-center justify-center">
              <span className="text-xl font-bold text-[#3a6450]">✦</span>
            </div>
          </div>
          <p className="sk-story-item__name">All designs</p>
        </button>
        {categories.map((cat,i) => (
          <button type="button" key={cat._id || i} onClick={() => onSelect?.(cat)}
            className="sk-story-item flex-shrink-0 snap-start text-center" aria-pressed={selectedId === cat._id}>
            <div className={`sk-story-item__outer ${selectedId === cat._id ? 'is-selected' : ''}`}>
              <div className="sk-story-item__inner">
                {cat.imageUrl
                  ? <img src={optimizedImage(cat.imageUrl, 160)} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" width="65" height="65" />
                  : <div className="flex h-full w-full items-center justify-center bg-[#f4f3ea] text-xl text-[#bf9d69]">◈</div>}
              </div>
            </div>
            <p className="sk-story-item__name">{cat.name}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
export default memo(StoryCategories);
