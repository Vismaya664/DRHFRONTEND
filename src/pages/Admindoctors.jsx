import { useState, useEffect, useRef } from 'react'
import { getAllDoctors, getDoctorCredentials, createDoctorCredentials, updateDoctorCredentials, deleteDoctorCredentials } from '../api/api'
import Sidebar from '../components/Sidebar'
import '../style/Admindoctors.scss'

// ─── Font injection ────────────────────────────────────────────────────────────
if (typeof document !== 'undefined') {
  const id = 'plus-jakarta-font'
  if (!document.getElementById(id)) {
    const l = document.createElement('link')
    l.id = id; l.rel = 'stylesheet'
    l.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
    document.head.appendChild(l)
  }
}

// ─── Mock Doctors - will be replaced with API data ───────────────────────────
const DOCTOR_LIST = []

// ─── API stub ─────────────────────────────────────────────────────────────────
const api = {
  create: async (payload) => ({ ...payload, id: `cred_${Date.now()}` }),
  update: async (payload) => ({ ...payload }),
  remove: async (id)      => ({ id }),
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
const maskPassword  = (p) => '•'.repeat(Math.min(p.length, 10))
const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
const getColor = (index) => {
  const colors = ['#4C9BE8', '#A78BFA', '#34D399', '#FBBF24', '#F87171', '#2DD4BF', '#FB923C', '#60A5FA']
  return colors[index % colors.length]
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ doc, large }) {
  return (
    <span
      className={`dlm-avatar${large ? ' dlm-avatar--lg' : ''}`}
      style={{ background: `${doc.color}22`, color: doc.color }}
    >
      {doc.initials}
    </span>
  )
}

