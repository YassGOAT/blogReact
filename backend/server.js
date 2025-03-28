const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const port = 8081;
const jwtSecret = process.env.JWT_SECRET || 'votre_secret';

app.use(cors());
app.use(express.json());

// Connexion à la base de données MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Adaptez selon votre configuration
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
  const token = authHeader.split(' ')[1]; // Format : "Bearer <token>"
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid or expired token' });
    req.user = decoded;
    next();
  });
};

// --- ENDPOINTS DE TEST ET RACINE ---
app.get('/test', (req, res) => {
  res.json({ message: 'Le serveur fonctionne correctement.' });
});
app.get('/', (req, res) => {
  res.send('Backend du site Blog');
});

// --- GESTION DES UTILISATEURS ---
app.post('/register', (req, res) => {
  const { username, email, password, bio, role } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email and password are required' });
  }
  const checkQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkQuery, [email], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length > 0) return res.status(400).json({ error: 'Email already used' });
    const insertQuery = 'INSERT INTO users (username, email, password, bio, role) VALUES (?, ?, ?, ?, ?)';
    db.query(insertQuery, [username, email, password, bio || '', role || 'reader'], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Registration successful', userId: result.insertId });
    });
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
    const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  });
});
app.get('/users', (req, res) => {
  const query = 'SELECT id, username, email FROM users';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  const query = 'SELECT id, username, email, bio, role FROM users WHERE id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(results[0]);
  });
});


// --- GESTION DU PROFIL ---
app.get('/account', verifyToken, (req, res) => {
  const userId = req.user.id;
  const userQuery = 'SELECT id, username, email, bio, role FROM users WHERE id = ?';
  const postsQuery = 'SELECT id, title, content, created_at FROM posts WHERE user_id = ?';
  // Modification : inclure post_id pour permettre la redirection dans le profil
  const commentsQuery = 'SELECT id, content, post_id FROM comments WHERE user_id = ?';
  
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



// --- GESTION DES CATÉGORIES ---
app.post('/categories', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Le nom de la catégorie est requis.' });
  }
  const query = 'INSERT INTO categories (name) VALUES (?)';
  db.query(query, [name], (err, result) => {
    if (err) {
      console.error('Erreur lors de la création de la catégorie:', err);
      return res.status(500).json({ error: 'Erreur lors de la création de la catégorie.' });
    }
    res.json({ message: 'Catégorie créée avec succès', categoryId: result.insertId });
  });
});
app.get('/categories', (req, res) => {
  const query = 'SELECT * FROM categories ORDER BY name ASC';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur lors de la récupération des catégories.' });
    res.json(results);
  });
});
app.get('/categories/:id', (req, res) => {
  const categoryId = req.params.id;
  const query = 'SELECT * FROM categories WHERE id = ?';
  db.query(query, [categoryId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ error: 'Category not found' });
    res.json(results[0]);
  });
});
app.get('/categories/:id/posts', (req, res) => {
  const categoryId = req.params.id;
  const query = `
    SELECT p.id, p.title, p.content, p.user_id, p.created_at, p.updated_at, 
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

// --- GESTION DES POSTS ---
app.get('/posts', (req, res) => {
  const query = `
    SELECT p.id, p.title, p.content, p.user_id, p.created_at, p.updated_at,
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
    SELECT p.id, p.title, p.content, p.user_id, p.created_at, p.updated_at,
           u.username, c.name AS category
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
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
app.post('/posts', verifyToken, (req, res) => {
  const { title, content, category_id, tags } = req.body;
  const userId = req.user.id;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  const query = 'INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)';
  db.query(query, [title, content, userId], (err, result) => {
    if (err) {
      console.error('Erreur lors de la création du post:', err);
      return res.status(500).json({ error: 'Erreur lors de la création du post.' });
    }
    const postId = result.insertId;
    if (category_id) {
      const catQuery = 'INSERT INTO posts_categories (post_id, category_id) VALUES (?, ?)';
      db.query(catQuery, [postId, category_id], (err) => {
        if (err) console.error('Erreur lors de l\'association catégorie:', err);
      });
    }
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
app.delete('/posts/:id', verifyToken, (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;
  const checkQuery = 'SELECT * FROM posts WHERE id = ? AND user_id = ?';
  db.query(checkQuery, [postId, userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    const deleteCatQuery = 'DELETE FROM posts_categories WHERE post_id = ?';
    db.query(deleteCatQuery, [postId], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      const deletePostQuery = 'DELETE FROM posts WHERE id = ?';
      db.query(deletePostQuery, [postId], (err3) => {
        if (err3) return res.status(500).json({ error: err3.message });
        res.json({ message: 'Post deleted successfully' });
      });
    });
  });
});
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
    db.query(updateQuery, [title, content, postId], (err2) => {
      if (err2) return res.status(500).json({ error: err2 });
      res.json({ message: 'Post updated successfully' });
    });
  });
});

// --- GESTION DES COMMENTAIRES ---
app.post('/comments', verifyToken, (req, res) => {
  const { content, post_id } = req.body;
  const userId = req.user.id;
  if (!content || !post_id) {
    return res.status(400).json({ error: 'Content and post_id are required' });
  }
  const query = 'INSERT INTO comments (content, user_id, post_id) VALUES (?, ?, ?)';
  db.query(query, [content, userId, post_id], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'ajout du commentaire :', err);
      return res.status(500).json({ error: 'Erreur lors de l\'ajout du commentaire.' });
    }
    res.json({ message: 'Comment added successfully', commentId: result.insertId });
  });
});

// Ajoutez cet endpoint juste après vos endpoints existants (par exemple, après les endpoints pour les posts)
app.get('/posts/:id/comments', (req, res) => {
  const postId = req.params.id;
  const query = `
    SELECT c.id, c.content, c.user_id, c.post_id, c.created_at,
           u.username AS author
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ?
    ORDER BY c.created_at DESC
  `;
  db.query(query, [postId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des commentaires :', err);
      return res.status(500).json({ error: 'Erreur lors de la récupération des commentaires.' });
    }
    res.json(results);
  });
});


// Optionnel : Récupérer tous les commentaires (pour test)
app.get('/comments', (req, res) => {
  const query = 'SELECT * FROM comments';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur lors de la récupération des commentaires.' });
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Serveur lancé sur le port ${port}`);
});
