import { useState, useEffect } from "react";
import api from '../api';

const categories = ["All", "Wedding", "Birthday", "Vastu", "Opening"];

export default function InstagramStyleGallery() {
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [likes, setLikes] = useState({});

  const fetchImages = async () => {
    try {
      const res = await api.get("/api/images");
      setImages(res.data);
      setFilteredImages(res.data);
    } catch (err) {
      console.error("Error fetching images:", err);
    }
  };

  useEffect(() => {
    fetchImages();
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredImages(images);
    } else {
      setFilteredImages(images.filter((img) => img.category === selectedCategory));
    }
  }, [selectedCategory, images]);

  const handleLike = (imageId) => {
    setLikes((prevLikes) => ({
      ...prevLikes,
      [imageId]: prevLikes[imageId] ? prevLikes[imageId] + 1 : 1,
    }));
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-yellow-50">

      {/* Header */}
      <header className="bg-white shadow-md py-2 px-4 flex justify-between items-center fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center space-x-4">
          <span className="font-bold text-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 bg-clip-text text-transparent">S.K. Cards</span>
        </div>
        <div className="flex space-x-4 text-pink-600">
          <i className="fas fa-facebook-messanger text-xl cursor-pointer"></i>
          <a
            href="https://wa.me/919372333633?text=Hi%2C%20I%20would%20like%20to%20make%20an%20enquiry"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl"
          >
            <i className="fa-brands fa-facebook-messenger text-xl"></i>
          </a>
        </div>
      </header>

      {/* Content */}
      <div className="mt-[60px] mb-[60px] overflow-y-auto flex-1">

        {/* Categories */}
        <div className="flex overflow-x-auto space-x-6 px-4 py-3 scrollbar-hide">
          {categories.map((category) => (
            <div
              key={category}
              className={`flex flex-col items-center space-y-2 cursor-pointer transition-transform duration-200 ${
                selectedCategory === category ? "scale-105" : ""
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-200 to-purple-100 flex items-center justify-center">
                <span className="text-xl font-semibold text-pink-600">{category[0]}</span>
              </div>
              <span className="text-sm text-pink-700">{category}</span>
            </div>
          ))}
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
          {filteredImages.map((img) => (
            <div
              key={img._id}
              className="bg-white rounded shadow-md cursor-pointer relative overflow-hidden"
            >
              <div className="aspect-square">
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-full object-cover pointer-events-auto select-none"
                  onContextMenu={(e) => e.preventDefault()}
                  loading="lazy"
                  draggable={false}
                />
              </div>
              <p className="text-center text-pink-600 font-medium py-2">{img.title}</p>
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
                <button
                  onClick={() => handleLike(img._id)}
                  
                >
                  <i className="fas fa-heart mr-2 text-red-600"></i>
                  Like {likes[img._id] || 0}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white shadow-md py-3 px-6 fixed bottom-0 left-0 right-0 z-10">
        <div className="flex justify-around items-center text-pink-600">
          <div className="flex flex-col items-center">
            <i className="fas fa-home text-2xl"></i>
            <span className="text-xs">Home</span>
          </div>
          <div className="flex flex-col items-center">
            <i className="fas fa-search text-2xl"></i>
            <span className="text-xs">Search</span>
          </div>
          <div className="flex flex-col items-center">
            <i className="fas fa-plus-circle text-2xl"></i>
            <span className="text-xs">Add</span>
          </div>
          <div className="flex flex-col items-center">
            <a
              href="https://wa.me/919372333633?text=Hi%2C%20I%20would%20like%20to%20make%20an%20enquiry"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-whatsapp text-2xl"></i>
            </a>
            <span className="text-xs">Messages</span>
          </div>
          <div className="flex flex-col items-center">
            <i className="fas fa-user-circle text-2xl"></i>
            <span className="text-xs">Profile</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
