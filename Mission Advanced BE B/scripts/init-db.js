import 'dotenv/config';
import mysql from 'mysql2/promise';

async function initDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'chillmovieapp';

  console.log(`🔌 Menghubungkan ke MySQL di ${host}:${port} sebagai ${user}...`);

  try {
    // Hubungkan tanpa database terlebih dahulu untuk membuat database jika belum ada
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    console.log(`✅ Database \`${database}\` siap.`);
    await connection.query(`USE \`${database}\`;`);

    // Buat tabel users sesuai ketentuan
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`fullname\` VARCHAR(255) NOT NULL,
        \`username\` VARCHAR(100) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`email\` VARCHAR(255) NOT NULL UNIQUE,
        \`verification_token\` VARCHAR(255) DEFAULT NULL,
        \`is_verified\` BOOLEAN DEFAULT FALSE,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Tambahkan kolom jika tabel sudah ada sebelumnya
    try {
      await connection.query(`ALTER TABLE \`users\` ADD COLUMN IF NOT EXISTS \`verification_token\` VARCHAR(255) DEFAULT NULL;`);
      await connection.query(`ALTER TABLE \`users\` ADD COLUMN IF NOT EXISTS \`is_verified\` BOOLEAN DEFAULT FALSE;`);
    } catch {
      // Abaikan jika database engine versi lama tidak support IF NOT EXISTS pada ADD COLUMN
    }
    console.log('✅ Tabel `users` siap.');

    // Buat tabel movies jika belum ada
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`movies\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`title\` VARCHAR(255) NOT NULL,
        \`year\` INT NOT NULL,
        \`genre\` VARCHAR(100) NOT NULL,
        \`rating\` DECIMAL(3, 1) NOT NULL,
        \`duration\` VARCHAR(50) NOT NULL,
        \`poster\` VARCHAR(255) NOT NULL,
        \`desc\` TEXT NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Tabel `movies` siap.');

    // Buat tabel series jika belum ada
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`series\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`title\` VARCHAR(255) NOT NULL,
        \`year\` INT NOT NULL,
        \`genre\` VARCHAR(100) NOT NULL,
        \`rating\` DECIMAL(3, 1) NOT NULL,
        \`duration\` VARCHAR(50) NOT NULL,
        \`poster\` VARCHAR(255) NOT NULL,
        \`desc\` TEXT NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Tabel `series` siap.');

    await connection.end();
    console.log('🎉 Inisialisasi database selesai!');
  } catch (error) {
    console.error('❌ Gagal menginisialisasi database:', error.message);
  }
}

initDatabase();
