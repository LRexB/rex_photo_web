import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  resolveFeaturedGallery,
  FEATURED_ROTATION_INTERVAL,
  FEATURED_AUTO_ROTATE
} from '../config/featuredConfig'
import { getGalleryPhotos, formatDate } from '../utils/galleryUtils'
import './FeaturedGallery.css'

function FeaturedGallery({ galleries, featuredGalleryOverride }) {
  const navigate = useNavigate()
  const [gallery, setGallery] = useState(null)
  const [photos, setPhotos] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(FEATURED_AUTO_ROTATE)
  const [isHovered, setIsHovered] = useState(false)
  const [loading, setLoading] = useState(true)

  const stageRef = useRef(null)
  const touchStartX = useRef(null)
  const touchEndX = useRef(null)

  // Resolve which gallery to feature
  useEffect(() => {
    if (!galleries || galleries.length === 0) return

    let resolved = null
    if (featuredGalleryOverride) {
      if (typeof featuredGalleryOverride === 'string') {
        resolved = galleries.find((g) => g.id === featuredGalleryOverride) || null
      } else {
        resolved = featuredGalleryOverride
      }
    }

    if (!resolved) {
      resolved = resolveFeaturedGallery(galleries)
    }

    setGallery(resolved)
  }, [galleries, featuredGalleryOverride])

  // Load photos for the featured gallery
  useEffect(() => {
    let isMounted = true

    async function loadPhotos() {
      if (!gallery?.id) return
      setLoading(true)

      try {
        const items = await getGalleryPhotos(gallery.id)
        if (isMounted) {
          setPhotos(items)
          setCurrentIndex(0)
          setLoading(false)
        }
      } catch (err) {
        console.error('Failed to load featured gallery photos:', err)
        if (isMounted) {
          setPhotos([])
          setLoading(false)
        }
      }
    }

    loadPhotos()

    return () => {
      isMounted = false
    }
  }, [gallery?.id])

  // Navigation handlers
  const goToNext = useCallback(() => {
    if (photos.length <= 1) return
    setCurrentIndex((prev) => (prev + 1) % photos.length)
  }, [photos.length])

  const goToPrev = useCallback(() => {
    if (photos.length <= 1) return
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }, [photos.length])

  // Auto-rotation timer
  useEffect(() => {
    if (!FEATURED_AUTO_ROTATE || !isPlaying || isHovered || photos.length <= 1) {
      return
    }

    const intervalId = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) {
        return
      }
      goToNext()
    }, FEATURED_ROTATION_INTERVAL)

    return () => clearInterval(intervalId)
  }, [isPlaying, isHovered, photos.length, goToNext])

  // Preload the next photo in background for instantaneous transitions
  useEffect(() => {
    if (photos.length > 1) {
      const nextIdx = (currentIndex + 1) % photos.length
      const nextPhoto = photos[nextIdx]
      const targetUrl = nextPhoto?.featured || nextPhoto?.fullsize
      if (targetUrl) {
        const preloadImg = new Image()
        preloadImg.src = targetUrl
      }
    }
  }, [currentIndex, photos])

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      goToPrev()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      goToNext()
    } else if (e.key === ' ' || e.key === 'k') {
      e.preventDefault()
      setIsPlaying((prev) => !prev)
    } else if (e.key === 'Enter') {
      if (gallery) {
        navigate(`/gallery/${gallery.id}`)
      }
    }
  }

  // Touch swipe support
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return
    const diff = touchStartX.current - touchEndX.current
    const swipeThreshold = 45

    if (diff > swipeThreshold) {
      goToNext()
    } else if (diff < -swipeThreshold) {
      goToPrev()
    }

    touchStartX.current = null
    touchEndX.current = null
  }

  if (!gallery || loading || photos.length === 0) {
    return null
  }

  const currentPhoto = photos[currentIndex]
  const displayImageSrc = currentPhoto?.featured || currentPhoto?.fullsize || currentPhoto?.thumbnail

  return (
    <section
      className="featured-gallery-section"
      aria-roledescription="carousel"
      aria-label="Featured Gallery Slideshow"
    >
      {/* Section Header */}
      <div className="gallery-row-header featured-header">
        <h2 className="gallery-row-title featured-section-title">
          <span className="featured-heading-label">Featured Gallery:</span>
          <span className="featured-gallery-named-title">{gallery.name}</span>
        </h2>

        <button
          className="gallery-row-action featured-header-action"
          onClick={() => navigate(`/gallery/${gallery.id}`)}
          aria-label={`Explore ${gallery.name} gallery`}
        >
          <span>Explore Gallery ({photos.length})</span>
          <span className="action-arrow">→</span>
        </button>
      </div>

      {/* Main Rotating Showcase Stage */}
      <div
        ref={stageRef}
        className="featured-stage"
        tabIndex={0}
        role="region"
        aria-label={`${gallery.name} photo slideshow`}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Ambient Glowing Background (Blurred dynamic backdrop) */}
        <div
          className="featured-ambient-backdrop"
          style={{ backgroundImage: `url(${displayImageSrc})` }}
          aria-hidden="true"
        />
        <div className="featured-vignette-overlay" aria-hidden="true" />


        {/* Photo Viewport */}
        <div
          className="featured-photo-viewport"
          onClick={() => navigate(`/gallery/${gallery.id}`)}
          title={`Click to view full ${gallery.name} gallery`}
          role="button"
          tabIndex={-1}
        >
          <img
            key={currentPhoto.id || currentPhoto.filename}
            src={displayImageSrc}
            alt={currentPhoto.title || `${gallery.name} photo ${currentIndex + 1}`}
            className="featured-active-photo"
            onError={(e) => {
              if (currentPhoto.raw && e.target.src !== currentPhoto.raw) {
                e.target.src = currentPhoto.raw
              } else if (currentPhoto.thumbnail && e.target.src !== currentPhoto.thumbnail) {
                e.target.src = currentPhoto.thumbnail
              }
            }}
          />
        </div>

        {/* Previous & Next Arrows */}
        {photos.length > 1 && (
          <>
            <button
              className="featured-nav-btn featured-nav-prev"
              onClick={(e) => {
                e.stopPropagation()
                goToPrev()
              }}
              aria-label="Previous photo"
              title="Previous photo (Left arrow)"
            >
              ‹
            </button>

            <button
              className="featured-nav-btn featured-nav-next"
              onClick={(e) => {
                e.stopPropagation()
                goToNext()
              }}
              aria-label="Next photo"
              title="Next photo (Right arrow)"
            >
              ›
            </button>
          </>
        )}

        {/* Play / Pause Toggle Button */}
        {photos.length > 1 && (
          <button
            className={`featured-play-button ${!isPlaying ? 'is-paused' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              setIsPlaying((prev) => !prev)
            }}
            aria-label={isPlaying ? 'Pause auto-rotation' : 'Start auto-rotation'}
            title={isPlaying ? 'Pause slideshow (Space)' : 'Play slideshow (Space)'}
          >
            {isPlaying ? (
              <span className="play-icon" aria-hidden="true">❚❚</span>
            ) : (
              <span className="play-icon" aria-hidden="true">▶</span>
            )}
            <span className="play-label">{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
        )}

        {/* Floating Glassmorphic Details Card */}
        <div
          className="featured-overlay-card"
          onClick={() => navigate(`/gallery/${gallery.id}`)}
          title={`Click to view full ${gallery.name} gallery`}
        >
          <div className="featured-card-meta">
            <div className="featured-gallery-title-row">
              <span className="featured-gallery-name">{gallery.name}</span>
              <span className="featured-meta-separator">•</span>
              <span className="featured-gallery-date">{formatDate(gallery.date)}</span>
            </div>
            
            <div className="featured-photo-title-row">
              <span className="featured-photo-title">
                {currentPhoto.title || `Photo ${currentIndex + 1}`}
              </span>
              <span className="featured-counter-badge">
                {currentIndex + 1} / {photos.length}
              </span>
            </div>

            {gallery.description && (
              <p className="featured-gallery-desc">
                {gallery.description}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Thumbnail Strip with Discreet Progress Bar */}
        {photos.length > 1 && (
          <div
            className="featured-thumbs-container"
            onClick={(e) => e.stopPropagation()}
            aria-label="Thumbnail previews and rotation progress"
          >
            <div
              className="featured-thumbnail-strip"
              aria-label="Thumbnail previews"
            >
              {photos.map((photo, index) => {
                const isActive = index === currentIndex
                return (
                  <button
                    key={photo.id || photo.filename}
                    className={`featured-thumb-item ${isActive ? 'is-active' : ''}`}
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`Show photo ${index + 1}: ${photo.title}`}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    <img
                      src={photo.thumbnail}
                      alt={photo.title}
                      className="featured-thumb-image"
                      loading="lazy"
                    />
                    {isActive && <div className="featured-thumb-indicator" />}
                  </button>
                )
              })}
            </div>

            {/* Discreet Progress Bar Under Thumbnails */}
            <div className="featured-progress-track">
              <div
                key={`${currentIndex}-${isPlaying}-${isHovered}`}
                className={`featured-progress-bar ${!isPlaying || isHovered ? 'paused' : 'running'}`}
                style={{
                  animationDuration: `${FEATURED_ROTATION_INTERVAL}ms`
                }}
              />
            </div>
          </div>
        )}

      </div>
    </section>
  )
}

export default FeaturedGallery
