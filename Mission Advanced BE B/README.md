# CHILL Movie & Series

## Menjalankan aplikasi

1. **Inisialisasi Database MySQL**:
   - Skema database tersedia di [schema.sql](file:///c:/Users/every/Documents/Code/chill-final/schema.sql).
   - Jalankan perintah SQL dari file tersebut atau jalankan helper script:
     ```bash
     node scripts/init-db.js
     ```
   - Skema ini membuat database `chillmovieapp` beserta tabel `users`, `movies`, dan `series`.
   - Dokumentasi ERD dapat dilihat pada [ERD.md](file:///c:/Users/every/Documents/Code/chill-final/ERD.md).

2. **Konfigurasi Environment**:
   - Salin `.env.example` menjadi `.env`, lalu sesuaikan `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, dan `DB_NAME` dengan konfigurasi MySQL lokal Anda.

3. **Menjalankan Server**:
   - Jalankan `npm run api` (Backend REST API) dan `npm run dev` (Frontend Vite) di terminal terpisah.
   - Atau gunakan `npm run mock` untuk server mock lokal jika MySQL belum aktif.

REST API tersedia di `http://localhost:5000/api/v1`.

## Endpoint REST API

### Autentikasi Pengguna & Email
- **POST `/api/v1/auth/register`**: Registrasi user baru dengan enkripsi password `bcrypt`, pembuatan unique token `uuid`, dan pengiriman email verifikasi melalui `nodemailer`.
  - Payload: `{ "fullname": "...", "username": "...", "password": "...", "email": "..." }`
- **GET `/api/v1/auth/verifikasi-email`**: Verifikasi email dengan parameter query `token`.
  - Mengembalikan `"Email Verified Successfully"` jika valid, atau `"Invalid Verification Token"` jika tidak valid.
- **POST `/api/v1/auth/login`**: Login user dengan verifikasi email & `bcrypt.compare`.
  - Payload: `{ "email": "...", "password": "..." }`
  - Response: `{ "message": "Login berhasil", "token": "<JWT_TOKEN>", "user": { ... } }`
- **GET `/api/v1/auth/me`**: Endpoint terproteksi yang memvalidasi token via `req.headers.authorization` dan `jwt.verify`.

### Upload Gambar (Multer)
- **POST `/api/v1/upload`** (atau `/upload`): Mengunggah file gambar (JPEG, PNG, WEBP, GIF) ke folder root `upload/`.
  - Form-data key: `image`.
  - Menyajikan file publik melalui: `http://localhost:5000/upload/<nama_file>`.

### Katalog Movies & Series (Terproteksi & Query Params)
- **GET `/api/v1/movies`**: Terproteksi dengan `authMiddleware.verifyToken`.
  - **Filter**: `?genre=Action` (menyaring data menggunakan `WHERE`).
  - **Search**: `?search=tomorrow` (mencari berdasarkan karakter menggunakan `WHERE` dan `LIKE`).
  - **Sort**: `?sort=rating&order=desc` (mengurutkan data menggunakan `ORDER BY`).
- GET detail, POST, PATCH, dan DELETE untuk `/movies` dan `/series`.

## Pengujian

- Jalankan `npm test` untuk menjalankan seluruh 18 unit & integration test (mencakup bcrypt, JWT, middleware verifyToken, email verification uuid/nodemailer, upload multer, dan query params filter/sort/search).
- Jalankan `npm run build` untuk memverifikasi frontend Vite.

## Pengujian melalui Postman

1. **Mission 2 (CRUD Movies & Series)**:
   - Import [postman/mission-2.postman_collection.json](file:///c:/Users/every/Documents/Code/chill-final/postman/mission-2.postman_collection.json).
2. **Mission 3 & Lanjutan**:
   - Import [postman/mission-3.postman_collection.json](file:///c:/Users/every/Documents/Code/chill-final/postman/mission-3.postman_collection.json).
   - Menjalankan 10 skenario pengujian:
     1. `POST Register Pengguna Baru` (Status 201 + generate token verifikasi)
     2. `GET Verifikasi Email Token Valid` ("Email Verified Successfully")
     3. `GET Verifikasi Email Token Salah` ("Invalid Verification Token")
     4. `POST Login Pengguna` (Status 200 & otomatis menyimpan JWT token)
     5. `POST Login Gagal - Password Salah` (Status 401)
     6. `GET Profile Terproteksi dengan Token` (Status 200)
     7. `GET Movies dengan Filter genre` (Status 200)
     8. `GET Movies dengan Search title` (Status 200)
     9. `GET Movies dengan Sorting rating` (Status 200)
     10. `POST Upload Gambar Poster` (Status 201)

