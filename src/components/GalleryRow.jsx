import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import GalleryCard from './GalleryCard'
import './GalleryRow.css'

function GalleryRow({ title, galleries }) {
  const scrollContainerRef = useRef(null)
  const navigate = useNavigate()

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400
      const current = scrollContainerRef.current.scrollLeft
      const target = direction === 'left' ? current - scrollAmount : current + scrollAmount
      
      scrollContainerRef.current.scrollTo({
        left: target,
        behavior: 'smooth'
      })
    }
  }

  if (!galleries || galleries.length === 0) {
    return null
  }

  return (
    <div className="gallery-row">
      <h2 className="gallery-row-title">{title}</h2>
      
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
