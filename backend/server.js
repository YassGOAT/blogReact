// server.js
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 8081;
const saltRounds = 10;
const jwtSecret = 'votre_secret'; // Remplacez par une chaîne complexe pour la production

// Middleware
app.use(cors());
app.use(express.json()); // Pour parser le JSON des requêtes

// Connexion à la base de données MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Ajoutez votre mot de passe si nécessaire
  database: 'blog'
});

db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données :', err);
    process.exit(1); // Arrête l'application si la connexion échoue
  }
  console.log('Connecté à la base de données, threadId :', db.threadId);
});

// Route racine
app.get('/', (req, res) => {
  res.send('Backend du site Blog');
});

// Route pour l'inscription (Register)
app.post('/register', (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Les champs username, email et password sont obligatoires.' });
  }
  // Vérifier si l'email est déjà utilisé
  const checkQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkQuery, [email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur lors de la vérification de l\'email.' });
    }
    if (results.length > 0) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
    }
    // Hachage du mot de passe
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur lors du hachage du mot de passe.' });
      }
      const insertQuery = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
      db.query(insertQuery, [username, email, hash, role || 'reader'], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Erreur lors de l\'insertion dans la base de données.' });
        }
        res.json({ message: 'Inscription réussie', userId: result.insertId });
      });
    });
  });
});

// Route pour la connexion (Login)
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Les champs email et password sont obligatoires.' });
  }
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur lors de la recherche de l\'utilisateur.' });
    }
    if (results.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }
    const user = results[0];
    // Comparaison des mots de passe
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur lors de la comparaison des mots de passe.' });
      }
      if (!isMatch) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
      }
      // Génération d'un token JWT valable 1 heure
      const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: '1h' });
      res.json({ message: 'Connexion réussie', token });
    });
  });
});

// Middleware de vérification du token pour sécuriser les routes
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(403).json({ error: 'Accès refusé. Token manquant.' });
  }
  const token = authHeader.split(' ')[1]; // Format attendu : "Bearer <token>"
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token invalide ou expiré.' });
    }
    req.user = decoded;
    next();
  });
};

// Exemple de route protégée (Profil de l'utilisateur)
app.get('/profile', verifyToken, (req, res) => {
  const query = 'SELECT id, username, email, role FROM users WHERE id = ?';
  db.query(query, [req.user.id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur lors de la récupération du profil.' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }
    res.json(results[0]);
  });
});

// Exemple de route pour récupérer les posts
app.get('/posts', (req, res) => {
  const sql = 'SELECT * FROM posts';
  db.query(sql, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur lors de la récupération des posts.' });
    }
    res.json(data);
  });
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Serveur lancé sur le port ${port}`);
});
