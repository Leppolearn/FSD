import { Check, Play, Plus, X } from 'lucide-react'

export default function MovieModal({ movie, onClose }) {
  if (!movie) return null
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`movie-modal modal-${movie.theme}`} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X /></button>
        <div className="modal-art">
          <div className="modal-title"><small>{movie.genre} • {movie.year}</small><h2>{movie.title}</h2></div>
        </div>
        <div className="modal-content">
          <div className="modal-actions">
            <button className="modal-play"><Play size={17} fill="currentColor" /> Play</button>
            <button className="modal-add"><Plus size={18} /> My List</button>
          </div>
          <div className="modal-meta"><strong>{movie.match}% Match</strong><span>{movie.age}</span><span>{movie.duration}</span><span>★ {movie.rating}</span></div>
          <p>{movie.description}</p>
          <div className="modal-check"><Check size={16} /> Available in HD</div>
        </div>
      </div>
    </div>
  )
}
