# CHILL Movie & Series

## Menjalankan aplikasi

1. Buat database MySQL `chillmovieapp` dan tabel `movies` serta `series`. Setiap tabel menggunakan kolom `id` sebagai primary key auto-increment dan kolom `title`, `year`, `genre`, `rating`, `duration`, `poster`, dan `desc`.
2. Salin `.env.example` menjadi `.env`, lalu sesuaikan `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, dan `DB_NAME` dengan konfigurasi MySQL lokal.
3. Jalankan `npm run api` dan `npm run dev` di terminal terpisah.

REST API tersedia di `http://localhost:5000/api/v1` dengan endpoint GET koleksi/detail, POST, PATCH, dan DELETE untuk `/movies` dan `/series`.

## Pengujian

Jalankan `npm test` untuk tes kontrak HTTP dan unit service SQL tanpa database. Jalankan `npm run build` untuk memverifikasi frontend. Tes integrasi SQL memerlukan MySQL aktif dengan schema dan kredensial yang sesuai.

## Pengujian melalui Postman

Import `postman/mission-2.postman_collection.json`, pastikan MySQL dan `npm run api` aktif, lalu jalankan collection secara berurutan. Setiap POST membuat data uji dan menyimpan ID untuk GET detail, PATCH, lalu DELETE.

Untuk bukti pengumpulan, ambil screenshot respons dan tab **Test Results** dari request yang berhasil, lalu gabungkan/print screenshot tersebut sebagai PDF. Jangan lampirkan screenshot sebelum menjalankan collection pada database yang aktif.
