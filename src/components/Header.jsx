import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Header.css'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  const menuItems = ['About', 'Contact', 'Help', 'Search']

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <button onClick={() => navigate('/')} className="logo-button">
            <span className="logo-text">REX BENNING</span>
            <span className="logo-subtitle">PHOTOGRAPHY</span>
          </button>
        </div>

        <nav className="nav-desktop">
          <ul className="nav-menu">
            {menuItems.map((item) => (
              <li key={item}>
                <a href={`#${item.toLowerCase()}`} className="nav-link">
                  {item}
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
                  className="nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
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
