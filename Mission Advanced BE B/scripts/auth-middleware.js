import jwt from 'jsonwebtoken';

/**
 * Langkah Keempat: Implementasi Middleware Autentikasi
 * Memeriksa token pada header req.headers.authorization
 * Memvalidasi token menggunakan jwt.verify dan secretKey
 * Jika tidak valid, mengembalikan HTTP 401 dan pesan autentikasi gagal
 * Jika valid, melanjutkan request dengan memanggil next()
 */
export function createAuthMiddleware(secretKey) {
  const verifyToken = function (req, res, next) {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    // Cek apakah ada token di header
    if (!authHeader) {
      return res.status(401).json({
        error: 'Autentikasi gagal: Token tidak ditemukan di header authorization',
      });
    }

    // Mendukung format "Bearer <token>" maupun format token langsung
    const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : String(authHeader).trim();

    if (!token) {
      return res.status(401).json({
        error: 'Autentikasi gagal: Format token tidak valid',
      });
    }

    try {
      // Mengecek validitas token menggunakan jwt.verify dan secretkey yang sama
      const decoded = jwt.verify(token, secretKey);
      req.user = decoded;
      // Jika token valid, biarkan permintaan lanjut dengan menggunakan next()
      next();
    } catch (error) {
      // Jika token tidak valid atau kedaluwarsa, beri respons status kode 401
      return res.status(401).json({
        error: 'Autentikasi gagal: Token tidak valid atau telah kedaluwarsa',
      });
    }
  };

  const middleware = function (req, res, next) {
    return verifyToken(req, res, next);
  };

  // Mendukung pemanggilan `authMiddleware.verifyToken` sesuai panduan tugas
  middleware.verifyToken = verifyToken;

  return middleware;
}

export const authMiddleware = {
  create: createAuthMiddleware,
};
