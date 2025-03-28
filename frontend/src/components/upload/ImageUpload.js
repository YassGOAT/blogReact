// src/components/upload/ImageUpload.js
import React, { useState } from 'react';

function ImageUpload({ endpoint, onUploadSuccess }) {
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérifier que c'est bien une image
    if (!file.type.startsWith('image/')) {
      setUploadError('Seuls les fichiers images sont autorisés.');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || 'Erreur lors de l’upload.');
      } else {
        // Renvoie l'URL de l'image au parent
        onUploadSuccess(data.imageUrl);
      }
    } catch (error) {
      setUploadError('Erreur réseau lors de l’upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploadError && <p style={{ color: 'red' }}>{uploadError}</p>}
    </div>
  );
}

export default ImageUpload;
