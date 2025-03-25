// src/components/Posts/PostDetails.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CommentForm from '../Comments/CommentForm';   // Vérifiez le chemin si nécessaire
import CommentList from '../Comments/CommentList';   // Vérifiez le chemin si nécessaire
import '../../styles/PostDetails.css';

function PostDetails() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState('');

  // Récupérer le post
  useEffect(() => {
    fetch(`http://localhost:8081/posts/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setPost(data);
        } else {
          setError(data.error);
        }
      })
      .catch(() => {
        setError('Erreur réseau lors de la récupération du post.');
      });
  }, [id]);

  // Récupérer les commentaires du post
  useEffect(() => {
    fetch(`http://localhost:8081/posts/${id}/comments`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setComments(data);
        } else {
          setComments([]);
        }
      })
      .catch(() => {
        setComments([]);
      });
  }, [id]);

  // Rafraîchir les commentaires après ajout
  const handleCommentAdded = () => {
    fetch(`http://localhost:8081/posts/${id}/comments`)
      .then((res) => res.json())
      .then((data) => setComments(data))
      .catch(() => setComments([]));
  };

  if (error) {
    return <div className="postdetails-container"><p className="error">{error}</p></div>;
  }
  if (!post) {
    return <div className="postdetails-container">Chargement...</div>;
  }

  return (
    <div className="postdetails-container">
      <h2>{post.title}</h2>
      <p className="post-meta">
        Par <strong>{post.username || 'Inconnu'}</strong>
        {post.category && <> – {post.category}</>}
      </p>
      <div className="post-content">
        {post.content}
      </div>
      {/* Section Commentaires */}
      <section className="comments-section">
        <h3>Commentaires</h3>
        <CommentList comments={comments} />
        <CommentForm postId={id} onCommentAdded={handleCommentAdded} />
      </section>
    </div>
  );
}

export default PostDetails;
