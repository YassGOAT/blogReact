import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/CategoryList.css';

function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:8081/categories');
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Erreur lors de la récupération des catégories.');
        } else {
          setCategories(data);
        }
      } catch (err) {
        setError('Erreur réseau.');
      }
    };
    fetchCategories();
  }, []);

  if (error) return <div className="categorylist-container"><p className="error">{error}</p></div>;
  if (categories.length === 0) return <div className="categorylist-container">Aucune catégorie disponible.</div>;

  return (
    <div className="categorylist-container">
      <h2>Catégories</h2>
      <ul>
        {categories.map(category => (
          <li key={category.id}>
            <Link to={`/categories/${category.id}`} className="link">
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CategoryList;
