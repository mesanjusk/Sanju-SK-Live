import { useCallback, useEffect, useRef, useState } from 'react';
import PinterestPinCard from './PinterestPinCard';
import { shuffleNextCycle, itemKey } from './endlessOrder.mjs';

const BATCH_SIZE = 18;
const entry = (product, cycle, index) => ({
  product, key: cycle + '-' + index + '-' + itemKey(product),
});

/** Endless Pinterest gallery: every design once per cycle, shuffled next time.
 * Uses small batches and an observer, rather than continuously repainting.
 * The enclosing component is re-mounted when the selected filter changes.
 */
export default function EndlessPinterestFeed({ products = [], categoryById, whatsappNumber }) {
  const initialCount = Math.min(BATCH_SIZE, products.length);
  const [pins, setPins] = useState(() =>
    products.slice(0, initialCount).map((product,index) => entry(product, 0, index)));
  const cursorRef = useRef({ order: products, offset: initialCount, cycle: 0 });
  const tailRef = useRef(null);
  const appendingRef = useRef(false);

  const appendNext = useCallback(() => {
    if (!products.length || appendingRef.current) return;
    appendingRef.current = true;
    const cursor = cursorRef.current;
    const next = [];
    for (let i = 0; i < BATCH_SIZE; i += 1) {
      if (cursor.offset >= cursor.order.length) {
        cursor.order = shuffleNextCycle(cursor.order);
        cursor.offset = 0;
        cursor.cycle += 1;
      }
      const position = cursor.offset++;
      next.push(entry(cursor.order[position], cursor.cycle, position));
    }
    setPins(previous => [...previous, ...next]);
  }, [products.length]);

  useEffect(() => { appendingRef.current = false; }, [pins.length]);

  useEffect(() => {
    if (!products.length || !tailRef.current || !('IntersectionObserver' in window)) return undefined;
    const observer = new IntersectionObserver(([item]) => {
      if (item.isIntersecting) appendNext();
    }, { rootMargin: '500px 0px', threshold: 0 });
    observer.observe(tailRef.current);
    return () => observer.disconnect();
  }, [pins.length, products.length, appendNext]);

  return (
    <>
      <div className="sk-pin-masonry" aria-label="Browse custom printing and design gallery">
        {pins.map((item,index) => (
          <PinterestPinCard key={item.key} product={item.product} index={index}
            categoryName={categoryById.get(itemKey(item.product.category))?.name || item.product.category?.name || ''}
            whatsappNumber={whatsappNumber} />
        ))}
      </div>
      <div ref={tailRef} className="sk-pin-feed-sentinel" aria-label="Continue exploring designs">
        <button type="button" className="sk-pin-show-more"
          onClick={appendNext}>More inspiration <span aria-hidden="true">↻</span></button>
      </div>
    </>
  );
}
