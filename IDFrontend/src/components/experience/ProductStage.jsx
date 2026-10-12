import { useEffect, useRef, useState } from 'react';
import { FaArrowLeft, FaArrowRight, FaExpand, FaSearchMinus, FaSearchPlus, FaTimes } from 'react-icons/fa';

// The photo viewer uses CSS perspective. It is not represented as a true 3D model.
// If a listing provides a GLB/GLTF URL, a real interactive model viewer is enabled.
export default function ProductStage({
  images = [], title = 'Product', activeIndex = 0, onIndexChange,
  modelUrl, compact = false,
}) {
  const frameRef = useRef(null);
  const touchRef = useRef(null);
  const [inspect, setInspect] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [modelReady, setModelReady] = useState(false);
  const [mode, setMode] = useState('photo');
  const photos = Array.isArray(images) ? images.filter(Boolean) : [images].filter(Boolean);
  const selected = photos[activeIndex] || photos[0];
  const next = (dir) => {
    if (photos.length > 1) onIndexChange?.((activeIndex + dir + photos.length) % photos.length);
  };

  useEffect(() => {
    if (!modelUrl) return;
    let mounted = true;
    const enable = () => {
      if (!mounted) return;
      window.customElements?.whenDefined('model-viewer').then(() => {
        if (mounted) setModelReady(true);
      });
    };
    if (window.customElements?.get('model-viewer')) enable();
    else {
      let script = document.querySelector('script[data-sk-model-viewer]');
      if (!script) {
        script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://cdn.jsdelivr.net/npm/@google/model-viewer@4.1.0/dist/model-viewer.min.js';
        script.dataset.skModelViewer = 'true';
        document.head.appendChild(script);
      }
      script.addEventListener('load', enable);
      return () => { mounted = false; script.removeEventListener('load', enable); };
    }
    return () => { mounted = false; };
  }, [modelUrl]);

  useEffect(() => {
    if (!inspect) return;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setInspect(false);
      if (event.key === 'ArrowRight') next(1);
      if (event.key === 'ArrowLeft') next(-1);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [inspect, activeIndex, photos.length, onIndexChange]);

  useEffect(() => { setZoom(1); }, [activeIndex, inspect]);

  const onPointerMove = (event) => {
    if (event.pointerType !== 'mouse' || !frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - .5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - .5) * 2;
    frameRef.current.style.setProperty('--sk-ry', `${(x * 7).toFixed(2)}deg`);
    frameRef.current.style.setProperty('--sk-rx', `${(-y * 6).toFixed(2)}deg`);
  };
  const onPointerLeave = () => {
    frameRef.current?.style.setProperty('--sk-ry', '0deg');
    frameRef.current?.style.setProperty('--sk-rx', '0deg');
  };
  const onTouchStart = (event) => {
    if (event.touches?.[0]) touchRef.current = event.touches[0].clientX;
  };
  const onTouchEnd = (event) => {
    if (touchRef.current === null || touchRef.current === undefined || photos.length <= 1) return;
    const delta = touchRef.current - event.changedTouches[0].clientX;
    if (Math.abs(delta) > 45) next(delta > 0 ? 1 : -1);
    touchRef.current = null;
  };

  return (
    <>
      <div className={`sk-product-stage ${compact ? 'sk-product-stage--compact' : ''}`}>
        <div className="sk-product-stage__viewport" ref={frameRef}
          onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}
          onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="sk-product-stage__light" aria-hidden="true" />
          <div className="sk-product-stage__floor" aria-hidden="true" />
          {modelReady && mode === 'model' ? (
            <model-viewer src={modelUrl} alt={`Interactive 3D model of ${title}`}
              camera-controls="true" shadow-intensity="1" exposure="1" interaction-prompt="auto"
              style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 3 }} />
          ) : (
            <div className="sk-product-stage__artwork">
              {selected ? (
                <img src={selected} alt={`${title} — view ${activeIndex + 1} of ${photos.length}`}
                  draggable="false" loading={compact ? 'lazy' : 'eager'} decoding="async" />
              ) : (
                <div className="sk-product-stage__missing">Product photo coming soon</div>
              )}
            </div>
          )}

          <div className="sk-product-stage__topbar">
            <span className="sk-product-stage__tag">{modelReady && mode === 'model' ? 'Real 3D model' : 'Studio preview'}</span>
            {selected && (
              <button type="button" className="sk-product-stage__icon" onClick={() => setInspect(true)}
                aria-label={`Inspect ${title} image full screen`}>
                <FaExpand />
              </button>
            )}
          </div>

          <div className="sk-product-stage__bottom">
            <span>{photos.length > 1 ? `Swipe to explore · ${activeIndex + 1}/${photos.length}` : 'Tap expand to inspect details'}</span>
            {!compact && photos.length > 1 && (
              <div className="sk-product-stage__arrows">
                <button type="button" onClick={() => next(-1)} aria-label="Previous photo"><FaArrowLeft /></button>
                <button type="button" onClick={() => next(1)} aria-label="Next photo"><FaArrowRight /></button>
              </div>
            )}
          </div>
        </div>

        {modelReady && (
          <div className="sk-product-stage__switch" role="group" aria-label="Product viewing mode">
            <button type="button" aria-pressed={mode === 'photo'} onClick={() => setMode('photo')}>Photo view</button>
            <button type="button" aria-pressed={mode === 'model'} onClick={() => setMode('model')}>Rotate 3D model</button>
          </div>
        )}

        {!compact && photos.length > 1 && (
          <div className="sk-product-stage__thumbs" aria-label="Product photo angles">
            {photos.map((photo, i) => (
              <button key={`${photo}-${i}`} type="button" onClick={() => onIndexChange?.(i)}
                aria-label={`Show photo ${i + 1}`} aria-pressed={i === activeIndex}
                className={i === activeIndex ? 'is-active' : ''}>
                <img src={photo} loading="lazy" alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      {inspect && selected && (
        <div className="sk-image-inspector" role="dialog" aria-modal="true" aria-label={`Inspect ${title}`}>
          <div className="sk-image-inspector__top">
            <div><strong>{title}</strong><p>Actual product photo · Zoom for details</p></div>
            <button type="button" onClick={() => setInspect(false)} aria-label="Close inspection" autoFocus><FaTimes /></button>
          </div>
          <div className="sk-image-inspector__canvas">
            <img src={selected} alt={`${title} enlarged view`} style={{ transform: `scale(${zoom})` }} />
          </div>
          <div className="sk-image-inspector__tools">
            <button type="button" disabled={zoom <= 1} onClick={() => setZoom(z => Math.max(1, +(z - .25).toFixed(2)))} aria-label="Zoom out"><FaSearchMinus /></button>
            <span>{Math.round(zoom * 100)}%</span>
            <button type="button" disabled={zoom >= 3} onClick={() => setZoom(z => Math.min(3, +(z + .25).toFixed(2)))} aria-label="Zoom in"><FaSearchPlus /></button>
            {photos.length > 1 && <>
              <button type="button" onClick={() => next(-1)} aria-label="Previous image"><FaArrowLeft /></button>
              <button type="button" onClick={() => next(1)} aria-label="Next image"><FaArrowRight /></button>
            </>}
          </div>
        </div>
      )}
    </>
  );
}
