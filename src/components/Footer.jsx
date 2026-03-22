import './Footer.css'

function Footer() {
  const currentYear = new Date().getFullYear()

  const handleConstructionClick = (e) => {
    e.preventDefault()
  }

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Information</h3>
          <ul>
            <li><a href="#about" className="nav-link-construction" title="Under construction">About <span className="construction-badge">🔨</span></a></li>
            <li><a href="#contact" className="nav-link-construction" title="Under construction">Contact <span className="construction-badge">🔨</span></a></li>
            <li><a href="#help" className="nav-link-construction" title="Under construction">Help <span className="construction-badge">🔨</span></a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Connect</h3>
          <ul>
            <li><a href="#" className="nav-link-construction" title="Under construction" onClick={handleConstructionClick}>Instagram <span className="construction-badge">🔨</span></a></li>
            <li><a href="#" className="nav-link-construction" title="Under construction" onClick={handleConstructionClick}>LinkedIn <span className="construction-badge">🔨</span></a></li>
            <li><a href="#" className="nav-link-construction" title="Under construction" onClick={handleConstructionClick}>Portfolio <span className="construction-badge">🔨</span></a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Sites</h3>
          <ul>
            <li><a href="#" className="nav-link-construction" title="Under construction" onClick={handleConstructionClick}>rexbenning.com <span className="construction-badge">🔨</span></a></li>
            <li><a href="#" className="nav-link-construction" title="Under construction" onClick={handleConstructionClick}>rexbenning.ca <span className="construction-badge">🔨</span></a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Rex Benning Photography. All rights reserved.</p>
        <p>Images are the intellectual property of Rex Benning.</p>
      </div>
    </footer>
  )
}

export default Footer
