import {useEffect,useMemo,useRef} from 'react';
import PinterestPinCard from './PinterestPinCard';
import {itemKey} from './endlessOrder.mjs';
import {uniqueDesigns} from './uniqueDesigns.mjs';

/**
 * Truly incremental Pinterest-style feed. Parent retrieves one MongoDB page
 * at a time; this component never fetches the complete catalog or repeats pins.
 */
export default function EndlessPinterestFeed({
  products=[],categoryById,whatsappNumber,hasMore=false,
  loadingMore=false,loadError=false,onLoadMore
}){
  const uniqueProducts=useMemo(()=>uniqueDesigns(products),[products]);
  const sentinelRef=useRef(null);
  useEffect(()=>{
    if(!hasMore||loadingMore||loadError||!onLoadMore||!sentinelRef.current||
      typeof IntersectionObserver==='undefined')return undefined;
    const observer=new IntersectionObserver(([entry])=>{
      if(entry.isIntersecting&&
        !document.getElementById('sk-business-information')?.open)onLoadMore();
    },{rootMargin:'650px 0px',threshold:0});
    observer.observe(sentinelRef.current);
    return ()=>observer.disconnect();
  },[hasMore,loadingMore,loadError,onLoadMore,uniqueProducts.length]);

  return (
    <>
      <div className="sk-pin-masonry" aria-label="Browse custom printing and design ideas">
        {uniqueProducts.map((product,index)=>(
          <PinterestPinCard key={itemKey(product)} product={product} index={index}
            categoryName={categoryById.get(itemKey(product.category))?.name||product.category?.name||''}
            whatsappNumber={whatsappNumber}/>
        ))}
      </div>
      {hasMore&&(
        <div ref={sentinelRef} className="sk-pin-feed-sentinel">
          {loadingMore?(
            <div className="sk-pin-loading-inline" role="status" aria-live="polite">
              <span className="sk-pin-spinner" aria-hidden="true"/>
              <span>Finding more ideas…</span>
            </div>
          ):loadError?(
            <button type="button" className="sk-pin-show-more" onClick={onLoadMore}>
              Could not load designs · Tap to retry
            </button>
          ):(
            <button type="button" className="sk-pin-show-more" onClick={onLoadMore}>
              Explore more designs <span aria-hidden="true">↓</span>
            </button>
          )}
        </div>
      )}
    </>
  );
}
