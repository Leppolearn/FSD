import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { createEmailService } from './email-service.js';

const DEFAULT_JWT_SECRET = process.env.JWT_SECRET || 'chill-secret-key-2025';
const SALT_ROUNDS = 10;

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export function createAuthService(pool, options = {}) {
  const secretKey = options.jwtSecret || process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
  const tokenExpiresIn = options.tokenExpiresIn || '1d';
  const mailer = options.emailService || createEmailService();

  return {
    getSecretKey() {
      return secretKey;
    },

    /**
     * Langkah Kedua & Keenam: Implementasi Register + Send Email Verifikasi
     * 1. Validasi input
     * 2. Enkripsi password menggunakan bcrypt
     * 3. Generate unique verification token menggunakan uuid
     * 4. Input data user dan token ke database dengan query INSERT
     * 5. Jalankan fungsi sendmail via nodemailer
     */
    async register(data) {
      if (!data || typeof data !== 'object') {
        throw httpError(400, 'Data pendaftaran harus berupa object JSON');
      }

      const { fullname, username, password, email } = data;

      // Validasi kelengkapan payload
      if (!fullname || !username || !password || !email) {
        throw httpError(400, 'Field fullname, username, password, dan email wajib diisi');
      }

      const trimmedFullname = String(fullname).trim();
      const trimmedUsername = String(username).trim();
      const trimmedEmail = String(email).trim().toLowerCase();

      if (!trimmedFullname || !trimmedUsername || !trimmedEmail || !password) {
        throw httpError(400, 'Data pendaftaran tidak boleh kosong');
      }

      // Validasi format email sederhana
      if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
        throw httpError(400, 'Format email tidak valid');
      }

      // Cek apakah username atau email sudah pernah terdaftar
      const [existing] = await pool.execute(
        'SELECT id, username, email FROM `users` WHERE `email` = ? OR `username` = ? LIMIT 1',
        [trimmedEmail, trimmedUsername]
      );

      if (existing && existing.length > 0) {
        const found = existing[0];
        if (found.email.toLowerCase() === trimmedEmail) {
          throw httpError(409, 'Email sudah terdaftar');
        }
        throw httpError(409, 'Username sudah digunakan');
      }

      // Enkripsi password menggunakan bcrypt
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // Langkah Keenam poin 2: Generate unique verification token dengan uuid
      const verificationToken = uuidv4();

      // Langkah Keenam poin 4 & 5: Simpan user baru dan token ke database dengan query INSERT
      let insertResult;
      try {
        const [res] = await pool.execute(
          'INSERT INTO `users` (`fullname`, `username`, `password`, `email`, `verification_token`, `is_verified`) VALUES (?, ?, ?, ?, ?, ?)',
          [trimmedFullname, trimmedUsername, hashedPassword, trimmedEmail, verificationToken, 0]
        );
        insertResult = res;
      } catch (err) {
        // Fallback jika tabel users belum memiliki kolom verification_token
        const [res] = await pool.execute(
          'INSERT INTO `users` (`fullname`, `username`, `password`, `email`) VALUES (?, ?, ?, ?)',
          [trimmedFullname, trimmedUsername, hashedPassword, trimmedEmail]
        );
        insertResult = res;
      }

      // Langkah Keenam poin 6: Panggil fungsi sendmail untuk mengirim token via nodemailer
      try {
        await mailer.sendMail({
          to: trimmedEmail,
          token: verificationToken,
          fullname: trimmedFullname,
        });
      } catch (err) {
        console.warn('⚠️ Gagal mengirim email verifikasi:', err.message);
      }

      return {
        id: insertResult.insertId,
        fullname: trimmedFullname,
        username: trimmedUsername,
        email: trimmedEmail,
        verificationToken,
      };
    },

    /**
     * Langkah Keenam poin 7 & 8: Service verifikasi email
     * Mencari token di database.
     * Jika tidak ditemukan -> 'Invalid Verification Token'
     * Jika berhasil -> 'Email Verified Successfully'
     */
    async verifyEmail(token) {
      if (!token || typeof token !== 'string' || !token.trim()) {
        throw httpError(400, 'Invalid Verification Token');
      }

      const trimmedToken = token.trim();

      const [rows] = await pool.execute(
        'SELECT id, email, is_verified FROM `users` WHERE `verification_token` = ? LIMIT 1',
        [trimmedToken]
      );

      const user = rows && rows[0];
      if (!user) {
        throw httpError(400, 'Invalid Verification Token');
      }

      // Update status verifikasi akun
      await pool.execute(
        'UPDATE `users` SET `is_verified` = 1, `verification_token` = NULL WHERE `id` = ?',
        [user.id]
      );

      return 'Email Verified Successfully';
    },

    /**
     * Langkah Ketiga: Implementasi Login
     * Menerima email dan password
     * 1. Periksa keberadaan user berdasarkan email
     * 2. Periksa kecocokan password menggunakan bcrypt.compare
     * 3. Buat token JWT jika email dan password sesuai
     */
    async login(data) {
      if (!data || typeof data !== 'object') {
        throw httpError(400, 'Data login harus berupa object JSON');
      }

      const { email, password } = data;

      if (!email || !password) {
        throw httpError(400, 'Email dan password wajib diisi');
      }

      const trimmedEmail = String(email).trim().toLowerCase();

      // 1. Periksa keberadaan user berdasarkan email yang dimasukkan
      const [rows] = await pool.execute(
        'SELECT * FROM `users` WHERE LOWER(`email`) = ? LIMIT 1',
        [trimmedEmail]
      );

      const user = rows && rows[0];

      // Jika pengguna tidak ditemukan, beri respon bahwa email atau password salah (HTTP 401)
      if (!user) {
        throw httpError(401, 'Email atau password yang dimasukkan salah');
      }

      // 2. Jika pengguna ditemukan, periksa kecocokan password menggunakan bcrypt.compare
      const isPasswordMatch = await bcrypt.compare(password, user.password);

      // Jika password tidak cocok, beri respon bahwa email atau password salah (HTTP 401)
      if (!isPasswordMatch) {
        throw httpError(401, 'Email atau password yang dimasukkan salah');
      }

      // 3. Jika email dan password sesuai, buat token menggunakan jsonwebtoken
      const payload = {
        id: user.id,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        is_verified: Boolean(user.is_verified),
      };

      const token = jwt.sign(payload, secretKey, { expiresIn: tokenExpiresIn });

      return {
        token,
        user: payload,
      };
    },

    /**
     * Ambil detail profil user berdasarkan ID (tanpa menyertakan password)
     */
    async getUserById(id) {
      const [rows] = await pool.execute(
        'SELECT id, fullname, username, email, is_verified, created_at FROM `users` WHERE `id` = ? LIMIT 1',
        [id]
      );

      if (!rows || !rows[0]) {
        throw httpError(404, 'User tidak ditemukan');
      }

      return rows[0];
    },

    /**
     * Verifikasi token JWT
     */
    verifyToken(token) {
      return jwt.verify(token, secretKey);
    },
  };
}
