import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Clapperboard, Search, ChevronLeft, ChevronRight, Play, Plus,
  Pencil, Trash2, X, Star, Clock3, Heart, Bookmark, LogOut, UserCircle2,
  Eye, EyeOff, Check, MoreHorizontal, ChevronDown
} from "lucide-react";
import "./styles.css";
import loginBg from "./assets/login-bg.png";
import registerBg from "./assets/register-bg.png";

const movieSeed = [
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
];

const seriesSeed = [
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
];

const heroData = {
  movie: {
    title:"Duty After School",
    year:"2023",
    genre:"Action",
    duration:"10 Episode",
    description:"Sebuah benda tak dikenal mengancam seluruh dunia. Dalam kepanikan besar, para pelajar dipersiapkan menjadi tentara untuk melawan ancaman yang muncul di langit.",
    image:"/media/movie-hero.jpg"
  },
  series: {
    title:"Happiness",
    year:"2021",
    genre:"Drama • Thriller",
    duration:"12 Episode",
    description:"Di sebuah apartemen yang baru dibangun di kota besar, di mana lantai atas untuk penjualan umum dan lantai bawah disewakan, seri ini menggambarkan pertempuran psikologis yang halus dan diskriminasi kelas yang terjadi. Kota ini mencapai titik terendah ketika kiamat yang akan datang menyerang dalam bentuk penyakit menular jenis baru di mana orang-orang menderita kehausan yang tak kunjung reda",
    image:"/media/series-hero.jpg"
  }
};

function Logo(){ return <div className="logo"><Clapperboard size={20} fill="currentColor"/><span>CHILL</span></div> }

function Auth({onLogin}){
  const [mode,setMode]=useState("login");
  const [show,setShow]=useState(false),[show2,setShow2]=useState(false);
  const [form,setForm]=useState({username:"",password:"",confirm:""});
  const [error,setError]=useState("");
  const register=mode==="register";
  const bg=register?registerBg:loginBg;
  const submit=e=>{
    e.preventDefault();
    if(!form.username.trim()||!form.password) return setError("Username dan kata sandi wajib diisi.");
    if(register&&form.password!==form.confirm) return setError("Konfirmasi kata sandi tidak cocok.");
    onLogin(form.username.trim());
  };
  return <main className="auth" style={{"--auth-bg":`url("${bg}")`}}>
    <div className="auth-shade"/>
    <section className="auth-card">
      <Logo/><h1>{register?"Daftar":"Masuk"}</h1><p>{register?"Selamat datang!":"Selamat datang kembali!"}</p>
      <form onSubmit={submit}>
        <label>Username</label><input name="username" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} placeholder="Masukkan username"/>
        <label>Kata Sandi</label><div className="pass"><input name="password" type={show?"text":"password"} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Masukkan kata sandi"/><button type="button" onClick={()=>setShow(!show)}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div>
        {register&&<><label>Konfirmasi Kata Sandi</label><div className="pass"><input name="confirm" type={show2?"text":"password"} value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})} placeholder="Masukkan kata sandi"/><button type="button" onClick={()=>setShow2(!show2)}>{show2?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></>}
        <div className="auth-links"><span>{register?"Sudah punya akun?":"Belum punya akun?"} <button type="button" onClick={()=>{setMode(register?"login":"register");setError("")}}>{register?"Masuk":"Daftar"}</button></span>{!register&&<button type="button" onClick={()=>setError("Demo: fitur lupa kata sandi siap dihubungkan ke backend.")}>Lupa kata sandi?</button>}</div>
        {error&&<div className="error">{error}</div>}
        <button className="auth-submit">{register?"Daftar":"Masuk"}</button>
        <div className="or">Atau</div>
        <button type="button" className="google" onClick={()=>onLogin("Google User")}><b>G</b>{register?"Daftar dengan Google":"Masuk dengan Google"}</button>
      </form>
    </section>
  </main>
}

function Hero({type,onPlay,onGenre,genre,genres,onManage}){
  const h=heroData[type];
  return <section className="hero" style={{"--hero":`url("${h.image}")`}}>
    <div className="hero-filter">
      <select aria-label="Pilih genre" value={genre} onChange={e=>onGenre(e.target.value)}>
        {genres.map(g=><option key={g} value={g}>{g}</option>)}
      </select>
      <button className="hero-manage" onClick={onManage} title="Kelola data"><MoreHorizontal size={14}/></button>
    </div>
    <div className="hero-content">
      <span className="kicker">{type==="movie"?"FILM UNGGULAN":"SERIES UNGGULAN"}</span>
      <h1>{h.title}</h1>
      <div className="hero-meta"><span>{h.year}</span><span>{h.genre}</span><span>{h.duration}</span><span className="age">13+</span></div>
      <p>{h.description}</p>
      <div className="hero-buttons"><button className="primary" onClick={onPlay}><Play size={14} fill="currentColor"/> Mulai</button><button className="secondary"><Plus size={14}/> Selengkapnya</button><button className="circle"><Bookmark size={15}/></button></div>
    </div>
    <button className="hero-mute" aria-label="Mute"><MoreHorizontal size={16}/></button>
  </section>
}

