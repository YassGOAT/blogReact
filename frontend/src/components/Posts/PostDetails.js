// src/components/Posts/PostDetails.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CommentForm from '../Comments/CommentForm';
import CommentList from '../Comments/CommentList';
import '../../styles/PostDetails.css';

function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState('');
  const [loggedUser, setLoggedUser] = useState(null);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    // Récupérer le post
    fetch(`http://localhost:8081/posts/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setPost(data);
        } else {
          setError(data.error);
        }
      })
      .catch(() => setError("Erreur réseau lors de la récupération du post."));
  }, [id]);

  useEffect(() => {
    // Récupérer les commentaires du post
    fetch(`http://localhost:8081/posts/${id}/comments`)
      .then(res => res.json())
      .then(data => setComments(data))
      .catch(() => setComments([]));
  }, [id]);

  useEffect(() => {
    // Récupérer les infos de l'utilisateur connecté
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:8081/account', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.profile) {
            setLoggedUser(data.profile);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Détermine si l'utilisateur est l'auteur
  const isAuthor = loggedUser && post && loggedUser.id === post.user_id;
  // Détermine si l'utilisateur est admin/superadmin
  const isAdmin = loggedUser && loggedUser.role && ['admin', 'superadmin'].includes(loggedUser.role.toLowerCase());

  // canEdit = seulement si c'est l'auteur
  const canEdit = isAuthor;
  // canDelete = auteur OU admin/superadmin
  const canDelete = isAuthor || isAdmin;

  // Fonction de suppression
  const handleDelete = async () => {
    if (window.confirm("Voulez-vous vraiment supprimer ce post ?")) {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Utilisateur non connecté.");
        return;
      }
      try {
        const res = await fetch(`http://localhost:8081/posts/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || "Erreur lors de la suppression du post.");
        } else {
          alert("Post supprimé avec succès.");
          navigate('/posts');
        }
      } catch (error) {
        alert("Erreur réseau.");
      }
    }
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

      {(canEdit || canDelete) && (
        <div className="post-options">
          <button className="options-toggle" onClick={() => setShowOptions(!showOptions)}>
            ...
          </button>
          {showOptions && (
            <div className="options-dropdown">
              {canEdit && (
                <Link to={`/edit-post/${post.id}`} className="option-button">
                  Modifier
                </Link>
              )}
              {canDelete && (
                <button onClick={handleDelete} className="option-button">
                  Supprimer
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Section Commentaires */}
      <section className="comments-section">
        <h3>Commentaires</h3>
        <CommentList comments={comments} />
        <CommentForm
          postId={id}
          onCommentAdded={() => {
            fetch(`http://localhost:8081/posts/${id}/comments`)
              .then(res => res.json())
              .then(data => setComments(data))
              .catch(() => setComments([]));
          }}
        />
      </section>
    </div>
  );
}

export default PostDetails;
