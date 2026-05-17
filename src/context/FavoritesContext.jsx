import { createContext, useContext, useState, useEffect } from 'react'

const FavoritesContext = createContext(null)

function load() {
  try { return JSON.parse(localStorage.getItem('ms_favorites') || '[]') } catch { return [] }
}

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(load)

  useEffect(() => {
    localStorage.setItem('ms_favorites', JSON.stringify(favorites))
  }, [favorites])

  const isFav = (id) => favorites.includes(id)

  const toggleFav = (id) =>
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])

  return (
    <FavoritesContext.Provider value={{ favorites, isFav, toggleFav }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() { return useContext(FavoritesContext) }
