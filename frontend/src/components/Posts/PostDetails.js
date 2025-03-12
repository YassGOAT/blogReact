import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../../styles/PostDetails.css';

function PostDetails() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`http://localhost:8081/posts/${id}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Erreur lors de la récupération du post.');
        } else {
          setPost(data);
        }
      } catch (err) {
        setError('Erreur réseau.');
      }
    };
    fetchPost();
  }, [id]);

  if (error) return <div className="postdetails-container"><p className="error">{error}</p></div>;
  if (!post) return <div className="postdetails-container">Chargement du post...</div>;

  return (
    <div className="postdetails-container">
      <h2>{post.title}</h2>
      <p>{post.content}</p>
      {/* Ajoutez ici des détails supplémentaires comme l'auteur, la date, etc. */}
    </div>
  );
}

export default PostDetails;
