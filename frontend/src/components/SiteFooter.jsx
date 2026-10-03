import { Link } from 'react-router-dom'
import { Mail, Phone } from 'lucide-react'

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-social-bar">
        <div className="footer-inner footer-social-content">
          <p>Do not miss out on social networks!</p>
          <div className="footer-social-links" aria-label="Social media">
            <a href="https://www.facebook.com/Idealswifttechltd" aria-label="Facebook">f</a>
            <a href="https://twitter.com/idealswifttech" aria-label="Twitter">X</a>
            <a href="https://www.google.com/" aria-label="Google Plus">G+</a>
            <a href="https://www.linkedin.com/" aria-label="LinkedIn">in</a>
            <a href="https://www.instagram.com/idealswifttechnologies/" aria-label="Instagram">◎</a>
          </div>
        </div>
      </div>
      <div className="footer-main">
        <div className="footer-inner footer-columns">
          <Link to="/" className="footer-brand" aria-label="Eduosmosis home">
            <img src="/Eduosmos.png" alt="Eduosmosis" />
          </Link>
          <section>
            <h2>Support</h2>
            <a href="/documentation">Documentation</a>
            <a href="https://status.idealswift.com/">Release Status</a>
          </section>
          <section>
            <h2>Useful Links</h2>
            <Link to="/">Home</Link>
            <a href="/about">About Us</a>
            <a href="/contact">Contact Us</a>
            <Link to="/pricing">Pricing</Link>
          </section>
          <section>
            <h2>Contact</h2>
            <a href="mailto:info@idealswift.com"><Mail aria-hidden="true" />info@idealswift.com</a>
            <a href="mailto:app@idealswift.com"><Mail aria-hidden="true" />app@idealswift.com</a>
            <a href="tel:+2348119935674"><Phone aria-hidden="true" />+234 811 993 5674</a>
          </section>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
