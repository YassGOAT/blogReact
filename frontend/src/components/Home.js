// src/components/Home.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

function Home() {
  const [categories, setCategories] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);

  // Récupérer les catégories
  useEffect(() => {
    fetch('http://localhost:8081/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Erreur lors de la récupération des catégories", err));
  }, []);

  // Récupérer les posts récents (par exemple les 3 premiers)
  useEffect(() => {
    fetch('http://localhost:8081/posts')
      .then((res) => res.json())
      .then((data) => setRecentPosts(data.slice(0, 3)))
      .catch((err) => console.error("Erreur lors de la récupération des posts", err));
  }, []);

  return (
    <div className="home-container">
      {/* Section Hero */}
      <section className="hero">
        <div className="hero-content">
          <h1>Bienvenue sur Mon Blog</h1>
          <p>Découvrez des articles passionnants et inspirez-vous au quotidien.</p>
          <Link to="/posts" className="btn cta">Explorer les articles</Link>
        </div>
      </section>

      {/* Section Catégories */}
      <section className="categories-section">
        <h2>Nos catégories</h2>
        <div className="categories-grid">
          {categories.length === 0 ? (
            <p>Aucune catégorie disponible.</p>
          ) : (
            categories.map(category => (
              <div key={category.id} className="category-card">
                <Link to={`/categories/${category.id}`}>{category.name}</Link>
              </div>
            ))
          )}
        </div>
        <Link to="/categories" className="btn secondary-btn">Voir toutes les catégories</Link>
      </section>

      {/* Section Articles récents */}
      <section className="recent-posts-section">
        <h2>Articles récents</h2>
        <div className="posts-grid">
          {recentPosts.length === 0 ? (
            <p>Aucun article récent.</p>
          ) : (
            recentPosts.map(post => (
              <div key={post.id} className="post-card">
                <h3><Link to={`/posts/${post.id}`}>{post.title}</Link></h3>
                <div className="post-meta">
                  <span className="author">Par {post.username || 'Inconnu'}</span>
                  {post.category && <span className="category"> – {post.category}</span>}
                </div>
                <p>{post.content.substring(0, 80)}...</p>
                <Link to={`/posts/${post.id}`} className="btn read-more-btn">Lire l'article</Link>
              </div>
            ))
          )}
        </div>
        <Link to="/posts" className="btn secondary-btn">Voir tous les articles</Link>
      </section>

      {/* Section À propos */}
      <section className="about-section">
        <h2>À propos</h2>
        <p>
          Ce blog est dédié à partager des idées, des réflexions et des inspirations. Plongez dans un univers de contenus variés et profitez d’une expérience unique.
        </p>
        <Link to="/about" className="btn secondary-btn">En savoir plus</Link>
      </section>
    </div>
  );
}

export default Home;
