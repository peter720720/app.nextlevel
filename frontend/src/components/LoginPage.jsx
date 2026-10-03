import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, LockKeyhole, UserRound } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'

function LoginPage({ title, roles }) {
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const user = await login(email, password, rememberMe, roles)
      const destination = user.role === 'platform_admin' || user.role === 'admin'
        ? '/admin/dashboard'
        : `/${user.role}/dashboard`
      navigate(destination, { replace: true })
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
        error.message ||
        'Unable to sign in. Please check your details and try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <h1 id="login-title">
          <UserRound aria-hidden="true" />
          {title}
        </h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-field">
            <Mail aria-hidden="true" />
            <span className="visually-hidden">Email address</span>
            <input
              type="email"
              name="email"
              autoComplete="username"
              placeholder="Your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="login-field">
            <LockKeyhole aria-hidden="true" />
            <span className="visually-hidden">Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <div className="login-options">
            <label className="remember-option">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              <span>Remember Me</span>
            </label>
            <a href="mailto:app@idealswift.com?subject=Password%20reset">Forgot password?</a>
          </div>
          {errorMessage && <p className="login-error" role="alert">{errorMessage}</p>}
          <button className="login-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default LoginPage
