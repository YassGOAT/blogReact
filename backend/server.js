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
    process.exit(1);
  }
  console.log('Connecté à la base de données, threadId :', db.threadId);
});

// Route racine
app.get('/', (req, res) => {
  res.send('Backend du site Blog');
});

// Route pour l'inscription (Register)
// Si vous souhaitez permettre la saisie d'une bio dès l'inscription, ajoutez "bio" dans req.body et dans la requête SQL.
app.post('/register', (req, res) => {
  const { username, email, password, bio, role } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Les champs username, email et password sont obligatoires.' });
  }
  const checkQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkQuery, [email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur lors de la vérification de l\'email.' });
    }
    if (results.length > 0) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
    }
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur lors du hachage du mot de passe.' });
      }
      const insertQuery = 'INSERT INTO users (username, email, password, bio, role) VALUES (?, ?, ?, ?, ?)';
      // La bio est optionnelle, si non fournie on insère une chaîne vide
      db.query(insertQuery, [username, email, hash, bio || '', role || 'reader'], (err, result) => {
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
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur lors de la comparaison des mots de passe.' });
      }
      if (!isMatch) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
      }
      const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: '1h' });
      res.json({ message: 'Connexion réussie', token });
    });
  });
});

// Middleware de vérification du token
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

// Route protégée pour récupérer le compte complet de l'utilisateur connecté
// Cette route retourne le profil (avec bio), ses posts et ses commentaires.
app.get('/account', verifyToken, (req, res) => {
  const userId = req.user.id;
  const userQuery = 'SELECT id, username, email, bio, role FROM users WHERE id = ?';
  const postsQuery = 'SELECT * FROM posts WHERE user_id = ?';
  const commentsQuery = 'SELECT * FROM comments WHERE user_id = ?';
  
  db.query(userQuery, [userId], (err, userResults) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur lors de la récupération du profil.' });
    }
    if (userResults.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }
    const profile = userResults[0];
    db.query(postsQuery, [userId], (err, postsResults) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur lors de la récupération des posts.' });
      }
      db.query(commentsQuery, [userId], (err, commentsResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Erreur lors de la récupération des commentaires.' });
        }
        res.json({
          profile,
          posts: postsResults,
          comments: commentsResults
        });
      });
    });
  });
});

// Route pour récupérer tous les posts (route existante)
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

// Routes existantes pour les catégories, commentaires, tags, associations et utilisateurs…
app.get('/categories', (req, res) => {
  const sql = 'SELECT * FROM categories ORDER BY name ASC';
  db.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err });
    res.json(data);
  });
});

app.get('/comments', (req, res) => {
  const sql = 'SELECT * FROM comments';
  db.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err });
    res.json(data);
  });
});

app.get('/tags', (req, res) => {
  const sql = 'SELECT * FROM tags';
  db.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err });
    res.json(data);
  });
});

app.get('/posts_tags', (req, res) => {
  const sql = 'SELECT * FROM posts_tags';
  db.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err });
    res.json(data);
  });
});

app.get('/posts_categories', (req, res) => {
  const sql = 'SELECT * FROM posts_categories';
  db.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err });
    res.json(data);
  });
});

app.get('/users', (req, res) => {
  const sql = 'SELECT * FROM users';
  db.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err });
    res.json(data);
  });
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Serveur lancé sur le port ${port}`);
});
