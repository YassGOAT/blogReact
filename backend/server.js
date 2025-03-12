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
  res.json('Backend du site AnimeShop');
});

// Récupérer tous les utilisateurs
app.get('/utilisateur', (req, res) => {
  const sql = 'SELECT * FROM utilisateur';
  db.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err });
    res.json(data);
  });
});

// Récupérer tous les produits
app.get('/produit', (req, res) => {
  const sql = 'SELECT * FROM produit';
  db.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err });
    res.json(data);
  });
});

// Récupérer toutes les catégories triées par ordre alphabétique
app.get('/categorie', (req, res) => {
  const sql = 'SELECT * FROM categorie ORDER BY nom_categorie ASC';
  db.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err });
    res.json(data);
  });
});

// Récupérer le détail d'un produit et ses avis
app.get('/product/:id', (req, res) => {
  const { id } = req.params;
  const sqlProduct = `
    SELECT p.*, c.nom_categorie
    FROM produit p
    LEFT JOIN categorie c ON p.id_categorie = c.id_categorie
    WHERE p.id_produit = ?`;
  db.query(sqlProduct, [id], (err, productResults) => {
    if (err) return res.status(500).json({ error: err });
    if (productResults.length === 0)
      return res.status(404).json({ error: 'Produit non trouvé' });
    const product = productResults[0];
    const sqlAvis = 'SELECT * FROM Avis WHERE id_produit = ?';
    db.query(sqlAvis, [id], (err, avisResults) => {
      if (err) return res.status(500).json({ error: err });
      product.avis = avisResults;
      res.json(product);
    });
  });
});

// Route de connexion
app.post('/login', (req, res) => {
  const { email, mot_de_passe } = req.body;
  if (!email || !mot_de_passe) {
    return res.status(400).json({ error: 'Email et mot de passe sont requis' });
  }
  const sql = 'SELECT * FROM utilisateur WHERE email = ? AND mot_de_passe = ?';
  db.query(sql, [email, mot_de_passe], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length > 0) {
      const user = results[0];
      // Supprime le mot de passe avant de renvoyer l'objet
      delete user.mot_de_passe;
      return res.json({ message: 'Connexion réussie', user });
    } else {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
  });
});

// Route d'inscription
app.post('/signup', (req, res) => {
  const { nom, prenom, telephone, email, mot_de_passe } = req.body;
  if (!nom || !prenom || !telephone || !email || !mot_de_passe) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }
  const role = 'client'; // Le rôle par défaut pour les nouveaux utilisateurs
  const sql = 'INSERT INTO utilisateur (nom, prenom, telephone, email, mot_de_passe, role, date_inscription) VALUES (?, ?, ?, ?, ?, ?, NOW())';
  db.query(sql, [nom, prenom, telephone, email, mot_de_passe, role], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Inscription réussie', id_utilisateur: result.insertId });
  });
});

// Démarrer le serveur
app.listen(8081, () => {
  console.log('Server running on port 8081');
});
