// Pure CSS printing-press animation; no JS intervals, images or external assets.
export default function CatalogLoadingState({ compact = false, error = false, onRetry }) {
  return (
    <section className={'sk-catalog-loading' + (compact ? ' sk-catalog-loading--compact' : '') +
      (error ? ' sk-catalog-loading--error' : '')}
      aria-label={error ? 'Catalog loading failed' : 'Loading product designs'}
      role={compact ? undefined : 'status'} aria-live={compact ? undefined : 'polite'}
      aria-hidden={compact ? true : undefined} aria-busy={!error}>
      <div className="sk-printing-scene" aria-hidden="true">
        <span className="sk-print-spark sk-print-spark-one">✦</span>
        <span className="sk-print-spark sk-print-spark-two">✧</span>
        <div className="sk-print-press">
          <div className="sk-print-press-top">
            <img className="sk-print-press-logo" src="/images/sk-digital-final.svg" alt="" width="44" height="28" />
          </div>
          <div className="sk-print-press-slot" />
          <div className="sk-print-paper">
            <span className="sk-print-paper-emblem">✦</span>
            <span className="sk-print-paper-line" />
            <span className="sk-print-paper-line sk-print-paper-line-short" />
          </div>
          <div className="sk-print-press-foot" />
        </div>
      </div>
      <div className="sk-catalog-loading-copy">
        <strong>{error ? 'Our design gallery is temporarily unavailable' : 'Preparing your designs'}</strong>
        <p>{error
          ? 'We could not connect to the catalog. Your enquiry options are still available.'
          : 'Arranging the latest collections from our Gondia studio…'}</p>
        {error
          ? <button type="button" className="sk-catalog-retry" onClick={onRetry}>Try loading again</button>
          : <span className="sk-catalog-progress" aria-hidden="true"><i/><i/><i/></span>}
      </div>
    </section>
  );
}
