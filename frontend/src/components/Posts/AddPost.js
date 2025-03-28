// src/components/Posts/AddPost.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageUpload from '../upload/ImageUpload';  // Chemin corrigé
import '../../styles/AddPost.css';

function AddPost() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  const [categories, setCategories] = useState([]);
  const postImageEndpoint = 'http://localhost:8081/upload/post-image';

  useEffect(() => {
    fetch('http://localhost:8081/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Erreur lors de la récupération des catégories :', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8081/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          content,
          category_id: categoryId,
          image_url: imageUrl
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur lors de la création du post.');
      } else {
        navigate('/posts');
      }
    } catch (err) {
      setError('Erreur réseau.');
    }
  };

  return (
    <div className="addpost-container">
      <h2>Créer un Post</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Titre :</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="input"
          />
        </div>
        <div className="form-group">
          <label>Contenu :</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="textarea"
          />
        </div>
        <div className="form-group">
          <label>Catégorie :</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="input"
            required
          >
            <option value="">Sélectionnez une catégorie</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        {/* Composant d'upload d'image */}
        <ImageUpload 
          endpoint={postImageEndpoint} 
          onUploadSuccess={(url) => setImageUrl(url)}
        />
        {imageUrl && <p>Image uploadée : <a href={imageUrl}>{imageUrl}</a></p>}
        <button type="submit" className="btn">Publier</button>
      </form>
    </div>
  );
}

export default AddPost;
