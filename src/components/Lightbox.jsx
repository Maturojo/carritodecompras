import { useEffect, useCallback } from 'react'

export default function Lightbox({ images, index, onClose, onPrev, onNext }) {
  const hasPrev = index > 0
  const hasNext = index < images.length - 1

  const handleKey = useCallback((e) => {
    if (e.key === 'Escape')    onClose()
    if (e.key === 'ArrowLeft'  && hasPrev) onPrev()
    if (e.key === 'ArrowRight' && hasNext) onNext()
  }, [onClose, onPrev, onNext, hasPrev, hasNext])

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [handleKey])

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}>✕</button>

      {hasPrev && (
        <button className="lightbox-arrow prev" onClick={e => { e.stopPropagation(); onPrev() }}>‹</button>
      )}

      <div className="lightbox-content" onClick={e => e.stopPropagation()}>
        <img src={images[index]} alt={`Imagen ${index + 1}`} className="lightbox-img" />
        {images.length > 1 && (
          <div className="lightbox-counter">{index + 1} / {images.length}</div>
        )}
        {images.length > 1 && (
          <div className="lightbox-dots">
            {images.map((_, i) => (
              <button
                key={i}
                className={`lightbox-dot ${i === index ? 'active' : ''}`}
                onClick={() => onNext(i)}
              />
            ))}
          </div>
        )}
      </div>

      {hasNext && (
        <button className="lightbox-arrow next" onClick={e => { e.stopPropagation(); onNext() }}>›</button>
      )}
    </div>
  )
}
