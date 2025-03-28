// src/components/Categories/AddCategory.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageUpload from '../upload/ImageUpload';
import '../../styles/AddCategory.css';

function AddCategory() {
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Endpoint d'upload pour l'image de catégorie
  const categoryImageEndpoint = 'http://localhost:8081/upload/category-image';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8081/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, image_url: imageUrl })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur lors de la création de la catégorie.');
      } else {
        navigate('/categories');
      }
    } catch (err) {
      setError('Erreur réseau.');
    }
  };

  return (
    <div className="addcategory-container">
      <h2>Créer une Catégorie</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Nom de la catégorie :</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input"
          />
        </div>
        <div className="form-group">
          <label>Image de la catégorie :</label>
          <ImageUpload 
            endpoint={categoryImageEndpoint} 
            onUploadSuccess={(url) => setImageUrl(url)}
          />
          {imageUrl && (
            <div>
              <p>Prévisualisation :</p>
              <img src={imageUrl} alt="Catégorie" style={{ width: '200px' }} />
            </div>
          )}
        </div>
        <button type="submit" className="btn">Créer la Catégorie</button>
      </form>
    </div>
  );
}

export default AddCategory;
