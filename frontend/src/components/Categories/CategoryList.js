// src/components/Categories/CategoryList.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/CategoryList.css';

function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:8081/categories')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setCategories(data))
      .catch((err) => {
        console.error('Erreur lors de la récupération des catégories:', err);
        setError('Erreur réseau. Vérifiez votre connexion ou le serveur.');
      });
  }, []);

  return (
    <div className="categorylist-container">
      <h2>Catégories</h2>
      {error && <p className="error">{error}</p>}
      <div className="categories-grid">
        {categories.length === 0 && !error ? (
          <p>Aucune catégorie disponible.</p>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="category-block">
              <Link to={`/categories/${category.id}`}>{category.name}</Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CategoryList;