// ─── Login Modal ──────────────────────────────────────────────────────────────
function LoginModal({ doctor, editRow, onSave, onClose }) {
  const [email,       setEmail]       = useState(editRow?.email    ?? '')
  const [currentPassword, setCurrentPassword] = useState(editRow?.actualPassword ?? '')  // Current password for display in edit mode
  const [newPassword, setNewPassword] = useState('')  // New password for editing
  const [showCurrentPwd, setShowCurrentPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [errors,      setErrors]      = useState({})
  const [loading,     setLoading]     = useState(false)
  const [photoFile,   setPhotoFile]   = useState(null)
  const [photoPreview, setPhotoPreview] = useState(editRow?.photo ?? null)
  const [dragOver,    setDragOver]    = useState(false)
  const firstRef   = useRef(null)
  const fileInputRef = useRef(null)
  
  const isEdit = !!editRow

  useEffect(() => { firstRef.current?.focus() }, [])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const validate = () => {
    const e = {}
    if (!email)                     e.email    = 'Email is required'
    else if (!validateEmail(email)) e.email    = 'Enter a valid email address'
    
    // Password validation
    if (!isEdit) {
      // New credentials: password is required
      if (!newPassword)                     e.password = 'Password is required'
      else if (newPassword.length < 6)      e.password = 'Minimum 6 characters'
    } else {
      // Edit mode: password is optional, but if provided must be at least 6 chars
      if (newPassword && newPassword.length < 6) e.password = 'Minimum 6 characters'
    }
    
    return e
  }

  const handlePhotoChange = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file.')
      return
    }
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setPhotoPreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handlePhotoChange(file)
  }

  const handleRemovePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true)
    try {
      const payload = {
        doctor_code: doctor.code,
        username: email.split('@')[0],
        email,
      }
      
      // Only include new password if it was entered (not empty)
      if (newPassword) {
        payload.password = newPassword
      }
      
      if (editRow) {
        await updateDoctorCredentials(doctor.code, payload)
      } else {
        await createDoctorCredentials(payload)
      }
      
      onSave({ 
        ...payload, 
        doctorName: doctor.name, 
        specialty: doctor.department,
        password: newPassword || currentPassword  // Include password for storage
      }, !!editRow)
    } catch (error) {
      setErrors({ email: error.response?.data?.error || 'Failed to save credentials' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dlm-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dlm-modal">

        <div className="dlm-modal__hdr">
          <div className="dlm-modal__hdr-left">
            <Avatar doc={doctor} large />
            <div>
              <p className="dlm-modal__title">{isEdit ? 'Edit Login' : 'Set Login Credentials'}</p>
              <p className="dlm-modal__sub">{doctor.name} · {doctor.specialty}</p>
            </div>
          </div>
          <button className="dlm-modal__close" onClick={onClose} title="Close">
            <CloseIcon />
          </button>
        </div>

        <div className="dlm-modal__body">

          {/* ── Profile Photo Upload ── */}
          <div className="dlm-field">
            <label className="dlm-label">Profile Photo <span className="dlm-optional">(Optional)</span></label>

            {photoPreview ? (
              <div className="dlm-photo-preview">
                <img src={photoPreview} alt="Preview" className="dlm-photo-preview__img" />
                <div className="dlm-photo-preview__info">
                  <p className="dlm-photo-preview__name">
                    {photoFile ? photoFile.name : 'Current photo'}
                  </p>
                  <p className="dlm-photo-preview__size">
                    {photoFile ? `${(photoFile.size / 1024).toFixed(1)} KB` : 'Uploaded'}
                  </p>
                </div>
                <div className="dlm-photo-preview__actions">
                  <button
                    className="dlm-photo-change-btn"
                    onClick={() => fileInputRef.current?.click()}
                    title="Change photo"
                  >
                    <EditIcon /> Change
                  </button>
                  <button
                    className="dlm-photo-remove-btn"
                    onClick={handleRemovePhoto}
                    title="Remove photo"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`dlm-upload-zone${dragOver ? ' dlm-upload-zone--drag' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <span className="dlm-upload-zone__icon">
                  <UploadIcon />
                </span>
                <p className="dlm-upload-zone__title">
                  {dragOver ? 'Drop image here' : 'Click or drag photo here'}
                </p>
                <p className="dlm-upload-zone__sub">PNG, JPG, WEBP</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => handlePhotoChange(e.target.files[0])}
            />
          </div>

          {/* ── Divider ── */}
          <div className="dlm-divider" />

          {/* ── Email ── */}
          <div className="dlm-field">
            <label className="dlm-label">
              Login Email <span className="dlm-required">*</span>
            </label>
            <div className={`dlm-input-wrap${errors.email ? ' dlm-input-wrap--error' : ''}`}>
              <MailIcon />
              <input
                ref={firstRef}
                type="email"
                placeholder="doctor@hospital.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })) }}
                className="dlm-input"
              />
            </div>
            {errors.email && <p className="dlm-err-msg">{errors.email}</p>}
          </div>

          {/* ── Password Fields ── */}
          {isEdit ? (
            <>
              {/* Current Password (display only) */}
              <div className="dlm-field">
                <label className="dlm-label">Current Password</label>
                <div className="dlm-input-wrap">
                  <LockIcon />
                  <input
                    type={showCurrentPwd ? 'text' : 'password'}
                    value={currentPassword}
                    readOnly
                    className="dlm-input"
                    style={{ backgroundColor: '#F1F5F9', cursor: 'not-allowed' }}
                  />
                  <button 
                    className="dlm-eye-btn" 
                    onClick={(e) => { e.preventDefault(); setShowCurrentPwd(v => !v) }}
                    title={showCurrentPwd ? 'Hide password' : 'Show password'}
                    type="button"
                    tabIndex={0}
                  >
                    {showCurrentPwd ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {/* New Password (editable) */}
              <div className="dlm-field">
                <label className="dlm-label">New Password <span style={{ fontSize: '12px', color: '#64748B' }}>(Optional)</span></label>
                <div className={`dlm-input-wrap${errors.password ? ' dlm-input-wrap--error' : ''}`}>
                  <LockIcon />
                  <input
                    type={showNewPwd ? 'text' : 'password'}
                    placeholder="Leave blank to keep current password"
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); setErrors(p => ({ ...p, password: '' })) }}
                    className="dlm-input"
                  />
                  <button 
                    className="dlm-eye-btn" 
                    onClick={(e) => { e.preventDefault(); setShowNewPwd(v => !v) }}
                    title={showNewPwd ? 'Hide password' : 'Show password'}
                    type="button"
                    tabIndex={0}
                  >
                    {showNewPwd ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.password && <p className="dlm-err-msg">{errors.password}</p>}
              </div>
            </>
          ) : (
            /* Create Mode - Single Password Field */
            <div className="dlm-field">
              <label className="dlm-label">
                Password <span className="dlm-required">*</span>
              </label>
              <div className={`dlm-input-wrap${errors.password ? ' dlm-input-wrap--error' : ''}`}>
                <LockIcon />
                <input
                  type={showNewPwd ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); setErrors(p => ({ ...p, password: '' })) }}
                  className="dlm-input"
                />
                <button 
                  className="dlm-eye-btn" 
                  onClick={(e) => { e.preventDefault(); setShowNewPwd(v => !v) }}
                  title={showNewPwd ? 'Hide password' : 'Show password'}
                  type="button"
                  tabIndex={0}
                >
                  {showNewPwd ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && <p className="dlm-err-msg">{errors.password}</p>}
            </div>
          )}

          <div className="dlm-info-box">
            <InfoIcon />
            <p>Credentials will be securely stored. The doctor can change their password on first login.</p>
          </div>

        </div>

        <div className="dlm-modal__footer">
          <button className="dlm-btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="dlm-btn-primary"
            onClick={handleSubmit}
            disabled={loading}
            style={{ opacity: loading ? .7 : 1 }}
          >
            {loading ? <SpinIcon /> : (isEdit ? <SaveIcon /> : <PlusIcon />)}
            {loading ? 'Saving…' : (isEdit ? 'Save Changes' : 'Add Credentials')}
          </button>
        </div>

      </div>
    </div>
  )
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────
function ConfirmModal({ row, onConfirm, onClose }) {
  return (
    <div className="dlm-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dlm-modal dlm-modal--sm">

        <div className="dlm-modal__hdr">
          <p className="dlm-modal__title">Confirm Removal</p>
          <button className="dlm-modal__close" onClick={onClose}><CloseIcon /></button>
        </div>

        <div className="dlm-modal__confirm-body">
          <span className="dlm-modal__confirm-body__emoji">🗑️</span>
          <p>
            Remove login credentials for <strong>{row.doctorName}</strong>?
            <br />This action cannot be undone.
          </p>
        </div>

        <div className="dlm-modal__confirm-footer">
          <button className="dlm-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="dlm-btn-danger" onClick={onConfirm}>Yes, Remove</button>
        </div>

      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDoctorLogin() {
  const [selectedDoc, setSelectedDoc] = useState('')
  const [modalDoc,    setModalDoc]    = useState(null)
  const [editRow,     setEditRow]     = useState(null)
  const [deleteRow,   setDeleteRow]   = useState(null)
  const [rows,        setRows]        = useState([])
  const [doctors,     setDoctors]     = useState([])
  const [search,      setSearch]      = useState('')
  const [toast,       setToast]       = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [visiblePasswords, setVisiblePasswords] = useState(new Set())

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null)
        const [doctorsData, credentialsData] = await Promise.all([
          getAllDoctors(),
          getDoctorCredentials()
        ])
        
        const formattedDoctors = doctorsData.map((d, idx) => ({
          id: d.code,
          code: d.code,
          name: d.name,
          specialty: d.department,
          department: d.department,
          initials: getInitials(d.name),
          color: getColor(idx)
        }))
        
        const formattedCredentials = (credentialsData || []).map(cred => ({
          id: cred.id,
          doctor_code: cred.doctor_code,
          doctorName: cred.doctor_name,
          specialty: cred.department,
          email: cred.email,
          actualPassword: cred.password || '',
          photo: null
        }))
        
        setDoctors(formattedDoctors)
        setRows(formattedCredentials)
      } catch (error) {
        console.error('Failed to fetch data:', error)
        setError(error.message || 'Failed to load doctors. Please try again.')
        showToast('Failed to load data', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const togglePasswordVisibility = (rowId) => {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev)
      if (newSet.has(rowId)) {
        newSet.delete(rowId)
      } else {
        newSet.add(rowId)
      }
      return newSet
    })
  }

  const openAdd = () => {
    if (!selectedDoc) return
    setModalDoc(doctors.find(d => d.id === selectedDoc))
    setEditRow(null)
  }

  const handleSave = (saved, isEdit) => {
    if (isEdit) {
      setRows(prev => prev.map(r => {
        if (r.id === saved.id || r.doctor_code === saved.doctor_code) {
          return {
            ...r,
            email: saved.email,
            doctorName: saved.doctorName || r.doctorName,
            specialty: saved.specialty || r.specialty,
            actualPassword: saved.password || r.actualPassword
          }
        }
        return r
      }))
      showToast('Credentials updated successfully.')
    } else {
      const newRow = {
        id: saved.id || `cred_${Date.now()}`,
        doctor_code: saved.doctor_code,
        doctorName: saved.doctorName,
        specialty: saved.specialty,
        email: saved.email,
        actualPassword: saved.password || '',
        photo: null
      }
      setRows(prev => [...prev, newRow])
      showToast('Login credentials added.')
    }
    setModalDoc(null)
    setEditRow(null)
    setSelectedDoc('')
  }

  const openEdit = (row) => {
    const doc = doctors.find(d => d.code === row.doctor_code)
      || { id: row.doctor_code, code: row.doctor_code, name: row.doctorName, specialty: row.specialty, initials: getInitials(row.doctorName), color: '#4C9BE8' }
    setEditRow(row)
    setModalDoc(doc)
  }

  const handleDelete = async () => {
    try {
      if (deleteRow && deleteRow.doctor_code) {
        await deleteDoctorCredentials(deleteRow.doctor_code)
        setRows(prev => prev.filter(r => r.doctor_code !== deleteRow.doctor_code))
        showToast('Credentials removed successfully', 'success')
      }
    } catch (error) {
      console.error('Failed to delete credentials:', error)
      showToast('Failed to delete credentials', 'error')
    }
    setDeleteRow(null)
  }

  const filtered = rows.filter(r =>
    r.doctorName.toLowerCase().includes(search.toLowerCase()) ||
    r.email.toLowerCase().includes(search.toLowerCase())
  )

  const credentialedIds = new Set(rows.map(r => r.doctor_code))

  if (loading) {
    return (
      <div className="dlm-shell">
        <Sidebar active="doctors" />
        <div className="dlm-main">
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
            <div style={{ fontSize: '14px', marginTop: '2rem' }}>Loading doctors...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dlm-shell">
        <Sidebar active="doctors" />
        <div className="dlm-main">
          <div style={{ padding: '2rem', textAlign: 'center', color: '#DC2626' }}>
            <div style={{ fontSize: '14px', marginTop: '1rem' }}>{error}</div>
            <button 
              onClick={() => window.location.reload()} 
              style={{ marginTop: '1rem', padding: '8px 16px', background: '#DC2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dlm-shell">
      <Sidebar active="doctors" />

      <div className="dlm-main">

        {toast && (
          <div className={`dlm-toast dlm-toast--${toast.type}`}>
            {toast.type === 'error' ? '🗑️' : '✅'} {toast.msg}
          </div>
        )}

        <div className="dlm-topbar">
          <div className="dlm-topbar__crumbs">
            <span className="dlm-topbar__crumb dlm-topbar__crumb--root">Admin</span>
            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="dlm-topbar__crumb dlm-topbar__crumb--active">Doctor Login Management</span>
          </div>
          <div className="dlm-topbar__right">
            <span className="dlm-topbar__date">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="dlm-page-hdr">
          <div>
            <div className="dlm-page-hdr__title">Doctor Login Management</div>
            <div className="dlm-page-hdr__sub">Manage portal access credentials for medical staff</div>
          </div>
          <div className="dlm-badge">
            <KeyIcon /> {rows.length} Active Credential{rows.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="dlm-body">

          <div className="dlm-card">
            <div className="dlm-card-hdr">
              <div className="dlm-card-hdr__left">
                <span className="dlm-card-hdr__icon"><PlusCircleIcon /></span>
                <div>
                  <p className="dlm-card-hdr__title">Assign Credentials</p>
                  <p className="dlm-card-hdr__sub">Select a doctor and set their login details</p>
                </div>
              </div>
            </div>

            <div className="dlm-add-row">
              <div className="dlm-select-wrap">
                <DoctorIcon />
                <select
                  className="dlm-select"
                  value={selectedDoc}
                  onChange={e => setSelectedDoc(e.target.value)}
                >
                  <option value="">— Select a doctor —</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id} disabled={credentialedIds.has(d.id)}>
                      {d.name} · {d.specialty}{credentialedIds.has(d.id) ? ' ✓' : ''}
                    </option>
                  ))}
                </select>
                <span className="dlm-select-chevron"><ChevronDownIcon /></span>
              </div>

              {selectedDoc && (() => {
                const doc = doctors.find(d => d.id === selectedDoc)
                return doc ? (
                  <div className="dlm-preview-chip">
                    <Avatar doc={doc} />
                    <div>
                      <p className="dlm-preview-chip__name">{doc.name}</p>
                      <p className="dlm-preview-chip__meta">{doc.specialty} · {doc.id}</p>
                    </div>
                  </div>
                ) : null
              })()}

              <button
                className="dlm-btn-primary"
                onClick={openAdd}
                disabled={!selectedDoc || credentialedIds.has(selectedDoc)}
              >
                <PlusIcon /> Set Credentials
              </button>
            </div>
          </div>

          <div className="dlm-card">
            <div className="dlm-card-hdr">
              <div className="dlm-card-hdr__left">
                <span className="dlm-card-hdr__icon"><TableIcon /></span>
                <div>
                  <p className="dlm-card-hdr__title">Credentials Registry</p>
                  <p className="dlm-card-hdr__sub">All assigned login records</p>
                </div>
              </div>
              <div className="dlm-search">
                <SearchIcon />
                <input
                  placeholder="Search doctor or email…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="dlm-results-bar">
              Showing <strong>{filtered.length}</strong> of <strong>{rows.length}</strong> records
            </div>

            <div className="dlm-table-wrap">
              <table className="dlm-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Doctor</th>
                    <th>Login Email</th>
                    <th>Password</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="dlm-empty">
                          <span className="dlm-empty__icon">🔐</span>
                          <p className="dlm-empty__title">No credentials assigned yet</p>
                          <p className="dlm-empty__sub">Use the form above to add doctor login access</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((row, idx) => (
                      <tr key={row.id}>
                        <td>{idx + 1}</td>
                        <td>
                          <div className="dlm-table-doc">
                            {row.photo
                              ? <img src={row.photo} alt={row.doctorName} className="dlm-table-doc__photo" />
                              : <Avatar doc={{ initials: row.initials, color: row.color }} />
                            }
                            <div>
                              <p className="dlm-table-doc__name">{row.doctorName}</p>
                              <p className="dlm-table-doc__meta">{row.specialty} · {row.doctorId}</p>
                            </div>
                          </div>
                        </td>
                        <td><span className="dlm-email-badge">{row.email}</span></td>
                        <td>
                          <div className="dlm-pwd-cell">
                            <span className="dlm-pwd-text" style={{ fontFamily: 'monospace', letterSpacing: '2px' }}>
                              {row.actualPassword 
                                ? (visiblePasswords.has(row.id) ? row.actualPassword : maskPassword(row.actualPassword))
                                : '—'
                              }
                            </span>
                            {row.actualPassword && (
                              <button 
                                className="dlm-pwd-eye-btn" 
                                onClick={(e) => { e.preventDefault(); togglePasswordVisibility(row.id) }}
                                type="button"
                                title={visiblePasswords.has(row.id) ? 'Hide password' : 'Show password'}
                                tabIndex={0}
                              >
                                {visiblePasswords.has(row.id) ? <EyeOffIcon /> : <EyeIcon />}
                              </button>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="dlm-table-actions">
                            <button className="dlm-action-btn dlm-action-btn--edit" onClick={() => openEdit(row)}>
                              <EditIcon /> Edit
                            </button>
                            <button className="dlm-action-btn dlm-action-btn--delete" onClick={() => setDeleteRow(row)}>
                              <TrashIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {modalDoc && (
        <LoginModal
          doctor={modalDoc}
          editRow={editRow}
          onSave={handleSave}
          onClose={() => { setModalDoc(null); setEditRow(null) }}
        />
      )}
      {deleteRow && (
        <ConfirmModal
          row={deleteRow}
          onConfirm={handleDelete}
          onClose={() => setDeleteRow(null)}
        />
      )}

    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function PlusIcon()        { return <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg> }
function SearchIcon()      { return <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/></svg> }
function CloseIcon()       { return <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg> }
function EditIcon()        { return <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg> }
function TrashIcon()       { return <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg> }
function MailIcon()        { return <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg> }
function LockIcon()        { return <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg> }
function EyeIcon()         { return <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg> }
function EyeOffIcon()      { return <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/></svg> }
function KeyIcon()         { return <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd"/></svg> }
function DoctorIcon()      { return <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg> }
function ChevronDownIcon() { return <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/></svg> }
function PlusCircleIcon()  { return <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"/></svg> }
function TableIcon()       { return <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm5-4h-5V8h5v2zM9 8H4v2h5V8z" clipRule="evenodd"/></svg> }
function InfoIcon()        { return <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" className="dlm-info-icon"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg> }
function SaveIcon()        { return <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293z"/></svg> }
function SpinIcon()        { return <svg viewBox="0 0 24 24" width="13" height="13" className="dlm-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="40" strokeDashoffset="10"/></svg> }
function UploadIcon()      { return <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg> }