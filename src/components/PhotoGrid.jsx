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
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"%3E%3Crect fill="%23333" width="300" height="300"/%3E%3C/svg%3E'
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
