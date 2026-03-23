import Header from '../components/Header'
import Banner from '../components/Banner'
import GalleryRow from '../components/GalleryRow'
import Footer from '../components/Footer'
import './LandingPage.css'

function LandingPage({ galleries, loading, searchState, onSearchStateChange }) {
  const searchQuery = searchState?.query || ''
  const searchResults = Array.isArray(searchState?.results) ? searchState.results : []
  const hasActiveResults = Boolean(searchState?.hasActiveResults)
  const searchFeedback = searchState?.feedback || ''

  const handleSearchSubmit = (event) => {
    event.preventDefault()

    const normalizedQuery = searchQuery.trim().toLowerCase().replace(/^#/, '')
    if (!normalizedQuery) {
      onSearchStateChange({
        query: searchQuery,
        results: [],
        hasActiveResults: false,
        feedback: 'Enter a hashtag to search your galleries.'
      })
      return
    }

    const matches = (galleries.all || []).filter((gallery) =>
      Array.isArray(gallery.tags) && gallery.tags.some((tag) => tag.includes(normalizedQuery))
    )

    if (matches.length > 0) {
      onSearchStateChange({
        query: searchQuery,
        results: matches,
        hasActiveResults: true,
        feedback: ''
      })
      return
    }

    onSearchStateChange({
      query: searchQuery,
      results: [],
      hasActiveResults: false,
      feedback: `No galleries found for #${normalizedQuery}.`
    })
  }

  const handleClearResults = () => {
    onSearchStateChange({
      query: '',
      results: [],
      hasActiveResults: false,
      feedback: ''
    })
  }

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
              <form className="gallery-search" onSubmit={handleSearchSubmit}>
                <label className="gallery-search-label" htmlFor="gallery-tag-search">
                  Search gallery hashtags
                </label>
                <div className="gallery-search-controls">
                  <input
                    id="gallery-tag-search"
                    type="search"
                    value={searchQuery}
                    onChange={(event) => {
                      onSearchStateChange((prev) => ({
                        ...(prev || {
                          query: '',
                          results: [],
                          hasActiveResults: false,
                          feedback: ''
                        }),
                        query: event.target.value
                      }))
                    }}
                    className="gallery-search-input"
                    placeholder="Try #winter or #quebec"
                  />
                  <button type="submit" className="gallery-search-button">
                    Search
                  </button>
                </div>
                {searchFeedback ? <p className="gallery-search-feedback">{searchFeedback}</p> : null}
              </form>

              {hasActiveResults ? (
                <GalleryRow
                  title="Results"
                  galleries={searchResults}
                  actionLabel="Back"
                  onAction={handleClearResults}
                />
              ) : null}

              <GalleryRow 
                title="Latest Galleries" 
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
