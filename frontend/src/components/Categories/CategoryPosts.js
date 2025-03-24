// src/components/Categories/CategoryPosts.js
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../../styles/CategoryPosts.css';

function CategoryPosts() {
  const { id } = useParams();
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCategoryPosts = async () => {
      try {
        // Récupérer la catégorie
        const resCat = await fetch(`http://localhost:8081/categories/${id}`);
        const catData = await resCat.json();
        if (!resCat.ok) {
          setError(catData.error || 'Erreur lors de la récupération de la catégorie.');
          return;
        }
        setCategory(catData);

        // Récupérer les posts de la catégorie
        const resPosts = await fetch(`http://localhost:8081/categories/${id}/posts`);
        const postsData = await resPosts.json();
        if (!resPosts.ok) {
          setError(postsData.error || 'Erreur lors de la récupération des posts.');
        } else {
          setPosts(postsData);
        }
      } catch (err) {
        setError('Erreur réseau.');
      }
    };
    fetchCategoryPosts();
  }, [id]);

  // Filtrage des posts selon le terme de recherche
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) return <div className="categoryposts-container"><p className="error">{error}</p></div>;
  if (!category) return <div className="categoryposts-container">Chargement de la catégorie...</div>;

  return (
    <div className="categoryposts-container">
      <h2>Catégorie : {category.name}</h2>
      <input
        type="text"
        placeholder="Rechercher dans cette catégorie..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="category-post-search-input"
      />
      {filteredPosts.length === 0 ? (
        <p>Aucun post correspondant dans cette catégorie.</p>
      ) : (
        <ul>
          {filteredPosts.map(post => (
            <li key={post.id}>
              <Link to={`/posts/${post.id}`} className="link">
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CategoryPosts;
