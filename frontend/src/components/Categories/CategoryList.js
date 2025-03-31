// src/components/Categories/CategoryList.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/CategoryList.css';

function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState(null);
  const categoriesPerPage = 12;

  // Récupération des catégories
  useEffect(() => {
    fetch('http://localhost:8081/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Erreur lors de la récupération des catégories:', err));
  }, []);

  // Vérification du rôle de l'utilisateur connecté via /account
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:8081/account', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.profile && data.profile.role) {
            const role = data.profile.role.toLowerCase();
            setIsAdmin(role === 'admin' || role === 'superadmin');
          }
        })
        .catch(err => console.error('Erreur lors de la vérification du rôle:', err));
    }
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(term)
    );
    setFilteredCategories(filtered);
    setCurrentPage(1);
  }, [searchTerm, categories]);

  const indexOfLast = currentPage * categoriesPerPage;
  const indexOfFirst = indexOfLast - categoriesPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);

  // Gestion du dropdown pour modifier/supprimer
  const toggleDropdown = (catId) => {
    setOpenDropdown(openDropdown === catId ? null : catId);
  };

  // Suppression d'une catégorie
  const handleDeleteCategory = async (categoryId) => {
    const token = localStorage.getItem('token');
    if (window.confirm('Voulez-vous vraiment supprimer cette catégorie ?')) {
      try {
        const res = await fetch(`http://localhost:8081/categories/${categoryId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          alert(data.message);
          setCategories(prev => prev.filter(cat => cat.id !== categoryId));
        } else {
          alert(data.error || 'Erreur lors de la suppression.');
        }
      } catch (err) {
        alert('Erreur réseau.');
      }
    }
  };

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
        {isAdmin && (
          <Link to="/add-category" className="btn add-category-btn">
            Créer une catégorie
          </Link>
        )}
      </div>
      <div className="categories-grid">
        {currentCategories.length === 0 ? (
          <p>Aucune catégorie trouvée.</p>
        ) : (
          currentCategories.map((category) => (
            <div key={category.id} className="category-block">
              <Link to={`/categories/${category.id}`}>{category.name}</Link>
              {isAdmin && (
                <div className="dropdown-container">
                  <button
                    className="dropdown-toggle-btn"
                    onClick={() => toggleDropdown(category.id)}
                    title="Actions"
                  >
                    ...
                  </button>
                  {openDropdown === category.id && (
                    <div className="dropdown-menu">
                      <Link to={`/edit-category/${category.id}`} className="dropdown-item">
                        Modifier
                      </Link>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="dropdown-item"
                      >
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              )}
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
