import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">Mon Blog</Link>
      </div>
      <div className="menu">
        <Link to="/">Home</Link>
        <Link to="/posts">Posts</Link>
        <Link to="/categories">Categories</Link>
        <Link to="/account">Account</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </div>
    </nav>
  );
}

export default Navbar;
