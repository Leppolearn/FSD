import 'dotenv/config';
import mysql from 'mysql2/promise';
import { createApiApp } from './api-app.js';
import { createDatabaseService } from './database-service.js';
import { createAuthService } from './auth-service.js';

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

const databaseService = createDatabaseService(pool);
const authService = createAuthService(pool);
const app = createApiApp(databaseService, authService);

const port = Number(process.env.PORT || 5000);
app.listen(port, () => {
  console.log(`\n===========================================`);
  console.log(`🎬 REST API CHILL Movie & Series berjalan!`);
  console.log(`📡 Base URL: http://localhost:${port}/api/v1`);
  console.log(`🔐 Auth Endpoints:`);
  console.log(`   - POST http://localhost:${port}/api/v1/auth/register`);
  console.log(`   - POST http://localhost:${port}/api/v1/auth/login`);
  console.log(`   - GET  http://localhost:${port}/api/v1/auth/me (Protected)`);
  console.log(`🍿 Resource Endpoints:`);
  console.log(`   - GET/POST/PATCH/DELETE http://localhost:${port}/api/v1/movies`);
  console.log(`   - GET/POST/PATCH/DELETE http://localhost:${port}/api/v1/series`);
  console.log(`===========================================\n`);
});