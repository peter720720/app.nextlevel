import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Mail, Menu, Phone, X } from 'lucide-react'

const navigationItems = [
  ['/', 'Home'],
  ['/about', 'About'],
  ['/pricing', 'Pricing'],
  ['/faqs', 'FAQs'],
  ['/contact', 'Contact'],
  ['/documentation', 'Documentation'],
]

function DualNavbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="utility-bar">
        <div className="utility-content">
          <div className="contact-info">
            <span>Have any questions?</span>
            <a href="tel:+2348100131944"><Phone aria-hidden="true" />+2348100131944</a>
            <a href="mailto:app@idealswift.com"><Mail aria-hidden="true" />app@idealswift.com</a>
          </div>
          <div className="account-links">
            <Link to="/register">Create School</Link>
            <Link to="/login">Administrator/Teacher Login</Link>
            <Link to="/student/login">Student Login</Link>
            <Link to="/parent/login">Parent Login</Link>
          </div>
        </div>
      </div>

      <div className="main-nav">
        <div className="nav-shell main-nav-inner">
          <Link to="/" className="brand-link" aria-label="Eduosmosis home">
            <img className="brand-logo" src="/Eduosmos.png" alt="Eduosmosis" />
          </Link>

          <nav className="primary-nav desktop-nav" aria-label="Main navigation">
            {navigationItems.map(([path, label]) => (
              <NavLink key={path} to={path} end={path === '/'}>
                {label}
              </NavLink>
            ))}
            <div className="social-links" aria-label="Social media">
              <a href="https://www.facebook.com/Idealswifttechltd" aria-label="Facebook">f</a>
              <a href="https://twitter.com/idealswifttech" aria-label="Twitter">X</a>
              <a href="https://www.instagram.com/idealswifttechnologies/" aria-label="Instagram">◎</a>
            </div>
          </nav>

          <button
            className="menu-toggle"
            type="button"
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((open) => !open)}
          >
            {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>

        {isOpen && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {navigationItems.map(([path, label]) => (
              <NavLink key={path} to={path} end={path === '/'} onClick={() => setIsOpen(false)}>
                {label}
              </NavLink>
            ))}
            <Link className="mobile-action" to="/register" onClick={() => setIsOpen(false)}>
              Create School
            </Link>
            <Link to="/login" onClick={() => setIsOpen(false)}>Administrator/Teacher Login</Link>
            <Link to="/student/login" onClick={() => setIsOpen(false)}>Student Login</Link>
            <Link to="/parent/login" onClick={() => setIsOpen(false)}>Parent Login</Link>
          </nav>
        )}
      </div>
    </header>
  )
}

export default DualNavbar
