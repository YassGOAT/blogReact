// server.js
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Pour parser le JSON dans les requêtes POST

// Connexion à la base de données MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'blog'
});

db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données :', err);
    return;
  }
  console.log('Connecté à la base de données, threadId :', db.threadId);
});

// Route de test
app.get('/', (req, res) => {
  res.json('Backend du site Blog');
});

// Récupérer tous les posts
app.get('/posts', (req, res) => {
  const sql = 'SELECT * FROM posts';
  db.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err });
    res.json(data);
  });
});

// Récupérer tous les categories
app.get('/categories', (req, res) => {
  const sql = 'SELECT * FROM categories';
  db.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err });
    res.json(data);
  });
});

// Récupérer toutes les catégories triées par ordre alphabétique
app.get('/comments', (req, res) => {
  const sql = 'SELECT * FROM comments';
  db.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err });
    res.json(data);
  });
});

// Récupérer toutes les tags
app.get('/tags', (req, res) => {
    const sql = 'SELECT * FROM tags';
    db.query(sql, (err, data) => {
      if (err) return res.status(500).json({ error: err });
      res.json(data);
    });
  });

// Récupérer toutes les posts_tags
app.get('/posts_tags', (req, res) => {
    const sql = 'SELECT * FROM posts_tags';
    db.query(sql, (err, data) => {
      if (err) return res.status(500).json({ error: err });
      res.json(data);
    });
  });

// Récupérer toutes les posts_categories
app.get('/posts_categories', (req, res) => {
    const sql = 'SELECT * FROM posts_categories';
    db.query(sql, (err, data) => {
      if (err) return res.status(500).json({ error: err });
      res.json(data);
    });
  });

// Récupérer toutes les users
app.get('/users', (req, res) => {
    const sql = 'SELECT * FROM users';
    db.query(sql, (err, data) => {
      if (err) return res.status(500).json({ error: err });
      res.json(data);
    });
  });