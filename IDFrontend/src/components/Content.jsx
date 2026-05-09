import { useEffect, useState } from 'react';
import Carousel from './Carousel';
import {
  FaRegHeart,
  FaHeart,
  FaRegCommentDots,
  FaShare,
  FaBookmark,
  FaRegBookmark,
} from 'react-icons/fa';

const Content = ({ listings, selectedCategory }) => {
  const [savedPosts, setSavedPosts] = useState(() => {
    const saved = localStorage.getItem('savedPosts');
    return saved ? JSON.parse(saved) : {};
  });

  const handleLikeClick = (listingId) => {
    setSavedPosts((prev) => {
      const updated = { ...prev };
      const existing = updated[listingId] || { likes: 0, bookmarked: false };

      if (existing.likes > 0) {
        existing.likes -= 1;
      } else {
        existing.likes += 1;
      }

      updated[listingId] = existing;
      localStorage.setItem('savedPosts', JSON.stringify(updated));
      return updated;
    });
  };

  const handleBookmarkToggle = (listingId) => {
    setSavedPosts((prev) => {
      const updated = { ...prev };
      const existing = updated[listingId] || { likes: 0, bookmarked: false };

      existing.bookmarked = !existing.bookmarked;
      updated[listingId] = existing;
      localStorage.setItem('savedPosts', JSON.stringify(updated));
      return updated;
    });
  };

  const filteredListings = selectedCategory
    ? listings.filter((l) => l.category === selectedCategory)
    : listings;

  useEffect(() => {
    localStorage.setItem('savedPosts', JSON.stringify(savedPosts));
  }, [savedPosts]);

  return (
    <div className="flex-1 overflow-y-auto pb-16">
      {filteredListings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No listings available</div>
      ) : (
        filteredListings.map((listing) => {
          const saved = savedPosts[listing._id] || { likes: 0, bookmarked: false };

          return (
            <div key={listing._id} className="border-b pb-4">
              <div className="flex items-center p-3 space-x-3">
                <img
                  src={listing.images[0] || 'default-image-path.jpg'}
                  alt="profile"
                  className="w-9 h-9 rounded-full object-cover"
                />
                <span className="font-semibold">{listing.title}</span>
              </div>

              <Carousel images={listing.images} />

              <div className="px-3 mt-2 flex justify-between items-center text-xl">
                <div className="flex space-x-4">
                  {/* Heart Icon with Like Count */}
                  <div className="flex items-center">
                    <div
                      className="cursor-pointer hover:text-red-500"
                      onClick={() => handleLikeClick(listing._id)}
                    >
                      {saved.likes > 0 ? (
                        <FaHeart className="text-red-500" />
                      ) : (
                        <FaRegHeart />
                      )}
                    </div>
                    <span className="ml-2">{saved.likes}</span>
                  </div>

                  <FaRegCommentDots className="cursor-pointer hover:text-blue-500" />

                  <FaShare
                    className="cursor-pointer"
                    onClick={() => {
                      if (navigator.share) {
                        navigator
                          .share({
                            title: listing.title,
                            text: listing.location,
                            url: window.location.href,
                          })
                          .catch((err) => console.error('Share failed:', err));
                      } else {
                        alert('Sharing is not supported in this browser.');
                      }
                    }}
                  />
                </div>

                {/* Bookmark */}
                <div
                  className="cursor-pointer"
                  onClick={() => handleBookmarkToggle(listing._id)}
                >
                  {saved.bookmarked ? <FaBookmark /> : <FaRegBookmark />}
                </div>
              </div>

              <div className="px-3 text-sm mt-1">{listing.location}</div>
              <div className="px-3 text-sm text-green-500">{listing.price} ₹</div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Content;
