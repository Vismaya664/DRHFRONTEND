import { useState, useEffect } from 'react'
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import Sidebar from '../components/Sidebar'
import { getAdminAppointments, getAllDoctors } from '../api/api'
import '../style/Admindashboard.scss'

if (typeof document !== 'undefined') {
  const id = 'plus-jakarta-font'
  if (!document.getElementById(id)) {
    const l = document.createElement('link')
    l.id = id; l.rel = 'stylesheet'
    l.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
    document.head.appendChild(l)
  }
}

const weeklyTrend = [
  { day: 'Mon', appointments: 32, completed: 28, pending: 4  },
  { day: 'Tue', appointments: 45, completed: 40, pending: 5  },
  { day: 'Wed', appointments: 38, completed: 33, pending: 5  },
  { day: 'Thu', appointments: 52, completed: 47, pending: 5  },
  { day: 'Fri', appointments: 61, completed: 54, pending: 7  },
  { day: 'Sat', appointments: 29, completed: 26, pending: 3  },
  { day: 'Sun', appointments: 18, completed: 16, pending: 2  },
]

const monthlyData = [
  { month: 'Oct', appointments: 310, completed: 278, pending: 32 },
  { month: 'Nov', appointments: 345, completed: 307, pending: 38 },
  { month: 'Dec', appointments: 290, completed: 259, pending: 31 },
  { month: 'Jan', appointments: 368, completed: 325, pending: 43 },
  { month: 'Feb', appointments: 402, completed: 358, pending: 44 },
  { month: 'Mar', appointments: 431, completed: 385, pending: 46 },
]

const STATUS_META = {
  accepted: { dot: '#16a34a', ring: '#dcfce7', label: 'Accepted', pill: 'act-pill--accepted' },
  pending:  { dot: '#ca8a04', ring: '#fef9c3', label: 'Pending',  pill: 'act-pill--pending'  },
  rejected: { dot: '#dc2626', ring: '#fee2e2', label: 'Rejected', pill: 'act-pill--rejected'  },
}

function MetricCard({ label, value, sub, color, icon }) {
  return (
    <div className="mc">
      <div className="mc__top">
        <span className="mc__icon-wrap" style={{ background: `${color}22` }}>
          <span style={{ color }}>{icon}</span>
        </span>
      </div>
      <div className="mc__value">{value}</div>
      <div className="mc__label">{label}</div>
      {sub && <div className="mc__sub">{sub}</div>}
      <div className="mc__bar">
        <div className="mc__bar-fill" style={{ width: '70%', background: color }} />
      </div>
    </div>
  )
}

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="ctip">
      <p className="ctip__label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="ctip__row">
          <span className="ctip__dot" style={{ background: p.color }} />
          <span>{p.name}</span>
          <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  )
}

