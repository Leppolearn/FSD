# CHILL Movie & Series — ReactJS

Versi ini melanjutkan project sebelumnya dan meniru struktur homepage pada mockup yang diberikan.

## Fitur
- Halaman **Film** dan **Series** dalam satu React SPA.
- Hero banner berbeda untuk Film/Series.
- Horizontal rail dengan tombol next/previous.
- Poster memiliki **hover interaction**: membesar, tombol play, rating, metadata, deskripsi singkat, favorit, edit, dan delete.
- Search dan filter genre.
- CRUD menggunakan **array of objects** dan `useState`.
- Props antar komponen: `Hero`, `Rail`, `HoverCard`, `DetailModal`, `Editor`, dll.
- Tambah/Edit/Hapus data tampil dari View homepage melalui tombol **Kelola Data** dan kontrol pada hover card.
- Login/Register demo dari project sebelumnya.
- Asset visual mockup disimpan lokal agar project tetap dapat dijalankan tanpa backend.

## Jalankan
```bash
npm install
npm run dev
```

## Catatan
Autentikasi, video player, Google OAuth, dan database belum dihubungkan ke backend. CRUD saat ini bersifat client-side sesuai kebutuhan tugas React/useState.
