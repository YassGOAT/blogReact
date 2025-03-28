// src/components/ProfileUpdate.js
import React, { useState } from 'react';
import ImageUpload from '../upload/ImageUpload';
import { useNavigate } from 'react-router-dom';
import '../../styles/ProfileUpdate.css'; // Créez ce fichier ou adaptez-le selon vos besoins

function ProfileUpdate() {
  const [profileImage, setProfileImage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const profileImageEndpoint = 'http://localhost:8081/upload/profile-image';

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Dans cet exemple, l'upload est déjà effectué dans ImageUpload.
    // Vous pouvez afficher une notification et rediriger l'utilisateur.
    if (profileImage) {
      navigate('/account');
    } else {
      setError('Veuillez uploader une image.');
    }
  };

  return (
    <div className="profile-update-container">
      <h2>Mettre à jour la photo de profil</h2>
      <form onSubmit={handleSubmit}>
        <ImageUpload 
          endpoint={profileImageEndpoint}
          onUploadSuccess={(url) => setProfileImage(url)}
        />
        {profileImage && (
          <div>
            <p>Prévisualisation :</p>
            <img src={profileImage} alt="Photo de profil" style={{ width: '150px' }} />
          </div>
        )}
        <button type="submit" className="btn">Mettre à jour</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}

export default ProfileUpdate;
