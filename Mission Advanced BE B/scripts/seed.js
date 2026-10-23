import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Baca file .env jika ada
let apiUrl = 'https://67c69992c464978afd0ed4ad.mockapi.io/api/v1';
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const match = envContent.match(/VITE_API_URL=(.+)/);
  if (match && match[1].trim()) {
    apiUrl = match[1].trim();
  }
}

console.log(`🚀 Menghubungkan seed script ke MockAPI: ${apiUrl}`);

const movieSeed = [
  {title:"The Tomorrow War",year:2021,genre:"Action",rating:8.2,duration:"2j 20m",poster:"/media/tomorrow.jpg",desc:"Seorang mantan tentara kembali ke medan perang untuk menghadapi ancaman dari masa depan."},
  {title:"The Quantumaniac",year:2024,genre:"Sci-Fi",rating:8.4,duration:"2j 05m",poster:"/media/quantum.jpg",desc:"Eksperimen energi membuka pintu menuju realitas yang tak pernah dibayangkan."},
  {title:"Guardians of the Galaxy",year:2023,genre:"Adventure",rating:8.7,duration:"2j 30m",poster:"/media/guardians.jpg",desc:"Sekelompok pahlawan luar angkasa kembali menyelamatkan galaksi dengan cara mereka sendiri."},
  {title:"A Man Called Otto",year:2022,genre:"Drama",rating:8.0,duration:"2j 06m",poster:"/media/hans.jpg",desc:"Kisah hangat tentang seorang pria yang menemukan kembali arti keluarga dan persahabatan."},
  {title:"The Little Mermaid",year:2023,genre:"Fantasy",rating:7.8,duration:"2j 15m",poster:"/media/little-mermaid.jpg",desc:"Petualangan seorang putri duyung yang berani mengejar dunia di luar laut."},
  {title:"Avatar",year:2022,genre:"Sci-Fi",rating:8.8,duration:"3j 12m",poster:"/media/avatar.jpg",desc:"Petualangan epik di dunia Pandora dengan konflik antara manusia dan Na'vi."},
  {title:"Jurassic World",year:2025,genre:"Adventure",rating:8.1,duration:"2j 18m",poster:"/media/jurassic.jpg",desc:"Taman dinosaurus kembali menjadi pusat kekacauan ketika spesies baru muncul."},
  {title:"Sonic",year:2024,genre:"Animation",rating:8.3,duration:"1j 58m",poster:"/media/sonic.jpg",desc:"Sonic dan kawan-kawan menghadapi musuh baru dalam petualangan tercepat mereka."},
  {title:"All of Us Are Dead",year:2025,genre:"Horror",rating:8.6,duration:"2j 10m",poster:"/media/dead.jpg",desc:"Sekolah berubah menjadi zona bertahan hidup ketika wabah zombie menyebar."},
  {title:"Big Hero 6",year:2014,genre:"Animation",rating:8.0,duration:"1j 42m",poster:"/media/big-hero.jpg",desc:"Seorang remaja jenius membangun tim pahlawan bersama robot kesehatan kesayangannya."},
  {title:"Duty After School",year:2023,genre:"Action",rating:8.5,duration:"10 Episode",poster:"/media/duty.jpg",desc:"Para siswa dipaksa ikut pelatihan militer untuk menghadapi ancaman misterius."},
  {title:"Off Duty",year:2024,genre:"Thriller",rating:7.9,duration:"2j 01m",poster:"/media/off-duty.jpg",desc:"Malam santai berubah menjadi pengejaran ketika sebuah rahasia terbongkar."},
  {title:"Missing",year:2023,genre:"Mystery",rating:8.2,duration:"1j 55m",poster:"/media/missing.jpg",desc:"Seorang anak mencari ibunya melalui jejak digital yang semakin membingungkan."}
];

const seriesSeed = [
  {title:"The Little Mermaid",year:2025,genre:"Fantasy",rating:8.4,duration:"10 Episode",poster:"/media/mermaid-series.jpg",desc:"Serial fantasi penuh petualangan dari dunia bawah laut yang mempesona."},
  {title:"Duty After School",year:2023,genre:"Action",rating:8.7,duration:"10 Episode",poster:"/media/duty-series.jpg",desc:"Para siswa menghadapi latihan militer dan ancaman misterius di luar sekolah."},
  {title:"Big Hero 6",year:2024,genre:"Animation",rating:8.2,duration:"12 Episode",poster:"/media/hero-series.jpg",desc:"Tim pahlawan muda menjaga kota dengan teknologi dan persahabatan."},
  {title:"Off Duty",year:2025,genre:"Thriller",rating:8.0,duration:"8 Episode",poster:"/media/off-series.jpg",desc:"Sebuah kasus lama kembali menghantui tim yang sedang mencoba hidup normal."},
  {title:"Missing",year:2024,genre:"Mystery",rating:8.5,duration:"12 Episode",poster:"/media/missing-series.jpg",desc:"Pencarian seseorang yang hilang membuka rahasia besar dari masa lalu."},
  {title:"The Tomorrow War",year:2025,genre:"Action",rating:8.1,duration:"12 Episode",poster:"/media/tomorrow-series.jpg",desc:"Perang lintas waktu dimulai ketika masa depan mengirimkan pesan terakhirnya."},
  {title:"The Quantumaniac",year:2025,genre:"Sci-Fi",rating:8.6,duration:"10 Episode",poster:"/media/quantum-series.jpg",desc:"Eksperimen rahasia membuat para ilmuwan terjebak di antara dua realitas."},
  {title:"Guardians",year:2025,genre:"Adventure",rating:8.8,duration:"10 Episode",poster:"/media/guardians-series.jpg",desc:"Tim penjaga baru dibentuk untuk melindungi galaksi dari ancaman kosmik."},
  {title:"A Man Called Hans",year:2024,genre:"Drama",rating:7.9,duration:"8 Episode",poster:"/media/hans-series.jpg",desc:"Drama keluarga tentang kesepian, tetangga baru, dan kesempatan kedua."},
  {title:"All of Us Are Dead",year:2025,genre:"Horror",rating:8.9,duration:"12 Episode",poster:"/media/dead.jpg",desc:"Wabah baru menyebar dan para penyintas harus menemukan jalan keluar."}
];

async function seed() {
  console.log('\n--- Mengunggah Movies ke MockAPI ---');
  for (const movie of movieSeed) {
    try {
      const res = await fetch(`${apiUrl}/movies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movie)
      });
      if (res.ok) {
        const data = await res.json();
        console.log(`✅ [Movie ${data.id}] Ditambahkan: ${data.title}`);
      } else {
        console.warn(`⚠️ [Movie] Gagal menambahkan ${movie.title}: ${res.status} ${res.statusText}`);
      }
    } catch (e) {
      console.error(`❌ [Movie] Error koneksi: ${e.message}`);
    }
  }

  console.log('\n--- Mengunggah Series ke MockAPI ---');
  for (const item of seriesSeed) {
    try {
      const res = await fetch(`${apiUrl}/series`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        const data = await res.json();
        console.log(`✅ [Series ${data.id}] Ditambahkan: ${data.title}`);
      } else {
        console.warn(`⚠️ [Series] Gagal menambahkan ${item.title}: ${res.status} ${res.statusText}`);
      }
    } catch (e) {
      console.error(`❌ [Series] Error koneksi: ${e.message}`);
    }
  }

  console.log('\n✨ Selesai!');
}

seed();
