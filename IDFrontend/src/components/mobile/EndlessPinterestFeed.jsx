import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PinterestPinCard from './PinterestPinCard';
import { itemKey } from './endlessOrder.mjs';
import { uniqueDesigns } from './uniqueDesigns.mjs';

const BATCH_SIZE = 18;

/**
 * Display each real catalog design once per filter view. Unlike the old
 * endless shuffled cycles, this stops when the unique catalog is exhausted.
 * The "More about" SEO footer stays reachable without an infinite stream.
 */
export default function EndlessPinterestFeed({ products = [], categoryById, whatsappNumber }) {
  const uniqueProducts = useMemo(() => uniqueDesigns(products), [products]);
  const [visibleCount, setVisibleCount] = useState(() => Math.min(BATCH_SIZE, uniqueProducts.length));
  const tailRef = useRef(null);
  const loadingRef = useRef(false);
  const remaining = Math.max(0, uniqueProducts.length - visibleCount);

  const appendNext = useCallback(() => {
    if (loadingRef.current || !remaining ||
      document.getElementById('sk-business-information')?.open) return;
    loadingRef.current = true;
    setVisibleCount(current => Math.min(current + BATCH_SIZE, uniqueProducts.length));
  }, [remaining, uniqueProducts.length]);

  useEffect(() => { loadingRef.current = false; }, [visibleCount]);

  useEffect(() => {
    if (!remaining || !tailRef.current || !('IntersectionObserver' in window)) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) appendNext();
    }, { rootMargin: '420px 0px', threshold: 0 });
    observer.observe(tailRef.current);
    return () => observer.disconnect();
  }, [remaining, appendNext]);

  return (
    <>
      <div className="sk-pin-masonry" aria-label="Browse unique custom printing and design ideas">
        {uniqueProducts.slice(0, visibleCount).map((product, index) => (
          <PinterestPinCard key={itemKey(product)} product={product} index={index}
            categoryName={categoryById.get(itemKey(product.category))?.name || product.category?.name || ''}
            whatsappNumber={whatsappNumber} />
        ))}
      </div>
      {remaining > 0 ? (
        <div ref={tailRef} className="sk-pin-feed-sentinel" aria-label="Load more different designs">
          <button type="button" className="sk-pin-show-more" onClick={appendNext}>
            Show more designs <span aria-hidden="true">↓</span>
          </button>
        </div>
      ) : (
        <p className="sk-pin-end-note" role="status">
          You've seen all {uniqueProducts.length} unique designs.
          Explore another category for more ideas.
        </p>
      )}
    </>
  );
}
