import './GalleryCard.css'

function GalleryCard({ gallery, onClick }) {
  return (
    <button className="gallery-card" onClick={onClick}>
      <div className="gallery-card-image">
        <img 
          src={gallery.thumbnail} 
          alt={gallery.name}
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"%3E%3Crect fill="%23333" width="300" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="14" fill="%23666" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E'
          }}
        />
      </div>
      <div className="gallery-card-content">
        <h3 className="gallery-card-title">{gallery.name}</h3>
        <p className="gallery-card-date">{new Date(gallery.date).toLocaleDateString()}</p>
      </div>
    </button>
  )
}

export default GalleryCard
