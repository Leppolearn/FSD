import { Bell, ChevronDown, Info, Play, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import MovieRow from '../components/MovieRow'
import MovieModal from '../components/MovieModal'
import { continueWatching, heroMovie, movies, newReleases, trending } from '../data/movies'

export default function Home() {
  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const results = useMemo(() => {
    if (!query.trim()) return []
    return movies.filter(m => `${m.title} ${m.genre}`.toLowerCase().includes(query.toLowerCase()))
  }, [query])

  return (
    <div className="home-page" id="home">
      <Navbar onSearch={() => setShowSearch(!showSearch)} />

      {showSearch && (
        <div className="search-panel">
          <div className="container search-inner">
            <Search size={20} />
            <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari judul atau genre..." />
          </div>
          {query && <div className="container search-results">
            {results.length ? results.map(movie => <button key={movie.id} onClick={() => setSelected(movie)}>{movie.title}<span>{movie.genre} • {movie.year}</span></button>) : <p>Tidak ada film yang cocok.</p>}
          </div>}
        </div>
      )}

      <section className={`hero-movie poster-theme-${heroMovie.theme}`}>
        <div className="hero-overlay" />
        <div className="hero-grid container">
          <div className="hero-movie-copy">
            <span className="hero-kicker">#1 MOVIE OF THE WEEK</span>
            <h1>{heroMovie.title}</h1>
            <div className="hero-meta"><b>{heroMovie.match}% Match</b><span>{heroMovie.year}</span><span>{heroMovie.age}</span><span>{heroMovie.duration}</span></div>
            <p>{heroMovie.description}</p>
            <div className="hero-buttons">
              <button className="hero-play" onClick={() => setSelected(heroMovie)}><Play size={17} fill="currentColor" /> Play now</button>
              <button className="hero-info" onClick={() => setSelected(heroMovie)}><Info size={17} /> More info</button>
            </div>
          </div>
        </div>
        <div className="hero-credit">A CHILL ORIGINAL <span>•</span> 4K</div>
      </section>

      {query ? (
        <section className="search-movie-section">
          <div className="container"><h2>Hasil pencarian</h2><div className="search-grid">{results.map(movie => <div key={movie.id}><MovieRow title="" movies={[movie]} onSelect={setSelected} /></div>)}</div></div>
        </section>
      ) : (
        <>
          <MovieRow id="trending" title="Trending minggu ini" movies={trending} onSelect={setSelected} />
          <MovieRow id="my-list" title="Lanjutkan menonton" movies={continueWatching} onSelect={setSelected} />
          <MovieRow id="movies" title="Film terbaru" movies={newReleases} onSelect={setSelected} />
        </>
      )}

      <footer className="movie-footer">
        <div className="container footer-grid">
          <div><span className="footer-brand">chill<span>.</span></span><p>Find something worth watching.</p></div>
          <div><span>PLATFORM</span><a>Movies</a><a>Series</a><a>My List</a></div>
          <div><span>COMPANY</span><a>About</a><a>Help Center</a><a>Privacy</a></div>
        </div>
        <div className="container footer-bottom">© 2026 Chill. Built with ReactJS.</div>
      </footer>

      <MovieModal movie={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
