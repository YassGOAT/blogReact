// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Account from './components/Account';
import PostList from './components/Posts/PostList';
import PostDetails from './components/Posts/PostDetails';
import AddPost from './components/Posts/AddPost';
import EditPost from './components/Posts/EditPost';
import CategoryList from './components/Categories/CategoryList';
import CategoryPosts from './components/Categories/CategoryPosts';
import AddCategory from './components/Categories/AddCategory';
import UserProfile from './components/UserProfile';
function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<Account />} />
          <Route path="/posts" element={<PostList />} />
          <Route path="/posts/:id" element={<PostDetails />} />
          <Route path="/add-post" element={<AddPost />} />
          <Route path="/edit-post/:id" element={<EditPost />} />
          <Route path="/categories" element={<CategoryList />} />
          <Route path="/categories/:id" element={<CategoryPosts />} />
          <Route path="/add-category" element={<AddCategory />} />
          <Route path="/users/:id" element={<UserProfile />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
