// src/components/UserProfile.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/UserProfile.css';

function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:8081/users/${id}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Erreur lors de la récupération de l’utilisateur.');
        } else {
          console.log('User data:', data);
          setUser(data);
        }
      } catch (err) {
        setError('Erreur réseau.');
      }
    };
    fetchUser();
  }, [id]);

  if (error) {
    return <div className="userprofile-container"><p className="error">{error}</p></div>;
  }
  if (!user) {
    return <div className="userprofile-container">Chargement...</div>;
  }

  return (
    <div className="userprofile-container">
      <div className="user-header">
        {user.profile_picture ? (
          <img src={user.profile_picture} alt="Photo de profil" className="profile-picture" />
        ) : (
          <div className="profile-placeholder">Aucune image</div>
        )}
        <h2>Profil de {user.username}</h2>
      </div>
      <p><strong>Email :</strong> {user.email}</p>
      <p><strong>Bio :</strong> {user.bio}</p>
      <p><strong>Rôle :</strong> {user.role}</p>
    </div>
  );
}

export default UserProfile;
