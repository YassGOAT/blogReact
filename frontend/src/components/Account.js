// src/components/Account.js
import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import '../styles/Account.css';

function Account() {
  const [accountData, setAccountData] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('posts');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
  const location = useLocation();

  // Lire le paramètre ?tab=posts ou ?tab=comments dans l'URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'comments' || tab === 'posts') {
      setActiveTab(tab);
    }
  }, [location.search]);

  // Récupérer les infos du compte (profil, posts et commentaires)
  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8081/account', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Erreur lors de la récupération des informations.');
        } else {
          setAccountData(data);
          if (data.posts) setFilteredPosts(data.posts);
        }
      } catch (err) {
        setError('Erreur réseau.');
      }
    };
    fetchAccount();
  }, []);

  // Filtrer les posts de l'utilisateur selon le titre uniquement
  useEffect(() => {
    if (accountData && accountData.posts) {
      const term = searchTerm.toLowerCase();
      const filtered = accountData.posts.filter(post =>
        post.title.toLowerCase().includes(term)
      );
      setFilteredPosts(filtered);
    }
  }, [searchTerm, accountData]);

  if (error) {
    return (
      <div className="account-container">
        <p className="error">{error}</p>
      </div>
    );
  }
  if (!accountData) {
    return <div className="account-container">Chargement...</div>;
  }

  const { profile, posts, comments } = accountData;

  return (
    <div className="account-container">
      <h2>Mon Compte</h2>
      {/* Affichage de la bio (sans email ni rôle) */}
      <div className="bio-section">
        <p><strong>Nom d'utilisateur :</strong> {profile.username}</p>
        <p><strong>Bio :</strong> {profile.bio}</p>
      </div>
      {/* Onglets de navigation */}
      <div className="account-tabs">
        <button
          className={activeTab === 'posts' ? 'active' : ''}
          onClick={() => setActiveTab('posts')}
        >
          Mes Posts
        </button>
        <button
          className={activeTab === 'comments' ? 'active' : ''}
          onClick={() => setActiveTab('comments')}
        >
          Mes Commentaires
        </button>
      </div>
      {/* Contenu de l'onglet "posts" */}
      {activeTab === 'posts' && (
        <div className="tab-content">
          <h3>Mes Posts</h3>
          <p>Nombre total de posts : {posts.length}</p>
          <div className="search-container">
            <input
              type="text"
              placeholder="Rechercher parmi mes posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          {filteredPosts.length === 0 ? (
            <p>Aucun post trouvé.</p>
          ) : (
            <ul>
              {filteredPosts.map((post) => (
                <li key={post.id}>
                  <Link to={`/posts/${post.id}`}>
                    <strong>{post.title}</strong> – {post.content.substring(0, 50)}...
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {/* Contenu de l'onglet "comments" */}
      {activeTab === 'comments' && (
        <div className="tab-content">
          <h3>Mes Commentaires</h3>
          {comments.length === 0 ? (
            <p>Aucun commentaire.</p>
          ) : (
            <ul>
              {comments.map((comment) => (
                <li key={comment.id}>
                  <Link to={`/posts/${comment.post_id}`}>
                    {comment.content}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default Account;
