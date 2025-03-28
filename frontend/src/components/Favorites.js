// src/components/Favorites.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Favorites.css';

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState('');

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8081/favorites', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur lors de la récupération des favoris.');
      } else {
        setFavorites(data);
      }
    } catch (err) {
      setError('Erreur réseau.');
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (favoriteId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8081/favorites/${favoriteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erreur lors de la suppression du favori.');
      } else {
        // Mettre à jour la liste localement
        setFavorites(favorites.filter(fav => fav.id !== favoriteId));
      }
    } catch (err) {
      alert('Erreur réseau lors de la suppression du favori.');
    }
  };

  return (
    <div className="favorites-container">
      <h2>Mes Utilisateurs Favoris</h2>
      {error && <p className="error">{error}</p>}
      {favorites.length === 0 ? (
        <p>Aucun favori ajouté.</p>
      ) : (
        <ul className="favorites-list">
          {favorites.map(fav => (
            <li key={fav.id} className="favorite-item">
              <Link to={`/users/${fav.favorite_user_id}`} className="favorite-link">
                <img
                  src={fav.profile_picture || 'http://localhost:8081/uploads/default-profile.jpg'}
                  alt={fav.username}
                  className="favorite-avatar"
                />
                <span className="favorite-username">{fav.username}</span>
              </Link>
              <button 
                onClick={() => handleRemoveFavorite(fav.id)} 
                className="favorite-remove-btn" 
                title="Retirer des favoris"
              >
                <i className="fa fa-star"></i>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Favorites;
