import { useState, useEffect } from 'react'
import { getAdminAppointments, updateAppointmentStatus, deleteAppointment, getAllDoctors, getDepartments } from '../api/api'
import Sidebar from '../components/Sidebar'
import '../style/Adminappointment.scss'

const initialAppointments = []

const statusConfig = {
  accepted: { label: 'Accepted', color: 'green' },
  pending:   { label: 'Pending',   color: 'amber' },
  rejected: { label: 'Rejected', color: 'red'   },
}

const statusOptions = [
  {
    key: 'accepted',
    label: 'Accepted',
    desc: 'Appointment is approved and scheduled',
    bg: '#F0FDF4', border: '#86EFAC', iconBg: '#DCFCE7', iconColor: '#15803D',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    key: 'pending',
    label: 'Pending',
    desc: 'Awaiting confirmation or review',
    bg: '#FFFBEB', border: '#FCD34D', iconBg: '#FEF3C7', iconColor: '#B45309',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    key: 'rejected',
    label: 'Rejected',
    desc: 'Appointment has been rejected',
    bg: '#FFF1F2', border: '#FCA5A5', iconBg: '#FEE2E2', iconColor: '#B91C1C',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
  },
]

const DEPARTMENTS = []
const DOCTORS     = []
const TYPES       = ['Consultation', 'Follow-up', 'Check-up', 'New Patient', 'Surgery Prep', 'Emergency']

const emptyForm = { patient: '', doctor: '', department: '', date: '', time: '', type: '', status: 'pending' }

function generateId(list) {
  const nums = list.map(a => parseInt(a.id.replace('APT-', ''), 10))
  return `APT-${String(Math.max(...nums) + 1).padStart(3, '0')}`
}

