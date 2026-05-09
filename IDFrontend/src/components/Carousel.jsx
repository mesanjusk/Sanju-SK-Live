import { useState, useEffect } from 'react';

const Carousel = ({ images = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e) => {
    if (isZoomed) return;
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (isZoomed) return;
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || isZoomed) return;

    const swipeDistance = touchStart - touchEnd;
    if (swipeDistance > 50) nextImage();
    if (swipeDistance < -50) prevImage();

    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleMouseDown = (e) => {
    if (isZoomed) return;
    setDragging(true);
    setDragStart(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (!dragging || isZoomed) return;

    const distance = dragStart - e.clientX;
    if (distance > 100) {
      nextImage();
      setDragging(false);
    } else if (distance < -100) {
      prevImage();
      setDragging(false);
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const toggleZoom = () => {
    setIsZoomed((z) => !z);
  };

  // Enable left/right arrow navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  if (images.length === 0) return null;

  return (
    <div
      className="relative select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      role="region"
      aria-label="Image Carousel"
    >
      <img
        src={images[currentIndex]}
        alt={`Slide ${currentIndex + 1}`}
        className={`w-full aspect-square object-cover transition-transform duration-300 ${
          isZoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in'
        }`}
        onClick={toggleZoom}
      />

      {/* Arrows (visible on sm+) */}
      <button
        className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white p-1 rounded-full"
        onClick={prevImage}
        aria-label="Previous Slide"
      >
        &#10094;
      </button>
      <button
        className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white p-1 rounded-full"
        onClick={nextImage}
        aria-label="Next Slide"
      >
        &#10095;
      </button>

      {/* Dots */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
        {images.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
