/**
 * Pinterest-inspired card skeletons while the first real MongoDB page loads.
 * No placeholder imagery or external assets; respects reduced-motion settings.
 */
const heights=[220,160,205,180,245,165,225,190,235,160,210,185];
export default function PinterestFeedLoading({error=false,onRetry}){
 if(error)return(
  <section className="sk-pin-load-error" role="alert">
   <p>The design gallery could not load right now.</p>
   <button type="button" className="sk-pin-show-more" onClick={onRetry}>
     Try again
   </button>
  </section>
 );
 return(
  <section className="sk-pin-loading-start" aria-label="Loading product designs"
   aria-live="polite" aria-busy="true">
   <div className="sk-pin-masonry sk-pin-skeleton-grid" aria-hidden="true">
    {heights.map((h,i)=>(
      <div className="sk-pin-skeleton-card" key={i}>
       <div className="sk-pin-skeleton-cover" style={{height:h}}/>
       <div className="sk-pin-skeleton-line"/>
       <div className="sk-pin-skeleton-line sk-pin-skeleton-line--short"/>
      </div>
    ))}
   </div>
   <div className="sk-pin-loading-inline sk-pin-loading-inline--initial" role="status">
    <span className="sk-pin-spinner" aria-hidden="true"/>
    <span>Discovering designs for you…</span>
   </div>
  </section>
 );
}
