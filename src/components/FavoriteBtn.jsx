import { useFavorites } from '../context/FavoritesContext'

export default function FavoriteBtn({ productId, className = '' }) {
  const { isFav, toggleFav } = useFavorites()
  const fav = isFav(productId)

  return (
    <button
      className={`fav-btn ${fav ? 'fav-active' : ''} ${className}`}
      onClick={e => { e.preventDefault(); e.stopPropagation(); toggleFav(productId) }}
      title={fav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      aria-label={fav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      {fav ? '❤️' : '🤍'}
    </button>
  )
}
