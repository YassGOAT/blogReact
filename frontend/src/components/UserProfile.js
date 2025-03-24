// src/components/UserProfile.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/UserProfile.css'; // Crée ce fichier pour personnaliser les styles si besoin

function UserProfile() {
  const { id } = useParams(); // Récupère l'ID depuis l'URL
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
      <h2>Profil de {user.username}</h2>
      <p><strong>Email :</strong> {user.email}</p>
      <p><strong>Bio :</strong> {user.bio}</p>
      <p><strong>Rôle :</strong> {user.role}</p>
    </div>
  );
}

export default UserProfile;
