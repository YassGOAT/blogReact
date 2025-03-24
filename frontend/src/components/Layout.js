// src/components/Layout.js
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import '../styles/Layout.css'; // Tu pourras y mettre tes styles communs

function Layout({ children }) {
  return (
    <div className="layout-container">
      <Navbar />
      <main className="layout-content">{children}</main>
      <Footer />
    </div>
  );
}

export default Layout;
