import './PhotoGrid.css'

function PhotoGrid({ photos, onPhotoClick }) {
  return (
    <div className="photo-grid">
      {photos.map((photo) => (
        <div 
          key={photo.id}
          className="photo-grid-item"
          onClick={() => onPhotoClick(photo)}
        >
          <img 
            src={photo.thumbnail}
            alt={photo.title}
            className="photo-thumbnail"
            loading="lazy"
            onError={(e) => {
              if (photo.raw && e.target.src !== photo.raw) {
                e.target.src = photo.raw
              } else {
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"%3E%3Crect fill="%23222" width="300" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="14" fill="%23666" text-anchor="middle" dy=".3em"%3EImage Unavailable%3C/text%3E%3C/svg%3E'
              }
            }}
          />
          <div className="photo-info">
            <h4 className="photo-title">{photo.title}</h4>
            <p className="photo-filename">{photo.filename}</p>
            <div className="photo-metadata-summary">
              <span>{photo.metadata.camera}</span>
              <span>{photo.metadata.fStop}</span>
              <span>{photo.metadata.shutter}</span>
              <span>ISO {photo.metadata.iso}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default PhotoGrid
