import { useState } from 'react'
import Header from '../components/Header'
import Banner from '../components/Banner'
import GalleryRow from '../components/GalleryRow'
import Footer from '../components/Footer'
import './LandingPage.css'

function LandingPage({ galleries, loading }) {
  return (
    <div className="landing-page">
      <Header />
      <Banner />
      
      <main className="gallery-main">
        <div className="container">
          {loading ? (
            <div className="loading">Loading galleries...</div>
          ) : (
            <div className="gallery-rows">
              <GalleryRow 
                title="Latest" 
                galleries={galleries.latest}
              />
              <GalleryRow 
                title="Recommended" 
                galleries={galleries.recommended}
              />
              <GalleryRow 
                title="Most Popular" 
                galleries={galleries.popular}
              />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default LandingPage
