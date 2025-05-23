// backend/server.js
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 8081;
const jwtSecret = process.env.JWT_SECRET || 'votre_secret';

app.use(cors());
app.use(express.json());

// -------------------
// Configuration Multer
// -------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Le dossier "uploads" doit être dans le même dossier que server.js
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    // Génération d'un nom unique basé sur le timestamp
    cb(null, Date.now() + ext);
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Limite 5MB
});

// Exposer le dossier uploads en statique
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// -------------------
// Connexion MySQL
// -------------------
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Ajustez selon votre configuration
  database: 'blog'
});
db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion MySQL :', err);
    process.exit(1);
  }
  console.log('Connecté à la base de données, threadId :', db.threadId);
});

// -------------------
// Middleware de vérification du token JWT
// -------------------
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader)
    return res.status(403).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid or expired token' });
    req.user = decoded; // Contient { id, email }
    next();
  });
};

// -------------------
// Endpoints de base
// -------------------
app.get('/test', (req, res) => {
  res.json({ message: 'Le serveur fonctionne correctement.' });
});
app.get('/', (req, res) => {
  res.send('Backend du site Blog');
});

// -------------------
// USERS : Register, Login, GET /users/:id, Mise à jour du profil
// -------------------
app.post('/register', (req, res) => {
  const { username, email, password, bio, role, profile_picture, banner_image } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email and password are required' });
  }
  const checkQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkQuery, [email], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length > 0) return res.status(400).json({ error: 'Email already used' });
    const insertQuery = `
      INSERT INTO users (username, email, password, bio, role, profile_picture, banner_image)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(insertQuery, [username, email, password, bio || '', role || 'reader', profile_picture || '', banner_image || ''],
      (err2, result) => {
        if (err2) return res.status(500).json({ error: err2 });
        res.json({ message: 'Registration successful', userId: result.insertId });
      }
    );
  });
});

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
    if (password !== user.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    // On renvoie token + userId
    const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token, userId: user.id });
  });
});

app.get('/users', (req, res) => {
  const query = 'SELECT id, username, email, bio, role, profile_picture, banner_image FROM users';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

app.get('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (Number.isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID param' });
  }
  const query = `
    SELECT id, username, email, bio, role, profile_picture, banner_image
    FROM users
    WHERE id = ?
  `;
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(results[0]);
  });
});

app.put('/users/:id/profile', verifyToken, (req, res) => {
  const userId = req.params.id;
  if (parseInt(userId, 10) !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized to update this profile' });
  }
  const { profile_picture, banner_image } = req.body;
  const updateQuery = 'UPDATE users SET profile_picture = ?, banner_image = ? WHERE id = ?';
  db.query(updateQuery, [profile_picture, banner_image, userId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Profile updated successfully' });
  });
});

// -------------------
// ACCOUNT : infos utilisateur, posts, commentaires
// -------------------
app.get('/account', verifyToken, (req, res) => {
  const userId = req.user.id;
  const userQuery = 'SELECT id, username, email, bio, role, profile_picture, banner_image FROM users WHERE id = ?';
  const postsQuery = 'SELECT id, title, content, image_url, created_at FROM posts WHERE user_id = ?';
  const commentsQuery = 'SELECT id, content, post_id FROM comments WHERE user_id = ?';
  
  db.query(userQuery, [userId], (err, userResults) => {
    if (err) return res.status(500).json({ error: err });
    if (userResults.length === 0) return res.status(404).json({ error: 'User not found' });
    const profile = userResults[0];
    db.query(postsQuery, [userId], (err2, postsResults) => {
      if (err2) return res.status(500).json({ error: err2 });
      db.query(commentsQuery, [userId], (err3, commentsResults) => {
        if (err3) return res.status(500).json({ error: err3 });
        res.json({ profile, posts: postsResults, comments: commentsResults });
      });
    });
  });
});

// -------------------
// POSTS ENDPOINTS
// -------------------
app.get('/posts', (req, res) => {
  const query = `
    SELECT p.id, p.title, p.content, p.user_id, p.image_url, p.created_at,
           u.username, c.name AS category
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN posts_categories pc ON p.id = pc.post_id
    LEFT JOIN categories c ON pc.category_id = c.id
    ORDER BY p.created_at DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

