import './Footer.css'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Information</h3>
          <ul>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
            <li><a href="#help">Help</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Connect</h3>
          <ul>
            <li><a href="#" target="_blank" rel="noopener noreferrer">Instagram</a></li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">Portfolio</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Sites</h3>
          <ul>
            <li><a href="#">rexbenning.com</a></li>
            <li><a href="#">rexbenning.ca</a></li>
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
