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

  // Récupération des posts
  useEffect(() => {
    fetch('http://localhost:8081/posts')
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(() => {
        // Gestion d'erreur si nécessaire
      });
  }, []);

  // Filtrage selon le terme de recherche
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
          Publier un post
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
            </div>
          ))
        )}
      </div>

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
    </div>
  );
}

export default PostList;
