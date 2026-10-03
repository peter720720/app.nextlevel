import { useContext, useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  CreditCard,
  CalendarDays,
  Database,
  FileText,
  Gauge,
  GraduationCap,
  House,
  ImagePlus,
  Mail,
  Menu,
  MessageCircle,
  Moon,
  Package,
  Pencil,
  School,
  Shield,
  UserRound,
  UserRoundCog,
  UsersRound,
  X,
  LogOut,
  List,
} from 'lucide-react'
import axiosInstance from '../api/axiosInstance'
import { AuthContext } from '../context/AuthContext'
import StudentClassManagement from './StudentClassManagement'

const dashboardItems = [
  { label: 'Dashboards', Icon: House },
  { label: 'Teachers/Administrators', Icon: UsersRound },
  { label: 'Students', Icon: GraduationCap, expandable: true },
  { label: 'Class Forums', Icon: School, expandable: true },
  { label: 'Resources/Materials', Icon: BookOpen, expandable: true },
  { label: 'Assignment', Icon: ClipboardList },
  { label: 'Test', Icon: Shield },
  { label: 'Examination', Icon: FileText },
  { label: 'Assignment Results', Icon: FileText, expandable: true },
  { label: 'Exam Results', Icon: FileText, expandable: true },
  { label: 'Test Results', Icon: FileText, expandable: true },
  { label: 'Cumulative Reports', Icon: ClipboardList },
  { label: 'Fees Management', Icon: CreditCard, expandable: true },
  { label: 'SMS', Icon: MessageCircle },
  { label: 'EMAIL', Icon: Mail },
  { label: 'Assets/Inventory Management', Icon: Package, expandable: true },
]

const accountTypes = ['teacher', 'student', 'parent']
const packageDetails = {
  basic: { name: 'Basic Plan', studentLimit: 200 },
  standard: { name: 'Standard Plan', studentLimit: 1000 },
  premium: { name: 'Premium Plan', studentLimit: null },
}

const studentClasses = [
  'Pre-nursery',
  'Nursery 1',
  'Nursery 2',
  'Nursery 3',
  'Primary 1',
  'Primary 2',
  'Primary 3',
  'Primary 4',
  'Primary 5',
  'Primary 6',
  'JSS 1',
  'JSS 2',
  'JSS 3',
  'SS1 - Science',
  'SS1 - Arts',
  'SS1 - Commercial',
  'SS2 - Science',
  'SS2 - Arts',
  'SS2 - Commercial',
  'SS3 - Science',
  'SS3 - Arts',
  'SS3 - Commercial',
]

