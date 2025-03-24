// src/components/Categories/AddCategory.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/AddCategory.css'; // Crée ce fichier pour personnaliser les styles

function AddCategory() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:8081/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur lors de la création de la catégorie.');
      } else {
        navigate('/categories'); // Redirige vers la liste des catégories
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
        <button type="submit" className="btn">Créer la Catégorie</button>
      </form>
    </div>
  );
}

export default AddCategory;
