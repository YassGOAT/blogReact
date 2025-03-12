import React, { useEffect, useState } from 'react';
import '../styles/Account.css';

function Account() {
  const [accountData, setAccountData] = useState(null);
  const [error, setError] = useState('');

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
        }
      } catch (err) {
        setError('Erreur réseau.');
      }
    };
    fetchAccount();
  }, []);

  if (error) return <div className="account-container"><p className="error">{error}</p></div>;
  if (!accountData) return <div className="account-container">Chargement...</div>;

  return (
    <div className="account-container">
      <h2>Mon Compte</h2>
      <section className="section">
        <h3>Profil</h3>
        <p><strong>Nom d'utilisateur :</strong> {accountData.profile.username}</p>
        <p><strong>Email :</strong> {accountData.profile.email}</p>
        <p><strong>Bio :</strong> {accountData.profile.bio}</p>
      </section>
      <section className="section">
        <h3>Mes Posts</h3>
        {accountData.posts.length === 0 ? (
          <p>Aucun post.</p>
        ) : (
          <ul>
            {accountData.posts.map((post) => (
              <li key={post.id}>{post.title}</li>
            ))}
          </ul>
        )}
      </section>
      <section className="section">
        <h3>Mes Commentaires</h3>
        {accountData.comments.length === 0 ? (
          <p>Aucun commentaire.</p>
        ) : (
          <ul>
            {accountData.comments.map((comment) => (
              <li key={comment.id}>{comment.content}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default Account;
