// src/components/UserProfile.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/UserProfile.css';

function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  // Récupérez l'ID de l'utilisateur connecté depuis localStorage (assurez-vous de le définir lors du login)
  const currentUserId = localStorage.getItem('currentUserId');

  // Récupération du profil de l'utilisateur consulté
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:8081/users/${id}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Erreur lors de la récupération de l’utilisateur.');
        } else {
          setUser(data);
        }
      } catch (err) {
        setError('Erreur réseau.');
      }
    };
    fetchUser();
  }, [id]);

  // Récupération de la liste des favoris du user connecté
  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8081/favorites', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        // Vérifier si l'utilisateur consulté est déjà favori
        const found = data.some(fav => String(fav.favorite_user_id) === id);
        setIsFavorite(found);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des favoris', err);
    }
  };

  useEffect(() => {
    if (currentUserId && String(currentUserId) !== id) {
      fetchFavorites();
    }
  }, [currentUserId, id]);

  // Toggle pour ajouter ou retirer l'utilisateur des favoris
  const handleToggleFavorite = async () => {
    const token = localStorage.getItem('token');
    if (!isFavorite) {
      // Ajouter aux favoris
      try {
        const res = await fetch('http://localhost:8081/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ favorite_user_id: id })
        });
        const data = await res.json();
        if (res.ok) {
          setIsFavorite(true);
          alert('Utilisateur ajouté aux favoris.');
        } else {
          alert(data.error || 'Erreur lors de l’ajout aux favoris.');
        }
      } catch (err) {
        alert('Erreur réseau.');
      }
    } else {
      // Pour retirer, on récupère l'ID de l'entrée favorite
      try {
        const token = localStorage.getItem('token');
        const resFav = await fetch('http://localhost:8081/favorites', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const favoritesData = await resFav.json();
        const favoriteEntry = favoritesData.find(fav => String(fav.favorite_user_id) === id);
        if (favoriteEntry) {
          const res = await fetch(`http://localhost:8081/favorites/${favoriteEntry.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok) {
            setIsFavorite(false);
            alert('Utilisateur retiré des favoris.');
          } else {
            alert(data.error || 'Erreur lors de la suppression du favori.');
          }
        }
      } catch (err) {
        alert('Erreur réseau.');
      }
    }
  };

  if (error) {
    return <div className="userprofile-container"><p className="error">{error}</p></div>;
  }
  if (!user) {
    return <div className="userprofile-container">Chargement...</div>;
  }

  return (
    <div className="userprofile-container">
      <div className="user-header">
        <img 
          src={user.profile_picture || 'http://localhost:8081/uploads/default-profile.jpg'} 
          alt="Photo de profil" 
          className="profile-picture" 
        />
        <h2>{user.username}</h2>
        {/* Afficher le bouton de favoris seulement si le profil consulté n'est pas celui du user connecté */}
        {currentUserId && String(currentUserId) !== id && (
          <button onClick={handleToggleFavorite} className="favorite-toggle-btn" title="Ajouter aux favoris">
            {isFavorite ? (
              <i className="fa fa-star" style={{ color: '#ffc107' }}></i>
            ) : (
              <i className="fa fa-star-o" style={{ color: '#ccc' }}></i>
            )}
          </button>
        )}
      </div>
      <p><strong>Email :</strong> {user.email}</p>
      <p><strong>Bio :</strong> {user.bio}</p>
      <p><strong>Rôle :</strong> {user.role}</p>
      <p><strong>Favoris :</strong>{user.favorites}</p>
    </div>
  );
}

export default UserProfile;
