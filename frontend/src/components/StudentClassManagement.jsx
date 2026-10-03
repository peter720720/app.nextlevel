import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  FileUp,
  HeartPulse,
  House,
  ListOrdered,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Plus,
  School,
  Stethoscope,
  UserRound,
  X,
} from 'lucide-react'
import axiosInstance from '../api/axiosInstance'

const getTodayDate = () => {
  const today = new Date()
  const offset = today.getTimezoneOffset() * 60000
  return new Date(today.getTime() - offset).toISOString().slice(0, 10)
}

const emptyForm = {
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  password: '',
  parentEmail: '',
  dateOfBirth: '',
  studentNumber: '',
  homeAddress: '',
  stateOfOrigin: '',
  previousSchool: '',
  emergencyContact: '',
  parentTitle: 'Mr',
  parentFullName: '',
  parentPhone: '',
  parentOccupation: '',
  allergies: '',
  medicalRecords: '',
  specialLearningRequirements: '',
}

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    if (character === '"' && quoted && text[index + 1] === '"') {
      field += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === ',' && !quoted) {
      row.push(field.trim())
      field = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && text[index + 1] === '\n') index += 1
      row.push(field.trim())
      if (row.some(Boolean)) rows.push(row)
      row = []
      field = ''
    } else {
      field += character
    }
  }

  row.push(field.trim())
  if (row.some(Boolean)) rows.push(row)
  return rows
}

const datePickerMonths = Array.from({ length: 12 }, (_, month) => (
  new Intl.DateTimeFormat('en', { month: 'long' }).format(new Date(2020, month, 1))
))

