import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { createAuthMiddleware } from './auth-middleware.js';
import { uploadImageMiddleware, UPLOAD_DIR } from './upload-service.js';
import { createEmailService } from './email-service.js';

const DEFAULT_SECRET = process.env.JWT_SECRET || 'chill-secret-key-2025';

function createInMemoryAuthService(secretKey = DEFAULT_SECRET) {
  const users = [];
  let nextId = 1;
  const mailer = createEmailService();

  return {
    getSecretKey() {
      return secretKey;
    },
    async register(data) {
      const { fullname, username, password, email } = data || {};
      if (!fullname || !username || !password || !email) {
        const error = new Error('Field fullname, username, password, dan email wajib diisi');
        error.statusCode = 400;
        throw error;
      }
      const trimmedEmail = String(email).trim().toLowerCase();
      const trimmedUsername = String(username).trim();
      const trimmedFullname = String(fullname).trim();

      if (users.some((u) => u.email === trimmedEmail)) {
        const error = new Error('Email sudah terdaftar');
        error.statusCode = 409;
        throw error;
      }
      if (users.some((u) => u.username === trimmedUsername)) {
        const error = new Error('Username sudah digunakan');
        error.statusCode = 409;
        throw error;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = uuidv4();

      const newUser = {
        id: nextId++,
        fullname: trimmedFullname,
        username: trimmedUsername,
        password: hashedPassword,
        email: trimmedEmail,
        verificationToken,
        is_verified: false,
      };
      users.push(newUser);

      // Kirim email simulasi
      try {
        await mailer.sendMail({
          to: trimmedEmail,
          token: verificationToken,
          fullname: trimmedFullname,
        });
      } catch (err) {
        console.warn('Simulasi email gagal:', err.message);
      }

      return {
        id: newUser.id,
        fullname: newUser.fullname,
        username: newUser.username,
        email: newUser.email,
        verificationToken,
      };
    },
    async verifyEmail(token) {
      if (!token || typeof token !== 'string' || !token.trim()) {
        const error = new Error('Invalid Verification Token');
        error.statusCode = 400;
        throw error;
      }
      const user = users.find((u) => u.verificationToken === token.trim());
      if (!user) {
        const error = new Error('Invalid Verification Token');
        error.statusCode = 400;
        throw error;
      }
      user.is_verified = true;
      user.verificationToken = null;
      return 'Email Verified Successfully';
    },
    async login(data) {
      const { email, password } = data || {};
      if (!email || !password) {
        const error = new Error('Email dan password wajib diisi');
        error.statusCode = 400;
        throw error;
      }
      const trimmedEmail = String(email).trim().toLowerCase();
      const user = users.find((u) => u.email === trimmedEmail);
      if (!user) {
        const error = new Error('Email atau password yang dimasukkan salah');
        error.statusCode = 401;
        throw error;
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        const error = new Error('Email atau password yang dimasukkan salah');
        error.statusCode = 401;
        throw error;
      }
      const payload = {
        id: user.id,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        is_verified: user.is_verified,
      };
      const token = jwt.sign(payload, secretKey, { expiresIn: '1d' });
      return { token, user: payload };
    },
  };
}

export function createApiApp(service, authService = null, options = {}) {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  // Langkah Ketujuh: Melayani file gambar statis dari folder upload
  app.use('/upload', express.static(UPLOAD_DIR));
  app.use('/api/v1/upload', express.static(UPLOAD_DIR));

  const auth = authService || createInMemoryAuthService();
  const secretKey = typeof auth.getSecretKey === 'function' ? auth.getSecretKey() : DEFAULT_SECRET;
  const authMiddleware = createAuthMiddleware(secretKey);

  // Expose middleware on app for external router access (authMiddleware.verifyToken)
  app.authMiddleware = authMiddleware;

  // ---------------------------------------------------------------------------
  // 1. Endpoint Registrasi Pengguna (/register, /api/v1/register, /api/v1/auth/register)
  // ---------------------------------------------------------------------------
  const handleRegister = async (req, res, next) => {
    try {
      const user = await auth.register(req.body);
      res.status(201).json({
        message: 'Registrasi berhasil',
        user,
      });
    } catch (error) {
      next(error);
    }
  };

  ['/api/v1/auth/register', '/api/v1/register', '/register'].forEach((route) => {
    app.post(route, handleRegister);
  });

  // ---------------------------------------------------------------------------
  // 2. Endpoint Login Pengguna (/login, /api/v1/login, /api/v1/auth/login)
  // ---------------------------------------------------------------------------
  const handleLogin = async (req, res, next) => {
    try {
      const result = await auth.login(req.body);
      res.status(200).json({
        message: 'Login berhasil',
        token: result.token,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  };

  ['/api/v1/auth/login', '/api/v1/login', '/login'].forEach((route) => {
    app.post(route, handleLogin);
  });

  // ---------------------------------------------------------------------------
  // 3. Endpoint Verifikasi Email (/verify-email, /verifikasi-email)
  // ---------------------------------------------------------------------------
  const handleVerifyEmail = async (req, res, next) => {
    try {
      const token = req.query.token || req.body?.token || req.params?.token;
      if (!token) {
        return res.status(400).send('Invalid Verification Token');
      }

      await auth.verifyEmail(token);
      return res.status(200).send('Email Verified Successfully');
    } catch (error) {
      if (error.message === 'Invalid Verification Token' || error.statusCode === 400) {
        return res.status(400).send('Invalid Verification Token');
      }
      next(error);
    }
  };

  [
    '/api/v1/auth/verify-email',
    '/api/v1/verify-email',
    '/verify-email',
    '/api/v1/auth/verifikasi-email',
    '/api/v1/verifikasi-email',
    '/verifikasi-email',
  ].forEach((route) => {
    app.get(route, handleVerifyEmail);
    app.post(route, handleVerifyEmail);
  });

  // ---------------------------------------------------------------------------
  // 4. Endpoint Terproteksi Profil Pengguna
  // ---------------------------------------------------------------------------
  const handleProfile = (req, res) => {
    res.status(200).json({
      message: 'Autentikasi berhasil',
      user: req.user,
    });
  };

  ['/auth/me', '/api/v1/auth/me', '/api/v1/me', '/me', '/api/v1/profile', '/profile'].forEach((route) => {
    app.get(route, authMiddleware.verifyToken, handleProfile);
  });

  // ---------------------------------------------------------------------------
  // 5. Endpoint Upload Gambar (/upload, /api/v1/upload)
  // ---------------------------------------------------------------------------
  const handleUpload = (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada file gambar yang diunggah' });
    }
    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol || 'http';
    const fileUrl = `${protocol}://${host}/upload/${req.file.filename}`;

    res.status(201).json({
      message: 'Gambar berhasil diunggah',
      filename: req.file.filename,
      path: `/upload/${req.file.filename}`,
      url: fileUrl,
    });
  };

  ['/api/v1/upload', '/upload'].forEach((route) => {
    app.post(route, uploadImageMiddleware, handleUpload);
  });

  // ---------------------------------------------------------------------------
  // 6. Endpoint Movie (/movie, /movies, /api/v1/movie, /api/v1/movies)
  // ---------------------------------------------------------------------------
  const shouldProtectMovies = options.protectMovies === true || (authService !== null && options.protectMovies !== false);

  const movieController = {
    async getList(req, res, next) {
      try {
        res.json(await service.getAll('movies', req.query));
      } catch (error) {
        next(error);
      }
    },
  };

  const movieRoutes = ['/api/v1/movies', '/api/v1/movie', '/movies', '/movie'];
  if (shouldProtectMovies) {
    movieRoutes.forEach((route) => {
      app.get(route, authMiddleware.verifyToken, movieController.getList);
    });
  } else {
    movieRoutes.forEach((route) => {
      app.get(route, movieController.getList);
    });
  }

  // Endpoint umum untuk koleksi resource lain atau series
  app.get('/api/v1/:resource', async (req, res, next) => {
    try {
      res.json(await service.getAll(req.params.resource, req.query));
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/v1/:resource/:id', async (req, res, next) => {
    try {
      res.json(await service.getById(req.params.resource, req.params.id));
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/v1/:resource', async (req, res, next) => {
    try {
      res.status(201).json(await service.create(req.params.resource, req.body));
    } catch (error) {
      next(error);
    }
  });

  app.patch('/api/v1/:resource/:id', async (req, res, next) => {
    try {
      res.json(await service.update(req.params.resource, req.params.id, req.body));
    } catch (error) {
      next(error);
    }
  });

  app.delete('/api/v1/:resource/:id', async (req, res, next) => {
    try {
      res.json(await service.delete(req.params.resource, req.params.id));
    } catch (error) {
      next(error);
    }
  });

  // ---------------------------------------------------------------------------
  // Error handling
  // ---------------------------------------------------------------------------
  app.use((req, res) => res.status(404).json({ error: 'Endpoint tidak ditemukan' }));
  app.use((error, req, res, next) => {
    const statusCode = error.statusCode || error.status || 500;
    if (statusCode >= 500) console.error(error);
    res.status(statusCode).json({
      error: statusCode >= 500 ? 'Terjadi kesalahan pada server' : error.message,
    });
  });

  return app;
}