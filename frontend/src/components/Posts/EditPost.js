// src/components/Posts/EditPost.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../styles/EditPost.css';

function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  // Récupérer les données du post
  useEffect(() => {
    const fetchPost = async () => {
      try {
        // On récupère le post pour le préremplir
        const res = await fetch(`http://localhost:8081/posts/${id}`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Erreur lors du chargement du post.');
          return;
        }
        const data = await res.json();
        setTitle(data.title);
        setContent(data.content);
      } catch (err) {
        console.error(err);
        setError('Erreur réseau lors du chargement du post.');
      }
    };
    fetchPost();
  }, [id]);

  // Soumettre la modification
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Utilisateur non connecté.');
      return;
    }
    try {
      const res = await fetch(`http://localhost:8081/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, content })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erreur lors de la modification du post.');
      } else {
        navigate(`/posts/${id}`);
      }
    } catch (err) {
      console.error(err);
      setError('Erreur réseau lors de la modification du post.');
    }
  };

  return (
    <div className="editpost-container">
      <h2>Modifier le Post</h2>
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
        <button type="submit" className="btn">Enregistrer</button>
      </form>
    </div>
  );
}

export default EditPost;
