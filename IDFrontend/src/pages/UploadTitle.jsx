import React, { useState } from 'react';
import api from '../api'

const UploadCategory = () => {
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    setCategoryImage(e.target.files[0]);
  };

  const handleNameChange = (e) => {
    setCategoryName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName || !categoryImage) {
      setError('Please provide both category name and image.');
      return;
    }

    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('name', categoryName);
    formData.append('image', categoryImage);

    try {
      // Make POST request to your deployed backend
      const response = await api.post(
        '/api/categories', // Updated URL
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setSuccess('Category uploaded successfully!');
      console.log(response.data);
    } catch (err) {
      setError('Error uploading category');
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Upload Category</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Category Name:</label>
          <input
            type="text"
            value={categoryName}
            onChange={handleNameChange}
            required
          />
        </div>
        <div>
          <label>Category Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            required
          />
        </div>
        <button type="submit">Upload</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
};

export default UploadCategory;
