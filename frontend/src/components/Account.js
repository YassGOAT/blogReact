// src/components/Account.js
import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import ImageUpload from './upload/ImageUpload';
import '../styles/Account.css';

function Account() {
  const [accountData, setAccountData] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('posts');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const location = useLocation();

  // États pour photo de profil et bannière
  const [profilePic, setProfilePic] = useState('');
  const [bannerPic, setBannerPic] = useState('');
  const DEFAULT_PROFILE_IMAGE = 'http://localhost:8081/uploads/default-profile.jpg';
  const DEFAULT_BANNER_IMAGE = 'http://localhost:8081/uploads/default-banner.jpg';

  // Gestion de l'onglet depuis l'URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'posts' || tab === 'comments' || tab === 'favorites') {
      setActiveTab(tab);
    }
  }, [location.search]);

  // Récupération des infos du compte
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
        setProfilePic(data.profile.profile_picture || DEFAULT_PROFILE_IMAGE);
        setBannerPic(data.profile.banner_image || DEFAULT_BANNER_IMAGE);
      }
    } catch (err) {
      setError('Erreur réseau.');
    }
  };

  useEffect(() => {
    fetchAccount();
  }, []);

  // Filtrer les posts
  useEffect(() => {
    if (accountData && accountData.posts) {
      const term = searchTerm.toLowerCase();
      const filtered = accountData.posts.filter(post =>
        post.title.toLowerCase().includes(term)
      );
      setFilteredPosts(filtered);
    }
  }, [searchTerm, accountData]);

  // Récupérer les favoris lorsque l'onglet Favoris est actif
  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8081/favorites', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur lors de la récupération des favoris.');
      } else {
        setFavorites(data);
      }
    } catch (err) {
      setError('Erreur réseau lors de la récupération des favoris.');
    }
  };

  useEffect(() => {
    if (activeTab === 'favorites') {
      fetchFavorites();
    }
  }, [activeTab]);

  // Mettre à jour la photo de profil
  const handleProfilePicUpdate = async () => {
    if (!accountData) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8081/users/${accountData.profile.id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          profile_picture: profilePic,
          banner_image: accountData.profile.banner_image // ne pas modifier ici la bannière
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur lors de la mise à jour de la photo de profil.');
      } else {
        alert('Photo de profil mise à jour avec succès.');
        fetchAccount();
      }
    } catch (err) {
      setError('Erreur réseau lors de la mise à jour de la PP.');
    }
  };

  // Supprimer la photo de profil
  const handleDeleteProfilePic = () => {
    setProfilePic(DEFAULT_PROFILE_IMAGE);
  };

  // Mettre à jour la bannière
  const handleBannerUpdate = async () => {
    if (!accountData) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8081/users/${accountData.profile.id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          profile_picture: accountData.profile.profile_picture,
          banner_image: bannerPic
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur lors de la mise à jour de la bannière.');
      } else {
        alert('Bannière mise à jour avec succès.');
        fetchAccount();
      }
    } catch (err) {
      setError('Erreur réseau lors de la mise à jour de la bannière.');
    }
  };

  // Supprimer la bannière
  const handleDeleteBanner = () => {
    setBannerPic(DEFAULT_BANNER_IMAGE);
  };

  // Retirer un favori
  const handleRemoveFavorite = async (favoriteId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8081/favorites/${favoriteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erreur lors de la suppression du favori.');
      } else {
        setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
      }
    } catch (err) {
      alert('Erreur réseau lors de la suppression du favori.');
    }
  };

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
      <h1>Mon Compte</h1>
      
      {/* Bannière */}
      <div className="banner-section" style={{ backgroundImage: `url(${bannerPic})` }}>
        <div className="banner-controls">
          <ImageUpload
            endpoint="http://localhost:8081/upload/profile-banner"
            onUploadSuccess={(url) => setBannerPic(url)}
          />
          <div className="banner-btn-group">
            <button onClick={handleBannerUpdate} className="btn save-btn">Enregistrer</button>
            <button onClick={handleDeleteBanner} className="btn delete-btn">Supprimer</button>
          </div>
        </div>
      </div>

      {/* Section supérieure : Photo de profil et infos */}
      <div className="account-top-section">
        <div className="account-photo-section">
          <img src={profilePic} alt="Photo de profil" className="profile-picture" />
          <div className="account-photo-actions">
            <ImageUpload
              endpoint="http://localhost:8081/upload/profile-image"
              onUploadSuccess={(url) => setProfilePic(url)}
            />
            <div className="photo-btn-group">
              <button onClick={handleProfilePicUpdate} className="btn save-btn">Enregistrer</button>
              <button onClick={handleDeleteProfilePic} className="btn delete-btn">Supprimer</button>
            </div>
          </div>
        </div>
        <div className="account-info-section">
          <p><strong>Nom d'utilisateur :</strong> {profile.username}</p>
          <p><strong>Bio :</strong> {profile.bio}</p>
        </div>
      </div>

      {/* Onglets */}
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
        <button
          className={activeTab === 'favorites' ? 'active' : ''}
          onClick={() => setActiveTab('favorites')}
        >
          Mes Favoris
        </button>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'posts' && (
        <div className="tab-content">
          <h3>Mes Posts</h3>
          <p>Nombre total de posts : {posts.length}</p>
          <div className="search-container">
            <input
              type="text"
              placeholder="Rechercher parmi mes posts (par titre)..."
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

      {activeTab === 'favorites' && (
        <div className="tab-content">
          <h3>Mes Favoris</h3>
          {favorites.length === 0 ? (
            <p>Aucun favori ajouté.</p>
          ) : (
            <ul className="favorites-list">
              {favorites.map(fav => (
                <li key={fav.id} className="favorite-item">
                  <Link to={`/users/${fav.favorite_user_id}`} className="favorite-link">
                    <img
                      src={fav.profile_picture || DEFAULT_PROFILE_IMAGE}
                      alt={fav.username}
                      className="favorite-avatar"
                    />
                    <span className="favorite-username">{fav.username}</span>
                  </Link>
                  <button 
                    onClick={() => handleRemoveFavorite(fav.id)} 
                    className="favorite-remove-btn" 
                    title="Retirer des favoris"
                  >
                    <i className="fa fa-star" style={{ color: '#ffc107' }}></i>
                  </button>
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
