const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 8081;
const saltRounds = 10;
const jwtSecret = 'votre_secret'; // Remplacez par une chaîne complexe pour la production

app.use(cors());
app.use(express.json());

// Connexion à la base de données MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Mettez ici votre mot de passe si nécessaire
  database: 'blog'
});

db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données :', err);
    process.exit(1);
  }
  console.log('Connecté à la base de données, threadId :', db.threadId);
});

// Middleware de vérification du token JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader)
    return res.status(403).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1]; // Format attendu : "Bearer <token>"
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid or expired token' });
    req.user = decoded; // Contient { id, email, iat, exp }
    next();
  });
};

// Endpoint de test
app.get('/test', (req, res) => {
  res.json({ message: 'Le serveur fonctionne correctement.' });
});

// Route racine
app.get('/', (req, res) => {
  res.send('Backend du site Blog');
});

// ======================
// Gestion des utilisateurs
// ======================

// Inscription
app.post('/register', (req, res) => {
  const { username, email, password, bio, role } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email and password are required' });
  }
  const checkQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkQuery, [email], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length > 0) return res.status(400).json({ error: 'Email already used' });
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) return res.status(500).json({ error: err });
      const insertQuery = 'INSERT INTO users (username, email, password, bio, role) VALUES (?, ?, ?, ?, ?)';
      db.query(insertQuery, [username, email, hash, bio || '', role || 'reader'], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: 'Registration successful', userId: result.insertId });
      });
    });
  });
});

// Connexion
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0)
      return res.status(401).json({ error: 'Invalid email or password' });
    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ error: err });
      if (!isMatch)
        return res.status(401).json({ error: 'Invalid email or password' });
      const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: '1h' });
      res.json({ message: 'Login successful', token });
    });
  });
});

app.get('/users', (req, res) => {
  const query = 'SELECT id, username, email FROM users';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});


// ======================
// Gestion du profil
// ======================
app.get('/account', verifyToken, (req, res) => {
  const userId = req.user.id;
  const userQuery = 'SELECT id, username, email, bio, role FROM users WHERE id = ?';
  const postsQuery = 'SELECT id, title, content, created_at FROM posts WHERE user_id = ?';
  const commentsQuery = 'SELECT id, content FROM comments WHERE user_id = ?';
  
  db.query(userQuery, [userId], (err, userResults) => {
    if (err) return res.status(500).json({ error: err });
    if (userResults.length === 0) return res.status(404).json({ error: 'User not found' });
    const profile = userResults[0];
    db.query(postsQuery, [userId], (err, postsResults) => {
      if (err) return res.status(500).json({ error: err });
      db.query(commentsQuery, [userId], (err, commentsResults) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ profile, posts: postsResults, comments: commentsResults });
      });
    });
  });
});

// ======================
// Gestion des catégories
// ======================
app.get('/categories', (req, res) => {
  const query = 'SELECT * FROM categories ORDER BY name ASC';
  db.query(query, (err, results) => {
    if (err)
      return res.status(500).json({ error: 'Erreur serveur lors de la récupération des catégories.' });
    res.json(results);
  });
});

// Récupérer les posts associés à une catégorie donnée
app.get('/categories/:id/posts', (req, res) => {
  const categoryId = req.params.id;
  const query = `
    SELECT p.*, u.username, c.name AS category
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN posts_categories pc ON p.id = pc.post_id
    LEFT JOIN categories c ON pc.category_id = c.id
    WHERE pc.category_id = ?

  `;
  db.query(query, [categoryId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});


// ======================
// Gestion des posts
// ======================

// Endpoint pour Home : récupérer tous les posts sans la catégorie
app.get('/posts', (req, res) => {
  const query = `
    SELECT id, title, content, user_id, created_at, updated_at 
    FROM posts 
    ORDER BY created_at DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Endpoint pour le détail d'un post : récupérer un post avec auteur et catégorie
app.get('/posts/:id', (req, res) => {
  const postId = req.params.id;
  const query = `
    SELECT p.*, u.username, c.name AS category
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN posts_categories pc ON p.id = pc.post_id
    LEFT JOIN categories c ON pc.category_id = c.id
    WHERE p.id = ?
  `;
  db.query(query, [postId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0)
      return res.status(404).json({ error: 'Post not found' });
    res.json(results[0]);
  });
});

// Créer un nouveau post (protégé) avec choix de catégorie et tags
app.post('/posts', verifyToken, (req, res) => {
  const { title, content, category_id, tags } = req.body;
  const userId = req.user.id;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  // Insérer le post
  const query = 'INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)';
  db.query(query, [title, content, userId], (err, result) => {
    if (err) {
      console.error('Erreur lors de la création du post:', err);
      return res.status(500).json({ error: 'Erreur lors de la création du post.' });
    }
    const postId = result.insertId;
    // Associer une catégorie via posts_categories si une catégorie est sélectionnée
    if (category_id) {
      const catQuery = 'INSERT INTO posts_categories (post_id, category_id) VALUES (?, ?)';
      db.query(catQuery, [postId, category_id], (err) => {
        if (err) console.error('Erreur lors de l\'association catégorie:', err);
      });
    }
    // Associer des tags via posts_tags si fournis (tags doit être un tableau d'identifiants)
    if (tags && Array.isArray(tags) && tags.length > 0) {
      const tagValues = tags.map(tagId => [postId, tagId]);
      const tagQuery = 'INSERT INTO posts_tags (post_id, tag_id) VALUES ?';
      db.query(tagQuery, [tagValues], (err) => {
        if (err) console.error('Erreur lors de l\'association tags:', err);
      });
    }
    res.json({ message: 'Post created successfully', postId });
  });
});

// Modifier un post (protégé, uniquement si l'utilisateur est le propriétaire)
app.put('/posts/:id', verifyToken, (req, res) => {
  const { title, content } = req.body;
  const postId = req.params.id;
  const userId = req.user.id;

  const checkQuery = 'SELECT * FROM posts WHERE id = ? AND user_id = ?';
  db.query(checkQuery, [postId, userId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0)
      return res.status(403).json({ error: 'Not authorized to update this post' });
    
    const updateQuery = 'UPDATE posts SET title = ?, content = ? WHERE id = ?';
    db.query(updateQuery, [title, content, postId], (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Post updated successfully' });
    });
  });
});



app.listen(port, () => {
  console.log(`Serveur lancé sur le port ${port}`);
});