function AdminDashboard() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [selectedItem, setSelectedItem] = useState('Dashboards')
  const [sectionHistory, setSectionHistory] = useState([])
  const [isClassRegisterOpen, setIsClassRegisterOpen] = useState(false)
  const [isSectionLoading, setIsSectionLoading] = useState(false)
  const sectionLoadingTimer = useRef(null)
  const [selectedAccountType, setSelectedAccountType] = useState('teacher')
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', dateOfBirth: '', className: studentClasses[0] })
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isStudentsExpanded, setIsStudentsExpanded] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false)
  const [copyrightYear] = useState(() => new Date().getFullYear())
  const [statsError, setStatsError] = useState('')
  const [dashboardStats, setDashboardStats] = useState({
    teacherAdminCount: 0,
    studentCount: 0,
    daysLeft: 0,
    usedSpaceMb: 0,
    planPackage: '',
    todayBirthdays: [],
    upcomingBirthdays: [],
  })

  const school = user?.role === 'admin' ? user.school : null
  const isViewingStudentClass = studentClasses.includes(selectedItem)
  const activePackage = packageDetails[dashboardStats.planPackage || school?.planPackage] || null

  useEffect(() => {
    if (!school || selectedItem !== 'Dashboards') return undefined

    let isCurrent = true
    axiosInstance.get('/admin/dashboard-stats')
      .then(({ data }) => {
        if (isCurrent) {
          setDashboardStats(data.data)
          setStatsError('')
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setStatsError(
            error.response?.data?.message ||
            error.response?.data?.error ||
            'Unable to load dashboard statistics.'
          )
        }
      })

    return () => {
      isCurrent = false
    }
  }, [school, selectedItem])

  useEffect(() => () => {
    if (sectionLoadingTimer.current) window.clearTimeout(sectionLoadingTimer.current)
  }, [])

  useEffect(() => {
    if (!isSectionLoading) return undefined

    const favicon = document.querySelector('link[rel~="icon"]')
    if (!favicon) return undefined

    const originalHref = favicon.href
    let angle = 0
    const updateFavicon = () => {
      const spinner = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="none" stroke="#d7e5ff" stroke-width="3"/><path d="M16 4a12 12 0 0 1 12 12" fill="none" stroke="#4285f4" stroke-width="3" stroke-linecap="round" transform="rotate(${angle} 16 16)"/></svg>`
      favicon.href = `data:image/svg+xml,${encodeURIComponent(spinner)}`
      angle = (angle + 24) % 360
    }
    updateFavicon()
    const faviconTimer = window.setInterval(updateFavicon, 120)

    return () => {
      window.clearInterval(faviconTimer)
      favicon.href = originalHref
    }
  }, [isSectionLoading])

  if (!user || !['admin', 'platform_admin'].includes(user.role)) {
    return <Navigate to="/login" replace />
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await axiosInstance.post(`/admin/create-${selectedAccountType}`, form)
      setMessage(`${selectedAccountType[0].toUpperCase()}${selectedAccountType.slice(1)} account created successfully.`)
      setForm({ firstName: '', lastName: '', email: '', password: '', dateOfBirth: '', className: studentClasses[0] })
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Unable to create this account. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const chooseSection = (label) => {
    setIsSectionLoading(true)
    if (sectionLoadingTimer.current) window.clearTimeout(sectionLoadingTimer.current)
    sectionLoadingTimer.current = window.setTimeout(() => {
      if (label !== selectedItem) {
        setSectionHistory((history) => [...history, selectedItem])
      }
      setIsClassRegisterOpen(false)
      setSelectedItem(label)
      setIsSidebarOpen(false)
      setIsSectionLoading(false)
      sectionLoadingTimer.current = null
    }, 4000)
  }

  const goBack = () => {
    if (isViewingStudentClass && isClassRegisterOpen) {
      setIsSectionLoading(true)
      setIsClassRegisterOpen(false)
      if (sectionLoadingTimer.current) window.clearTimeout(sectionLoadingTimer.current)
      sectionLoadingTimer.current = window.setTimeout(() => {
        setIsSectionLoading(false)
        sectionLoadingTimer.current = null
      }, 4000)
      return
    }
    if (!sectionHistory.length) return
    setIsSectionLoading(true)
    if (sectionLoadingTimer.current) window.clearTimeout(sectionLoadingTimer.current)
    sectionLoadingTimer.current = window.setTimeout(() => {
      setSelectedItem(sectionHistory[sectionHistory.length - 1])
      setSectionHistory((history) => history.slice(0, -1))
      setIsSidebarOpen(false)
      setIsSectionLoading(false)
      sectionLoadingTimer.current = null
    }, 4000)
  }

  const openQuickSection = (label) => {
    chooseSection(label)
    if (label === 'Students') setIsStudentsExpanded(true)
    setIsQuickActionsOpen(false)
  }

  const studentUsagePercent = activePackage?.studentLimit
    ? Math.min(100, Math.round(dashboardStats.studentCount / activePackage.studentLimit * 100))
    : 0

  return (
    <main className={`school-dashboard${isDarkMode ? ' school-dashboard-dark' : ''}`}>
      <aside className={`dashboard-sidebar${isSidebarOpen ? ' dashboard-sidebar-open' : ''}`}>
        <Link className="dashboard-school-brand" to="/admin/dashboard" aria-label="Dashboard">
          {school?.logoUrl ? (
            <img src={school.logoUrl} alt={`${school.name || 'School'} logo`} />
          ) : (
            <img src="/Eduosmos.png" alt="Eduosmosis" />
          )}
        </Link>
        <nav className="dashboard-side-nav" aria-label="School management">
          {dashboardItems.map(({ label, Icon, expandable }) => (
            <div className="dashboard-nav-group" key={label}>
              <button
                type="button"
                className={`dashboard-side-link${selectedItem === label || (label === 'Students' && isViewingStudentClass) ? ' selected' : ''}`}
                aria-current={selectedItem === label || (label === 'Students' && isViewingStudentClass) ? 'page' : undefined}
                aria-expanded={label === 'Students' ? isStudentsExpanded : undefined}
                onClick={() => {
                  if (label === 'Students') {
                    setIsStudentsExpanded((expanded) => !expanded)
                    return
                  }
                  chooseSection(label)
                }}
              >
                <Icon aria-hidden="true" />
                <span>{label}</span>
                {expandable && (
                  <ChevronDown
                    className={`dashboard-side-chevron${label === 'Students' && isStudentsExpanded ? ' expanded' : ''}`}
                    aria-hidden="true"
                  />
                )}
              </button>
              {label === 'Students' && isStudentsExpanded && (
                <div className="dashboard-student-classes" aria-label="Student classes">
                  {studentClasses.map((className) => (
                    <button
                      key={className}
                      type="button"
                      className={`dashboard-student-class${selectedItem === className ? ' selected' : ''}`}
                      aria-current={selectedItem === className ? 'page' : undefined}
                      onClick={() => chooseSection(className)}
                    >
                      {className}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>
      {isSidebarOpen && (
        <button
          className="dashboard-sidebar-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="dashboard-workspace">
        <header className="dashboard-topbar">
          <button
            className="dashboard-menu-toggle"
            type="button"
            aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsSidebarOpen((open) => !open)}
          >
            {isSidebarOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
          <span className="dashboard-product-name">Eduosmosis v.2</span>
          <div className="dashboard-top-actions">
            <button className="dashboard-mode-button" type="button" onClick={() => setIsDarkMode((mode) => !mode)}>
              <Moon aria-hidden="true" />
              Change mode
            </button>
            <a href="mailto:app@idealswift.com?subject=Help"><CircleHelp aria-hidden="true" />Help</a>
            <a href="mailto:app@idealswift.com?subject=Support"><MessageCircle aria-hidden="true" />Support</a>
            <details className="dashboard-profile">
              <summary><UserRound aria-hidden="true" />{user.firstName}<ChevronDown aria-hidden="true" /></summary>
              <button type="button" onClick={handleLogout}><LogOut aria-hidden="true" />Sign out</button>
            </details>
          </div>
        </header>

        <section className={`dashboard-content${selectedItem === 'Teachers/Administrators' ? ' dashboard-content-wide' : ''}`}>
          <div className="dashboard-breadcrumb">
            {selectedItem === 'Dashboards' ? (
              <>
                <button type="button" className="dashboard-breadcrumb-link" onClick={() => chooseSection('Dashboards')}>
                  <Menu aria-hidden="true" />
                  <span>Dashboard</span>
                </button>
                <span className="dashboard-breadcrumb-arrow" aria-hidden="true">»</span>
              </>
            ) : (
              <>
                <button type="button" className="dashboard-breadcrumb-link" onClick={() => chooseSection('Dashboards')}>
                  <Menu aria-hidden="true" />
                  <span>Dashboard</span>
                </button>
                <span className="dashboard-breadcrumb-arrow" aria-hidden="true">»</span>
                <button type="button" className="dashboard-breadcrumb-link" onClick={goBack} disabled={!sectionHistory.length}>
                  Back
                </button>
                <span className="dashboard-breadcrumb-arrow" aria-hidden="true">»</span>
              </>
            )}
            {selectedItem !== 'Dashboards' && (
              <span className="dashboard-breadcrumb-current">
                {isViewingStudentClass ? `${selectedItem} Students Page` : selectedItem}
              </span>
            )}
          </div>

          {!isViewingStudentClass && (
            <section className={`dashboard-subscription-notice${school ? '' : ' dashboard-subscription-pending'}`}>
              {school ? (
                <>
                  <p>{school.subscriptionStatus === 'active' ? 'Your school subscription is active.' : 'School subscription information.'}</p>
                  {school.subscriptionExpiresAt && (
                    <p>Subscription expires on {new Date(school.subscriptionExpiresAt).toLocaleDateString()}.</p>
                  )}
                  <span className="dashboard-current-package">
                    {activePackage?.name || school.planPackage || 'Current package'}
                  </span>
                  <Link to="/pricing">Manage plan</Link>
                </>
              ) : (
                <>
                  <p>School subscription details will appear here after a school subscribes.</p>
                  <Link to="/pricing">View pricing plans</Link>
                </>
              )}
            </section>
          )}

          {selectedItem === 'Dashboards' ? (
            <>
              <section className="dashboard-school-card" aria-label="School profile">
                <div className="dashboard-school-logo">
                  {school?.logoUrl ? (
                    <img src={school.logoUrl} alt={`${school.name || 'School'} logo`} />
                  ) : (
                    <div><ImagePlus aria-hidden="true" /><span>School logo</span></div>
                  )}
                </div>
                <div className="dashboard-school-details">
                  <h1>{school?.name || 'School profile'}</h1>
                  <p>{school?.address || 'School name, address, and logo will appear after registration.'}</p>
                  {school?.createdAt && <p>Account created on {new Date(school.createdAt).toLocaleDateString()}.</p>}
                  {school && <button type="button" disabled><Pencil aria-hidden="true" />Edit info</button>}
                </div>
              </section>
              <section className="dashboard-stat-grid" aria-label="School statistics">
                <DashboardStatCard
                  Icon={UsersRound}
                  title="Teachers/Admins"
                  value={dashboardStats.teacherAdminCount}
                  color="blue"
                  usagePercent={0}
                  usageLabel="Used"
                />
                <DashboardStatCard
                  Icon={GraduationCap}
                  title="Students"
                  value={dashboardStats.studentCount}
                  color="amber"
                  usagePercent={studentUsagePercent}
                  usageLabel="Used"
                />
                <DashboardStatCard
                  Icon={CalendarDays}
                  title="Days Left"
                  value={dashboardStats.daysLeft}
                  color="cyan"
                  usagePercent={0}
                  usageLabel="Remaining"
                />
                <DashboardStatCard
                  Icon={Database}
                  title="Used Space"
                  value={`${dashboardStats.usedSpaceMb} MB`}
                  color="red"
                  usagePercent={0}
                  usageLabel="Used"
                />
              </section>
              {statsError && <p className="dashboard-stats-error" role="alert">{statsError}</p>}
              <BirthdayPhotoContainer birthday={dashboardStats.todayBirthdays[0] || dashboardStats.upcomingBirthdays[0]} />
              <BirthdayPanel
                todayBirthdays={dashboardStats.todayBirthdays}
                upcomingBirthdays={dashboardStats.upcomingBirthdays}
                canManage={Boolean(school)}
              />
            </>
          ) : isViewingStudentClass ? (
            <StudentClassManagement
              key={selectedItem}
              className={selectedItem}
              classes={studentClasses}
              canManage={Boolean(school)}
              onAttendanceViewChange={setIsClassRegisterOpen}
              isAttendanceOpen={isClassRegisterOpen}
            />
          ) : selectedItem === 'Teachers/Administrators' ? (
            <TeacherAdminManagement canManage={Boolean(school)} />
          ) : selectedItem === 'Students' ? (
            school ? (
              <section className="account-manager dashboard-account-manager" aria-labelledby="account-manager-title">
                <div className="account-manager-heading">
                  <UserPlusIcon />
                  <div>
                    <h1 id="account-manager-title">Create an account</h1>
                    <p>Create login accounts for your school community.</p>
                  </div>
                </div>
                <div className="account-type-tabs" role="group" aria-label="Account type">
                  {accountTypes.map((type) => (
                    <button
                      key={type}
                      className={selectedAccountType === type ? 'selected' : ''}
                      type="button"
                      aria-pressed={selectedAccountType === type}
                      onClick={() => {
                        setSelectedAccountType(type)
                        setMessage('')
                        setErrorMessage('')
                      }}
                    >
                      {type[0].toUpperCase()}{type.slice(1)}
                    </button>
                  ))}
                </div>
                <form className="account-form" onSubmit={handleSubmit}>
                  <label>First name<input autoComplete="given-name" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} required /></label>
                  <label>Last name<input autoComplete="family-name" value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} required /></label>
                  {selectedAccountType === 'student' && (
                    <label>
                      Class
                      <select value={form.className} onChange={(event) => setForm({ ...form, className: event.target.value })} required>
                        {studentClasses.map((className) => <option key={className} value={className}>{className}</option>)}
                      </select>
                    </label>
                  )}
                  <label>Email<input type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
                  <label>Temporary password<input type="password" autoComplete="new-password" minLength="8" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /></label>
                  <label>Date of birth<input type="date" value={form.dateOfBirth} onChange={(event) => setForm({ ...form, dateOfBirth: event.target.value })} /></label>
                  {message && <p className="account-form-message" role="status">{message}</p>}
                  {errorMessage && <p className="account-form-error" role="alert">{errorMessage}</p>}
                  <button className="account-submit" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating account…' : `Create ${selectedAccountType} account`}
                  </button>
                </form>
              </section>
            ) : (
              <section className="dashboard-section-empty">
                <h1>{selectedItem}</h1>
                <p>These accounts can be managed after a school subscribes and its profile is set up.</p>
              </section>
            )
          ) : (
            <section className="dashboard-section-empty">
              <h1>{selectedItem}</h1>
              <p>This section will be available here.</p>
            </section>
          )}
        </section>
        {selectedItem === 'Dashboards' && (
          <footer className="dashboard-footer">
            © {copyrightYear} Copyright A Product of IdealSwift Technologies
          </footer>
        )}
      </div>

      <div
        className={`dashboard-quick-actions${isQuickActionsOpen ? ' dashboard-quick-actions-open' : ''}`}
        onMouseEnter={() => setIsQuickActionsOpen(true)}
        onMouseLeave={() => setIsQuickActionsOpen(false)}
        onFocus={() => setIsQuickActionsOpen(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setIsQuickActionsOpen(false)
        }}
      >
        <div className="dashboard-quick-action-menu" aria-hidden={!isQuickActionsOpen}>
          <button type="button" className="quick-action-green" aria-label="Open dashboard" title="Dashboard" tabIndex={isQuickActionsOpen ? 0 : -1} onClick={() => openQuickSection('Dashboards')}>
            <Gauge aria-hidden="true" />
          </button>
          <button type="button" className="quick-action-blue" aria-label="Open students" title="Students" tabIndex={isQuickActionsOpen ? 0 : -1} onClick={() => openQuickSection('Students')}>
            <UserRound aria-hidden="true" />
          </button>
          <button type="button" className="quick-action-yellow" aria-label="Open teachers and administrators" title="Teachers/Administrators" tabIndex={isQuickActionsOpen ? 0 : -1} onClick={() => openQuickSection('Teachers/Administrators')}>
            <List aria-hidden="true" />
          </button>
          <button type="button" className="quick-action-exit" aria-label="Sign out" title="Sign out" tabIndex={isQuickActionsOpen ? 0 : -1} onClick={handleLogout}>
            <LogOut aria-hidden="true" />
          </button>
        </div>
        <button
          className="dashboard-quick-action-toggle"
          type="button"
          aria-label={isQuickActionsOpen ? 'Close quick actions' : 'Open quick actions'}
          aria-expanded={isQuickActionsOpen}
          onClick={() => setIsQuickActionsOpen((open) => !open)}
        >
          <Pencil aria-hidden="true" />
        </button>
      </div>
    </main>
  )
}

const emptyTeacherAdminForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  dateOfBirth: '',
  role: 'teacher',
}

function TeacherAdminManagement({ canManage }) {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(canManage)
  const [loadError, setLoadError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [entriesPerPage, setEntriesPerPage] = useState(50)
  const [currentPage, setCurrentPage] = useState(1)
  const [showFullProfile, setShowFullProfile] = useState(false)
  const [isAddFormOpen, setIsAddFormOpen] = useState(false)
  const [newUser, setNewUser] = useState(emptyTeacherAdminForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!canManage) return undefined

    let isCurrent = true
    axiosInstance.get('/admin/teacher-admins')
      .then(({ data }) => {
        if (isCurrent) {
          setUsers(data.data)
          setLoadError('')
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setLoadError(
            error.response?.data?.message ||
            error.response?.data?.error ||
            'Unable to load teachers and administrators.'
          )
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [canManage])

  const filteredUsers = users.filter((account) => (
    `${account.firstName} ${account.middleName || ''} ${account.lastName} ${account.email} ${account.phone || ''} ${account.role}`
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase())
  ))
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / entriesPerPage))
  const pageUsers = filteredUsers.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage)
  const firstEntry = filteredUsers.length ? (currentPage - 1) * entriesPerPage + 1 : 0
  const lastEntry = Math.min(currentPage * entriesPerPage, filteredUsers.length)

  const handleCreateUser = async (event) => {
    event.preventDefault()
    setFormError('')
    setMessage('')
    setIsSubmitting(true)
    try {
      const endpoint = newUser.role === 'admin' ? '/admin/create-admin' : '/admin/create-teacher'
      const { data } = await axiosInstance.post(endpoint, newUser)
      setUsers((current) => [...current, data.data].sort((left, right) => (
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      )))
      setNewUser(emptyTeacherAdminForm)
      setIsAddFormOpen(false)
      setMessage(`${newUser.role === 'admin' ? 'Administrator' : 'Teacher'} account created successfully.`)
      setCurrentPage(1)
    } catch (error) {
      setFormError(
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Unable to create this account.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="teacher-admin-manager" aria-labelledby="teacher-admin-title">
      <div className="teacher-admin-toolbar">
        <div className="teacher-admin-total">
          <span>Total users</span>
          <strong>{isLoading ? '—' : users.length}</strong>
        </div>
        <div className="teacher-admin-actions">
          <button type="button" className="teacher-admin-add" onClick={() => {
            setIsAddFormOpen(true)
            setFormError('')
          }} disabled={!canManage || isLoading}>
            Add New
          </button>
          <button type="button" className="teacher-admin-profile" onClick={() => setShowFullProfile((show) => !show)}>
            {showFullProfile ? 'Hide Profile' : 'Full Profile'}
          </button>
        </div>
      </div>

      {!canManage && (
        <p className="student-school-required teacher-admin-notice" role="status">
          A school must be attached to this account before teacher and administrator accounts can be managed.
        </p>
      )}
      {loadError && <p className="account-form-error teacher-admin-feedback" role="alert">{loadError}</p>}
      {message && <p className="account-form-message teacher-admin-feedback" role="status">{message}</p>}

      <div className="teacher-admin-table-section">
        <h1 id="teacher-admin-title">Users Table</h1>
        <div className="teacher-admin-table-tools">
          <label>
            Show
            <select aria-label="Users per page" value={entriesPerPage} onChange={(event) => {
              setEntriesPerPage(Number(event.target.value))
              setCurrentPage(1)
            }}>
              {[10, 25, 50, 100].map((count) => <option key={count} value={count}>{count}</option>)}
            </select>
            entries
          </label>
          <label className="teacher-admin-search">
            Search:
            <input aria-label="Search teachers and administrators" value={searchTerm} onChange={(event) => {
              setSearchTerm(event.target.value)
              setCurrentPage(1)
            }} />
          </label>
        </div>
        <div className="teacher-admin-table-scroll">
          <table className="teacher-admin-table">
            <thead>
              <tr>
                <th scope="col">Full Name</th>
                <th scope="col">Email</th>
                <th scope="col">Phone No</th>
                <th scope="col">Designation</th>
                <th scope="col">Date Added</th>
                {showFullProfile && <th scope="col">Date of Birth</th>}
                {showFullProfile && <th scope="col">Status</th>}
                <th scope="col">Picture</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td className="teacher-admin-empty" colSpan={6 + (showFullProfile ? 2 : 0)}>Loading users…</td></tr>
              ) : pageUsers.length ? pageUsers.map((account) => (
                <tr key={account._id}>
                  <td>{[account.firstName, account.middleName, account.lastName].filter(Boolean).join(' ')}</td>
                  <td>{account.email}</td>
                  <td>{account.phone || '—'}</td>
                  <td>{account.role === 'admin' ? 'Administrator' : 'Teacher'}</td>
                  <td>{account.createdAt ? new Date(account.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                  {showFullProfile && <td>{account.dateOfBirth ? new Date(account.dateOfBirth).toLocaleDateString('en-GB') : '—'}</td>}
                  {showFullProfile && <td>{account.isActive ? 'Active' : 'Inactive'}</td>}
                  <td>
                    {account.profilePicture
                      ? <img className="teacher-admin-avatar" src={account.profilePicture} alt={`${account.firstName} ${account.lastName}`} />
                      : <span className="teacher-admin-avatar-fallback" aria-label={`${account.firstName} ${account.lastName} profile`}>{account.firstName?.[0]}{account.lastName?.[0]}</span>}
                  </td>
                </tr>
              )) : (
                <tr><td className="teacher-admin-empty" colSpan={6 + (showFullProfile ? 2 : 0)}>
                  {loadError ? 'Users could not be loaded.' : searchTerm ? 'No users match your search.' : 'No teachers or administrators have been added yet.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="teacher-admin-table-footer">
          <span>Showing {firstEntry} to {lastEntry} of {filteredUsers.length} entries</span>
          <div className="teacher-admin-pagination" aria-label="Users table pages">
            <button type="button" aria-label="Previous page" disabled={currentPage <= 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>‹</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button type="button" aria-label="Next page" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>›</button>
          </div>
        </div>
      </div>

      {isAddFormOpen && (
        <div className="teacher-admin-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setIsAddFormOpen(false)
        }}>
          <section className="teacher-admin-modal" role="dialog" aria-modal="true" aria-labelledby="teacher-admin-form-title">
            <header>
              <h2 id="teacher-admin-form-title">Add Teacher or Administrator</h2>
              <button type="button" aria-label="Close form" onClick={() => setIsAddFormOpen(false)}><X aria-hidden="true" /></button>
            </header>
            <form className="account-form" onSubmit={handleCreateUser}>
              <label>Account type
                <select value={newUser.role} onChange={(event) => setNewUser({ ...newUser, role: event.target.value })}>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Administrator</option>
                </select>
              </label>
              <label>First name<input autoComplete="given-name" value={newUser.firstName} onChange={(event) => setNewUser({ ...newUser, firstName: event.target.value })} required /></label>
              <label>Last name<input autoComplete="family-name" value={newUser.lastName} onChange={(event) => setNewUser({ ...newUser, lastName: event.target.value })} required /></label>
              <label>Email<input type="email" autoComplete="email" value={newUser.email} onChange={(event) => setNewUser({ ...newUser, email: event.target.value })} required /></label>
              <label>Phone number<input type="tel" autoComplete="tel" value={newUser.phone} onChange={(event) => setNewUser({ ...newUser, phone: event.target.value })} /></label>
              <label>Date of birth<input type="date" value={newUser.dateOfBirth} onChange={(event) => setNewUser({ ...newUser, dateOfBirth: event.target.value })} /></label>
              <label>Temporary password<input type="password" autoComplete="new-password" minLength="8" value={newUser.password} onChange={(event) => setNewUser({ ...newUser, password: event.target.value })} required /></label>
              {formError && <p className="account-form-error" role="alert">{formError}</p>}
              <div className="teacher-admin-form-actions">
                <button type="button" onClick={() => setIsAddFormOpen(false)}>Cancel</button>
                <button className="account-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating…' : 'Create account'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  )
}

function DashboardStatCard({ Icon, title, value, color, usagePercent, usageLabel }) {
  return (
    <article className={`dashboard-stat-card dashboard-stat-${color}`}>
      <div className="dashboard-stat-main">
        <span className="dashboard-stat-icon"><Icon aria-hidden="true" /></span>
        <div className="dashboard-stat-copy">
          <strong>{value}</strong>
          <span>{title}</span>
        </div>
      </div>
      <div className="dashboard-stat-track" aria-hidden="true">
        <span style={{ width: `${usagePercent}%` }} />
      </div>
      <p className="dashboard-stat-usage">{usageLabel} {usagePercent}%</p>
    </article>
  )
}

function BirthdayPhotoContainer({ birthday }) {
  return (
    <section className="dashboard-birthday-photo-container" aria-label="Birthday photo">
      {birthday?.profilePicture && (
        <img
          src={birthday.profilePicture}
          alt={`${birthday.firstName} ${birthday.lastName} celebrating a birthday`}
        />
      )}
    </section>
  )
}

function BirthdayPanel({ todayBirthdays, upcomingBirthdays, canManage }) {
  const birthdays = [...todayBirthdays, ...upcomingBirthdays]
  const dateFormatter = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <section className="dashboard-birthday-panel" aria-labelledby="dashboard-birthday-title">
      <h2 id="dashboard-birthday-title">Today&apos;s and Upcoming Birthdays</h2>
      {todayBirthdays.length === 0 ? (
        <p className="dashboard-birthday-empty">No Birthdays Today</p>
      ) : null}
      <div className="dashboard-birthday-table-scroll">
        <table className="dashboard-birthday-table">
          <thead>
            <tr>
              <th scope="col">Full Name</th>
              <th scope="col">Email/Student&apos;s Class</th>
              <th scope="col">Phone/Parent&apos;s</th>
              <th scope="col">Designation</th>
              <th scope="col">Date</th>
              <th scope="col">Avatar</th>
            </tr>
          </thead>
          <tbody>
            {birthdays.length ? birthdays.map((person) => (
              <tr key={person.id}>
                <td>{[person.firstName, person.middleName, person.lastName].filter(Boolean).join(' ')}</td>
                <td>{person.role === 'student' ? person.className : person.email}</td>
                <td>{person.phone || person.parentEmail || '—'}</td>
                <td>{person.role[0].toUpperCase() + person.role.slice(1)}</td>
                <td>{dateFormatter.format(new Date(person.dateOfBirth))}</td>
                <td>
                  {person.profilePicture
                    ? <img className="dashboard-birthday-avatar" src={person.profilePicture} alt={`${person.firstName} ${person.lastName}`} />
                    : <span className="dashboard-birthday-avatar dashboard-birthday-avatar-empty" aria-label="No profile picture" />}
                </td>
              </tr>
            )) : (
              <tr>
                <td className="dashboard-birthday-no-upcoming" colSpan="6">
                  {canManage ? 'No upcoming birthdays in the next 30 days.' : 'No birthday records available.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function UserPlusIcon() {
  return <UserRoundCog aria-hidden="true" />
}

export default AdminDashboard
