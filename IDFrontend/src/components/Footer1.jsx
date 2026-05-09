import { useNavigate } from 'react-router-dom';
import { FaHome, FaSearch, FaShoppingBag, FaUser } from 'react-icons/fa';
import { MdOutlineVideoLibrary } from 'react-icons/md';

const Footer1 = () => {
  const navigate = useNavigate(); // Hook to navigate programmatically

  return (
    <div className="fixed bottom-0 w-full max-w-sm bg-white border-t flex justify-between px-6 py-2 text-xl">
      <FaHome 
      className="cursor-pointer"
        onClick={() => navigate('/')} // Navigate to profile when clicked
      />
      <FaSearch />
      <MdOutlineVideoLibrary />
      <FaShoppingBag />
      <FaUser
        className="cursor-pointer"
        onClick={() => navigate('/profile')} // Navigate to profile when clicked
      />
    </div>
  );
};

export default Footer1;
