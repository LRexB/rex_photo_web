import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import GalleryDetail from './pages/GalleryDetail'
import { scanGalleries, sortGalleriesByDate } from './utils/galleryUtils'
import './App.css'

function App() {
  const [galleries, setGalleries] = useState({ all: [], latest: [], recommended: [], popular: [] })
  const [landingSearch, setLandingSearch] = useState({
    query: '',
    results: [],
    hasActiveResults: false,
    feedback: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadGalleries() {
      try {
        const allGalleries = await scanGalleries()
        
        // Sort by date for latest
        const latest = sortGalleriesByDate(allGalleries).slice(0, 5)
        
        // For now, put all galleries in latest. In production, you'd have
        // logic to categorize them as recommended/popular based on metadata
        const recommended = []
        const popular = []
        
        setGalleries({
          all: allGalleries,
          latest,
          recommended,
          popular
        })
      } catch (error) {
        console.error('Error loading galleries:', error)
        // Fallback to empty galleries
        setGalleries({ all: [], latest: [], recommended: [], popular: [] })
      } finally {
        setLoading(false)
      }
    }

    loadGalleries()
  }, [])

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={(
            <LandingPage
              galleries={galleries}
              loading={loading}
              searchState={landingSearch}
              onSearchStateChange={setLandingSearch}
            />
          )}
        />
        <Route path="/gallery/:id" element={<GalleryDetail galleries={galleries} />} />
      </Routes>
    </Router>
  )
}

export default App
