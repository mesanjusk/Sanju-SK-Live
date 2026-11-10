import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PinterestPinCard from './PinterestPinCard';
import { itemKey } from './endlessOrder.mjs';
import { uniqueDesigns } from './uniqueDesigns.mjs';
import { geminiDesignIds, orderDesigns, readDesignInterests, secureRandomSeed } from './recommendations.mjs';

const BATCH_SIZE = 18;

/**
 * A fresh shuffle per visit/refresh, elevated similar designs after a tap.
 * One product appears only once per feed; no duplicate cycles or end-message.
 */
export default function EndlessPinterestFeed({ products = [], categoryById, whatsappNumber }) {
  const uniqueProducts = useMemo(() => uniqueDesigns(products), [products]);
  const [seed] = useState(secureRandomSeed);
  const [interests] = useState(readDesignInterests);
  const [geminiIds, setGeminiIds] = useState([]);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const tailRef = useRef(null);
  const loadingRef = useRef(false);
  const orderedProducts = useMemo(() => orderDesigns(uniqueProducts, interests, seed, geminiIds),
    [uniqueProducts, interests, seed, geminiIds]);
  const remaining = Math.max(0, orderedProducts.length - visibleCount);

  useEffect(() => {
    if (!interests.length || !uniqueProducts.length) return undefined;
    const controller = new AbortController();
    geminiDesignIds(uniqueProducts, interests, controller.signal).then(ids => {
      if (!controller.signal.aborted && ids.length) setGeminiIds(ids);
    });
    return () => controller.abort();
  }, [uniqueProducts, interests]);

  const appendNext = useCallback(() => {
    if (loadingRef.current || !remaining ||
      document.getElementById('sk-business-information')?.open) return;
    loadingRef.current = true;
    setVisibleCount(current => Math.min(current + BATCH_SIZE, orderedProducts.length));
  }, [remaining, orderedProducts.length]);

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
      <div className="sk-pin-masonry" aria-label="Discover personalised unique designs">
        {orderedProducts.slice(0, visibleCount).map((product, index) => (
          <PinterestPinCard key={itemKey(product)} product={product} index={index}
            categoryName={categoryById.get(itemKey(product.category))?.name ||
              product.category?.name || ''} whatsappNumber={whatsappNumber}/>
        ))}
      </div>
      {remaining > 0 && (
        <div ref={tailRef} className="sk-pin-feed-sentinel" aria-label="Load more designs">
          <button type="button" className="sk-pin-show-more" onClick={appendNext}>
            Show more designs <span aria-hidden="true">↓</span>
          </button>
        </div>
      )}
    </>
  );
}
