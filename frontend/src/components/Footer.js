import React from 'react';
import '../styles/Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} PostFlow. Tous droits réservés.</p>
    </footer>
  );
}

export default Footer;