app.get('/posts/:id', (req, res) => {
  const postId = req.params.id;
  const query = `
    SELECT p.id, p.title, p.content, p.user_id, p.image_url, p.created_at,
           u.username, c.name AS category
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN posts_categories pc ON p.id = pc.post_id
    LEFT JOIN categories c ON pc.category_id = c.id
    WHERE p.id = ?
  `;
  db.query(query, [postId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ error: 'Post not found' });
    res.json(results[0]);
  });
});

app.post('/posts', verifyToken, (req, res) => {
  const { title, content, category_id, image_url } = req.body;
  const userId = req.user.id;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  const query = 'INSERT INTO posts (title, content, user_id, image_url) VALUES (?, ?, ?, ?)';
  db.query(query, [title, content, userId, image_url || ''], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    const postId = result.insertId;
    if (category_id) {
      const catQuery = 'INSERT INTO posts_categories (post_id, category_id) VALUES (?, ?)';
      db.query(catQuery, [postId, category_id], (err2) => {
        if (err2) console.error(err2);
      });
    }
    res.json({ message: 'Post created successfully', postId });
  });
});

app.put('/posts/:id', verifyToken, (req, res) => {
  const { title, content, image_url } = req.body;
  const postId = req.params.id;
  const userId = req.user.id;
  const checkQuery = 'SELECT * FROM posts WHERE id = ? AND user_id = ?';
  db.query(checkQuery, [postId, userId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }
    const updateQuery = 'UPDATE posts SET title = ?, content = ?, image_url = ? WHERE id = ?';
    db.query(updateQuery, [title, content, image_url || '', postId], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: 'Post updated successfully' });
    });
  });
});

app.delete('/posts/:id', verifyToken, (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;
  const postQuery = 'SELECT * FROM posts WHERE id = ?';
  db.query(postQuery, [postId], (err, postResults) => {
    if (err) return res.status(500).json({ error: err });
    if (postResults.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    const post = postResults[0];
    const userQuery = 'SELECT * FROM users WHERE id = ?';
    db.query(userQuery, [userId], (err2, userResults) => {
      if (err2) return res.status(500).json({ error: err2 });
      if (userResults.length === 0) return res.status(404).json({ error: 'User not found' });
      const user = userResults[0];
      const isAuthor = (post.user_id === userId);
      const isAdmin = user.role && ['admin', 'superadmin'].includes(user.role.toLowerCase());
      if (!isAuthor && !isAdmin) {
        return res.status(403).json({ error: 'Not authorized to delete this post' });
      }
      const deleteCatQuery = 'DELETE FROM posts_categories WHERE post_id = ?';
      db.query(deleteCatQuery, [postId], (err3) => {
        if (err3) return res.status(500).json({ error: err3.message });
        const deletePostQuery = 'DELETE FROM posts WHERE id = ?';
        db.query(deletePostQuery, [postId], (err4) => {
          if (err4) return res.status(500).json({ error: err4.message });
          res.json({ message: 'Post deleted successfully' });
        });
      });
    });
  });
});

// -------------------
// CATEGORIES ENDPOINTS
// -------------------

// Endpoint pour uploader une image de catégorie
app.post('/upload/category-image', verifyToken, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ message: 'Category image uploaded successfully', imageUrl });
});

// GET /categories : Retourne toutes les catégories (utilisé dans Home, Catégories, et dans le formulaire de création d'un post)
app.get('/categories', (req, res) => {
  const query = 'SELECT * FROM categories ORDER BY name ASC';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur lors de la récupération des catégories.' });
    res.json(results);
  });
});

// POST /categories : Crée une nouvelle catégorie (seulement admin ou superadmin)
app.post('/categories', verifyToken, (req, res) => {
  const { name, image_url } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Le nom de la catégorie est requis.' });
  }
  // Vérifier si l'utilisateur connecté est admin/superadmin
  const userId = req.user.id;
  const userQuery = 'SELECT role FROM users WHERE id = ?';
  db.query(userQuery, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });
    const role = results[0].role.toLowerCase();
    if (role !== 'admin' && role !== 'superadmin') {
      return res.status(403).json({ error: 'Not authorized to create category' });
    }
    const insertQuery = 'INSERT INTO categories (name, image_url) VALUES (?, ?)';
    db.query(insertQuery, [name, image_url || ''], (err2, result) => {
      if (err2) return res.status(500).json({ error: 'Erreur lors de la création de la catégorie.' });
      res.json({ message: 'Catégorie créée avec succès', categoryId: result.insertId });
    });
  });
});

