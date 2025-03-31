-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : lun. 31 mars 2025 à 13:44
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `blog`
--

-- --------------------------------------------------------

--
-- Structure de la table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`id`, `name`, `image_url`) VALUES
(1, 'Technologie', 'tech.jpg'),
(2, 'Culture', 'culture.jpg'),
(3, 'Voyage', 'voyage.jpg'),
(4, 'Cuisine', 'cuisine.jpg'),
(5, 'Sport', 'sport.jpg'),
(6, 'Santé', 'sante.jpg'),
(7, 'Art', 'art.jpg'),
(8, 'Finance', 'finance.jpg'),
(9, 'Éducation', 'education.jpg'),
(10, 'Divertissement', 'divertissement.jpg'),
(13, 'tezt', 'http://localhost:8081/uploads/1743163334398.png'),
(14, 'k', ''),
(15, 'a', '');

-- --------------------------------------------------------

--
-- Structure de la table `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL,
  `content` text NOT NULL,
  `user_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `comments`
--

INSERT INTO `comments` (`id`, `content`, `user_id`, `post_id`, `created_at`, `updated_at`) VALUES
(3, 'Commentaire 3 sur le post 3.', 4, 3, '2025-03-28 05:34:44', '2025-03-28 05:34:44'),
(4, 'Commentaire 4 sur le post 4.', 5, 4, '2025-03-28 05:34:44', '2025-03-28 05:34:44'),
(5, 'Commentaire 5 sur le post 5.', 6, 5, '2025-03-28 05:34:44', '2025-03-28 05:34:44'),
(6, 'Commentaire 6 sur le post 6.', 7, 6, '2025-03-28 05:34:44', '2025-03-28 05:34:44'),
(7, 'Commentaire 7 sur le post 7.', 8, 7, '2025-03-28 05:34:44', '2025-03-28 05:34:44'),
(8, 'Commentaire 8 sur le post 8.', 9, 8, '2025-03-28 05:34:44', '2025-03-28 05:34:44'),
(9, 'Commentaire 9 sur le post 9.', 10, 9, '2025-03-28 05:34:44', '2025-03-28 05:34:44'),
(11, '^po', 2, 4, '2025-03-28 08:48:26', '2025-03-28 08:48:26'),
(12, 'wow !', 1, 11, '2025-03-28 08:57:17', '2025-03-28 08:57:17'),
(13, 'yui', 2, 12, '2025-03-28 08:59:42', '2025-03-28 08:59:42');

-- --------------------------------------------------------

--
-- Structure de la table `favorites`
--

CREATE TABLE `favorites` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `favorite_user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `posts`
--

CREATE TABLE `posts` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `user_id` int(11) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `image` longblob DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `posts`
--

INSERT INTO `posts` (`id`, `title`, `content`, `user_id`, `image_url`, `created_at`, `updated_at`, `image`) VALUES
(3, 'Post 3', 'Contenu du post 3. C\'est un exemple de contenu.', 3, 'post3.jpg', '2025-03-28 05:34:44', '2025-03-28 05:34:44', NULL),
(4, 'Post 4', 'Contenu du post 4. C\'est un exemple de contenu.', 4, 'post4.jpg', '2025-03-28 05:34:44', '2025-03-28 05:34:44', NULL),
(5, 'Post 5', 'Contenu du post 5. C\'est un exemple de contenu.', 5, 'post5.jpg', '2025-03-28 05:34:44', '2025-03-28 05:34:44', NULL),
(6, 'Post 6', 'Contenu du post 6. C\'est un exemple de contenu.', 6, 'post6.jpg', '2025-03-28 05:34:44', '2025-03-28 05:34:44', NULL),
(7, 'Post 7', 'Contenu du post 7. C\'est un exemple de contenu.', 7, 'post7.jpg', '2025-03-28 05:34:44', '2025-03-28 05:34:44', NULL),
(8, 'Post 8', 'Contenu du post 8. C\'est un exemple de contenu.', 8, 'post8.jpg', '2025-03-28 05:34:44', '2025-03-28 05:34:44', NULL),
(9, 'Post 9', 'Contenu du post 9. C\'est un exemple de contenu.', 9, 'post9.jpg', '2025-03-28 05:34:44', '2025-03-28 05:34:44', NULL),
(11, 'ju', 'ttrtzezqdza', 1, NULL, '2025-03-28 08:47:54', '2025-03-28 08:47:54', NULL),
(12, 'azerty', 'azertaaayuiopazeazezaeaezezaeazeazea', 2, NULL, '2025-03-28 08:59:35', '2025-03-28 09:10:27', NULL),
(15, 'test', 'teqst', 1, 'http://localhost:8081/uploads/1743163302897.jpeg', '2025-03-28 12:01:56', '2025-03-28 12:01:56', NULL),
(17, 'aaaa', 'aaa', 2, 'http://localhost:8081/uploads/1743164180681.jpeg', '2025-03-28 12:16:23', '2025-03-28 12:16:23', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `posts_categories`
--

CREATE TABLE `posts_categories` (
  `post_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `posts_categories`
