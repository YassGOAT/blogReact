// src/components/Navbar.js
import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

function Navbar() {
  const [loggedUser, setLoggedUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate(); // Ajout de useNavigate

  // Récupération des infos de l'utilisateur connecté
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:8081/account', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.profile && data.profile.username) {
            setLoggedUser(data.profile);
          }
        })
        .catch(err => {
          // Gestion silencieuse de l'erreur
        });
    }
  }, []);

  // Récupération de tous les utilisateurs pour la recherche
  useEffect(() => {
    fetch('http://localhost:8081/users')
      .then(res => res.json())
      .then(data => setAllUsers(data))
      .catch(err => {
        // Gestion silencieuse ou alerte
      });
  }, []);

  // Filtrage des utilisateurs en fonction du terme de recherche et exclusion des admin/superadmin
  useEffect(() => {
    const term = userSearchTerm.toLowerCase();
    if (term === '') {
      setFilteredUsers([]);
    } else {
      const filtered = allUsers.filter(user =>
        (user.username.toLowerCase().includes(term) ||
          (user.email && user.email.toLowerCase().includes(term))) &&
        (user.role !== "admin" && user.role !== "superadmin")
      );
      setFilteredUsers(filtered);
    }
  }, [userSearchTerm, allUsers]);

  // Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem('token');
    setLoggedUser(null);
    navigate('/login');
  };

  // Fermer le dropdown en cliquant en dehors
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <nav className="navbar">
      <div className="left-section">
        <div className="user-search-container">
          <input
            type="text"
            placeholder="Rechercher des utilisateurs..."
            value={userSearchTerm}
            onChange={(e) => setUserSearchTerm(e.target.value)}
            className="user-search-input"
          />
          {userSearchTerm && filteredUsers.length > 0 && (
            <div className="user-search-results">
              <ul>
                {filteredUsers.map(user => (
                  <li key={user.id}>
                    <Link to={`/users/${user.id}`} onClick={() => setUserSearchTerm('')}>
                      {user.username}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className="center-section">
        <div className="logo">
          <Link to="/">PostFlow</Link>
        </div>
      </div>
      <div className="right-section">
        <div className="menu">
          <Link to="/">Accueil</Link>
          <Link to="/posts">Articles</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/add-post" className="create-post-btn">Créer un article</Link>
          {loggedUser ? (
            <div className="user-dropdown">
              <span className="username" onClick={() => setShowDropdown(prev => !prev)}>
                Salut, {loggedUser.username}
              </span>
              {showDropdown && (
                <div className="dropdown-menu" ref={dropdownRef}>
                  <Link to="/account" className="dropdown-item">Voir le profil</Link>
                  <Link to="/account?tab=posts" className="dropdown-item">Voir les articles</Link>
                  <Link to="/account?tab=comments" className="dropdown-item">Voir les commentaires</Link>
                  <Link to="#" className="dropdown-item" onClick={handleLogout}>Se déconnecter</Link>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login">Se connecter</Link>
              <Link to="/register">S'inscrire</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