function HoverCard({item,onSelect,onEdit,onDelete,favorite,onFavorite}){
  return <article className="poster-card">
    <div className="poster-wrap">
      <img src={item.poster} alt={item.title}/>
      <span className="badge">13+</span>
      <button className="hover-play" onClick={()=>onSelect(item)}><Play size={19} fill="currentColor"/></button>
      <div className="hover-panel">
        <div className="panel-top"><strong>{item.title}</strong><button onClick={()=>onFavorite(item.id)} className={favorite?"liked":""}><Heart size={16} fill={favorite?"currentColor":"none"}/></button></div>
        <div className="panel-meta"><span><Star size={12} fill="currentColor"/> {item.rating}</span><span>{item.year}</span><span>{item.duration}</span></div>
        <p>{item.desc}</p>
        <div className="panel-actions"><button onClick={()=>onSelect(item)}><Play size={13} fill="currentColor"/> Putar</button><button onClick={()=>onEdit(item)}><Pencil size={13}/> Edit</button><button onClick={()=>onDelete(item.id)} className="delete"><Trash2 size={13}/></button></div>
      </div>
    </div>
  </article>
}

function Rail({title,items,onSelect,onEdit,onDelete,favorites,onFavorite,scrollDir}){
  const [offset,setOffset]=useState(0);
  const max=Math.max(0,items.length-5);
  const move=d=>setOffset(v=>Math.min(max,Math.max(0,v+d)));
  const visible=items.slice(offset,offset+5);
  return <section className="rail">
    <div className="section-title"><h2>{title}</h2><div className="rail-controls"><button onClick={()=>move(-1)} disabled={offset===0}><ChevronLeft size={16}/></button><button onClick={()=>move(1)} disabled={offset===max}><ChevronRight size={16}/></button></div></div>
    <div className="rail-window"><div className="rail-grid">
      {visible.map(item=><HoverCard key={item.id} item={item} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} favorite={favorites.includes(item.id)} onFavorite={onFavorite}/>)}
    </div></div>
  </section>
}

function DetailModal({item,onClose,onPlay}){
  if(!item)return null;
  return <div className="modal-bg" onMouseDown={onClose}><div className="detail-modal" onMouseDown={e=>e.stopPropagation()}>
    <button className="close" onClick={onClose}><X size={19}/></button>
    <img src={item.poster} alt="" />
    <div className="detail-copy"><span className="kicker">CHILL ORIGINAL</span><h2>{item.title}</h2><div className="hero-meta"><span>{item.year}</span><span>{item.genre}</span><span>{item.duration}</span><span>★ {item.rating}</span></div><p>{item.desc}</p><button className="primary" onClick={()=>onPlay(item)}><Play size={15} fill="currentColor"/> Mulai Menonton</button></div>
  </div></div>
}

function Editor({item,onSave,onClose,type}){
  const [form,setForm]=useState(item||{id:Date.now(),title:"",year:2025,genre:"Drama",rating:8,duration:type==="series"?"10 Episode":"2j 00m",poster:"/media/default.jpg",desc:""});
  const set=(k,v)=>setForm({...form,[k]:v});
  return <div className="modal-bg"><form className="editor" onSubmit={e=>{e.preventDefault();onSave({...form,year:Number(form.year),rating:Number(form.rating)})}}>
    <div className="editor-head"><div><span className="kicker">CONTENT MANAGEMENT</span><h2>{item?"Edit Konten":"Tambah Konten"}</h2></div><button type="button" className="close static" onClick={onClose}><X size={19}/></button></div>
    <div className="editor-grid">
      <label>Judul<input value={form.title} onChange={e=>set("title",e.target.value)} required/></label>
      <label>Tahun<input type="number" value={form.year} onChange={e=>set("year",e.target.value)}/></label>
      <label>Genre<select value={form.genre} onChange={e=>set("genre",e.target.value)}>{["Action","Adventure","Animation","Drama","Fantasy","Horror","Mystery","Sci-Fi","Thriller"].map(g=><option key={g}>{g}</option>)}</select></label>
      <label>Rating<input type="number" min="0" max="10" step=".1" value={form.rating} onChange={e=>set("rating",e.target.value)}/></label>
      <label>Durasi<input value={form.duration} onChange={e=>set("duration",e.target.value)}/></label>
      <label>Poster URL<input value={form.poster} onChange={e=>set("poster",e.target.value)} /></label>
      <label className="wide">Deskripsi<textarea rows="4" value={form.desc} onChange={e=>set("desc",e.target.value)}/></label>
    </div>
    <div className="editor-actions"><button type="button" className="secondary" onClick={onClose}>Batal</button><button className="primary"><Check size={15}/> Simpan</button></div>
  </form></div>
}

