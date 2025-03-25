// src/components/Posts/PostDetails.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CommentForm from '../Comments/CommentForm';
import CommentList from '../Comments/CommentList';
import '../../styles/PostDetails.css';

function PostDetails() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const [comments, setComments] = useState([]);

  // Récupérer le post
  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const res = await fetch(`http://localhost:8081/posts/${id}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Erreur lors de la récupération du post.');
        } else {
          setPost(data);
        }
      } catch (err) {
        setError('Erreur réseau.');
      }
    };
    fetchPostDetails();
  }, [id]);

  // Récupérer les commentaires pour ce post
  useEffect(() => {
    const fetchComments = async () => {
      try {
        // Supposons que l'endpoint GET /posts/:id/comments existe
        const res = await fetch(`http://localhost:8081/posts/${id}/comments`);
        const data = await res.json();
        if (!res.ok) {
          // On peut gérer l'absence de commentaires par défaut
          setComments([]);
        } else {
          setComments(data);
        }
      } catch (err) {
        setComments([]);
      }
    };
    fetchComments();
  }, [id]);

  // Fonction pour rafraîchir les commentaires après ajout
  const refreshComments = () => {
    fetch(`http://localhost:8081/posts/${id}/comments`)
      .then((res) => res.json())
      .then((data) => setComments(data))
      .catch(() => setComments([]));
  };

  if (error)
    return (
      <div className="postdetails-container">
        <p className="error">{error}</p>
      </div>
    );
  if (!post)
    return <div className="postdetails-container">Chargement du post...</div>;

  return (
    <div className="postdetails-container">
      <h2>{post.title}</h2>
      <div className="post-meta">
        <span className="author">Par {post.username || 'Inconnu'}</span>
        {post.category && <span className="category"> – {post.category}</span>}
      </div>
      <div className="post-content">{post.content}</div>

      {/* Section Commentaires */}
      <section className="comments-section">
        <h3>Commentaires</h3>
        <CommentList comments={comments} />
        <CommentForm postId={id} onCommentAdded={refreshComments} />
      </section>
    </div>
  );
}

export default PostDetails;
