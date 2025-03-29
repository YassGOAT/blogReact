// src/components/UserProfile.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/UserProfile.css';

function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  // Récupérer l'ID de l'utilisateur connecté stocké lors du login
  const currentUserId = localStorage.getItem('currentUserId');

  // Récupérer le profil de l'utilisateur consulté
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:8081/users/${id}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Erreur lors de la récupération du profil.');
        } else {
          setUser(data);
        }
      } catch (err) {
        setError('Erreur réseau.');
      }
    };
    fetchUser();
  }, [id]);

  // Récupérer la liste des favoris du user connecté pour vérifier si l'utilisateur consulté y figure
  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8081/favorites', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        const favExists = data.some(fav => String(fav.favorite_user_id) === id);
        setIsFavorite(favExists);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des favoris", err);
    }
  };

  useEffect(() => {
    if (currentUserId && String(currentUserId) !== id) {
      fetchFavorites();
    }
  }, [currentUserId, id]);

  // Fonction de basculement du favori
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
      // Retirer des favoris
      try {
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
    return (
      <div className="userprofile-container">
        <p className="error">{error}</p>
      </div>
    );
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
        {currentUserId && String(currentUserId) !== id && (
          <button onClick={handleToggleFavorite} className="favorite-toggle-btn">
            {isFavorite ? <i className="fa fa-star" /> : <i className="fa fa-star-o" />}
          </button>
        )}

      </div>
      <p><strong>Email :</strong> {user.email}</p>
      <p><strong>Bio :</strong> {user.bio}</p>
      <p><strong>Rôle :</strong> {user.role}</p>
    </div>
  );
}

export default UserProfile;
