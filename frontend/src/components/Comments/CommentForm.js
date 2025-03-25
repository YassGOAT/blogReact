// src/components/Comments/CommentForm.js
import React, { useState } from 'react';
import '../../styles/CommentForm.css';

function CommentForm({ postId, onCommentAdded }) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8081/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content, post_id: postId })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur lors de l\'ajout du commentaire.');
      } else {
        setContent('');
        if (onCommentAdded) onCommentAdded();
      }
    } catch (err) {
      setError('Erreur réseau.');
    }
  };

  return (
    <div className="commentform-container">
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="form">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ajouter un commentaire..."
          required
          className="textarea"
        />
        <button type="submit" className="btn">Envoyer</button>
      </form>
    </div>
  );
}

export default CommentForm;
