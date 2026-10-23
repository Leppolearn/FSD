import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { createServer } from 'node:http';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createApiApp } from '../scripts/api-app.js';
import { createAuthService } from '../scripts/auth-service.js';
import { createAuthMiddleware } from '../scripts/auth-middleware.js';
import { createDatabaseService } from '../scripts/database-service.js';

const TEST_SECRET = 'test-secret-key-12345';

test('createAuthService: register hashes password with bcrypt and executes INSERT with verification_token', async () => {
  const calls = [];
  const mockPool = {
    execute: async (sql, params) => {
      calls.push([sql, params]);
      if (sql.includes('SELECT')) {
        return [[]]; // Tidak ada user yang duplikat
      }
      if (sql.includes('INSERT')) {
        return [{ insertId: 99 }];
      }
      return [[]];
    },
  };

  const authService = createAuthService(mockPool, { jwtSecret: TEST_SECRET });
  const result = await authService.register({
    fullname: 'Budi Santoso',
    username: 'budisantoso',
    password: 'password123',
    email: 'budi@example.com',
  });

  assert.equal(result.id, 99);
  assert.equal(result.fullname, 'Budi Santoso');
  assert.equal(result.username, 'budisantoso');
  assert.equal(result.email, 'budi@example.com');
  assert.ok(result.verificationToken, 'verification_token harus dibuat');

  // Periksa bahwa query INSERT dijalankan
  const insertCall = calls.find(([sql]) => sql.includes('INSERT INTO `users`'));
  assert.ok(insertCall, 'Query INSERT INTO users harus dijalankan');

  const [, params] = insertCall;
  const [fullname, username, hashedPassword, email, token] = params;
  assert.equal(fullname, 'Budi Santoso');
  assert.equal(username, 'budisantoso');
  assert.equal(email, 'budi@example.com');
  assert.ok(token);

  // Pastikan password dienkripsi dengan bcrypt dan bukan plaintext
  assert.notEqual(hashedPassword, 'password123');
  const isMatch = await bcrypt.compare('password123', hashedPassword);
  assert.equal(isMatch, true, 'Password yang disimpan harus valid dengan bcrypt.compare');
});

test('createAuthService: verifyEmail validates token in database and updates verification status', async () => {
  const calls = [];
  const mockPool = {
    execute: async (sql, params) => {
      calls.push([sql, params]);
      if (sql.includes('SELECT') && params[0] === 'valid-uuid-token') {
        return [[{ id: 10, email: 'user@chill.com', is_verified: 0 }]];
      }
      return [[]];
    },
  };

  const authService = createAuthService(mockPool, { jwtSecret: TEST_SECRET });

  // 1. Token valid
  const resSuccess = await authService.verifyEmail('valid-uuid-token');
  assert.equal(resSuccess, 'Email Verified Successfully');
  assert.ok(calls.some(([sql]) => sql.includes('UPDATE `users` SET `is_verified` = 1')));

  // 2. Token invalid -> lempar error 400
  await assert.rejects(
    authService.verifyEmail('invalid-token-123'),
    (err) => {
      assert.equal(err.statusCode, 400);
      assert.equal(err.message, 'Invalid Verification Token');
      return true;
    }
  );
});

test('createAuthService: login verifies email and password with bcrypt and returns jwt token', async () => {
  const passwordHash = await bcrypt.hash('secretPass123', 10);
  const mockUser = {
    id: 15,
    fullname: 'Siti Rahma',
    username: 'siti_r',
    password: passwordHash,
    email: 'siti@example.com',
    is_verified: 1,
  };

  const mockPool = {
    execute: async (sql, params) => {
      if (sql.includes('SELECT * FROM `users` WHERE LOWER(`email`) = ?')) {
        if (params[0] === 'siti@example.com') {
          return [[mockUser]];
        }
      }
      return [[]];
    },
  };

  const authService = createAuthService(mockPool, { jwtSecret: TEST_SECRET });

  // 1. Kasus Sukses: email dan password cocok
  const successResult = await authService.login({
    email: 'siti@example.com',
    password: 'secretPass123',
  });

  assert.ok(successResult.token, 'Token JWT harus dikembalikan');
  assert.equal(successResult.user.id, 15);
  assert.equal(successResult.user.username, 'siti_r');

  const decoded = jwt.verify(successResult.token, TEST_SECRET);
  assert.equal(decoded.id, 15);
  assert.equal(decoded.email, 'siti@example.com');

  // 2. Kasus User Tidak Ditemukan -> 401
  await assert.rejects(
    authService.login({ email: 'tidak_ada@example.com', password: 'secretPass123' }),
    (err) => {
      assert.equal(err.statusCode, 401);
      assert.equal(err.message, 'Email atau password yang dimasukkan salah');
      return true;
    }
  );

  // 3. Kasus Password Salah -> 401
  await assert.rejects(
    authService.login({ email: 'siti@example.com', password: 'salahPassword' }),
    (err) => {
      assert.equal(err.statusCode, 401);
      assert.equal(err.message, 'Email atau password yang dimasukkan salah');
      return true;
    }
  );
});

