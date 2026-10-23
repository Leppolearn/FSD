import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root upload directory
export const UPLOAD_DIR = path.resolve(__dirname, '../upload');

// Pastikan folder upload ada di root aplikasi
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Langkah Ketujuh: Implementasi Upload Image menggunakan Multer
 * 1. Konfigurasi destination ke folder upload
 * 2. Konfigurasi penamaan file unik
 * 3. Filter file agar hanya menerima gambar
 */
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `image-${uniqueSuffix}${ext}`);
  },
});

function imageFileFilter(req, file, cb) {
  const allowedExtensions = /jpeg|jpg|png|gif|webp|svg/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mimeTypeMatches = file.mimetype.startsWith('image/');

  if (allowedExtensions.test(ext) || mimeTypeMatches) {
    cb(null, true);
  } else {
    const error = new Error('Hanya file gambar (JPEG, PNG, GIF, WEBP) yang diizinkan untuk diunggah');
    error.statusCode = 400;
    cb(error, false);
  }
}

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Maksimal 5 MB
  },
  fileFilter: imageFileFilter,
});

/**
 * Middleware upload yang fleksibel: mendukung field 'file', 'image', atau 'poster'
 */
export const uploadImageMiddleware = (req, res, next) => {
  const uploader = upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'image', maxCount: 1 },
    { name: 'poster', maxCount: 1 },
  ]);

  uploader(req, res, (err) => {
    if (err) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
    if (req.files) {
      if (req.files.file && req.files.file[0]) {
        req.file = req.files.file[0];
      } else if (req.files.image && req.files.image[0]) {
        req.file = req.files.image[0];
      } else if (req.files.poster && req.files.poster[0]) {
        req.file = req.files.poster[0];
      }
    }
    next();
  });
};
