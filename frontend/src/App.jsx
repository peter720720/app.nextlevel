import { useContext, useEffect, useState } from 'react'
import { BrowserRouter as Router, Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AuthContext, AuthProvider } from './context/AuthContext'
import DualNavbar from './components/DualNavbar'
import LoginPage from './components/LoginPage'
import AdminDashboard from './components/AdminDashboard'
import SiteFooter from './components/SiteFooter'
import { BookOpen, ChevronLeft, ChevronRight, Gem, Heart, Sparkles, UsersRound } from 'lucide-react'
import Pricing from './pages/Pricing';

const slides = [
  {
    image: '/slide-1.jpg',
    alt: 'A student reading a book in a library',
    heading: 'Need more study time for your kids?',
    action: 'Get registered',
  },
  {
    image: '/slide-2.jpg',
    alt: 'Students learning together',
    heading: 'E-learning at its best',
    action: 'Explore Eduosmosis',
  },
  {
    image: '/slide-3.jpg',
    alt: 'A student studying at a desk',
    heading: 'For the love of education',
    action: 'Get registered',
  },
]

const highlights = [
  {
    title: 'Educational',
    description: 'Build knowledge through lessons, assignments, and online assessments.',
    Icon: BookOpen,
  },
  {
    title: 'Fun',
    description: 'Turn progress into a friendly challenge that keeps students engaged.',
    Icon: Sparkles,
  },
  {
    title: 'Relaxing',
    description: 'Give learners a calmer place to practise and grow at their own pace.',
    Icon: Heart,
  },
  {
    title: 'Connected',
    description: 'Bring students, teachers, and families together around learning.',
    Icon: UsersRound,
  },
]

const pricingPlans = [
  {
    name: 'Tiny',
    price: '₦5000',
    description: 'Suitable for schools with less than 100 students',
    features: ['100 students', '2 Administrators', '5 Teachers', '3GB File space', 'Print Result/Report', 'Export Result/Report'],
  },
  {
    name: 'Starter',
    price: '₦9000',
    description: 'Suitable for schools with less than 400 students',
    features: ['250 students', '4 Administrators', '20 Teachers', '6GB File space', 'Print Result/Report', 'Export Result/Report'],
  },
  {
    name: 'Premium',
    price: '₦15000',
    description: 'Suitable for schools with about 500 students',
    features: ['400 students', '8 Administrators', '35 Teachers', '8GB File space', 'Print Result/Report', 'Export Result/Report'],
    featured: true,
  },
  {
    name: 'Custom',
    price: '₦25000',
    description: 'Suitable for schools with more than 500 students',
    features: ['Unlimited students', 'Unlimited Administrators', 'Unlimited Teachers', '12GB File space', 'Print Result/Report', 'Export Result/Report'],
  },
]

function PricingPage() {
  return (
    <main className="pricing-page">
      <header className="pricing-heading">
        <h1>Pricing Plan</h1>
        <p>Choose a pricing plan to make payment and get a registration token.</p>
      </header>
      <section className="pricing-grid" aria-label="Available pricing plans">
        {pricingPlans.map(({ name, price, description, features, featured }) => (
          <article className={`pricing-card${featured ? ' featured' : ''}`} key={name}>
            <header className="pricing-card-header">
              <h2>{name}</h2>
              <p><strong>{price}</strong> <span>/ month</span></p>
            </header>
            <div className="pricing-card-content">
              <Gem aria-hidden="true" className="pricing-gem" />
              <h3>Features</h3>
              <p className="pricing-description">{description}</p>
              <ul>
                {features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
              <Link className="pricing-choose" to={`/register?plan=${encodeURIComponent(name)}`}>
                Choose
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}

function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0)
  const slide = slides[activeSlide]

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length)
    }, 5000)

    return () => window.clearInterval(intervalId)
  }, [])

  const moveSlide = (direction) => {
    setActiveSlide((current) => (current + direction + slides.length) % slides.length)
  }

  return (
    <main>
      <section className="hero" aria-label="Eduosmosis highlights">
        <img key={slide.image} className="hero-image" src={slide.image} alt={slide.alt} />
        <div className="hero-shade" />
        <button className="hero-arrow hero-arrow-left" type="button" aria-label="Previous slide" onClick={() => moveSlide(-1)}>
          <ChevronLeft aria-hidden="true" />
        </button>
        <div className="hero-caption" aria-live="polite">
          <h1>{slide.heading}</h1>
          <a href="/register">{slide.action}</a>
        </div>
        <button className="hero-arrow hero-arrow-right" type="button" aria-label="Next slide" onClick={() => moveSlide(1)}>
          <ChevronRight aria-hidden="true" />
        </button>
        <div className="hero-indicators" role="group" aria-label="Choose a slide">
          {slides.map(({ heading }, index) => (
            <button
              key={heading}
              className={`hero-indicator${index === activeSlide ? ' active' : ''}`}
              type="button"
              aria-label={`Show slide ${index + 1}`}
              aria-current={index === activeSlide ? 'true' : undefined}
              onClick={() => setActiveSlide(index)}
            />
          ))}
        </div>
      </section>

      <section className="benefits" aria-labelledby="benefits-title">
        <div className="benefits-inner">
          <div className="benefits-intro">
            <p className="benefits-eyebrow">For the love of education</p>
            <h2 id="benefits-title">Why is it so great?</h2>
            <p>Everything students need to learn with confidence, stay curious, and make progress.</p>
          </div>
          <div className="benefit-list">
            {highlights.map(({ title, description, Icon }) => (
              <article className="benefit-item" key={title}>
                <Icon aria-hidden="true" />
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

function AppRoutes() {
  const { pathname } = useLocation()
  const isAuthPage = [
    '/login',
    '/student/login',
    '/parent/login',
    '/admin/dashboard',
    '/teacher/dashboard',
    '/student/dashboard',
    '/parent/dashboard',
  ].includes(pathname)

  return (
    <div className={`app-shell${isAuthPage ? ' auth-shell' : ''}`}>
      {!isAuthPage && <DualNavbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<LoginPage title="Admin/Teacher Login" roles={['platform_admin', 'admin', 'teacher']} />} />
        <Route path="/student/login" element={<LoginPage title="Student Login" roles={['student']} />} />
        <Route path="/parent/login" element={<LoginPage title="Parent Login" roles={['parent']} />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/teacher/dashboard" element={<RoleDashboard role="teacher" />} />
        <Route path="/student/dashboard" element={<RoleDashboard role="student" />} />
        <Route path="/parent/dashboard" element={<RoleDashboard role="parent" />} />
        <Route path="/pricing" element={<Pricing />} />
      </Routes>
      {!isAuthPage && <SiteFooter />}
    </div>
  )
}

function RoleDashboard({ role }) {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  if (!user || user.role !== role) {
    return <Navigate to={`/${role}/login`} replace />
  }

  return (
    <main className="role-dashboard">
      <h1>{role[0].toUpperCase()}{role.slice(1)} dashboard</h1>
      <p>Welcome, {user.firstName}.</p>
      <button
        className="admin-logout"
        type="button"
        onClick={() => {
          logout()
          navigate(`/${role}/login`, { replace: true })
        }}
      >
        Sign out
      </button>
    </main>
  )
}

export default App