function RecentActivityFeed({ appointments }) {
  return (
    <div className="db-card db-card--fixed">
      <div className="db-card__head">
        <div>
          <h2 className="db-card__title">Recent Activity</h2>
          <p className="db-card__sub">Latest 6 appointments</p>
        </div>
      </div>

      <div className="jira-feed">
        <div className="jira-feed__line" />

        {appointments.length === 0 && (
          <p className="jira-empty">No appointments yet.</p>
        )}

        {appointments.slice(0, 6).map(a => {
          const meta  = STATUS_META[a.status] ?? STATUS_META.pending
          const label = new Date(a.appointment_date).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric',
          })

          return (
            <div key={a.id} className="jira-item">
              <div
                className="jira-item__dot"
                style={{ background: meta.ring, borderColor: meta.dot }}
              >
                <span style={{ background: meta.dot }} />
              </div>

              <div className="jira-item__body">
                <div className="jira-item__row">
                  <span className="jira-item__name">{a.patient_name}</span>
                  <span className="jira-item__date">{label}</span>
                </div>
                <div className="jira-item__row">
                  <span className="jira-item__doctor">Dr. {a.doctor_code}</span>
                  <span className={`act-pill ${meta.pill}`}>{meta.label}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [range, setRange]               = useState('Week')
  const [appointments, setAppointments] = useState([])
  const [doctorCount, setDoctorCount]   = useState(0)

  useEffect(() => {
    getAdminAppointments()
      .then(data => setAppointments(data))
      .catch(err => console.error('Failed to fetch appointments:', err))

    getAllDoctors()
      .then(data => setDoctorCount(data.length))
      .catch(err => console.error('Failed to fetch doctors:', err))
  }, [])

  const chartData = range === 'Month' ? monthlyData : weeklyTrend
  const xKey      = range === 'Month' ? 'month' : 'day'

  const today      = new Date().toDateString()
  const totalApts  = appointments.length
  const confirmed  = appointments.filter(a => a.status === 'accepted').length
  const pending    = appointments.filter(a => a.status === 'pending').length
  const todayCount = appointments.filter(
    a => new Date(a.appointment_date).toDateString() === today
  ).length

  return (
    <div className="db-shell">
      <Sidebar active="dashboard" />

      <div className="db-main">

        <header className="db-topbar">
          <nav className="db-topbar__crumbs">
            <span className="db-crumb db-crumb--root">Hospital System</span>
            <ChevronRightIcon />
            <span className="db-crumb db-crumb--active">Dashboard</span>
          </nav>
          <div className="db-topbar__right">
            <div className="db-searchbox">
              <SearchIcon />
              <input placeholder="Search patients, doctors, appointments…" />
              <kbd>⌘K</kbd>
            </div>
            <button className="db-icon-btn" aria-label="Notifications">
              <BellIcon />
              <span className="db-icon-btn__badge">3</span>
            </button>
            <div className="db-user">
              <ChevronDownIcon />
            </div>
          </div>
        </header>

        <div className="db-page-hdr">
          <div>
            <h1 className="db-page-hdr__title">Dashboard</h1>
            <p className="db-page-hdr__date">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
          </div>
          <div className="db-page-hdr__pills">
            <span className="db-live-pill">● SYSTEM NORMAL</span>
            <span className="db-updated">Updated just now</span>
          </div>
        </div>

        <div className="db-body">
          <div className="db-body__left">

            <p className="db-eyebrow">KEY METRICS</p>
            <div className="mc-grid">
              <MetricCard
                label="Total Doctors"
                value={String(doctorCount)}
                sub="this month"
                color="#4C9BE8"
                icon={<DoctorsIcon />}
              />
              <MetricCard
                label="Total Appointments"
                value={String(totalApts)}
                sub="vs last month"
                color="#34D399"
                icon={<AppointmentsIcon />}
              />
              <MetricCard
                label="Today's Appointments"
                value={String(todayCount)}
                sub="vs yesterday"
                color="#2DD4BF"
                icon={<CalTodayIcon />}
              />
              <MetricCard
                label="Completed"
                value={String(confirmed)}
                sub="completion rate"
                color="#34D399"
                icon={<CheckCircleIcon />}
              />
              <MetricCard
                label="Pending"
                value={String(pending)}
                sub="of total"
                color="#FBBF24"
                icon={<PendingIcon />}
              />
            </div>

            <p className="db-eyebrow" style={{ marginTop: 28 }}>ANALYTICS</p>
            <div className="db-chart-row">

              {/* ── Appointment Trends chart ── */}
              <div className="db-card db-card--grow">
                <div className="db-card__head">
                  <div>
                    <h2 className="db-card__title">Appointment Trends</h2>
                    <p className="db-card__sub">Total · Completed · Pending over time</p>
                  </div>
                  <div className="db-seg">
                    {['Week', 'Month'].map(t => (
                      <button
                        key={t}
                        className={`db-seg__btn ${range === t ? 'db-seg__btn--on' : ''}`}
                        onClick={() => setRange(t)}
                      >{t}</button>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={196}>
                  <AreaChart data={chartData} margin={{ top: 4, right: 2, left: -24, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#4C9BE8" stopOpacity={0.20} />
                        <stop offset="95%" stopColor="#4C9BE8" stopOpacity={0}    />
                      </linearGradient>
                      <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#34D399" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#34D399" stopOpacity={0}    />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 4" stroke="#E2E8F0" />
                    <XAxis
                      dataKey={xKey}
                      tick={{ fontSize: 10.5, fill: '#94A3B8', fontFamily: 'Plus Jakarta Sans' }}
                      axisLine={false} tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10.5, fill: '#94A3B8', fontFamily: 'Plus Jakarta Sans' }}
                      axisLine={false} tickLine={false}
                    />
                    <Tooltip content={<ChartTip />} />
                    <Area type="monotone" dataKey="appointments" stroke="#4C9BE8" strokeWidth={2}   fill="url(#gA)" name="Total"     />
                    <Area type="monotone" dataKey="completed"    stroke="#34D399" strokeWidth={2}   fill="url(#gC)" name="Completed" />
                    <Area type="monotone" dataKey="pending"      stroke="#FBBF24" strokeWidth={1.5} fill="none" strokeDasharray="5 3" name="Pending" />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="db-legend">
                  {[['#4C9BE8','Total'],['#34D399','Completed'],['#FBBF24','Pending']].map(([c,l]) => (
                    <span key={l} className="db-legend__item">
                      <span className="db-legend__swatch" style={{ background: c }} />{l}
                    </span>
                  ))}
                </div>
              </div>

              {/* ── Jira-style Recent Activity Feed ── */}
              <RecentActivityFeed appointments={appointments} />

            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function DoctorsIcon()      { return <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg> }
function AppointmentsIcon() { return <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg> }
function CalTodayIcon()     { return <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 9h12v7H4V9zm2 2a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd"/></svg> }
function CheckCircleIcon()  { return <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg> }
function PendingIcon()      { return <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg> }
function SearchIcon()       { return <svg width="13" height="13" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="5.5" stroke="#64748B" strokeWidth="1.6"/><path d="M13 13l3.5 3.5" stroke="#64748B" strokeWidth="1.6" strokeLinecap="round"/></svg> }
function BellIcon()         { return <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg> }
function ChevronRightIcon() { return <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg> }
function ChevronDownIcon()  { return <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/></svg> }