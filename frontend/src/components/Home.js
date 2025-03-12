import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

function Home() {
  return (
    <div className="home-container">
      <h1>Bienvenue sur Mon Blog</h1>
      <p>Découvrez les derniers articles et partagez vos idées.</p>
      <Link to="/posts" className="btn-primary">Voir les posts</Link>
    </div>
  );
}

export default Home;
