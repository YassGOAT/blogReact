// src/components/Home.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

function Home() {
  // État pour les catégories (carousel)
  const [categories, setCategories] = useState([]);
  const [catCurrentIndex, setCatCurrentIndex] = useState(0);

  // État pour les articles récents
  const [recentPosts, setRecentPosts] = useState([]);

  // Récupérer toutes les catégories
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

  // Calculer les catégories visibles (3 à la fois)
  const visibleCategories = categories.slice(catCurrentIndex, catCurrentIndex + 3);

  // Fonctions de navigation dans le carousel
  const handlePrev = () => {
    setCatCurrentIndex((prev) => Math.max(prev - 3, 0));
  };
  const handleNext = () => {
    setCatCurrentIndex((prev) =>
      prev + 3 < categories.length ? prev + 3 : prev
    );
  };

  return (
    <div className="home-container">
      {/* Section Hero */}
      <section className="hero">
        <div className="hero-content">
          <h1>Bienvenue sur Mon Blog</h1>
          <p>Découvrez des articles passionnants et inspirez-vous chaque jour.</p>
          <Link to="/posts" className="btn cta">Explorer les articles</Link>
        </div>
      </section>

      {/* Section À propos (désormais juste après le hero) */}
      <section className="about-section">
        <h2>À propos</h2>
        <p>
          Ce blog est dédié à partager des idées, des réflexions et des inspirations. 
          Plongez dans un univers de contenus variés et profitez d’une expérience unique.
        </p>
        {/* Bouton éventuel vers une page "À propos" plus détaillée */}
        {/* <Link to="/about" className="btn secondary-btn">En savoir plus</Link> */}
      </section>

      {/* Section Catégories (avec carousel) */}
      <section className="categories-section">
        <h2>Nos Catégories</h2>
        <div className="carousel-container">
          {catCurrentIndex > 0 && (
            <button className="arrow left-arrow" onClick={handlePrev}>
              &#8249;
            </button>
          )}
          <div className="categories-carousel">
            {visibleCategories.length === 0 ? (
              <p>Aucune catégorie disponible.</p>
            ) : (
              visibleCategories.map((cat) => (
                <div key={cat.id} className="category-card">
                  <Link to={`/categories/${cat.id}`}>{cat.name}</Link>
                </div>
              ))
            )}
          </div>
          {catCurrentIndex + 3 < categories.length && (
            <button className="arrow right-arrow" onClick={handleNext}>
              &#8250;
            </button>
          )}
        </div>
        <div className="all-categories-btn-container">
          <Link to="/categories" className="btn secondary-btn">
            Voir toutes les catégories
          </Link>
        </div>
      </section>

      {/* Section Articles récents (sans bouton "Lire l'article") */}
      <section className="recent-posts-section">
        <h2>Articles Récents</h2>
        <div className="posts-grid">
          {recentPosts.length === 0 ? (
            <p>Aucun article récent.</p>
          ) : (
            recentPosts.map((post) => (
              <div key={post.id} className="post-card">
                <h3>
                  <Link to={`/posts/${post.id}`}>{post.title}</Link>
                </h3>
                <div className="post-meta">
                  <span className="author">Par {post.username || 'Inconnu'}</span>
                  {post.category && <span className="category"> – {post.category}</span>}
                </div>
                <p>{post.content.substring(0, 80)}...</p>
                {/* Pas de bouton "Lire l'article" */}
              </div>
            ))
          )}
        </div>
        <div className="all-posts-btn-container">
          <Link to="/posts" className="btn secondary-btn">
            Voir tous les articles
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
