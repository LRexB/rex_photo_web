import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import GalleryCard from './GalleryCard'
import './GalleryRow.css'

function GalleryRow({ title, galleries, actionLabel, onAction }) {
  const scrollContainerRef = useRef(null)
  const navigate = useNavigate()

  const scroll = (direction) => {
    const container = scrollContainerRef.current
    if (!container) {
      return
    }

    const cards = Array.from(container.querySelectorAll('.gallery-card'))
    if (cards.length === 0) {
      return
    }

    const current = container.scrollLeft
    const cardWidth = cards[0].getBoundingClientRect().width
    const styles = window.getComputedStyle(container)
    const gapValue = parseFloat(styles.gap || styles.columnGap || '0')
    const step = cardWidth + (Number.isFinite(gapValue) ? gapValue : 0)
    const delta = direction === 'right' ? step : -step
    const target = Math.max(0, current + delta)

    container.scrollTo({
      left: target,
      behavior: 'smooth'
    })
  }

  if (!galleries || galleries.length === 0) {
    return null
  }

  return (
    <div className="gallery-row">
      <div className="gallery-row-header">
        <h2 className="gallery-row-title">{title}</h2>
        {actionLabel && onAction ? (
          <button className="gallery-row-action" onClick={onAction}>
            {actionLabel}
          </button>
        ) : null}
      </div>
      
      <div className="gallery-row-wrapper">
        <button 
          className="scroll-button scroll-left"
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          ←
        </button>

        <div className="gallery-row-container" ref={scrollContainerRef}>
          {galleries.map((gallery) => (
            <GalleryCard
              key={gallery.id}
              gallery={gallery}
              onClick={() => navigate(`/gallery/${gallery.id}`)}
            />
          ))}
        </div>

        <button 
          className="scroll-button scroll-right"
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          →
        </button>
      </div>
    </div>
  )
}

export default GalleryRow
