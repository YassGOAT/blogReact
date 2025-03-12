import React from 'react';
import '../styles/Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} Mon Blog. Tous droits réservés.</p>
    </footer>
  );
}

export default Footer;
