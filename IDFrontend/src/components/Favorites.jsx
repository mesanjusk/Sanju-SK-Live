import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';

const Favorites = () => {
  const { favorites, removeFavorite } = useFavorites();

  if (favorites.length === 0) {
    return <p className="p-4 text-center">No favourites yet.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {favorites.map((item) => (
        <div key={item.id} className="border rounded shadow-sm p-4 flex flex-col">
          <img
            src={item.images?.[0]}
            alt={item.title}
            className="h-40 w-full object-cover rounded mb-2"
          />
          <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
          <p className="text-sm text-gray-600 mb-2">{item.price} USD / night</p>
          <div className="mt-auto flex justify-between items-center">
            <Link
              to={`/listing/${item.id}`}
              className="text-blue-500 hover:underline text-sm"
            >
              View Details
            </Link>
            <button
              onClick={() => removeFavorite(item.id)}
              className="text-xs text-red-500 hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Favorites;

