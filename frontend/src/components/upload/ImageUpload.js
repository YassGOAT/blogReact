// src/components/upload/ImageUpload.js
import React, { useState } from 'react';

function ImageUpload({ endpoint, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setPreviewUrl(selectedFile ? URL.createObjectURL(selectedFile) : null);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError('Veuillez sélectionner un fichier.');
      return;
    }
    setUploading(true);
    setUploadError('');
    const formData = new FormData();
    formData.append('image', file);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Laissez FormData définir le Content-Type
        },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || 'Erreur lors de l’upload.');
      } else {
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
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {previewUrl && (
        <div style={{ margin: '10px 0' }}>
          <img src={previewUrl} alt="Prévisualisation" style={{ width: '200px' }} />
        </div>
      )}
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Téléchargement…' : 'Importer l’image'}
      </button>
      {uploadError && <p style={{ color: 'red' }}>{uploadError}</p>}
    </div>
  );
}

export default ImageUpload;
