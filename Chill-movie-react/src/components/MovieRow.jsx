import { ChevronRight } from 'lucide-react'
import MoviePoster from './MoviePoster'

export default function MovieRow({ title, movies, id, onSelect }) {
  return (
    <section className="movie-section container" id={id}>
      <div className="section-head">
        <h2>{title}</h2>
        <button onClick={() => alert(`Demo: melihat semua ${title.toLowerCase()}.`)}>Lihat semua <ChevronRight size={16} /></button>
      </div>
      <div className="movie-row">
        {movies.map(movie => <MoviePoster key={movie.id} movie={movie} onSelect={onSelect} />)}
      </div>
    </section>
  )
}
