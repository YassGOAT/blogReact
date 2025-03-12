import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../styles/EditPost.css';

function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`http://localhost:8081/posts/${id}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Erreur lors du chargement du post.');
        } else {
          setTitle(data.title);
          setContent(data.content);
        }
      } catch (err) {
        setError('Erreur réseau.');
      }
    };
    fetchPost();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8081/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, content })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur lors de la modification du post.');
      } else {
        navigate(`/posts/${id}`);
      }
    } catch (err) {
      setError('Erreur réseau.');
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