test('createDatabaseService: supports Query Params (filter, sort, search)', async () => {
  const calls = [];
  const service = createDatabaseService({
    execute: async (sql, params) => {
      calls.push([sql, params]);
      return [[{ id: 1, title: 'Action Film' }]];
    },
  });

  // 1. Filter dengan WHERE
  await service.getAll('movies', { genre: 'Action' });
  assert.equal(calls[0][0], 'SELECT * FROM `movies` WHERE `genre` = ?');
  assert.deepEqual(calls[0][1], ['Action']);

  // 2. Search dengan WHERE dan LIKE
  await service.getAll('movies', { search: 'Tomorrow' });
  assert.equal(calls[1][0], 'SELECT * FROM `movies` WHERE `title` LIKE ?');
  assert.deepEqual(calls[1][1], ['%Tomorrow%']);

  // 3. Sorting dengan ORDER BY
  await service.getAll('movies', { sort: 'rating', order: 'desc' });
  assert.equal(calls[2][0], 'SELECT * FROM `movies` ORDER BY `rating` DESC');

  // 4. Kombinasi Filter, Search, dan Sort
  await service.getAll('movies', { genre: 'Drama', search: 'Otto', sort: 'year', order: 'asc' });
  assert.equal(calls[3][0], 'SELECT * FROM `movies` WHERE `title` LIKE ? AND `genre` = ? ORDER BY `year` ASC');
  assert.deepEqual(calls[3][1], ['%Otto%', 'Drama']);
});

