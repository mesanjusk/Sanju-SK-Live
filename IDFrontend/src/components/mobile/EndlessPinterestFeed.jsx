import {useEffect,useMemo,useRef} from 'react';
import PinterestPinCard from './PinterestPinCard';
import PinterestVideoPin from './PinterestVideoPin';
import {interleavePinterestVideos} from './pinterestVideoFeed.mjs';
import {itemKey} from './endlessOrder.mjs';
import {uniqueDesigns} from './uniqueDesigns.mjs';

/**
 * Truly incremental Pinterest-style feed. Parent retrieves one MongoDB page
 * at a time; this component never fetches the complete catalog or repeats pins.
 */
export default function EndlessPinterestFeed({
  products=[],videos=[],categoryById,whatsappNumber,hasMore=false,
  loadingMore=false,loadError=false,onLoadMore
}){
  const uniqueProducts=useMemo(()=>uniqueDesigns(products),[products]);
  const feedItems=useMemo(()=>interleavePinterestVideos(uniqueProducts,videos),[uniqueProducts,videos]);
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
        {feedItems.map((item,index)=>item.kind==='video'?
          <PinterestVideoPin key={item.key} video={item.video}/>:
          <PinterestPinCard key={item.key} product={item.product} index={index}
            categoryName={categoryById.get(itemKey(item.product.category))?.name||item.product.category?.name||''}
            whatsappNumber={whatsappNumber}/>
        )}
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
