// src/components/Posts/PostList.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/PostList.css';

function PostList() {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 12;

  // Pour la confirmation personnalisée
  const [showConfirm, setShowConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  // Récupération des posts
  useEffect(() => {
    fetch('http://localhost:8081/posts')
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch(() => {
        // Pas de console.log, on peut gérer autrement si besoin
      });
  }, []);

  // Filtrage selon la barre de recherche
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = posts.filter(post =>
      post.title.toLowerCase().includes(term) ||
      post.content.toLowerCase().includes(term)
    );
    setFilteredPosts(filtered);
    setCurrentPage(1);
  }, [searchTerm, posts]);

  // Pagination
  const indexOfLast = currentPage * postsPerPage;
  const indexOfFirst = indexOfLast - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  // Ouvre le bloc de confirmation
  const handleRequestDelete = (postId) => {
    setPostToDelete(postId);
    setShowConfirm(true);
  };

  // Ferme le bloc de confirmation (annule la suppression)
  const cancelDeletePost = () => {
    setShowConfirm(false);
    setPostToDelete(null);
  };

  // Valide la suppression
  const confirmDeletePost = async () => {
    if (!postToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8081/posts/${postToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erreur lors de la suppression du post.');
      } else {
        // On retire le post de la liste
        setPosts(prev => prev.filter(post => post.id !== postToDelete));
      }
    } catch {
      alert('Erreur réseau.');
    }

    // Ferme le bloc de confirmation
    setShowConfirm(false);
    setPostToDelete(null);
  };

  return (
    <div className="postlist-container">
      <h1>Liste des posts</h1>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Rechercher des posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <Link to="/add-post" className="btn add-post-btn">
          Ajouter un post
        </Link>
      </div>

      <div className="posts-list">
        {currentPosts.length === 0 ? (
          <p>Aucun post disponible.</p>
        ) : (
          currentPosts.map((post) => (
            <div key={post.id} className="post-item">
              <h3>
                <Link to={`/posts/${post.id}`}>{post.title}</Link>
              </h3>
              <div className="meta">
                <span className="author">Par {post.username || 'Inconnu'}</span>
                {post.category && <span className="category"> - {post.category}</span>}
              </div>
              <p>{post.content.substring(0, 50)}...</p>

              {/* Bouton de suppression (ouvre le bloc de confirmation) */}
              <button
                className="delete-btn noselect"
                onClick={() => handleRequestDelete(post.id)}
              >
                <span className="text">Delete</span>
                <span className="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"></path>
                  </svg>
                </span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={currentPage === i + 1 ? 'btn active' : 'btn'}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Bloc de confirmation personnalisé (modale) */}
      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <p>Voulez-vous vraiment supprimer ce post ?</p>
            <div className="confirm-buttons">
              <button onClick={confirmDeletePost} className="btn confirm-yes">Oui</button>
              <button onClick={cancelDeletePost} className="btn confirm-no">Non</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostList;