--

INSERT INTO `posts_categories` (`post_id`, `category_id`) VALUES
(3, 3),
(4, 4),
(5, 5),
(6, 6),
(7, 7),
(8, 8),
(9, 9),
(11, 7),
(12, 9),
(15, 7),
(17, 13);

-- --------------------------------------------------------

--
-- Structure de la table `posts_tags`
--

CREATE TABLE `posts_tags` (
  `post_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `posts_tags`
--

INSERT INTO `posts_tags` (`post_id`, `tag_id`) VALUES
(3, 3),
(4, 4),
(5, 5),
(6, 6),
(7, 7),
(8, 8),
(9, 9);

-- --------------------------------------------------------

--
-- Structure de la table `tags`
--

CREATE TABLE `tags` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `tags`
--

INSERT INTO `tags` (`id`, `name`) VALUES
(1, 'Nouveautés'),
(2, 'Conseils'),
(3, 'Tutos'),
(4, 'Avis'),
(5, 'Lifestyle'),
(6, 'Review'),
(7, 'DIY'),
(8, 'Analyse'),
(9, 'Guide'),
(10, 'Astuce');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `bio` text DEFAULT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'reader',
  `profile_picture` varchar(255) DEFAULT NULL,
  `banner_image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `bio`, `role`, `profile_picture`, `banner_image`) VALUES
(1, 'adminUser', 'admin@example.com', 'adminpass', 'C\'est l\'administrateur du blog.', 'admin', 'adminpic.jpg', 'adminbanner.jpg'),
(2, 'user1', 'user1@example.com', 'password1', 'Bio de user1', 'reader', 'http://localhost:8081/uploads/1743165406141.ico', 'user1banner.jpg'),
(3, 'user2', 'user2@example.com', 'password2', 'Bio de user2', 'reader', 'user2pic.jpg', 'user2banner.jpg'),
(4, 'user3', 'user3@example.com', 'password3', 'Bio de user3', 'reader', 'user3pic.jpg', 'user3banner.jpg'),
(5, 'user4', 'user4@example.com', 'password4', 'Bio de user4', 'reader', 'user4pic.jpg', 'user4banner.jpg'),
(6, 'user5', 'user5@example.com', 'password5', 'Bio de user5', 'reader', 'user5pic.jpg', 'user5banner.jpg'),
(7, 'user6', 'user6@example.com', 'password6', 'Bio de user6', 'reader', 'user6pic.jpg', 'user6banner.jpg'),
(8, 'user7', 'user7@example.com', 'password7', 'Bio de user7', 'reader', 'user7pic.jpg', 'user7banner.jpg'),
(9, 'user8', 'user8@example.com', 'password8', 'Bio de user8', 'reader', 'user8pic.jpg', 'user8banner.jpg'),
(10, 'user9', 'user9@example.com', 'password9', 'Bio de user9', 'reader', 'user9pic.jpg', 'user9banner.jpg');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `post_id` (`post_id`);

--
-- Index pour la table `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `favorite_user_id` (`favorite_user_id`);

--
-- Index pour la table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `posts_categories`
--
ALTER TABLE `posts_categories`
  ADD PRIMARY KEY (`post_id`,`category_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Index pour la table `posts_tags`
--
ALTER TABLE `posts_tags`
  ADD PRIMARY KEY (`post_id`,`tag_id`),
  ADD KEY `tag_id` (`tag_id`);

--
-- Index pour la table `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT pour la table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT pour la table `favorites`
--
ALTER TABLE `favorites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT pour la table `tags`
--
ALTER TABLE `tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`);

--
-- Contraintes pour la table `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`favorite_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `posts_categories`
--
ALTER TABLE `posts_categories`
  ADD CONSTRAINT `posts_categories_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`),
  ADD CONSTRAINT `posts_categories_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

--
-- Contraintes pour la table `posts_tags`
--
ALTER TABLE `posts_tags`
  ADD CONSTRAINT `posts_tags_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`),
  ADD CONSTRAINT `posts_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