function StudentClassManagement({
  className,
  classes,
  canManage,
  onAttendanceViewChange,
  isAttendanceOpen,
}) {
  const [students, setStudents] = useState([])
  const [loadResultFor, setLoadResultFor] = useState('')
  const [loadError, setLoadError] = useState({ className: '', message: '' })
  const [errorMessage, setErrorMessage] = useState('')
  const [message, setMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [entriesPerPage, setEntriesPerPage] = useState(50)
  const [currentPage, setCurrentPage] = useState(1)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isFormRendered, setIsFormRendered] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [datePickerMonth, setDatePickerMonth] = useState(() => new Date().getMonth())
  const [datePickerYear, setDatePickerYear] = useState(() => new Date().getFullYear())
  const [todayCalendarDate] = useState(() => new Date())
  const currentCalendarYear = todayCalendarDate.getFullYear()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showFullDetails, setShowFullDetails] = useState(false)
  const [isPromoting, setIsPromoting] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [destinationClass, setDestinationClass] = useState('')
  const [attendanceDate, setAttendanceDate] = useState(getTodayDate)
  const [attendanceStartedAt, setAttendanceStartedAt] = useState(() => new Date())
  const [attendanceEntries, setAttendanceEntries] = useState([])
  const [loadedAttendanceKey, setLoadedAttendanceKey] = useState('')
  const [isAttendanceSaving, setIsAttendanceSaving] = useState(false)
  const [attendanceMessage, setAttendanceMessage] = useState('')
  const [attendanceError, setAttendanceError] = useState('')

  const isLoading = canManage && loadResultFor !== className
  const attendanceRequestKey = `${className}:${attendanceDate}`
  const isAttendanceLoading = isAttendanceOpen && canManage && loadedAttendanceKey !== attendanceRequestKey
  const loadErrorMessage = loadError.className === className ? loadError.message : ''
  const columnCount = 7 + (isPromoting ? 1 : 0) + (showFullDetails ? 2 : 0)
  const monthStart = new Date(datePickerYear, datePickerMonth, 1)
  const calendarDays = [
    ...Array(monthStart.getDay()).fill(null),
    ...Array.from({ length: new Date(datePickerYear, datePickerMonth + 1, 0).getDate() }, (_, index) => index + 1),
  ]
  const displayedCalendarDate = form.dateOfBirth
    ? new Date(`${form.dateOfBirth}T00:00:00`)
    : new Date(
      datePickerYear,
      datePickerMonth,
      Math.min(todayCalendarDate.getDate(), new Date(datePickerYear, datePickerMonth + 1, 0).getDate()),
    )

  const closeStudentForm = () => {
    setIsDatePickerOpen(false)
    setIsFormOpen(false)
  }

  const toggleStudentForm = () => {
    if (isFormOpen) {
      closeStudentForm()
      return
    }
    setIsFormRendered(true)
    setIsFormOpen(true)
  }

  const selectDateOfBirth = (day) => {
    const month = String(datePickerMonth + 1).padStart(2, '0')
    const date = String(day).padStart(2, '0')
    setForm((current) => ({ ...current, dateOfBirth: `${datePickerYear}-${month}-${date}` }))
    setIsDatePickerOpen(false)
  }

  const selectTodayOfBirth = () => {
    const today = getTodayDate()
    const selectedToday = new Date(`${today}T00:00:00`)
    setForm((current) => ({ ...current, dateOfBirth: today }))
    setDatePickerMonth(selectedToday.getMonth())
    setDatePickerYear(selectedToday.getFullYear())
    setIsDatePickerOpen(false)
  }

  const clearDateOfBirth = () => {
    setForm((current) => ({ ...current, dateOfBirth: '' }))
    setIsDatePickerOpen(false)
  }

  const openDateOfBirthPicker = () => {
    if (isDatePickerOpen) {
      setIsDatePickerOpen(false)
      return
    }

    const selectedDate = form.dateOfBirth ? new Date(`${form.dateOfBirth}T00:00:00`) : new Date()
    setDatePickerMonth(selectedDate.getMonth())
    setDatePickerYear(selectedDate.getFullYear())
    setIsDatePickerOpen(true)
  }

  useEffect(() => {
    if (!canManage) return undefined
    let isCurrent = true

    axiosInstance.get('/admin/students', { params: { className } })
      .then(({ data }) => {
        if (isCurrent) {
          setStudents(data.data)
          setLoadResultFor(className)
          setLoadError({ className: '', message: '' })
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setLoadError({
            className,
            message:
            error.response?.data?.message ||
            error.response?.data?.error ||
            'Unable to load students for this class.'
          })
          setLoadResultFor(className)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [canManage, className])

  useEffect(() => {
    if (!isAttendanceOpen || !canManage) return undefined

    let isCurrent = true
    const requestKey = attendanceRequestKey
    axiosInstance.get('/admin/attendance', { params: { className, date: attendanceDate } })
      .then(({ data }) => {
        if (isCurrent) {
          setAttendanceEntries(data.data)
          setAttendanceError('')
          setAttendanceMessage('')
          setLoadedAttendanceKey(requestKey)
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setAttendanceEntries([])
          setAttendanceError(
            error.response?.data?.message ||
            error.response?.data?.error ||
            'Unable to load attendance for this date.'
          )
          setLoadedAttendanceKey(requestKey)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [attendanceDate, attendanceRequestKey, canManage, className, isAttendanceOpen])

  useEffect(() => {
    if (!isFormRendered) return undefined

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') closeStudentForm()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [isFormRendered])

  useEffect(() => {
    if (!isFormRendered || isFormOpen) return undefined

    const closeTimer = window.setTimeout(() => setIsFormRendered(false), 950)
    return () => window.clearTimeout(closeTimer)
  }, [isFormOpen, isFormRendered])

  const filteredStudents = students.filter((student) => {
    const searchValue = `${student.lastName} ${student.firstName} ${student.middleName || ''} ${student.parentEmail || ''} ${student.email}`.toLowerCase()
    return searchValue.includes(searchTerm.toLowerCase())
  })
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / entriesPerPage))
  const pageStudents = filteredStudents.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage)
  const firstEntry = filteredStudents.length ? (currentPage - 1) * entriesPerPage + 1 : 0
  const lastEntry = Math.min(currentPage * entriesPerPage, filteredStudents.length)
  const displayedError = loadErrorMessage || errorMessage

  const handleCreateStudent = async (event) => {
    event.preventDefault()
    if (!canManage) {
      setErrorMessage('A school must be attached to this account before student accounts can be created.')
      return
    }
    if (!form.dateOfBirth) {
      setErrorMessage('Select the student’s date of birth.')
      setIsDatePickerOpen(true)
      return
    }
    setErrorMessage('')
    setMessage('')
    setIsSubmitting(true)
    try {
      const { data } = await axiosInstance.post('/admin/create-student', { ...form, className })
      setStudents((current) => [...current, data.data].sort((left, right) => left.lastName.localeCompare(right.lastName)))
      setForm(emptyForm)
      closeStudentForm()
      setMessage('Student account created successfully.')
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Unable to create this student account.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveAttendance = async () => {
    setAttendanceError('')
    setAttendanceMessage('')
    if (!attendanceEntries.length || attendanceEntries.some((entry) => !entry.status)) {
      setAttendanceError('Mark every student present or absent before saving.')
      return
    }

    setIsAttendanceSaving(true)
    try {
      const { data } = await axiosInstance.post('/admin/attendance', {
        className,
        date: attendanceDate,
        records: attendanceEntries.map(({ id, status }) => ({ studentId: id, status }))
      })
      setAttendanceMessage(`${data.savedCount} attendance record${data.savedCount === 1 ? '' : 's'} saved for ${attendanceDate}.`)
    } catch (error) {
      setAttendanceError(
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Unable to save attendance.'
      )
    } finally {
      setIsAttendanceSaving(false)
    }
  }

  const handleBatchUpload = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setErrorMessage('')
    setMessage('')
    setIsUploading(true)
    const createdStudents = []
    try {
      const [headerRow, ...records] = parseCsv(await file.text())
      const headers = headerRow.map((header) => header.toLowerCase().replaceAll(' ', ''))
      const requiredHeaders = ['firstname', 'lastname', 'email', 'password']
      if (!headerRow || requiredHeaders.some((header) => !headers.includes(header))) {
        throw new Error('CSV needs firstName, lastName, email, and password columns.')
      }
      if (records.length > 100) {
        throw new Error('Upload no more than 100 student records at a time.')
      }

      for (const record of records) {
        const student = Object.fromEntries(headers.map((header, index) => [header, record[index] || '']))
        const { data } = await axiosInstance.post('/admin/create-student', {
          firstName: student.firstname,
          middleName: student.middlename,
          lastName: student.lastname,
          email: student.email,
          password: student.password,
          parentEmail: student.parentemail,
          dateOfBirth: student.dateofbirth,
          className,
        })
        createdStudents.push(data.data)
      }
      setStudents((current) => [...current, ...createdStudents].sort((left, right) => left.lastName.localeCompare(right.lastName)))
      setMessage(`${createdStudents.length} student account${createdStudents.length === 1 ? '' : 's'} uploaded successfully.`)
    } catch (error) {
      if (createdStudents.length) {
        setStudents((current) => [...current, ...createdStudents].sort((left, right) => left.lastName.localeCompare(right.lastName)))
      }
      setErrorMessage(
        `${createdStudents.length ? `${createdStudents.length} student accounts were created before the upload stopped. ` : ''}${
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Unable to upload the student file.'
        }`
      )
    } finally {
      setIsUploading(false)
    }
  }

  const toggleStudent = (studentId) => {
    setSelectedIds((current) => current.includes(studentId)
      ? current.filter((id) => id !== studentId)
      : [...current, studentId])
  }

  const handlePromote = async () => {
    setErrorMessage('')
    setMessage('')
    try {
      const { data } = await axiosInstance.post('/admin/students/promote', {
        studentIds: selectedIds,
        className: destinationClass,
      })
      setStudents((current) => current.filter((student) => !selectedIds.includes(student._id || student.id)))
      setMessage(`${data.modifiedCount} student${data.modifiedCount === 1 ? '' : 's'} promoted to ${destinationClass}.`)
      setSelectedIds([])
      setIsPromoting(false)
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Unable to promote the selected students.'
      )
    }
  }

  return (
    <section className="student-class-manager" aria-labelledby="student-class-title">
      <div className="student-class-topbar">
        <div className="student-total">
          <span className="student-total-label">Total students in {className}</span>
          <strong>{isLoading ? '—' : students.length}</strong>
        </div>
        <div className="student-class-toolbar">
          {isAttendanceOpen ? (
            <button type="button" className="student-action-details" onClick={() => setShowFullDetails((show) => !show)}>
              {showFullDetails ? 'Hide Full Details' : 'Full Details'}
            </button>
          ) : (
            <>
          <button
            type="button"
            className="student-action-register"
            onClick={() => {
              setAttendanceEntries([])
              setAttendanceError('')
              setAttendanceMessage('')
              setLoadedAttendanceKey('')
              setAttendanceDate(getTodayDate())
              setAttendanceStartedAt(new Date())
              onAttendanceViewChange(true)
            }}
          >
            Class Register
          </button>
          <button
            type="button"
            className="student-primary-action"
            onClick={toggleStudentForm}
          >
            {isFormOpen ? <X aria-hidden="true" /> : <Plus aria-hidden="true" />}
            {isFormOpen ? 'Close Form' : 'Add New Student'}
          </button>
          <label className="student-file-action">
            <FileUp aria-hidden="true" />
            {isUploading ? 'Uploading…' : 'Batch File Upload'}
            <input type="file" accept=".csv,text/csv" onChange={handleBatchUpload} disabled={!canManage || isUploading} />
          </label>
          <button type="button" className="student-action-details" onClick={() => setShowFullDetails((show) => !show)}>
            {showFullDetails ? 'Hide Full Details' : 'Full Details'}
          </button>
          <button type="button" className="student-action-promote" disabled={!canManage} onClick={() => setIsPromoting((promoting) => !promoting)}>
            {isPromoting ? 'Cancel Promotion' : 'Promote Students'}
          </button>
            </>
          )}
        </div>
      </div>

      {!canManage && (
        <p className="student-school-required" role="status">
          A school must be attached to this account before student records can be managed.
        </p>
      )}

      {!isAttendanceOpen && <h1 className="student-table-title" id="student-class-title">Students Table</h1>}

      {isAttendanceOpen ? (
        <>
          <div className="student-attendance-heading">
            <h1>
              Class Register - {new Date(`${attendanceDate}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ (\d{4})$/, ', $1')}
              {' '}
              {attendanceStartedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).toLowerCase().replace(' ', '')}
            </h1>
          </div>
          {!canManage && (
            <p className="student-school-required" role="status">
              A school must be attached to this account before attendance can be managed.
            </p>
          )}
          {attendanceError && <p className="student-class-error" role="alert">{attendanceError}</p>}
          {attendanceMessage && <p className="student-class-message" role="status">{attendanceMessage}</p>}
          <div className="student-table-tools">
            <label className="student-entry-count">
              Show
              <select aria-label="Attendance entries per page" value={entriesPerPage} onChange={(event) => { setEntriesPerPage(Number(event.target.value)); setCurrentPage(1) }}>
                {[10, 25, 50, 100].map((count) => <option key={count} value={count}>{count}</option>)}
              </select>
              entries
            </label>
            <label className="student-search"><span>Search:</span><input aria-label="Search attendance roster" value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setCurrentPage(1) }} /></label>
          </div>
          <div className="student-table-scroll">
            <table className="student-table student-attendance-table">
              <thead>
                <tr>
                  <th scope="col">Last Name</th>
                  <th scope="col">First Name</th>
                  <th scope="col">Middle Name</th>
                  <th scope="col">Present</th>
                  <th scope="col">Absent</th>
                  <th scope="col">Today</th>
                </tr>
              </thead>
              <tbody>
                {isAttendanceLoading ? (
                  <tr><td colSpan="6" className="student-table-empty">Loading attendance…</td></tr>
                ) : pageStudents.length ? pageStudents.map((student) => {
                  const attendance = attendanceEntries.find((entry) => entry.id === (student._id || student.id))
                  return (
                    <tr key={student._id || student.id}>
                      <td>{student.lastName}</td>
                      <td>{student.firstName}</td>
                      <td>{student.middleName || '—'}</td>
                      <td><input type="radio" name={`attendance-${student._id || student.id}`} aria-label={`Mark ${student.firstName} ${student.lastName} present`} checked={attendance?.status === 'present'} disabled={!canManage || isAttendanceLoading} onChange={() => setAttendanceEntries((entries) => entries.map((entry) => entry.id === attendance?.id ? { ...entry, status: 'present' } : entry))} /></td>
                      <td><input type="radio" name={`attendance-${student._id || student.id}`} aria-label={`Mark ${student.firstName} ${student.lastName} absent`} checked={attendance?.status === 'absent'} disabled={!canManage || isAttendanceLoading} onChange={() => setAttendanceEntries((entries) => entries.map((entry) => entry.id === attendance?.id ? { ...entry, status: 'absent' } : entry))} /></td>
                      <td>{new Date(`${attendanceDate}T00:00:00`).toLocaleDateString()}</td>
                    </tr>
                  )
                }) : (
                  <tr><td colSpan="6" className="student-table-empty">
                    {displayedError || attendanceError
                      ? 'Attendance roster could not be loaded.'
                      : canManage
                        ? 'You currently do not have any student in this class.'
                        : 'No students are available until a school is attached to this account.'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="student-table-footer">
            <span>Showing {firstEntry} to {lastEntry} of {filteredStudents.length} entries</span>
            <div className="student-table-pagination" aria-label="Attendance table pages">
              <button type="button" aria-label="Previous page" disabled={currentPage <= 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}><ChevronLeft aria-hidden="true" /></button>
              <span>Page {currentPage} of {totalPages}</span>
              <button type="button" aria-label="Next page" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}><ChevronRight aria-hidden="true" /></button>
            </div>
          </div>
          <div className="student-attendance-save-row">
            <button
              type="button"
              className="student-attendance-save"
              onClick={handleSaveAttendance}
              disabled={!canManage || !attendanceEntries.length || isAttendanceLoading || isAttendanceSaving}
            >
              <Check aria-hidden="true" />{isAttendanceSaving ? 'Saving…' : 'Save Attendance'}
            </button>
          </div>
        </>
      ) : (
      <>

      {isPromoting && (
        <div className="student-promotion-controls">
          <span>{selectedIds.length} selected</span>
          <label>
            Promote to
            <select value={destinationClass} onChange={(event) => setDestinationClass(event.target.value)}>
              <option value="">Select class</option>
              {classes.filter((option) => option !== className).map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <button type="button" disabled={!selectedIds.length || !destinationClass} onClick={handlePromote}>
            Promote selected
          </button>
        </div>
      )}

      {isFormRendered && (
        <div
          className={`student-create-modal-backdrop${isFormOpen ? '' : ' is-closing'}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeStudentForm()
          }}
        >
          <section
            className={`student-create-modal${isFormOpen ? '' : ' is-closing'}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-create-title"
            onAnimationEnd={(event) => {
              if (event.target === event.currentTarget && event.animationName === 'student-create-modal-slide-out') {
                setIsFormRendered(false)
              }
            }}
          >
            <button className="student-create-modal-close" type="button" aria-label="Close student form" onClick={closeStudentForm}>
              <X aria-hidden="true" />
            </button>
            <form className="student-create-form" onSubmit={handleCreateStudent}>
              <header className="student-create-modal-header">
                <h1>Add Student to Class {className}</h1>
              </header>
              <p className="student-create-required-note">All fields are required</p>
              <div className="student-create-modal-columns">
                <section className="student-create-section">
                  <h2 id="student-create-title">Student&apos;s Information</h2>
                  <label className="student-icon-field">
                    <UserRound aria-hidden="true" />
                    <input aria-label="First name" placeholder=" " autoComplete="given-name" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} required />
                    <span className="student-field-label">First Name*</span>
                  </label>
                  <label className="student-icon-field">
                    <UserRound aria-hidden="true" />
                    <input aria-label="Last name" placeholder=" " autoComplete="family-name" value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} required />
                    <span className="student-field-label">Last Name*</span>
                  </label>
                  <label className="student-icon-field">
                    <UserRound aria-hidden="true" />
                    <input aria-label="Middle name" placeholder=" " autoComplete="additional-name" value={form.middleName} onChange={(event) => setForm({ ...form, middleName: event.target.value })} />
                    <span className="student-field-label">Middle Name</span>
                  </label>
                  <label className="student-icon-field">
                    <ListOrdered aria-hidden="true" />
                    <input aria-label="Student number" placeholder=" " autoComplete="off" value={form.studentNumber} onChange={(event) => setForm({ ...form, studentNumber: event.target.value })} required />
                    <span className="student-field-label">Student Number*</span>
                  </label>
                  <div className="student-date-picker-wrap">
                    <button className={`student-icon-field student-date-picker-trigger${form.dateOfBirth || isDatePickerOpen ? ' has-value' : ''}`} type="button" aria-label="Date of birth" aria-expanded={isDatePickerOpen} onClick={openDateOfBirthPicker}>
                      <CalendarDays aria-hidden="true" />
                      <span className="student-date-picker-value">{form.dateOfBirth ? new Intl.DateTimeFormat('en-GB').format(new Date(`${form.dateOfBirth}T00:00:00`)) : ''}</span>
                      <span className="student-field-label">Date of Birth*</span>
                    </button>
                    {isDatePickerOpen && createPortal(
                      <div className="student-date-picker-layer" onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setIsDatePickerOpen(false)
                      }}>
                        <div className="student-date-picker" role="dialog" aria-modal="true" aria-label="Choose date of birth">
                          <div className="student-date-picker-display">
                            <span>{new Intl.DateTimeFormat('en', { weekday: 'short' }).format(displayedCalendarDate)}</span>
                            <strong>{new Intl.DateTimeFormat('en', { month: 'short' }).format(displayedCalendarDate).toUpperCase()}</strong>
                            <b>{displayedCalendarDate.getDate()}</b>
                            <span>{displayedCalendarDate.getFullYear()}</span>
                          </div>
                          <div className="student-date-picker-controls">
                            <button type="button" aria-label="Previous month" onClick={() => {
                              const previous = new Date(datePickerYear, datePickerMonth - 1, 1)
                              setDatePickerMonth(previous.getMonth())
                              setDatePickerYear(previous.getFullYear())
                            }}><ChevronLeft aria-hidden="true" /></button>
                            <select aria-label="Year" value={datePickerYear} onChange={(event) => setDatePickerYear(Number(event.target.value))}>
                              {Array.from({ length: 101 }, (_, index) => currentCalendarYear - index).map((year) => <option key={year} value={year}>{year}</option>)}
                            </select>
                            <select aria-label="Month" value={datePickerMonth} onChange={(event) => setDatePickerMonth(Number(event.target.value))}>
                              {datePickerMonths.map((month, index) => <option key={month} value={index}>{month}</option>)}
                            </select>
                            <button type="button" aria-label="Next month" onClick={() => {
                              const next = new Date(datePickerYear, datePickerMonth + 1, 1)
                              setDatePickerMonth(next.getMonth())
                              setDatePickerYear(next.getFullYear())
                            }}><ChevronRight aria-hidden="true" /></button>
                          </div>
                          <div className="student-date-picker-grid">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span className="student-date-picker-weekday" key={day}>{day}</span>)}
                            {calendarDays.map((day, index) => day ? (
                              <button
                                type="button"
                                className={
                                  form.dateOfBirth === `${datePickerYear}-${String(datePickerMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                                    ? 'selected'
                                    : todayCalendarDate.getFullYear() === datePickerYear
                                      && todayCalendarDate.getMonth() === datePickerMonth
                                      && todayCalendarDate.getDate() === day
                                      ? 'today'
                                      : ''
                                }
                                key={`${datePickerYear}-${datePickerMonth}-${day}`}
                                onClick={() => selectDateOfBirth(day)}
                              >
                                {day}
                              </button>
                            ) : <span key={`blank-${index}`} />)}
                          </div>
                          <div className="student-date-picker-footer">
                            <button type="button" onClick={selectTodayOfBirth}>Today</button>
                            <button type="button" onClick={clearDateOfBirth}>Clear</button>
                            <button type="button" onClick={() => setIsDatePickerOpen(false)}>Close</button>
                          </div>
                        </div>
                      </div>,
                      document.body,
                    )}
                  </div>
                  <label className="student-icon-field">
                    <House aria-hidden="true" />
                    <input aria-label="Home address" placeholder=" " autoComplete="street-address" value={form.homeAddress} onChange={(event) => setForm({ ...form, homeAddress: event.target.value })} required />
                    <span className="student-field-label">Home Address*</span>
                  </label>
                  <label className="student-icon-field">
                    <MapPin aria-hidden="true" />
                    <input aria-label="State of origin" placeholder=" " autoComplete="address-level1" value={form.stateOfOrigin} onChange={(event) => setForm({ ...form, stateOfOrigin: event.target.value })} required />
                    <span className="student-field-label">State of Origin*</span>
                  </label>
                  <label className="student-icon-field">
                    <School aria-hidden="true" />
                    <input aria-label="Previous school attended" placeholder=" " value={form.previousSchool} onChange={(event) => setForm({ ...form, previousSchool: event.target.value })} />
                    <span className="student-field-label">Previous School Attended</span>
                  </label>
                  <label className="student-icon-field">
                    <Phone aria-hidden="true" />
                    <input aria-label="Emergency contact" placeholder=" " type="tel" value={form.emergencyContact} onChange={(event) => setForm({ ...form, emergencyContact: event.target.value })} required />
                    <span className="student-field-label">Emergency Contact*</span>
                  </label>
                  <label className="student-icon-field">
                    <Mail aria-hidden="true" />
                    <input aria-label="Student email" placeholder=" " type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
                    <span className="student-field-label">Student Email*</span>
                  </label>
                  <label className="student-icon-field">
                    <LockKeyhole aria-hidden="true" />
                    <input aria-label="Temporary password" placeholder=" " type="password" autoComplete="new-password" minLength="8" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
                    <span className="student-field-label">Temporary Password*</span>
                  </label>
                </section>
                <section className="student-create-section">
                  <h2>Parent&apos;s Information</h2>
                  <label className="student-icon-field">
                    <UserRound aria-hidden="true" />
                    <select aria-label="Parent title" value={form.parentTitle} onChange={(event) => setForm({ ...form, parentTitle: event.target.value })} required>
                      {['Mr', 'Mrs', 'Chief', 'Others'].map((title) => <option key={title} value={title}>{title}</option>)}
                    </select>
                    <span className="student-field-label">Title</span>
                  </label>
                  <label className="student-icon-field">
                    <UserRound aria-hidden="true" />
                    <input aria-label="Parent's full name" placeholder=" " autoComplete="name" value={form.parentFullName} onChange={(event) => setForm({ ...form, parentFullName: event.target.value })} required />
                    <span className="student-field-label">Parent&apos;s Fullname*</span>
                  </label>
                  <label className="student-icon-field">
                    <Phone aria-hidden="true" />
                    <input aria-label="Parent's phone" placeholder=" " type="tel" autoComplete="tel" value={form.parentPhone} onChange={(event) => setForm({ ...form, parentPhone: event.target.value })} required />
                    <span className="student-field-label">Parent&apos;s Phone*</span>
                  </label>
                  <label className="student-icon-field">
                    <Mail aria-hidden="true" />
                    <input aria-label="Parent email" placeholder=" " type="email" value={form.parentEmail} onChange={(event) => setForm({ ...form, parentEmail: event.target.value })} />
                    <span className="student-field-label">Parent&apos;s Email</span>
                  </label>
                  <label className="student-icon-field">
                    <BriefcaseBusiness aria-hidden="true" />
                    <input aria-label="Parent's occupation" placeholder=" " autoComplete="organization-title" value={form.parentOccupation} onChange={(event) => setForm({ ...form, parentOccupation: event.target.value })} />
                    <span className="student-field-label">Parent&apos;s Occupation</span>
                  </label>
                  <h2 className="student-create-health-heading">Health Information</h2>
                  <label className="student-icon-field student-icon-textarea">
                    <HeartPulse aria-hidden="true" />
                    <textarea aria-label="Allergies or illnesses" placeholder=" " value={form.allergies} onChange={(event) => setForm({ ...form, allergies: event.target.value })} rows="1" />
                    <span className="student-field-label">Allergies or Illnesses</span>
                  </label>
                  <label className="student-icon-field student-icon-textarea">
                    <Stethoscope aria-hidden="true" />
                    <textarea aria-label="Relevant medical records" placeholder=" " value={form.medicalRecords} onChange={(event) => setForm({ ...form, medicalRecords: event.target.value })} rows="1" />
                    <span className="student-field-label">Relevant Medical Records</span>
                  </label>
                  <label className="student-icon-field student-icon-textarea">
                    <Plus aria-hidden="true" />
                    <textarea aria-label="Special learning requirements" placeholder=" " value={form.specialLearningRequirements} onChange={(event) => setForm({ ...form, specialLearningRequirements: event.target.value })} rows="1" />
                    <span className="student-field-label">Special Learning Requirements</span>
                  </label>
                  {!canManage && (
                    <p className="student-school-required" role="status">
                      A school must be attached to this account before student accounts can be created.
                    </p>
                  )}
                  {errorMessage && <p className="student-class-error" role="alert">{errorMessage}</p>}
                </section>
              </div>
              <div className="student-create-modal-footer">
                <button type="button" className="student-create-cancel" onClick={closeStudentForm}>Cancel</button>
                <button className="student-create-submit" type="submit" disabled={!canManage || isSubmitting}>
                  {isSubmitting ? 'Creating account…' : 'Create'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {message && <p className="student-class-message" role="status">{message}</p>}
      {displayedError && !isFormOpen && <p className="student-class-error" role="alert">{displayedError}</p>}

      <div className="student-table-tools">
        <label className="student-entry-count">
          Show
          <select
            aria-label="Entries per page"
            value={entriesPerPage}
            onChange={(event) => {
              setEntriesPerPage(Number(event.target.value))
              setCurrentPage(1)
            }}
          >
            {[10, 25, 50, 100].map((count) => <option key={count} value={count}>{count}</option>)}
          </select>
          entries
        </label>
        <label className="student-search"><span>Search:</span><input aria-label="Search students" value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setCurrentPage(1) }} /></label>
      </div>

      <div className="student-table-scroll">
        <table className="student-table">
          <thead>
            <tr>
              {isPromoting && <th scope="col"><span className="visually-hidden">Select</span></th>}
              <th scope="col">Last Name</th>
              <th scope="col">First Name</th>
              <th scope="col">Middle Name</th>
              <th scope="col">Points</th>
              <th scope="col">Level</th>
              <th scope="col">Parent Email</th>
              <th scope="col">Picture</th>
              {showFullDetails && <><th scope="col">Student Email</th><th scope="col">Created</th></>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={columnCount} className="student-table-empty">Loading students…</td></tr>
            ) : pageStudents.length ? pageStudents.map((student) => {
              const studentId = student._id || student.id
              return (
                <tr key={studentId}>
                  {isPromoting && <td><input aria-label={`Select ${student.firstName} ${student.lastName}`} type="checkbox" checked={selectedIds.includes(studentId)} onChange={() => toggleStudent(studentId)} /></td>}
                  <td>{student.lastName}</td>
                  <td>{student.firstName}</td>
                  <td>{student.middleName || '—'}</td>
                  <td>{student.points ?? 0}</td>
                  <td>{student.level || '—'}</td>
                  <td>{student.parentEmail || '—'}</td>
                  <td>
                    {student.profilePicture
                      ? <img className="student-picture" src={student.profilePicture} alt={`${student.firstName} ${student.lastName}`} />
                      : <span className="student-picture-placeholder"><UserRound aria-hidden="true" /></span>}
                  </td>
                  {showFullDetails && <><td>{student.email}</td><td>{student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '—'}</td></>}
                </tr>
              )
            }) : (
              <tr><td colSpan={columnCount} className="student-table-empty">
                {displayedError
                  ? 'Student records could not be loaded.'
                  : canManage
                    ? 'You currently do not have any student in this class.'
                    : 'No student records are available until a school is attached to this account.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="student-table-footer">
        <span>Showing {firstEntry} to {lastEntry} of {filteredStudents.length} entries</span>
        <div className="student-table-pagination" aria-label="Student table pages">
          <button type="button" aria-label="Previous page" disabled={currentPage <= 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>
            <ChevronLeft aria-hidden="true" />
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button type="button" aria-label="Next page" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>
      </>
      )}
    </section>
  )
}

export default StudentClassManagement
