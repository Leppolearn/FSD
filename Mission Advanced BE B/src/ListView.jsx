import React from 'react';
import { useSelector } from 'react-redux';
import { getData } from './services/api'; // Import fungsi Get API dari folder services/api
import { Play, Pencil, Trash2, Heart, Star } from 'lucide-react';

/**
 * Komponen ListView
 * Menampilkan data hasil API dari state global Redux menggunakan useSelector
 */
export function ListView({
  items,
  onSelect = () => {},
  onEdit = () => {},
  onDelete = () => {},
  favorites = [],
  onFavorite = () => {},
  title = "Semua Film",
}) {
  // Mengambil data dari state Redux menggunakan useSelector
  const reduxMovies = useSelector((state) => state.movies || state.data || []);
  
  // Prioritaskan items yang dipass (misal hasil filter), atau langsung ambil dari state Redux
  const displayItems = items !== undefined 
    ? items 
    : (Array.isArray(reduxMovies) ? reduxMovies : []);

  return (
    <section className="all-section homepage-crud-list">
      <div className="section-title">
        <h2>{title}</h2>
        <span>{displayItems.length} judul</span>
      </div>

      <div className="all-grid">
        {displayItems.length > 0 ? (
          displayItems.map((item) => {
            const isFav = favorites.some((f) => String(f) === String(item.id));
            return (
              <article key={item.id} className="poster-card">
                <div className="poster-wrap">
                  <img src={item.poster || "/media/default.jpg"} alt={item.title} />
                  <span className="badge">13+</span>
                  <button 
                    className="hover-play" 
                    onClick={() => onSelect(item)} 
                    aria-label={`Putar ${item.title}`}
                  >
                    <Play size={19} fill="currentColor" />
                  </button>
                  <div className="hover-panel">
                    <div className="panel-top">
                      <strong>{item.title}</strong>
                      <button 
                        onClick={() => onFavorite(item.id)} 
                        className={isFav ? "liked" : ""}
                        aria-label="Tambah ke favorit"
                      >
                        <Heart size={16} fill={isFav ? "currentColor" : "none"} />
                      </button>
                    </div>
                    <div className="panel-meta">
                      <span><Star size={12} fill="currentColor" /> {item.rating}</span>
                      <span>{item.year}</span>
                      <span>{item.duration}</span>
                    </div>
                    <p>{item.desc}</p>
                    <div className="panel-actions">
                      <button type="button" onClick={() => onSelect(item)}>
                        <Play size={13} fill="currentColor" /> Putar
                      </button>
                      <button type="button" onClick={() => onEdit(item)}>
                        <Pencil size={13} /> Edit
                      </button>
                      <button type="button" onClick={() => onDelete(item.id)} className="delete">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="empty-saved" style={{ gridColumn: '1 / -1' }}>
            <span>Tidak ada data untuk ditampilkan.</span>
          </div>
        )}
      </div>
    </section>
  );
}

export default ListView;
