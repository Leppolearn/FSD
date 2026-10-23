import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const DB_PATH = path.resolve(__dirname, '../data/mock-db.json');
const JWT_SECRET = process.env.JWT_SECRET || 'chill-secret-key-2025';

// Initial seed data jika database lokal belum ada
const initialSeed = {
  users: [],
  movies: [
    {id:1,title:"The Tomorrow War",year:2021,genre:"Action",rating:8.2,duration:"2j 20m",poster:"/media/tomorrow.jpg",desc:"Seorang mantan tentara kembali ke medan perang untuk menghadapi ancaman dari masa depan."},
    {id:2,title:"The Quantumaniac",year:2024,genre:"Sci-Fi",rating:8.4,duration:"2j 05m",poster:"/media/quantum.jpg",desc:"Eksperimen energi membuka pintu menuju realitas yang tak pernah dibayangkan."},
    {id:3,title:"Guardians of the Galaxy",year:2023,genre:"Adventure",rating:8.7,duration:"2j 30m",poster:"/media/guardians.jpg",desc:"Sekelompok pahlawan luar angkasa kembali menyelamatkan galaksi dengan cara mereka sendiri."},
    {id:4,title:"A Man Called Otto",year:2022,genre:"Drama",rating:8.0,duration:"2j 06m",poster:"/media/hans.jpg",desc:"Kisah hangat tentang seorang pria yang menemukan kembali arti keluarga dan persahabatan."},
    {id:5,title:"The Little Mermaid",year:2023,genre:"Fantasy",rating:7.8,duration:"2j 15m",poster:"/media/little-mermaid.jpg",desc:"Petualangan seorang putri duyung yang berani mengejar dunia di luar laut."},
    {id:6,title:"Avatar",year:2022,genre:"Sci-Fi",rating:8.8,duration:"3j 12m",poster:"/media/avatar.jpg",desc:"Petualangan epik di dunia Pandora dengan konflik antara manusia dan Na'vi."},
    {id:7,title:"Jurassic World",year:2025,genre:"Adventure",rating:8.1,duration:"2j 18m",poster:"/media/jurassic.jpg",desc:"Taman dinosaurus kembali menjadi pusat kekacauan ketika spesies baru muncul."},
    {id:8,title:"Sonic",year:2024,genre:"Animation",rating:8.3,duration:"1j 58m",poster:"/media/sonic.jpg",desc:"Sonic dan kawan-kawan menghadapi musuh baru dalam petualangan tercepat mereka."},
    {id:9,title:"All of Us Are Dead",year:2025,genre:"Horror",rating:8.6,duration:"2j 10m",poster:"/media/dead.jpg",desc:"Sekolah berubah menjadi zona bertahan hidup ketika wabah zombie menyebar."},
    {id:10,title:"Big Hero 6",year:2014,genre:"Animation",rating:8.0,duration:"1j 42m",poster:"/media/big-hero.jpg",desc:"Seorang remaja jenius membangun tim pahlawan bersama robot kesehatan kesayangannya."},
    {id:11,title:"Duty After School",year:2023,genre:"Action",rating:8.5,duration:"10 Episode",poster:"/media/duty.jpg",desc:"Para siswa dipaksa ikut pelatihan militer untuk menghadapi ancaman misterius."},
    {id:12,title:"Off Duty",year:2024,genre:"Thriller",rating:7.9,duration:"2j 01m",poster:"/media/off-duty.jpg",desc:"Malam santai berubah menjadi pengejaran ketika sebuah rahasia terbongkar."},
    {id:13,title:"Missing",year:2023,genre:"Mystery",rating:8.2,duration:"1j 55m",poster:"/media/missing.jpg",desc:"Seorang anak mencari ibunya melalui jejak digital yang semakin membingungkan."}
  ],
  series: [
    {id:101,title:"The Little Mermaid",year:2025,genre:"Fantasy",rating:8.4,duration:"10 Episode",poster:"/media/mermaid-series.jpg",desc:"Serial fantasi penuh petualangan dari dunia bawah laut yang mempesona."},
    {id:102,title:"Duty After School",year:2023,genre:"Action",rating:8.7,duration:"10 Episode",poster:"/media/duty-series.jpg",desc:"Para siswa menghadapi latihan militer dan ancaman misterius di luar sekolah."},
    {id:103,title:"Big Hero 6",year:2024,genre:"Animation",rating:8.2,duration:"12 Episode",poster:"/media/hero-series.jpg",desc:"Tim pahlawan muda menjaga kota dengan teknologi dan persahabatan."},
    {id:104,title:"Off Duty",year:2025,genre:"Thriller",rating:8.0,duration:"8 Episode",poster:"/media/off-series.jpg",desc:"Sebuah kasus lama kembali menghantui tim yang sedang mencoba hidup normal."},
    {id:105,title:"Missing",year:2024,genre:"Mystery",rating:8.5,duration:"12 Episode",poster:"/media/missing-series.jpg",desc:"Pencarian seseorang yang hilang membuka rahasia besar dari masa lalu."},
    {id:106,title:"The Tomorrow War",year:2025,genre:"Action",rating:8.1,duration:"12 Episode",poster:"/media/tomorrow-series.jpg",desc:"Perang lintas waktu dimulai ketika masa depan mengirimkan pesan terakhirnya."},
    {id:107,title:"The Quantumaniac",year:2025,genre:"Sci-Fi",rating:8.6,duration:"10 Episode",poster:"/media/quantum-series.jpg",desc:"Eksperimen rahasia membuat para ilmuwan terjebak di antara dua realitas."},
    {id:108,title:"Guardians",year:2025,genre:"Adventure",rating:8.8,duration:"10 Episode",poster:"/media/guardians-series.jpg",desc:"Tim penjaga baru dibentuk untuk melindungi galaksi dari ancaman kosmik."},
    {id:109,title:"A Man Called Hans",year:2024,genre:"Drama",rating:7.9,duration:"8 Episode",poster:"/media/hans-series.jpg",desc:"Drama keluarga tentang kesepian, tetangga baru, dan kesempatan kedua."},
    {id:110,title:"All of Us Are Dead",year:2025,genre:"Horror",rating:8.9,duration:"12 Episode",poster:"/media/dead.jpg",desc:"Wabah baru menyebar dan para penyintas harus menemukan jalan keluar."}
  ]
};

