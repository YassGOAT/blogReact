import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/PostList.css';

function PostList() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('http://localhost:8081/posts');
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Erreur lors de la récupération des posts.');
        } else {
          setPosts(data);
        }
      } catch (err) {
        setError('Erreur réseau.');
      }
    };
    fetchPosts();
  }, []);

  if (error) return <div className="postlist-container"><p className="error">{error}</p></div>;
  if (posts.length === 0) return <div className="postlist-container">Aucun post disponible.</div>;

  return (
    <div className="postlist-container">
      <h2>Liste des Posts</h2>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <Link to={`/posts/${post.id}`} className="link">{post.title}</Link>
          </li>
        ))}
      </ul>
      <Link to="/add-post" className="btn">Ajouter un Post</Link>
    </div>
  );
}

export default PostList;
