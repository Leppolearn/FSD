import { Play, Plus, Check } from 'lucide-react'
import { useState } from 'react'

const themeClass = (theme) => `poster-theme-${theme}`

export default function MoviePoster({ movie, featured = false, onSelect }) {
  const [saved, setSaved] = useState(false)
  return (
    <article className={`movie-card ${featured ? 'movie-card-featured' : ''}`} onClick={() => onSelect?.(movie)}>
      <div className={`movie-poster ${themeClass(movie.theme)}`}>
        <div className="poster-noise" />
        {movie.badge && <span className="movie-badge">{movie.badge}</span>}
        <div className="poster-title">
          <small>{movie.genre}</small>
          <strong>{movie.title}</strong>
        </div>
        <div className="poster-hover">
          <button className="play-small"><Play size={16} fill="currentColor" /></button>
          <button className="save-small" onClick={(e) => { e.stopPropagation(); setSaved(!saved) }}>
            {saved ? <Check size={16} /> : <Plus size={16} />}
          </button>
        </div>
      </div>
      <div className="movie-meta">
        <div><span className="match">{movie.match}% match</span><span>{movie.year}</span><span>{movie.age}</span></div>
        <span className="rating">★ {movie.rating}</span>
      </div>
    </article>
  )
}
