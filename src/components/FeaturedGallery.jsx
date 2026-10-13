import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
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
  const [slideState, setSlideState] = useState('idle') // 'idle' | 'sliding-next' | 'sliding-prev'
  const [isPlaying, setIsPlaying] = useState(FEATURED_AUTO_ROTATE)
  const [isHovered, setIsHovered] = useState(false)
  const [loading, setLoading] = useState(true)
  const [bgLayers, setBgLayers] = useState({ current: '', prev: '' })
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768
    }
    return false
  })

  // Responsive listener for mobile breakpoint (<= 768px)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mql = window.matchMedia('(max-width: 768px)')
    const handleChange = (e) => {
      setIsMobile(e.matches)
    }

    setIsMobile(mql.matches)

    if (mql.addEventListener) {
      mql.addEventListener('change', handleChange)
      return () => mql.removeEventListener('change', handleChange)
    } else {
      mql.addListener(handleChange)
      return () => mql.removeListener(handleChange)
    }
  }, [])

  const stageRef = useRef(null)
  const trackRef = useRef(null)
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
          setSlideState('idle')
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

  // Navigation handlers: trigger smooth physical slide
  const goToNext = useCallback(() => {
    if (photos.length <= 1 || slideState !== 'idle') return
    setSlideState('sliding-next')
  }, [photos.length, slideState])

  const goToPrev = useCallback(() => {
    if (photos.length <= 1 || slideState !== 'idle') return
    setSlideState('sliding-prev')
  }, [photos.length, slideState])

  // Complete slide transition and reset position seamlessly
  const handleTransitionEnd = useCallback((e) => {
    if (e && e.target !== trackRef.current) return
    if (e && e.propertyName !== 'transform') return

    if (slideState === 'sliding-next') {
      setCurrentIndex((prev) => (prev + 1) % photos.length)
      setSlideState('idle')
    } else if (slideState === 'sliding-prev') {
      setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
      setSlideState('idle')
    }
  }, [slideState, photos.length])

  // Safety fallback timer in case transitionend event is missed
  useEffect(() => {
    if (slideState !== 'idle') {
      const timer = setTimeout(() => {
        handleTransitionEnd({ target: trackRef.current, propertyName: 'transform' })
      }, 720)
      return () => clearTimeout(timer)
    }
  }, [slideState, handleTransitionEnd])

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

  // Calculate visible count: 1 on mobile, up to 3 on desktop
  const visibleCount = useMemo(() => {
    if (photos.length === 0) return 1
    if (isMobile) return 1
    return Math.min(3, photos.length)
  }, [isMobile, photos.length])

  // Track items: includes 1 left buffer card (offset -1) and 1 right buffer card (offset visibleCount)
  // so the cards can smoothly scroll through the frame without popping.
  const trackItems = useMemo(() => {
    if (photos.length === 0) return []
    if (photos.length === 1) {
      return [{ offset: 0, photo: photos[0], index: 0 }]
    }

    const items = []
    const total = photos.length

    // Buffer card off-screen to the left
    const leftIdx = (currentIndex - 1 + total) % total
    items.push({
      offset: -1,
      photo: photos[leftIdx],
      index: leftIdx
    })

    // Visible cards in the frame
    for (let slot = 0; slot < visibleCount; slot++) {
      const photoIdx = (currentIndex + slot) % total
      items.push({
        offset: slot,
        photo: photos[photoIdx],
        index: photoIdx
      })
    }

    // Buffer card off-screen to the right
    const rightIdx = (currentIndex + visibleCount) % total
    items.push({
      offset: visibleCount,
      photo: photos[rightIdx],
      index: rightIdx
    })

    return items
  }, [photos, currentIndex, visibleCount])

  // Active indices for thumbnails and info badges
  const displayIndex = useMemo(() => {
    if (slideState === 'sliding-next') return (currentIndex + 1) % photos.length
    if (slideState === 'sliding-prev') return (currentIndex - 1 + photos.length) % photos.length
    return currentIndex
  }, [slideState, currentIndex, photos.length])

  const visibleIndices = useMemo(() => {
    if (photos.length === 0) return []
    const list = []
    for (let s = 0; s < visibleCount; s++) {
      list.push((displayIndex + s) % photos.length)
    }
    return list
  }, [displayIndex, visibleCount, photos.length])

  // Identify the middle photo displayed in the frame
  const middlePhotoIndex = useMemo(() => {
    if (photos.length === 0) return 0
    if (visibleCount >= 3) return (displayIndex + 1) % photos.length
    return displayIndex % photos.length
  }, [displayIndex, visibleCount, photos.length])

  const middlePhoto = photos[middlePhotoIndex] || photos[displayIndex] || photos[0] || null
  const middleImageSrc = middlePhoto?.featured || middlePhoto?.fullsize || middlePhoto?.thumbnail || ''

  // Dual-layer state for smooth crossfading of the ambient middle photo backdrop
  useEffect(() => {
    if (!middleImageSrc) return
    setBgLayers((prev) => {
      if (prev.current === middleImageSrc) return prev
      return {
        current: middleImageSrc,
        prev: prev.current || ''
      }
    })
  }, [middleImageSrc])

  // Preload upcoming photos in background for instantaneous transitions
  useEffect(() => {
    if (photos.length > 1) {
      const preloadIndices = [
        (currentIndex + 1) % photos.length,
        (currentIndex + 2) % photos.length,
        (currentIndex + 3) % photos.length,
        (currentIndex - 1 + photos.length) % photos.length
      ]
      for (const idx of preloadIndices) {
        const photo = photos[idx]
        const targetUrl = photo?.featured || photo?.fullsize || photo?.thumbnail
        if (targetUrl) {
          const preloadImg = new Image()
          preloadImg.src = targetUrl
        }
      }
    }
  }, [currentIndex, photos])

  // Thumbnail click handler: smoothly slides if adjacent, jumps directly if further away
  const handleThumbnailClick = (index) => {
    if (index === currentIndex || slideState !== 'idle') return

    if (index === (currentIndex + 1) % photos.length) {
      goToNext()
    } else if (index === (currentIndex - 1 + photos.length) % photos.length) {
      goToPrev()
    } else {
      setCurrentIndex(index)
    }
  }

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
        navigate(`/gallery/${gallery.id}/explore?photo=${middlePhotoIndex}`)
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

  const currentPhoto = photos[displayIndex] || photos[currentIndex]

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
          onClick={() => navigate(`/gallery/${gallery.id}/explore`)}
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
        {/* Softened Ambient Background of the Middle Photo */}
        <div className="featured-ambient-container" aria-hidden="true">
          {bgLayers.prev && bgLayers.prev !== bgLayers.current && (
            <div
              className="featured-ambient-backdrop is-prev"
              style={{ backgroundImage: `url(${bgLayers.prev})` }}
            />
          )}
          {bgLayers.current && (
            <div
              key={bgLayers.current}
              className="featured-ambient-backdrop is-current"
              style={{ backgroundImage: `url(${bgLayers.current})` }}
            />
          )}
          <div className="featured-ambient-overlay" />
        </div>

        {/* Photos Showcase Viewport: Continuous Smooth Scrolling Track */}
        <div
          className="featured-photos-viewport"
          role="region"
          aria-label={`${gallery.name} pictures carousel`}
        >
          <div
            className={`featured-track-window items-${visibleCount} ${photos.length <= 1 ? 'has-single-photo' : ''}`}
            style={{
              '--visible-count': visibleCount
            }}
          >
            <div
              ref={trackRef}
              className={`featured-sliding-track ${
                photos.length <= 1
                  ? 'is-static'
                  : slideState === 'sliding-next'
                  ? 'is-sliding-next'
                  : slideState === 'sliding-prev'
                  ? 'is-sliding-prev'
                  : 'is-idle'
              }`}
              onTransitionEnd={handleTransitionEnd}
            >
              {trackItems.map((item) => {
                const photo = item.photo
                const imgSrc = photo?.featured || photo?.fullsize || photo?.thumbnail
                const isCenterVisible = visibleCount === 3 && item.offset === 1
                const isLeadVisible = item.offset === 0

                return (
                  <div
                    key={`track-slot-${item.offset}`}
                    className={`featured-photo-card slot-offset-${item.offset} ${
                      isLeadVisible ? 'is-lead' : ''
                    } ${isCenterVisible ? 'is-center' : ''}`}
                    onClick={() => {
                      if (slideState === 'idle') {
                        navigate(`/gallery/${gallery.id}/explore?photo=${item.index}`)
                      }
                    }}
                    title={`Click to explore ${gallery.name} gallery`}
                    role="button"
                    tabIndex={item.offset >= 0 && item.offset < visibleCount ? 0 : -1}
                    aria-hidden={item.offset < 0 || item.offset >= visibleCount}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.stopPropagation()
                        navigate(`/gallery/${gallery.id}/explore?photo=${item.index}`)
                      }
                    }}
                    aria-label={`Photo ${item.index + 1}: ${photo.title || 'Untitled'} - Click to explore gallery`}
                  >
                    <div className="featured-card-image-wrap">
                      <img
                        src={imgSrc}
                        alt={photo.title || `${gallery.name} photo ${item.index + 1}`}
                        className="featured-card-photo"
                        onError={(e) => {
                          if (photo.raw && e.target.src !== photo.raw) {
                            e.target.src = photo.raw
                          } else if (photo.thumbnail && e.target.src !== photo.thumbnail) {
                            e.target.src = photo.thumbnail
                          }
                        }}
                      />
                      <div className="featured-card-hover-overlay" aria-hidden="true">
                        <span className="featured-card-hover-action">Explore Gallery →</span>
                      </div>
                    </div>

                    <div className="featured-card-caption">
                      <span className="featured-card-photo-title" title={photo.title}>
                        {photo.title || `Photo ${item.index + 1}`}
                      </span>
                      <span className="featured-card-badge">
                        {item.index + 1}/{photos.length}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
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
          onClick={() => navigate(`/gallery/${gallery.id}/explore?photo=${displayIndex}`)}
          title={`Click to explore ${gallery.name} gallery`}
        >
          <div className="featured-card-meta">
            <div className="featured-gallery-title-row">
              <span className="featured-gallery-name">{gallery.name}</span>
              <span className="featured-meta-separator">•</span>
              <span className="featured-gallery-date">{formatDate(gallery.date)}</span>
            </div>
            
            <div className="featured-photo-title-row">
              <span className="featured-photo-title">
                {currentPhoto?.title || gallery.name}
              </span>
              <span className="featured-counter-badge">
                {visibleCount > 1
                  ? `${displayIndex + 1}–${((displayIndex + visibleCount - 1) % photos.length) + 1} of ${photos.length}`
                  : `${displayIndex + 1} / ${photos.length}`}
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
                const isActive = index === displayIndex
                const isInRow = visibleIndices.includes(index)
                return (
                  <button
                    key={photo.id || photo.filename}
                    className={`featured-thumb-item ${isActive ? 'is-active' : ''} ${isInRow ? 'is-in-row' : ''}`}
                    onClick={() => handleThumbnailClick(index)}
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
