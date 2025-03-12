import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../../styles/CategoryPosts.css';

function CategoryPosts() {
  const { id } = useParams();
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState(null);
  const [error, setError] = useState('');

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

  if (error) return <div className="categoryposts-container"><p className="error">{error}</p></div>;
  if (!category) return <div className="categoryposts-container">Chargement de la catégorie...</div>;

  return (
    <div className="categoryposts-container">
      <h2>Catégorie : {category.name}</h2>
      {posts.length === 0 ? (
        <p>Aucun post dans cette catégorie.</p>
      ) : (
        <ul>
          {posts.map(post => (
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
