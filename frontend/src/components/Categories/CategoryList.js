// src/components/Categories/CategoryList.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/CategoryList.css';

function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const categoriesPerPage = 12;

  useEffect(() => {
    fetch('http://localhost:8081/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error('Erreur lors de la récupération des catégories:', err));
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(term)
    );
    setFilteredCategories(filtered);
    setCurrentPage(1);
  }, [searchTerm, categories]);

  // Pagination
  const indexOfLast = currentPage * categoriesPerPage;
  const indexOfFirst = indexOfLast - categoriesPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);

  return (
    <div className="categorylist-container">
      <h1>Catégories</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="Rechercher des catégories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <Link to="/add-category" className="btn add-category-btn">
          Créer une catégorie
        </Link>
      </div>
      <div className="categories-grid">
        {currentCategories.length === 0 ? (
          <p>Aucune catégorie trouvée.</p>
        ) : (
          currentCategories.map((category) => (
            <div key={category.id} className="category-block">
              <Link to={`/categories/${category.id}`}>{category.name}</Link>
            </div>
          ))
        )}
      </div>
      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={currentPage === i + 1 ? 'btn active' : 'btn'}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryList;
