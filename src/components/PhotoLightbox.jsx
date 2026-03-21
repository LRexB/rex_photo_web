import { useEffect } from 'react'
import './PhotoLightbox.css'

function PhotoLightbox({ photo, photos, onClose, onNext, onPrev }) {
  useEffect(() => {
    const handleKeypress = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNext()
      if (e.key === 'ArrowLeft') onPrev()
    }
    
    window.addEventListener('keydown', handleKeypress)
    return () => window.removeEventListener('keydown', handleKeypress)
  }, [onClose, onNext, onPrev])

  const currentIndex = photos.findIndex(p => p.id === photo.id)
  const hasNext = currentIndex < photos.length - 1
  const hasPrev = currentIndex > 0

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        {/* Main Image Area */}
        <div className="lightbox-main">
          <button 
            className="lightbox-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>

          <button 
            className={`lightbox-nav lightbox-prev ${!hasPrev ? 'disabled' : ''}`}
            onClick={onPrev}
            disabled={!hasPrev}
            aria-label="Previous photo"
          >
            ←
          </button>

          <div className="lightbox-image-container">
            <img 
              src={photo.fullsize} 
              alt={photo.title}
              className="lightbox-image"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"%3E%3Crect fill="%23333" width="800" height="800"/%3E%3C/svg%3E'
              }}
            />
          </div>

          <button 
            className={`lightbox-nav lightbox-next ${!hasNext ? 'disabled' : ''}`}
            onClick={onNext}
            disabled={!hasNext}
            aria-label="Next photo"
          >
            →
          </button>
        </div>

        {/* Metadata Sidebar */}
        <div className="lightbox-sidebar">
          <div className="metadata-section">
            <h2 className="metadata-title">{photo.title}</h2>
            <p className="metadata-filename">{photo.filename}</p>
          </div>

          <div className="metadata-section">
            <h3 className="metadata-label">Metadata</h3>
            <div className="metadata-items">
              <div className="metadata-item">
                <span className="metadata-key">Date</span>
                <span className="metadata-value">{photo.metadata.date}</span>
              </div>
              <div className="metadata-item">
                <span className="metadata-key">Camera</span>
                <span className="metadata-value">{photo.metadata.camera}</span>
              </div>
              <div className="metadata-item">
                <span className="metadata-key">Aperture</span>
                <span className="metadata-value">{photo.metadata.fStop}</span>
              </div>
              <div className="metadata-item">
                <span className="metadata-key">Shutter Speed</span>
                <span className="metadata-value">{photo.metadata.shutter}</span>
              </div>
              <div className="metadata-item">
                <span className="metadata-key">ISO</span>
                <span className="metadata-value">{photo.metadata.iso}</span>
              </div>
            </div>
          </div>

          <div className="metadata-counter">
            Photo {currentIndex + 1} of {photos.length}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhotoLightbox
