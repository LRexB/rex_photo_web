import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import PhotoGrid from '../components/PhotoGrid'
import PhotoLightbox from '../components/PhotoLightbox'
import Footer from '../components/Footer'
import { getGalleryPhotos } from '../utils/galleryUtils'
import './GalleryDetail.css'

function GalleryDetail({ galleries }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [currentGallery, setCurrentGallery] = useState(null)
  const [photos, setPhotos] = useState([])
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadGallery() {
      // Find the gallery from all categories
      let gallery = galleries.all?.find(g => g.id === id) || null

      if (!gallery && galleries.latest) {
        gallery = galleries.latest.find(g => g.id === id)
      }
      if (!gallery && galleries.recommended) {
        gallery = galleries.recommended.find(g => g.id === id)
      }
      if (!gallery && galleries.popular) {
        gallery = galleries.popular.find(g => g.id === id)
      }

      if (gallery) {
        setCurrentGallery(gallery)
        
        // Load actual photos from the gallery
        try {
          const galleryPhotos = await getGalleryPhotos(id)
          setPhotos(galleryPhotos)
        } catch (error) {
          console.error('Error loading photos:', error)
          setPhotos([])
        }
      }
      
      setLoading(false)
    }

    loadGallery()
  }, [id, galleries])

  if (loading) {
    return (
      <>
        <Header />
        <div className="gallery-detail-loading">
          <p>Loading gallery...</p>
        </div>
        <Footer />
      </>
    )
  }

  if (!currentGallery) {
    return (
      <>
        <Header />
        <div className="gallery-detail-container">
          <div className="gallery-detail-error">
            <p>Gallery not found</p>
            <button onClick={() => navigate('/')} className="back-button">
              ← Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <div className="gallery-detail-page">
      <Header />
      
      <main className="gallery-detail-main">
        <div className="container">
          <button onClick={() => navigate('/')} className="back-button">
            ← Back to Home
          </button>
          
          <div className="gallery-header">
            <h1>{currentGallery.name}</h1>
            <p className="gallery-date">{new Date(currentGallery.date).toLocaleDateString()}</p>
          </div>

          <div className="gallery-description">
            <p>{currentGallery.description}</p>
          </div>

          <PhotoGrid 
            photos={photos}
            onPhotoClick={setSelectedPhoto}
          />
        </div>
      </main>

      {selectedPhoto && (
        <PhotoLightbox 
          photo={selectedPhoto}
          photos={photos}
          onClose={() => setSelectedPhoto(null)}
          onNext={() => {
            const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id)
            if (currentIndex < photos.length - 1) {
              setSelectedPhoto(photos[currentIndex + 1])
            }
          }}
          onPrev={() => {
            const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id)
            if (currentIndex > 0) {
              setSelectedPhoto(photos[currentIndex - 1])
            }
          }}
        />
      )}

      <Footer />
    </div>
  )
}

export default GalleryDetail
