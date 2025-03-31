// src/components/Categories/EditCategory.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../styles/AddCategory.css'; // Réutilisation des styles de création de catégorie

function EditCategory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`http://localhost:8081/categories/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setName(data.name);
          setImageUrl(data.image_url);
          setPreview(data.image_url); // Prévisualisation de l'image existante
        }
      })
      .catch(err => setError('Erreur réseau.'));
  }, [id]);

  // Gérer le changement de fichier
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Affichage de la prévisualisation
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Envoyer le fichier au serveur via FormData
      const formData = new FormData();
      formData.append('image', file);
      const token = localStorage.getItem('token');
      fetch('http://localhost:8081/upload/category-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
        .then(res => res.json())
        .then(data => {
          if (data.imageUrl) {
            setImageUrl(data.imageUrl);
          } else {
            setError(data.error || 'Erreur lors de l\'upload.');
          }
        })
        .catch(err => {
          console.error(err);
          setError('Erreur réseau lors de l\'upload.');
        });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8081/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, image_url: imageUrl })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur lors de la mise à jour.');
      } else {
        alert(data.message);
        navigate('/categories');
      }
    } catch (err) {
      setError('Erreur réseau.');
    }
  };

  return (
    <div className="addcategory-container">
      <h2>Modifier la Catégorie</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Nom de la catégorie :</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input"
          />
        </div>
        <div className="form-group">
          <label>Image de la catégorie :</label>
          <input type="file" onChange={handleFileChange} accept="image/*" />
          {preview && (
            <div style={{ marginTop: '10px' }}>
              <img src={preview} alt="Prévisualisation" style={{ width: '100%', maxWidth: '300px', borderRadius: '4px' }} />
            </div>
          )}
        </div>
        <button type="submit" className="btn">Enregistrer</button>
      </form>
    </div>
  );
}

export default EditCategory;
