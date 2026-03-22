import './Banner.css'

function Banner() {
  return (
    <div className="banner">
      <div className="banner-image-wrapper">
        <img 
          src="/images/banner-image.jpg" 
          alt="Portfolio Banner"
          className="banner-image"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 600"%3E%3Crect fill="%23333" width="1600" height="600"/%3E%3Ctext x="50%25" y="50%25" font-size="48" fill="%23666" text-anchor="middle" dy=".3em"%3EBanner Image%3C/text%3E%3C/svg%3E'
          }}
        />
      </div>
      <div className="banner-overlay"></div>
      <div className="banner-content">
        <h1 className="banner-title">REX BENNING</h1>
        <p className="banner-subtitle">Photography Portfolio</p>
      </div>
    </div>
  )
}

export default Banner