function Footer(){return <footer><div className="footer-brand"><Logo/><small>© 2025 CHILL All Rights Reserved.</small></div><div className="footer-links"><div><b>Genre</b><span>Action</span><span>Anime</span><span>Drama</span><span>Horror</span></div><div><b>Film</b><span>Series</span><span>Korea</span><span>Romance</span></div><div><b>Komunitas</b><span>Favorit</span><span>Rating</span><span>Review</span></div><div><b>Bantuan</b><span>FAQ</span><span>Kontak Kami</span><span>Privacy</span></div></div></footer>}

function App(){
  const [logged,setLogged]=useState(false);
  const [user,setUser]=useState("");
  const [page,setPage]=useState("movie");
  const [movies,setMovies]=useState(movieSeed);
  const [series,setSeries]=useState(seriesSeed);
  const [query,setQuery]=useState("");
  const [selected,setSelected]=useState(null);
  const [editing,setEditing]=useState(null);
  const [favorites,setFavorites]=useState([12,10,8,107,108,11,6,3,7,13,1,9]);
  const [toast,setToast]=useState("");
  const [showManage,setShowManage]=useState(false);
  const [profileOpen,setProfileOpen]=useState(false);

  const isSavedPage=page==="saved";
  const data=page==="movie"?movies:series;
  const combined=[...movies,...series];
  const setData=page==="movie"?setMovies:setSeries;
  const genres=["Semua",...Array.from(new Set(data.map(x=>x.genre)))];
  const [genre,setGenre]=useState("Semua");
  const filtered=useMemo(()=>data.filter(x=>(genre==="Semua"||x.genre===genre)&&x.title.toLowerCase().includes(query.toLowerCase())),[data,genre,query]);
  const savedItems=useMemo(()=>combined.filter(x=>favorites.includes(x.id)&&x.title.toLowerCase().includes(query.toLowerCase())),[combined,favorites,query]);
  const trending=filtered.slice(0,5);
  const top=filtered.slice().sort((a,b)=>b.rating-a.rating).slice(0,5);
  const releases=filtered.slice(5,10).length?filtered.slice(5,10):filtered.slice(0,5);
  const newOnes=filtered.slice().reverse().slice(0,5);

  const notify=t=>{setToast(t);setTimeout(()=>setToast(""),1800)};
  const login=name=>{setUser(name);setLogged(true)};
  const save=item=>{
    if(isSavedPage){
      const targetSeries=series.some(x=>x.id===item.id);
      (targetSeries?setSeries:setMovies)(prev=>prev.some(x=>x.id===item.id)?prev.map(x=>x.id===item.id?item:x):[item,...prev]);
    }else{
      setData(prev=>prev.some(x=>x.id===item.id)?prev.map(x=>x.id===item.id?item:x):[item,...prev]);
    }
    setEditing(null);notify("Data berhasil disimpan.")
  };
  const remove=id=>{
    if(isSavedPage){
      if(series.some(x=>x.id===id)) setSeries(prev=>prev.filter(x=>x.id!==id));
      else setMovies(prev=>prev.filter(x=>x.id!==id));
    }else setData(prev=>prev.filter(x=>x.id!==id));
    setSelected(null);notify("Data berhasil dihapus.")
  };
  const fav=id=>setFavorites(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id]);

  if(!logged)return <Auth onLogin={login}/>;

  return <div className="app">
    <nav className="navbar">
      <button className="brand-button" onClick={()=>setPage("movie")}><Logo/></button>
      <div className="nav-main"><button className={page==="series"?"active":""} onClick={()=>{setPage("series");setGenre("Semua")}}>Series</button><button className={page==="movie"?"active":""} onClick={()=>{setPage("movie");setGenre("Semua")}}>Film</button><button className={isSavedPage?"active":""} onClick={()=>{setPage("saved");setGenre("Semua")}}><Bookmark size={14}/> Daftar Saya</button></div>
      <div className="nav-right profile-area">
        <button className={`profile-trigger ${profileOpen ? "open" : ""}`} onClick={()=>setProfileOpen(v=>!v)} aria-label="Menu profil" aria-expanded={profileOpen}>
          <img src="/media/profile-avatar.png" alt="Profil" className="profile-avatar" />
          <ChevronDown size={16} className="profile-chevron" />
        </button>
        {profileOpen && (
          <div className="profile-menu">
            <button className="profile-menu-item current" onClick={()=>{setProfileOpen(false);notify("Profil Saya")}}>
              <UserCircle2 size={17} fill="currentColor" />
              <span>Profil Saya</span>
            </button>
            <button className="profile-menu-item" onClick={()=>{setProfileOpen(false);notify("Fitur Premium siap digunakan.")}}>
              <Star size={17} fill="currentColor" />
              <span>Ubah Premium</span>
            </button>
            <button className="profile-menu-item" onClick={()=>{setProfileOpen(false);setLogged(false)}}>
              <LogOut size={17} />
              <span>Keluar</span>
            </button>
          </div>
        )}
      </div>
    </nav>

    {!isSavedPage&&<Hero type={page} genre={genre} genres={genres} onGenre={setGenre} onManage={()=>setShowManage(v=>!v)} onPlay={()=>notify("Pemutar video demo siap dihubungkan.")}/>}

    <main className={isSavedPage?"content saved-page":"content"}>
      {isSavedPage ? (
        <section className="saved-section">
          <div className="saved-heading"><h1>Daftar Saya</h1><span>{savedItems.length} judul tersimpan</span></div>
          {savedItems.length ? (
            <div className="saved-grid">
              {savedItems.map(item=><HoverCard key={item.id} item={item} onSelect={setSelected} onEdit={setEditing} onDelete={remove} favorite={favorites.includes(item.id)} onFavorite={fav}/>)}
            </div>
          ) : <div className="empty-saved"><Bookmark size={28}/><strong>Daftar Saya masih kosong</strong><span>Tambahkan film atau series dengan tombol hati saat hover poster.</span></div>}
        </section>
      ) : (
        <>
          {showManage&&<div className="management management-float">
            <div><strong>CRUD {page==="movie"?"Film":"Series"}</strong><span>Array object aktif: {data.length} data</span></div>
            <div className="management-actions"><div className="mobile-search"><Search size={14}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari..."/></div><button className="primary" onClick={()=>setEditing({new:true})}><Plus size={15}/> Tambah Data</button></div>
          </div>}

          <Rail title={page==="movie"?"Melanjutkan Tonton Film":"Melanjutkan Tonton Series"} items={trending} onSelect={setSelected} onEdit={setEditing} onDelete={remove} favorites={favorites} onFavorite={fav}/>
          <Rail title={page==="movie"?"Top Rating Film dan Series Hari ini":"Series Persembahan CHILL"} items={top} onSelect={setSelected} onEdit={setEditing} onDelete={remove} favorites={favorites} onFavorite={fav}/>
          <Rail title={page==="movie"?"Film Trending":"Top Rating Series Hari ini"} items={releases} onSelect={setSelected} onEdit={setEditing} onDelete={remove} favorites={favorites} onFavorite={fav}/>
          <Rail title={page==="movie"?"Rilis Baru":"Series Trending"} items={newOnes} onSelect={setSelected} onEdit={setEditing} onDelete={remove} favorites={favorites} onFavorite={fav}/>
          <Rail title="Rilis Baru" items={filtered.slice().reverse().slice(0,5)} onSelect={setSelected} onEdit={setEditing} onDelete={remove} favorites={favorites} onFavorite={fav}/>

          <section className="all-section homepage-crud-list"><div className="section-title"><h2>Semua {page==="movie"?"Film":"Series"}</h2><span>{filtered.length} judul</span></div><div className="all-grid">{filtered.map(item=><HoverCard key={item.id} item={item} onSelect={setSelected} onEdit={setEditing} onDelete={remove} favorite={favorites.includes(item.id)} onFavorite={fav}/>)}</div></section>
        </>
      )}
    </main>

    <Footer/>
    {selected&&<DetailModal item={selected} onClose={()=>setSelected(null)} onPlay={()=>notify("Memulai pemutaran demo.")}/>}
    {editing&&<Editor item={editing.new?null:editing} onSave={save} onClose={()=>setEditing(null)} type={isSavedPage?(editing?.id>=100?"series":"movie"):page}/>}
    {toast&&<div className="toast">{toast}</div>}
  </div>
}

createRoot(document.getElementById("root")).render(<App/>);
