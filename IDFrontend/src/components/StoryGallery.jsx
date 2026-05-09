import { useEffect, useState, useRef } from "react";
import api from '../api';

export default function StoryGallery() {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await api.get("/api/images");
        setImages(res.data);
      } catch (err) {
        console.error("Error fetching story images:", err);
      }
    };
    fetchImages();
  }, []);

  useEffect(() => {
    let interval;
    if (autoPlay && images.length > 0) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [autoPlay, images]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      // Swipe left → next
      setCurrentIndex((prev) => (prev + 1) % images.length);
    } else if (diff < -50) {
      // Swipe right → previous
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const currentImage = images[currentIndex];

  return (
    <div
      className="fixed inset-0 bg-black text-white overflow-hidden flex items-center justify-center"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => setAutoPlay((prev) => !prev)} // Tap to pause/play
    >
      {currentImage && (
        <>
          <img
            src={currentImage.url}
            alt={currentImage.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute top-0 left-0 w-full flex gap-1 p-2 z-10">
            {images.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded bg-white transition-opacity ${
                  i <= currentIndex ? "opacity-100" : "opacity-30"
                }`}
              />
            ))}
          </div>
          <div className="absolute bottom-4 w-full text-center text-sm text-gray-300 z-10">
            Tap to {autoPlay ? "pause" : "play"}, swipe to navigate
          </div>
        </>
      )}
    </div>
  );
}
