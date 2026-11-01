import { memo, useCallback, useEffect, useState } from 'react';
import CompactProductCard from './CompactProductCard';

// Keep exactly three products in the viewport while allowing horizontal swipe.
// Render additional products in batches as shoppers approach the end of a row.
const BATCH_SIZE = 6;

function CategoryProductCarousel({ section, whatsappNumber }) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  useEffect(() => setVisibleCount(BATCH_SIZE), [section.id]);

  const onScroll = useCallback((event) => {
    const row = event.currentTarget;
    if (row.scrollWidth - row.scrollLeft - row.clientWidth < 170) {
      setVisibleCount(count => Math.min(count + BATCH_SIZE, section.products.length));
    }
  }, [section.products.length]);

  return (
    <div role="region" aria-label={section.name + ' products — swipe left to explore more'}
      className="flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain pb-3 scrollbar-hide"
      onScroll={onScroll}>
      {section.products.slice(0, visibleCount).map(product => (
        <div key={product._id} className="min-w-0 shrink-0 snap-start"
          style={{ flex: '0 0 calc((100% - 16px) / 3)' }}>
          <CompactProductCard product={product} categoryName={section.name}
            whatsappNumber={whatsappNumber} />
        </div>
      ))}
    </div>
  );
}

export default memo(CategoryProductCarousel);
