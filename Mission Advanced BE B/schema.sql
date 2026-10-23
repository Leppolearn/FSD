-- =============================================================================
-- Skema Database CHILL Movie & Series
-- Database: chillmovieapp
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `chillmovieapp`;
USE `chillmovieapp`;

-- -----------------------------------------------------------------------------
-- Tabel: users
-- Menyimpan data akun pengguna aplikasi dengan password terenkripsi (bcrypt)
-- Atribut: Fullname, Username, Password, email
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `fullname` VARCHAR(255) NOT NULL,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `verification_token` VARCHAR(255) DEFAULT NULL,
  `is_verified` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Tabel: movies
-- Menyimpan katalog film
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `movies` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `year` INT NOT NULL,
  `genre` VARCHAR(100) NOT NULL,
  `rating` DECIMAL(3, 1) NOT NULL,
  `duration` VARCHAR(50) NOT NULL,
  `poster` VARCHAR(255) NOT NULL,
  `desc` TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Tabel: series
-- Menyimpan katalog series
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `series` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `year` INT NOT NULL,
  `genre` VARCHAR(100) NOT NULL,
  `rating` DECIMAL(3, 1) NOT NULL,
  `duration` VARCHAR(50) NOT NULL,
  `poster` VARCHAR(255) NOT NULL,
  `desc` TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