// GET /categories/:id : Retourne une catégorie précise
app.get('/categories/:id', (req, res) => {
  const categoryId = req.params.id;
  const query = 'SELECT * FROM categories WHERE id = ?';
  db.query(query, [categoryId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ error: 'Category not found' });
    res.json(results[0]);
  });
});

// PUT /categories/:id : Mise à jour d'une catégorie (seulement admin/superadmin)
app.put('/categories/:id', verifyToken, (req, res) => {
  const categoryId = req.params.id;
  const { name, image_url } = req.body;
  const userId = req.user.id;
  const userQuery = 'SELECT role FROM users WHERE id = ?';
  db.query(userQuery, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });
    const role = results[0].role.toLowerCase();
    if (role !== 'admin' && role !== 'superadmin') {
      return res.status(403).json({ error: 'Not authorized to update category' });
    }
    const updateQuery = 'UPDATE categories SET name = ?, image_url = ? WHERE id = ?';
    db.query(updateQuery, [name, image_url || '', categoryId], (err2, result) => {
      if (err2) return res.status(500).json({ error: err2 });
      res.json({ message: 'Category updated successfully' });
    });
  });
});

// DELETE /categories/:id : Suppression d'une catégorie (seulement admin/superadmin)
app.delete('/categories/:id', verifyToken, (req, res) => {
  const categoryId = req.params.id;
  const userId = req.user.id;
  const userQuery = 'SELECT role FROM users WHERE id = ?';
  db.query(userQuery, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });
    const role = results[0].role.toLowerCase();
    if (role !== 'admin' && role !== 'superadmin') {
      return res.status(403).json({ error: 'Not authorized to delete category' });
    }
    const deleteQuery = 'DELETE FROM categories WHERE id = ?';
    db.query(deleteQuery, [categoryId], (err2, result) => {
      if (err2) return res.status(500).json({ error: err2 });
      res.json({ message: 'Category deleted successfully' });
    });
  });
});

// GET /categories/:id/posts : Retourne les posts liés à une catégorie (optionnel)
app.get('/categories/:id/posts', (req, res) => {
  const categoryId = req.params.id;
  const query = `
    SELECT p.id, p.title, p.content, p.user_id, p.image_url, p.created_at, p.updated_at,
           u.username, c.name AS category
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN posts_categories pc ON p.id = pc.post_id
    LEFT JOIN categories c ON pc.category_id = c.id
    WHERE pc.category_id = ?
    ORDER BY p.created_at DESC
  `;
  db.query(query, [categoryId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});


// -------------------
// COMMENTS ENDPOINTS
// -------------------
app.post('/comments', verifyToken, (req, res) => {
  const { content, post_id } = req.body;
  const userId = req.user.id;
  if (!content || !post_id) {
    return res.status(400).json({ error: 'Content and post_id are required' });
  }
  const query = 'INSERT INTO comments (content, user_id, post_id) VALUES (?, ?, ?)';
  db.query(query, [content, userId, post_id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Comment added successfully', commentId: result.insertId });
  });
});

app.get('/posts/:id/comments', (req, res) => {
  const postId = req.params.id;
  const query = `
    SELECT c.id, c.content, c.user_id, c.post_id, c.created_at,
           u.username AS author, u.profile_picture
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ?
    ORDER BY c.created_at DESC
  `;
  db.query(query, [postId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

app.get('/comments', (req, res) => {
  const query = 'SELECT * FROM comments';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// -------------------
// UPLOAD D'IMAGES ENDPOINTS
// -------------------
app.post('/upload/profile-image', verifyToken, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ message: 'Profile image uploaded successfully', imageUrl });
});

app.post('/upload/profile-banner', verifyToken, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ message: 'Banner image uploaded successfully', imageUrl });
});

// -------------------
// Lancement du serveur
// -------------------
app.listen(port, () => {
  console.log(`Serveur lancé sur le port ${port}`);
});
