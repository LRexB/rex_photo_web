import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback } from 'react'
import { getGalleryPhotos, enrichPhotosWithExif } from '../utils/galleryUtils'
import PhotoLightbox from '../components/PhotoLightbox'
import './GalleryExplore.css'

function GalleryExplore({ galleries }) {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [currentGallery, setCurrentGallery] = useState(null)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(() => {
    const p = parseInt(searchParams.get('photo'), 10)
    return !isNaN(p) && p >= 0 ? p : 0
  })
  const [selectedLightboxPhoto, setSelectedLightboxPhoto] = useState(null)

  const scrollContainerRef = useRef(null)
  const slideRefs = useRef([])
  const isProgrammaticScroll = useRef(false)
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)

  // 1. Resolve gallery and load photos with background EXIF streaming
  useEffect(() => {
    let abortExif = null
    let isMounted = true

    async function loadGalleryData() {
      // Find gallery across all categories
      let gallery = galleries.all?.find((g) => g.id === id) || null
      if (!gallery && galleries.latest) {
        gallery = galleries.latest.find((g) => g.id === id)
      }
      if (!gallery && galleries.recommended) {
        gallery = galleries.recommended.find((g) => g.id === id)
      }
      if (!gallery && galleries.popular) {
        gallery = galleries.popular.find((g) => g.id === id)
      }

      if (gallery) {
        setCurrentGallery(gallery)

        try {
          const galleryPhotos = await getGalleryPhotos(id)
          if (isMounted) {
            setPhotos(galleryPhotos)
            setLoading(false)

            // Stream EXIF in background
            abortExif = enrichPhotosWithExif(galleryPhotos, (updated) => {
              if (isMounted) {
                setPhotos(updated)
              }
            })
          }
        } catch (err) {
          console.error('Failed to load explore photos:', err)
          if (isMounted) {
            setPhotos([])
            setLoading(false)
          }
        }
      } else if (!galleries.all || galleries.all.length > 0) {
        // Only stop loading if galleries array has loaded and gallery still not found
        setLoading(false)
      }
    }

    loadGalleryData()

    return () => {
      isMounted = false
      if (abortExif) abortExif()
    }
  }, [id, galleries])

  // 2. Initial scroll to requested photo index
  useEffect(() => {
    if (photos.length === 0) return

    const initialPhotoParam = parseInt(searchParams.get('photo'), 10)
    const targetIdx =
      !isNaN(initialPhotoParam) && initialPhotoParam >= 0 && initialPhotoParam < photos.length
        ? initialPhotoParam
        : 0

    setActiveIndex(targetIdx)

    // Allow DOM to layout then scroll
    const timer = setTimeout(() => {
      const targetElement = slideRefs.current[targetIdx]
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'auto' })
      }
    }, 60)

    return () => clearTimeout(timer)
  }, [photos.length, searchParams])

  // 3. Intersection Observer to keep activeIndex accurately in sync with user scrolling
  useEffect(() => {
    if (photos.length === 0 || !scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScroll.current) return

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const idx = parseInt(entry.target.getAttribute('data-index'), 10)
            if (!isNaN(idx)) {
              setActiveIndex(idx)
            }
          }
        })
      },
      {
        root: container,
        threshold: 0.5
      }
    )

    slideRefs.current.forEach((slide) => {
      if (slide) observer.observe(slide)
    })

    return () => {
      observer.disconnect()
    }
  }, [photos])

  // 4. Smooth scroll to specific slide
  const scrollToSlide = useCallback(
    (index) => {
      if (index < 0 || index >= photos.length) return
      const targetSlide = slideRefs.current[index]
      if (!targetSlide) return

      isProgrammaticScroll.current = true
      setActiveIndex(index)

      targetSlide.scrollIntoView({ behavior: 'smooth' })

      setTimeout(() => {
        isProgrammaticScroll.current = false
      }, 700)
    },
    [photos.length]
  )

  const handlePrev = useCallback(() => {
    if (activeIndex > 0) {
      scrollToSlide(activeIndex - 1)
    }
  }, [activeIndex, scrollToSlide])

  const handleNext = useCallback(() => {
    if (activeIndex < photos.length - 1) {
      scrollToSlide(activeIndex + 1)
    }
  }, [activeIndex, photos.length, scrollToSlide])

  const handleReturn = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }, [navigate])

  const handleGoToRegularGallery = useCallback(() => {
    navigate(`/gallery/${id}?skipRedirect=1`)
  }, [navigate, id])

  // 5. Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if lightbox is open
      if (selectedLightboxPhoto) return

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault()
        handleNext()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        handlePrev()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleReturn()
      } else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault()
        handleGoToRegularGallery()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNext, handlePrev, handleReturn, handleGoToRegularGallery, selectedLightboxPhoto])

  // 6. Touch swipe support for horizontal gestures
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || touchStartY.current === null) return
    const diffX = touchStartX.current - e.changedTouches[0].clientX
    const diffY = touchStartY.current - e.changedTouches[0].clientY
    const swipeThreshold = 50

    // Only handle horizontal swipes if horizontal motion dominates
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
      if (diffX > 0) {
        handleNext()
      } else {
        handlePrev()
      }
    }

    touchStartX.current = null
    touchStartY.current = null
  }

  // Loading state
  if (loading) {
    return (
      <div className="explore-loading-screen">
        <div className="explore-spinner" />
        <p>Loading full page gallery...</p>
      </div>
    )
  }

  // Not found state
  if (!currentGallery) {
    return (
      <div className="explore-error-screen">
        <h2>Gallery Not Found</h2>
        <p>The requested gallery could not be located.</p>
        <button className="explore-action-btn" onClick={() => navigate('/')}>
          ← Return to Home
        </button>
      </div>
    )
  }

  const currentPhoto = photos[activeIndex] || photos[0]
  const progressPercent = photos.length > 0 ? ((activeIndex + 1) / photos.length) * 100 : 0

  return (
    <div
      className="gallery-explore-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Floating Minimal HUD */}
      <header className="explore-top-hud">
        {/* Top Progress Line */}
        <div
          className="explore-progress-bar"
          style={{ width: `${progressPercent}%` }}
          aria-hidden="true"
        />

        <div className="explore-hud-content">
          {/* Left: Return Button */}
          <div className="explore-hud-left">
            <button
              className="explore-hud-btn explore-hud-return"
              onClick={handleReturn}
              title="Return to previous page (Esc)"
              aria-label="Return to previous page"
            >
              <span className="btn-icon">←</span>
              <span className="btn-label">Return</span>
            </button>
          </div>

          {/* Center: Gallery Title & Progress */}
          <div className="explore-hud-center">
            <span className="explore-gallery-name">{currentGallery.name}</span>
            <span className="explore-divider">•</span>
            <span className="explore-counter-pill">
              {photos.length > 0 ? `${activeIndex + 1} of ${photos.length}` : '0 of 0'}
            </span>
          </div>

          {/* Right: Regular Gallery Display Button */}
          <div className="explore-hud-right">
            <button
              className="explore-hud-btn explore-hud-regular"
              onClick={handleGoToRegularGallery}
              title="Go to regular grid display (G)"
              aria-label="Go to regular gallery display"
            >
              <span className="btn-icon">▦</span>
              <span className="btn-label">Regular Gallery</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Back & Forward Navigation Controls */}
      {/* Navigation arrows removed for cleaner vertical scrolling */}

      {/* Scrolling Minimal Full Page Scroller */}
      <main ref={scrollContainerRef} className="explore-scroll-feed">
        {photos.map((photo, index) => {
          const photoSrc = photo.fullsize || photo.featured || photo.thumbnail
          const isCurrent = index === activeIndex

          return (
            <section
              key={photo.id || photo.filename || index}
              ref={(el) => (slideRefs.current[index] = el)}
              data-index={index}
              className={`explore-photo-slide ${isCurrent ? 'is-active-slide' : ''}`}
            >
              {/* Softened Ambient Background of this Photo */}
              <div
                className="explore-slide-backdrop"
                style={{ backgroundImage: `url(${photoSrc})` }}
                aria-hidden="true"
              />
              <div className="explore-slide-vignette" aria-hidden="true" />

              {/* Main Photo Showcase */}
              <div className="explore-slide-stage">
                <div
                  className="explore-image-frame"
                  onClick={() => setSelectedLightboxPhoto(photo)}
                  title="Click to view full-resolution lightbox"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setSelectedLightboxPhoto(photo)
                    }
                  }}
                  aria-label={`Photo ${index + 1}: ${photo.title || 'Untitled'} - Click to expand`}
                >
                  <img
                    src={photoSrc}
                    alt={photo.title || `${currentGallery.name} photo ${index + 1}`}
                    className="explore-photo-img"
                    loading={Math.abs(index - activeIndex) <= 1 ? 'eager' : 'lazy'}
                    onError={(e) => {
                      if (photo.raw && e.target.src !== photo.raw) {
                        e.target.src = photo.raw
                      } else if (photo.thumbnail && e.target.src !== photo.thumbnail) {
                        e.target.src = photo.thumbnail
                      }
                    }}
                  />
                  <div className="explore-image-expand-hint" aria-hidden="true">
                    <span>⤢ Expand</span>
                  </div>
                </div>

                {/* Minimal Caption & Metadata Bar */}
                <div className="explore-slide-caption">
                  <div className="explore-caption-left">
                    <h2 className="explore-photo-title">
                      {photo.title || `Photo ${index + 1}`}
                    </h2>
                    {photo.metadata?.date && (
                      <span className="explore-photo-date">{photo.metadata.date}</span>
                    )}
                  </div>

                  {/* Camera EXIF Pills */}
                  {photo.metadata && (photo.metadata.camera || photo.metadata.fStop || photo.metadata.iso) && (
                    <div className="explore-meta-pills">
                      {photo.metadata.camera && (
                        <span className="explore-pill">{photo.metadata.camera}</span>
                      )}
                      {photo.metadata.fStop && (
                        <span className="explore-pill">
                          ƒ/{photo.metadata.fStop.replace(/^[fF]\/?/, '')}
                        </span>
                      )}
                      {photo.metadata.shutter && (
                        <span className="explore-pill">{photo.metadata.shutter}</span>
                      )}
                      {photo.metadata.iso && (
                        <span className="explore-pill">ISO {photo.metadata.iso}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )
        })}
      </main>
      {/* Scroll reminder: show on first photo */}
      {activeIndex === 0 && (
        <div className="scroll-reminder" aria-hidden="true">
          <span className="scroll-arrow">⬇️</span>
          <span className="scroll-text">Scroll for more</span>
        </div>
      )}

      {/* Optional Lightbox for Full-Resolution Viewing */}
      {selectedLightboxPhoto && (
        <PhotoLightbox
          photo={selectedLightboxPhoto}
          photos={photos}
          onClose={() => setSelectedLightboxPhoto(null)}
          onNext={() => {
            const idx = photos.findIndex((p) => p.id === selectedLightboxPhoto.id)
            if (idx < photos.length - 1) {
              setSelectedLightboxPhoto(photos[idx + 1])
            }
          }}
          onPrev={() => {
            const idx = photos.findIndex((p) => p.id === selectedLightboxPhoto.id)
            if (idx > 0) {
              setSelectedLightboxPhoto(photos[idx - 1])
            }
          }}
        />
      )}
    </div>
  )
}

export default GalleryExplore