// Pastikan direktori data ada
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Baca atau inisialisasi DB
function readDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(initialSeed, null, 2), 'utf-8');
    return JSON.parse(JSON.stringify(initialSeed));
  }
  try {
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    if (!data.users) data.users = [];
    return data;
  } catch {
    return JSON.parse(JSON.stringify(initialSeed));
  }
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// Buat server HTTP lokal untuk Mock API
const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  const sendJson = (status, data) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  // Helper untuk membaca request body
  const getBody = () => new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Format JSON tidak valid'));
      }
    });
  });

  (async () => {
    try {
      const db = readDb();

      // -----------------------------------------------------------------------
      // AUTH: Register (/register, /api/v1/register, /api/v1/auth/register)
      // -----------------------------------------------------------------------
      if (req.method === 'POST' && (pathname === '/api/v1/auth/register' || pathname === '/api/v1/register' || pathname === '/register')) {
        const body = await getBody();
        const { fullname, username, password, email } = body || {};

        if (!fullname || !username || !password || !email) {
          return sendJson(400, { error: 'Field fullname, username, password, dan email wajib diisi' });
        }

        const trimmedEmail = String(email).trim().toLowerCase();
        const trimmedUsername = String(username).trim();

        if (db.users.some(u => u.email === trimmedEmail)) {
          return sendJson(409, { error: 'Email sudah terdaftar' });
        }
        if (db.users.some(u => u.username === trimmedUsername)) {
          return sendJson(409, { error: 'Username sudah digunakan' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const nextId = db.users.length > 0 ? Math.max(...db.users.map(u => Number(u.id) || 0)) + 1 : 1;
        const verificationToken = `token-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

        const newUser = {
          id: nextId,
          fullname: String(fullname).trim(),
          username: trimmedUsername,
          password: hashedPassword,
          email: trimmedEmail,
          verificationToken,
          is_verified: false,
        };

        db.users.push(newUser);
        writeDb(db);

        return sendJson(201, {
          message: 'Registrasi berhasil',
          user: {
            id: newUser.id,
            fullname: newUser.fullname,
            username: newUser.username,
            email: newUser.email,
            verificationToken: newUser.verificationToken,
          },
        });
      }

      // -----------------------------------------------------------------------
      // AUTH: Login (/login, /api/v1/login, /api/v1/auth/login)
      // -----------------------------------------------------------------------
      if (req.method === 'POST' && (pathname === '/api/v1/auth/login' || pathname === '/api/v1/login' || pathname === '/login')) {
        const body = await getBody();
        const { email, password } = body || {};

        if (!email || !password) {
          return sendJson(400, { error: 'Email dan password wajib diisi' });
        }

        const trimmedEmail = String(email).trim().toLowerCase();
        const user = db.users.find(u => u.email === trimmedEmail);

        // Jika user tidak ditemukan
        if (!user) {
          return sendJson(401, { error: 'Email atau password yang dimasukkan salah' });
        }

        // Cek password menggunakan bcrypt.compare
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return sendJson(401, { error: 'Email atau password yang dimasukkan salah' });
        }

        const payload = {
          id: user.id,
          fullname: user.fullname,
          username: user.username,
          email: user.email,
          is_verified: user.is_verified,
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

        return sendJson(200, {
          message: 'Login berhasil',
          token,
          user: payload,
        });
      }

      // -----------------------------------------------------------------------
      // AUTH: Protected Route (/auth/me, /api/v1/auth/me, /me, /profile)
      // -----------------------------------------------------------------------
      const profilePaths = ['/auth/me', '/me', '/profile', '/api/v1/auth/me', '/api/v1/me', '/api/v1/profile'];
      if (req.method === 'GET' && profilePaths.includes(pathname)) {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          return sendJson(401, { error: 'Autentikasi gagal: Token tidak ditemukan di header authorization' });
        }
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          return sendJson(200, { message: 'Autentikasi berhasil', user: decoded });
        } catch {
          return sendJson(401, { error: 'Autentikasi gagal: Token tidak valid atau telah kedaluwarsa' });
        }
      }

      // -----------------------------------------------------------------------
      // AUTH: Verifikasi Email (/verify-email, /verifikasi-email, dll.)
      // -----------------------------------------------------------------------
      const verifyPaths = [
        '/api/v1/auth/verify-email',
        '/api/v1/verify-email',
        '/verify-email',
        '/api/v1/auth/verifikasi-email',
        '/api/v1/verifikasi-email',
        '/verifikasi-email',
      ];
      if (verifyPaths.includes(pathname)) {
        let token = parsedUrl.searchParams.get('token');
        if (!token) {
          try {
            const body = await getBody();
            token = body?.token;
          } catch {
            // ignore JSON parse error on empty body
          }
        }
        if (!token) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          return res.end('Invalid Verification Token');
        }
        const user = db.users.find(u => u.verificationToken === token);
        if (!user) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          return res.end('Invalid Verification Token');
        }
        user.is_verified = true;
        user.verificationToken = null;
        writeDb(db);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        return res.end('Email Verified Successfully');
      }

      // -----------------------------------------------------------------------
      // UPLOAD: Endpoint Upload Image (/upload atau /api/v1/upload)
      // -----------------------------------------------------------------------
      if (req.method === 'POST' && (pathname === '/api/v1/upload' || pathname === '/upload')) {
        const mockFilename = `image-${Date.now()}.png`;
        return sendJson(201, {
          message: 'Gambar berhasil diunggah',
          filename: mockFilename,
          path: `/upload/${mockFilename}`,
          url: `http://${req.headers.host}/upload/${mockFilename}`,
        });
      }

      // Format rute resource: /api/v1/:resource atau /:resource atau /api/v1/:resource/:id
      const match = pathname.match(/^(?:\/api\/v1)?\/(movies|movie|series)(?:\/([^\/]+))?$/);

      if (!match) {
        return sendJson(404, { error: 'Endpoint tidak ditemukan' });
      }

      const [, rawResource, id] = match;
      const resource = rawResource === 'movie' ? 'movies' : rawResource;
      if (!db[resource]) {
        db[resource] = [];
      }

      // 1. GET ALL (dengan dukungan Filter, Sort, & Search)
      if (req.method === 'GET' && !id) {
        let results = [...db[resource]];

        // Search: mencari keyword di title atau desc
        const search = parsedUrl.searchParams.get('search') || parsedUrl.searchParams.get('q');
        if (search) {
          const s = search.toLowerCase();
          results = results.filter(item => (item.title && item.title.toLowerCase().includes(s)) || (item.desc && item.desc.toLowerCase().includes(s)));
        }

        // Filter: genre, year, dll
        const genre = parsedUrl.searchParams.get('genre');
        if (genre && genre !== 'Semua') {
          results = results.filter(item => item.genre && item.genre.toLowerCase() === genre.toLowerCase());
        }
        const year = parsedUrl.searchParams.get('year');
        if (year) {
          results = results.filter(item => String(item.year) === String(year));
        }

        // Sort: sortBy & order
        const sortBy = parsedUrl.searchParams.get('sortBy') || parsedUrl.searchParams.get('sort');
        const order = (parsedUrl.searchParams.get('order') || 'asc').toLowerCase();
        if (sortBy) {
          results.sort((a, b) => {
            const valA = a[sortBy] ?? '';
            const valB = b[sortBy] ?? '';
            if (typeof valA === 'number' && typeof valB === 'number') {
              return order === 'desc' ? valB - valA : valA - valB;
            }
            return order === 'desc'
              ? String(valB).localeCompare(String(valA))
              : String(valA).localeCompare(String(valB));
          });
        }

        sendJson(200, results);
        return;
      }

      // 2. GET BY ID
      if (req.method === 'GET' && id) {
        const item = db[resource].find(x => String(x.id) === String(id));
        if (!item) return sendJson(404, { error: 'Data tidak ditemukan' });
        sendJson(200, item);
        return;
      }

      // 3. POST (ADD DATA)
      if (req.method === 'POST') {
        const body = await getBody();
        const nextId = db[resource].length > 0 
          ? Math.max(...db[resource].map(x => Number(x.id) || 0)) + 1 
          : (resource === 'series' ? 101 : 1);
        const newItem = { ...body, id: nextId };
        db[resource].unshift(newItem);
        writeDb(db);
        sendJson(201, newItem);
        return;
      }

      // 4. PUT / PATCH (UPDATE DATA)
      if ((req.method === 'PATCH' || req.method === 'PUT') && id) {
        const body = await getBody();
        const index = db[resource].findIndex(x => String(x.id) === String(id));
        if (index === -1) return sendJson(404, { error: 'Data tidak ditemukan' });
        const updatedItem = { ...db[resource][index], ...body, id: Number(id) || id };
        db[resource][index] = updatedItem;
        writeDb(db);
        sendJson(200, updatedItem);
        return;
      }

      // 5. DELETE DATA
      if (req.method === 'DELETE' && id) {
        const index = db[resource].findIndex(x => String(x.id) === String(id));
        if (index === -1) return sendJson(404, { error: 'Data tidak ditemukan' });
        const deletedItem = db[resource].splice(index, 1)[0];
        writeDb(db);
        sendJson(200, deletedItem);
        return;
      }

      sendJson(405, { error: 'Method Not Allowed' });
    } catch (err) {
      sendJson(500, { error: err.message });
    }
  })();
});

server.listen(PORT, () => {
  console.log(`\n===========================================`);
  console.log(`🎬 Local Mock API Server Berjalan!`);
  console.log(`📡 Base URL: http://localhost:${PORT}/api/v1`);
  console.log(`🔐 Auth Endpoints:`);
  console.log(`   - POST http://localhost:${PORT}/api/v1/auth/register`);
  console.log(`   - POST http://localhost:${PORT}/api/v1/auth/login`);
  console.log(`   - GET  http://localhost:${PORT}/api/v1/auth/me (Protected)`);
  console.log(`🍿 Endpoints:`);
  console.log(`   - GET/POST/PUT/DELETE http://localhost:${PORT}/api/v1/movies`);
  console.log(`   - GET/POST/PUT/DELETE http://localhost:${PORT}/api/v1/series`);
  console.log(`💾 Database file: ${DB_PATH}`);
  console.log(`===========================================\n`);
});
