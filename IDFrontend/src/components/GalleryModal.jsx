import { useEffect } from 'react';

const GalleryModal = ({ images = [], onClose }) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-xl text-gray-700 hover:text-red-500"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="grid gap-4">
          {images.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`Preview ${idx + 1}`}
              className="w-full object-contain rounded"
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GalleryModal;
