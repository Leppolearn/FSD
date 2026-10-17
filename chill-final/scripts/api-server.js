import 'dotenv/config';
import mysql from 'mysql2/promise';
import { createApiApp } from './api-app.js';
import { createDatabaseService } from './database-service.js';

const requiredConfig = ['DB_HOST', 'DB_USER', 'DB_NAME'];
const missingConfig = requiredConfig.filter((key) => !process.env[key]);
if (missingConfig.length) {
  throw new Error(`Konfigurasi database belum lengkap: ${missingConfig.join(', ')}`);
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});
const app = createApiApp(createDatabaseService(pool));
const port = Number(process.env.PORT || 5000);
app.listen(port, () => console.log(`REST API berjalan di http://localhost:${port}/api/v1`));