import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate, useLocation } from "react-router-dom";

const API_URL = '/api/listings';

const AllListing = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [listings, setListings] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'delete' or 'edit'
  const [selectedItem, setSelectedItem] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');

  const fetchListings = async () => {
    try {
      const res = await api.get(API_URL);
      setListings(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    const checkUserAndFetch = async () => {
      setLoading(true);
      const userNameFromState = location.state?.id;
      const user = userNameFromState || localStorage.getItem('User_name');
      setLoggedInUser(user);
      if (user) {
        await fetchListings();
      } else {
        navigate("/login");
      }
      setLoading(false);
    };
    checkUserAndFetch();
  }, [location.state, navigate]);

  const openModal = (type, item) => {
    setModalType(type);
    setSelectedItem(item);
    if (type === 'edit') setEditedTitle(item.title);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setEditedTitle('');
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`${API_URL}/${selectedItem._id}`);
      await fetchListings();
      closeModal();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const confirmEdit = async () => {
    try {
      await api.put(`${API_URL}/${selectedItem._id}`, { title: editedTitle });
      await fetchListings();
      closeModal();
    } catch (err) {
      console.error('Edit error:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h3 className="text-xl font-semibold mb-2">All Listings</h3>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <table className="w-full border border-gray-300 rounded-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Image</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((list) => (
              <tr key={list._id} className="text-center">
                <td className="p-2 border">
                  {Array.isArray(list.images) && list.images.length > 0 ? (
                    <div className="flex gap-2 justify-center">
                      {list.images.map((imgUrl, index) => (
                        <img
                          key={index}
                          src={imgUrl}
                          alt={`Image ${index + 1}`}
                          className="h-12 w-12 object-cover rounded"
                        />
                      ))}
                    </div>
                  ) : (
                    <span>No image</span>
                  )}
                </td>
                <td className="p-2 border">{list.title}</td>
                <td className="p-2 border flex justify-center gap-2">
                  <button
                    onClick={() => openModal('edit', list)}
                    className="text-white bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openModal('delete', list)}
                    className="text-white bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
            {modalType === 'delete' ? (
              <>
                <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
                <p className="mb-4">Are you sure you want to delete <strong>{selectedItem.title}</strong>?</p>
                <div className="flex justify-end gap-2">
                  <button onClick={closeModal} className="px-4 py-2 border rounded">
                    Cancel
                  </button>
                  <button onClick={confirmDelete} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                    Delete
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold mb-4">Edit Title</h2>
                <input
                  type="text"
                  className="border p-2 w-full mb-4"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <button onClick={closeModal} className="px-4 py-2 border rounded">
                    Cancel
                  </button>
                  <button onClick={confirmEdit} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    Save
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllListing;
