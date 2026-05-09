import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from '../api';
import Footer from "./Footer";
import Header from "./Header";

export default function SubCategory() {
  const { id } = useParams();
  const [subcategories, setSubcategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const response = await api.get("/api/subcategories");
        const matched = response.data.filter((sub) => {
          const catId = sub.categoryId?._id || sub.categoryId?.$oid || sub.categoryId;
          return catId?.toString() === id?.toString();
        });
        setSubcategories(matched);
      } catch (err) {
        console.error("Error fetching subcategories:", err);
      }
    };
    fetchSubcategories();
  }, [id]);

  const handleClick = (sub) => {
    navigate(`/list/${sub.name}`);
  };

  return (
    <div className="p-4">
      <Header />
      <h2 className="text-xl font-semibold mb-4">Subcategories</h2>

      {subcategories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {subcategories.map((sub) => (
            <div
              key={sub._id}
              className="border rounded-lg p-3 shadow hover:shadow-md transition cursor-pointer"
              onClick={() => handleClick(sub)}
            >
              <img
                src={sub.imageUrl}
                alt={sub.name}
                className="w-full h-40 object-cover rounded mb-2"
                onError={(e) => { e.target.src = "/fallback-image.png"; }}
              />
              <p className="text-sm text-center font-medium">{sub.name}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center">No subcategories found.</p>
      )}
      <Footer />
    </div>
  );
}
