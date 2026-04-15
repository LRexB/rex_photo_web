import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Header.css'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  const menuItems = ['About', 'Contact', 'Help']

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <button onClick={() => navigate('/')} className="logo-button">
            <img
              src="/photos/Rex 2 B&W.jpg"
              alt="Rex Benning"
              className="logo-thumbnail"
            />
            <div className="logo-text-group">
              <span className="logo-text">REX BENNING</span>
              <span className="logo-subtitle">PHOTOGRAPHY</span>
            </div>
          </button>
        </div>

        <nav className="nav-desktop">
          <ul className="nav-menu">
            {menuItems.map((item) => (
              <li key={item}>
                <a href={`#${item.toLowerCase()}`} className="nav-link nav-link-construction" title="Under construction">
                  {item}
                  <span className="construction-badge">🔨</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button 
          className="nav-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {isMenuOpen && (
        <nav className="nav-mobile">
          <ul className="nav-menu">
            {menuItems.map((item) => (
              <li key={item}>
                <a 
                  href={`#${item.toLowerCase()}`} 
                  className="nav-link nav-link-construction"
                  onClick={() => setIsMenuOpen(false)}
                  title="Under construction"
                >
                  {item}
                  <span className="construction-badge">🔨</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}

export default Header