test('authMiddleware: supports authMiddleware.verifyToken syntax and validates token', () => {
  const middleware = createAuthMiddleware(TEST_SECRET);
  assert.equal(typeof middleware.verifyToken, 'function');

  // Tanpa token -> 401
  let status1 = null;
  middleware.verifyToken(
    { headers: {} },
    { status: (c) => { status1 = c; return { json: () => {} }; } },
    () => assert.fail('Harus gagal jika token kosong')
  );
  assert.equal(status1, 401);

  // Dengan token valid -> next() dipanggil
  const validToken = jwt.sign({ id: 50, username: 'user50' }, TEST_SECRET);
  let nextCalled = false;
  const req = { headers: { authorization: `Bearer ${validToken}` } };
  middleware.verifyToken(req, {}, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
  assert.equal(req.user.id, 50);
});

// -----------------------------------------------------------------------------
// HTTP Integration Tests
// -----------------------------------------------------------------------------
let server;
let baseUrl;

beforeEach(async () => {
  const service = {
    getAll: async (resource, query) => [{ id: 1, title: `${resource} item`, query }],
    getById: async (resource, id) => ({ id: Number(id), title: `${resource} item` }),
    create: async (resource, data) => ({ id: 2, ...data, resource }),
    update: async (resource, id, data) => ({ id: Number(id), ...data, resource }),
    delete: async (resource, id) => ({ id: Number(id), resource }),
  };

  const registeredUsers = [];
  let savedToken = null;
  const authService = createAuthService({
    execute: async (sql, params) => {
      if (sql.includes('INSERT INTO `users`')) {
        savedToken = params?.[4];
        const newUser = {
          id: registeredUsers.length + 1,
          fullname: params?.[0],
          username: params?.[1],
          password: params?.[2],
          email: params?.[3],
          verification_token: params?.[4],
          is_verified: params?.[5] || 0,
        };
        registeredUsers.push(newUser);
        return [{ insertId: newUser.id }];
      }
      if (sql.includes('SELECT') && sql.includes('verification_token')) {
        const found = registeredUsers.find((u) => u.verification_token === params?.[0]);
        if (found) {
          return [[found]];
        }
        if (params?.[0] && params[0] === savedToken) {
          return [[{ id: 1, email: 't@mail.com', is_verified: 0 }]];
        }
        return [[]];
      }
      if (sql.includes('SELECT * FROM `users` WHERE LOWER(`email`) = ?')) {
        const found = registeredUsers.find((u) => u.email.toLowerCase() === params?.[0]?.toLowerCase());
        if (found) {
          return [[found]];
        }
        return [[]];
      }
      if (sql.includes('UPDATE `users` SET `is_verified`')) {
        const found = registeredUsers.find((u) => u.id === params?.[0]);
        if (found) {
          found.is_verified = 1;
        }
        return [{ affectedRows: 1 }];
      }
      return [[]];
    },
  }, { jwtSecret: TEST_SECRET });

  // Testing createApiApp dengan proteksi movies diaktifkan
  const app = createApiApp(service, authService, { protectMovies: true });
  server = createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api/v1`;
});

afterEach(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test('HTTP POST /api/v1/auth/register registers user, generates token, and allows email verification', async () => {
  const regRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullname: 'Rian Pratama',
      username: 'rianp',
      password: 'passwordKu123',
      email: 'rian@chill.com',
    }),
  });

  assert.equal(regRes.status, 201);
  const regData = await regRes.json();
  assert.equal(regData.message, 'Registrasi berhasil');
  assert.ok(regData.user.verificationToken);

  // Verifikasi email dengan token salah -> 400 'Invalid Verification Token'
  const wrongVerifyRes = await fetch(`${baseUrl}/auth/verifikasi-email?token=token-ngawur`);
  assert.equal(wrongVerifyRes.status, 400);
  const wrongText = await wrongVerifyRes.text();
  assert.equal(wrongText, 'Invalid Verification Token');

  // Verifikasi email dengan token benar -> 200 'Email Verified Successfully'
  const okVerifyRes = await fetch(`${baseUrl}/auth/verifikasi-email?token=${regData.user.verificationToken}`);
  assert.equal(okVerifyRes.status, 200);
  const okText = await okVerifyRes.text();
  assert.equal(okText, 'Email Verified Successfully');
});

test('HTTP GET /api/v1/movies is protected by authMiddleware.verifyToken', async () => {
  // Tanpa token -> 401
  const noTokenRes = await fetch(`${baseUrl}/movies`);
  assert.equal(noTokenRes.status, 401);

  // Buat token valid
  const token = jwt.sign({ id: 1, username: 'tester' }, TEST_SECRET);

  // Dengan token -> 200
  const withTokenRes = await fetch(`${baseUrl}/movies`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(withTokenRes.status, 200);
});

test('HTTP POST /api/v1/upload handles image upload via multer', async () => {
  // Upload tanpa file -> 400
  const emptyRes = await fetch(`${baseUrl}/upload`, { method: 'POST' });
  assert.equal(emptyRes.status, 400);

  // Upload dengan FormData & file gambar
  const formData = new FormData();
  const dummyBlob = new Blob(['fake image content'], { type: 'image/png' });
  formData.append('image', dummyBlob, 'test-poster.png');

  const uploadRes = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: formData,
  });
  assert.equal(uploadRes.status, 201);
  const uploadData = await uploadRes.json();
  assert.equal(uploadData.message, 'Gambar berhasil diunggah');
  assert.ok(uploadData.filename.includes('image-'));
  assert.ok(uploadData.url);
});

test('Reference Table Validation: matches all 5 endpoints (/register, /login, /verify-email, /movie, /upload)', async () => {
  const rootUrl = `http://127.0.0.1:${server.address().port}`;

  // 1. POST /register (Payload: fullname, username, password, email)
  const regRes = await fetch(`${rootUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullname: 'Movie User',
      username: 'movieuser',
      password: 'password123',
      email: 'movieuser@chill.com',
    }),
  });
  assert.equal(regRes.status, 201);
  const regData = await regRes.json();
  const token = regData.user.verificationToken;

  // 2. POST /login (Payload: email, password)
  const loginRes = await fetch(`${rootUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'movieuser@chill.com',
      password: 'password123',
    }),
  });
  assert.equal(loginRes.status, 200);
  const loginData = await loginRes.json();
  assert.ok(loginData.token);
  const authToken = loginData.token;

  // 2.5 GET /auth/me (Protected route with Bearer token)
  const profileRes = await fetch(`${rootUrl}/auth/me`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  assert.equal(profileRes.status, 200);
  const profileData = await profileRes.json();
  assert.equal(profileData.user.email, 'movieuser@chill.com');

  // 3. GET /verify-email (Payload / query param: token)
  const verifyRes = await fetch(`${rootUrl}/verify-email?token=${token}`);
  assert.equal(verifyRes.status, 200);
  const verifyText = await verifyRes.text();
  assert.equal(verifyText, 'Email Verified Successfully');

  // 4. GET /movie (Params: genre, sortBy, search) with Bearer token
  const movieRes = await fetch(`${rootUrl}/movie?genre=Action&sortBy=rating&search=Action`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  assert.equal(movieRes.status, 200);
  const movies = await movieRes.json();
  assert.ok(Array.isArray(movies));

  // 5. POST /upload (Payload: { file: })
  const formData = new FormData();
  const dummyBlob = new Blob(['sample-movie-image'], { type: 'image/jpeg' });
  formData.append('file', dummyBlob, 'reference-test.jpg');

  const uploadRes = await fetch(`${rootUrl}/upload`, {
    method: 'POST',
    body: formData,
  });
  assert.equal(uploadRes.status, 201);
  const uploadJson = await uploadRes.json();
  assert.equal(uploadJson.message, 'Gambar berhasil diunggah');
  assert.ok(uploadJson.filename);
});