export default function AdminAppointment() {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [search, setSearch]             = useState('')
  const [filterStatus, setFilter]       = useState('all')
  const [selected, setSelected]         = useState(null)
  const [doctors, setDoctors]           = useState([])
  const [departments, setDepartments]   = useState([])
  const [loading, setLoading]           = useState(true)

  // New appointment modal
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm]           = useState(emptyForm)
  const [errors, setErrors]       = useState({})

  // Status change modal
  const [statusModal, setStatusModal]   = useState(null)
  const [pickedStatus, setPickedStatus] = useState(null)
  const [statusSaved, setStatusSaved]   = useState(false)
  const [error, setError]               = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null)
        const [appointmentsData, deptData] = await Promise.all([
          getAdminAppointments(),
          getDepartments()
        ])
        
        setAppointments(appointmentsData.map(apt => ({
          id: `APT-${apt.id}`,
          patient: apt.patient_name,
          doctor: apt.doctor_name || apt.doctor_code,
          department: apt.department_name || apt.department_code,
          date: new Date(apt.appointment_date).toLocaleDateString(),
          time: apt.appointment_time_range || new Date(apt.appointment_date).toLocaleTimeString(),
          status: apt.status,
          type: 'Consultation',
          rawId: apt.id
        })))
        
        setDepartments(deptData.map(d => d.name))
        
      } catch (error) {
        console.error('Failed to fetch appointments:', error)
        setError(error.message || 'Failed to load appointments. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // ── derived metrics ──────────────────────────────────────────────────────────
  const accepted = appointments.filter(a => a.status === 'accepted').length
  const pending   = appointments.filter(a => a.status === 'pending').length
  const rejected  = appointments.filter(a => a.status === 'rejected').length
  const total     = appointments.length

  const metrics = [
    { label: "Today's Total",  value: String(total), sub: `${total} total appointments`, badge: '+12%', badgeType: 'up', iconColor: 'blue', bar: 80, barColor: '#4C9BE8',
      icon: <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg> },
    { label: 'Accepted', value: String(accepted), sub: `${total ? Math.round(accepted/total*100) : 0}% of total`, badge: `${total ? Math.round(accepted/total*100) : 0}%`, badgeType: 'up', iconColor: 'green', bar: total ? Math.round(accepted/total*100) : 0, barColor: '#34D399',
      icon: <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> },
    { label: 'Pending', value: String(pending), sub: 'Awaiting confirmation', badge: `${total ? Math.round(pending/total*100) : 0}%`, badgeType: 'down', iconColor: 'amber', bar: total ? Math.round(pending/total*100) : 0, barColor: '#FBBF24',
      icon: <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg> },
    { label: 'Rejected', value: String(rejected), sub: `${total ? Math.round(rejected/total*100) : 0}% of total`, badge: `-${rejected}`, badgeType: 'down', iconColor: 'red', bar: total ? Math.round(rejected/total*100) : 0, barColor: '#F87171',
      icon: <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg> },
  ]

  const filtered = appointments.filter(a => {
    const q = search.toLowerCase()
    return (
      (a.patient.toLowerCase().includes(q) || a.doctor.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)) &&
      (filterStatus === 'all' || a.status === filterStatus)
    )
  })

  // ── new appointment ──────────────────────────────────────────────────────────
  async function openModal() { 
    setForm(emptyForm); 
    setErrors({}); 
    setModalOpen(true);
    
    if (doctors.length === 0) {
      try {
        const doctorsData = await getAllDoctors();
        setDoctors(doctorsData.map(d => d.name));
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
      }
    }
  }
  function closeModal() { setModalOpen(false) }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(ev => ({ ...ev, [name]: '' }))
  }

  function validate() {
    const required = ['patient', 'doctor', 'department', 'date', 'time', 'type']
    const next = {}
    required.forEach(k => { if (!form[k].trim()) next[k] = 'This field is required' })
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    let displayTime = form.time
    if (/^\d{2}:\d{2}$/.test(form.time)) {
      const [h, m] = form.time.split(':').map(Number)
      displayTime = `${String(h % 12 || 12).padStart(2,'0')}:${String(m).padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`
    }
    setAppointments(prev => [{ id: generateId(prev), patient: form.patient.trim(), doctor: form.doctor, department: form.department, date: form.date, time: displayTime, type: form.type, status: form.status }, ...prev])
    closeModal()
  }

  // ── status change ────────────────────────────────────────────────────────────
  function openStatusModal(e, apt) {
    e.stopPropagation()
    setPickedStatus(apt.status)
    setStatusSaved(false)
    setStatusModal({ aptId: apt.id, current: apt.status, patient: apt.patient })
  }

  function closeStatusModal() { setStatusModal(null); setPickedStatus(null); setStatusSaved(false) }

  function confirmStatusChange() {
    if (!pickedStatus || pickedStatus === statusModal.current) { closeStatusModal(); return }
    
    const aptId = parseInt(statusModal.aptId.replace('APT-', ''))
    updateAppointmentStatus(aptId, pickedStatus)
      .then(() => {
        setAppointments(prev => prev.map(a => a.id === statusModal.aptId ? { ...a, status: pickedStatus } : a))
        setStatusSaved(true)
        setTimeout(() => closeStatusModal(), 1400)
      })
      .catch(error => {
        console.error('Failed to update status:', error)
        closeStatusModal()
      })
  }

  function handleDeleteAppointment(apt) {
    if (window.confirm(`Are you sure you want to delete the appointment for ${apt.patient}?`)) {
      const aptId = parseInt(apt.id.replace('APT-', ''))
      deleteAppointment(aptId)
        .then(() => {
          setAppointments(prev => prev.filter(a => a.id !== apt.id))
        })
        .catch(error => {
          console.error('Failed to delete appointment:', error)
          alert('Failed to delete appointment. Please try again.')
        })
    }
  }

  return (
    <div className="ap-shell">
      <Sidebar active="appointments" />

      {loading && (
        <div className="ap-main">
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
            <div style={{ fontSize: '14px', marginTop: '2rem' }}>Loading appointments...</div>
          </div>
        </div>
      )}

      {error && (
        <div className="ap-main">
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
      )}

      {!loading && !error && (
      <div className="ap-main">
        {/* Topbar */}
        <div className="ap-topbar">
          <div className="ap-topbar__crumbs">
            <span className="ap-topbar__crumb ap-topbar__crumb--root">Admin</span>
            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
            <span className="ap-topbar__crumb ap-topbar__crumb--active">Appointments</span>
          </div>
          <div className="ap-topbar__right">
            <div style={{ fontSize: 11, color: '#475569' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="ap-page-hdr">
          <div>
            <div className="ap-page-hdr__title">Appointments</div>
            <div className="ap-page-hdr__sub">Manage and track all scheduled appointments</div>
          </div>
          <div className="ap-page-hdr__actions">
            <button className="ap-btn-primary" onClick={openModal}>
              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
              New Appointment
            </button>
          </div>
        </div>

        <div className="ap-body">
          {/* Metric Cards */}
          <div>
            <p className="ap-eyebrow">Overview</p>
            <div className="ap-mc-grid">
              {metrics.map(m => (
                <div key={m.label} className="ap-mc">
                  <div className="ap-mc__top">
                    <div className={`ap-mc__icon ap-mc__icon--${m.iconColor}`}>{m.icon}</div>
                    <span className={`ap-mc__badge ap-mc__badge--${m.badgeType}`}>{m.badge}</span>
                  </div>
                  <div className="ap-mc__value">{m.value}</div>
                  <div className="ap-mc__label">{m.label}</div>
                  <div className="ap-mc__sub">{m.sub}</div>
                  <div className="ap-mc__bar">
                    <div className="ap-mc__bar-fill" style={{ width: `${m.bar}%`, background: m.barColor }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Table Card */}
          <div className="ap-card">
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div className="ap-searchbox">
                <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                <input placeholder="Search patient, doctor…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="ap-filters">
                {['all', 'accepted', 'pending', 'rejected'].map(s => (
                  <button key={s} className={`ap-filter-btn ${filterStatus === s ? 'ap-filter-btn--on' : ''}`} onClick={() => setFilter(s)}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead>
                  <tr>
                    {/* ── CHANGED: ID → No. ── */}
                    <th>No.</th><th>Patient</th><th>Doctor</th><th>Department</th>
                    <th>Date & Time</th><th>Type</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan="8" className="ap-empty">No appointments found</td></tr>
                  ) : filtered.map((a, index) => {
                    const sc = statusConfig[a.status]
                    return (
                      <tr key={a.id} className={selected === a.id ? 'ap-row--selected' : ''} onClick={() => setSelected(a.id === selected ? null : a.id)}>
                        {/* ── CHANGED: shows row number instead of APT-xxx ── */}
                        <td><span className="ap-id">{index + 1}</span></td>
                        <td>
                          <div className="ap-patient">
                            <div className="ap-avatar">{a.patient.split(' ').map(n => n[0]).join('')}</div>
                            {a.patient}
                          </div>
                        </td>
                        <td className="ap-doctor">{a.doctor}</td>
                        <td><span className="ap-dept">{a.department}</span></td>
                        <td>
                          <div className="ap-datetime">
                            <span className="ap-date">{a.date}</span>
                            <span className="ap-time">{a.time}</span>
                          </div>
                        </td>
                        <td className="ap-type">{a.type}</td>
                        <td>
                          <button
                            className={`ap-loz ap-loz--${sc.color} ap-loz--clickable`}
                            onClick={e => openStatusModal(e, a)}
                            title="Click to change status"
                          >
                            {sc.label}
                            <svg viewBox="0 0 20 20" fill="currentColor" width="10" height="10" style={{ marginLeft: 4, opacity: 0.65 }}>
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </td>
                        <td>
                          <div className="ap-actions">
                            <button 
                              className="ap-action-btn ap-action-btn--edit" 
                              title="Edit Status"
                              onClick={(ev) => { ev.stopPropagation(); openStatusModal(ev, a) }}
                            >
                              <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                            </button>
                            <button 
                              className="ap-action-btn ap-action-btn--delete" 
                              title="Delete"
                              onClick={(ev) => { ev.stopPropagation(); handleDeleteAppointment(a) }}
                            >
                              <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="ap-table-foot">
              <span className="ap-count">Showing {filtered.length} of {appointments.length} appointments</span>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ── Status Change Modal ───────────────────────────────────────────────── */}
      {statusModal && (
        <div className="ap-modal-backdrop" onClick={closeStatusModal}>
          <div className="ap-smodal" onClick={e => e.stopPropagation()}>

            {statusSaved ? (
              <div className="ap-smodal__success">
                <div className="ap-smodal__success-ring">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <div className="ap-smodal__success-title">Status Updated!</div>
                <div className="ap-smodal__success-sub">
                  Changed to <strong>{statusOptions.find(s => s.key === pickedStatus)?.label}</strong>
                </div>
              </div>
            ) : (
              <>
                <div className="ap-smodal__header">
                  <div>
                    <div className="ap-smodal__title">Change Appointment Status</div>
                    <div className="ap-smodal__sub">
                      <span className="ap-smodal__patient">
                        <svg viewBox="0 0 20 20" fill="currentColor" width="11" height="11"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                        {statusModal.patient}
                      </span>
                    </div>
                  </div>
                  <button className="ap-modal__close" onClick={closeStatusModal}>
                    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                <div className="ap-smodal__current">
                  <span className="ap-smodal__current-label">Current status</span>
                  <span className={`ap-loz ap-loz--${statusConfig[statusModal.current].color}`}>
                    {statusConfig[statusModal.current].label}
                  </span>
                </div>

                <div className="ap-smodal__options">
                  {statusOptions.map(opt => {
                    const isSelected = pickedStatus === opt.key
                    const isCurrent  = statusModal.current === opt.key
                    return (
                      <button
                        key={opt.key}
                        className={`ap-sopt ${isSelected ? 'ap-sopt--selected' : ''} ${isCurrent ? 'ap-sopt--current' : ''}`}
                        style={isSelected ? { borderColor: opt.border, background: opt.bg } : {}}
                        onClick={() => setPickedStatus(opt.key)}
                      >
                        <div className="ap-sopt__icon" style={{ background: opt.iconBg, color: opt.iconColor }}>
                          {opt.icon}
                        </div>
                        <div className="ap-sopt__text">
                          <div className="ap-sopt__label">{opt.label}</div>
                          <div className="ap-sopt__desc">{opt.desc}</div>
                          {isCurrent && <span className="ap-sopt__curr-tag">Current</span>}
                        </div>
                        <div
                          className={`ap-sopt__check ${isSelected ? 'ap-sopt__check--on' : ''}`}
                          style={isSelected ? { background: opt.iconColor, borderColor: opt.iconColor } : {}}
                        >
                          {isSelected && (
                            <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="ap-smodal__footer">
                  <button className="ap-btn-ghost" onClick={closeStatusModal}>Cancel</button>
                  <button
                    className="ap-btn-primary"
                    onClick={confirmStatusChange}
                    disabled={!pickedStatus || pickedStatus === statusModal.current}
                    style={{ opacity: (!pickedStatus || pickedStatus === statusModal.current) ? 0.45 : 1, cursor: (!pickedStatus || pickedStatus === statusModal.current) ? 'not-allowed' : 'pointer' }}
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Update Status
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── New Appointment Modal ─────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="ap-modal-backdrop" onClick={closeModal}>
          <div className="ap-modal" onClick={e => e.stopPropagation()}>
            <div className="ap-modal__header">
              <div>
                <div className="ap-modal__title">New Appointment</div>
                <div className="ap-modal__sub">Fill in the details to schedule an appointment</div>
              </div>
              <button className="ap-modal__close" onClick={closeModal}>
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <form className="ap-modal__body" onSubmit={handleSubmit} noValidate>
              <div className="ap-field">
                <label className="ap-field__label">Patient Name <span className="ap-field__req">*</span></label>
                <input className={`ap-field__input ${errors.patient ? 'ap-field__input--err' : ''}`} type="text" name="patient" placeholder="e.g. John Smith" value={form.patient} onChange={handleChange} />
                {errors.patient && <span className="ap-field__err">{errors.patient}</span>}
              </div>
              <div className="ap-field-row">
                <div className="ap-field">
                  <label className="ap-field__label">Doctor <span className="ap-field__req">*</span></label>
                  <select className={`ap-field__input ap-field__select ${errors.doctor ? 'ap-field__input--err' : ''}`} name="doctor" value={form.doctor} onChange={handleChange}>
                    <option value="">Select doctor</option>
                    {DOCTORS.length > 0 ? DOCTORS.map(d => <option key={d} value={d}>{d}</option>) : doctors.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {errors.doctor && <span className="ap-field__err">{errors.doctor}</span>}
                </div>
                <div className="ap-field">
                  <label className="ap-field__label">Department <span className="ap-field__req">*</span></label>
                  <select className={`ap-field__input ap-field__select ${errors.department ? 'ap-field__input--err' : ''}`} name="department" value={form.department} onChange={handleChange}>
                    <option value="">Select department</option>
                    {DEPARTMENTS.length > 0 ? DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>) : departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {errors.department && <span className="ap-field__err">{errors.department}</span>}
                </div>
              </div>
              <div className="ap-field-row">
                <div className="ap-field">
                  <label className="ap-field__label">Date <span className="ap-field__req">*</span></label>
                  <input className={`ap-field__input ${errors.date ? 'ap-field__input--err' : ''}`} type="date" name="date" value={form.date} onChange={handleChange} />
                  {errors.date && <span className="ap-field__err">{errors.date}</span>}
                </div>
                <div className="ap-field">
                  <label className="ap-field__label">Time <span className="ap-field__req">*</span></label>
                  <input className={`ap-field__input ${errors.time ? 'ap-field__input--err' : ''}`} type="time" name="time" value={form.time} onChange={handleChange} />
                  {errors.time && <span className="ap-field__err">{errors.time}</span>}
                </div>
              </div>
              <div className="ap-field-row">
                <div className="ap-field">
                  <label className="ap-field__label">Appointment Type <span className="ap-field__req">*</span></label>
                  <select className={`ap-field__input ap-field__select ${errors.type ? 'ap-field__input--err' : ''}`} name="type" value={form.type} onChange={handleChange}>
                    <option value="">Select type</option>
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.type && <span className="ap-field__err">{errors.type}</span>}
                </div>
                <div className="ap-field">
                  <label className="ap-field__label">Initial Status</label>
                  <select className="ap-field__input ap-field__select" name="status" value={form.status} onChange={handleChange}>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="ap-modal__footer">
                <button type="button" className="ap-btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="ap-btn-primary">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                  Add Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}