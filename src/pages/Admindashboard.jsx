import { useState } from 'react'
import {
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import Sidebar from '../components/Sidebar'
import '../style/Admindashboard.scss'

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

// ─── Data ─────────────────────────────────────────────────────────────────────

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

const deptData = [
  { name: 'Cardiology',    value: 24, color: '#4C9BE8' },
  { name: 'Neurology',     value: 18, color: '#A78BFA' },
  { name: 'Orthopedics',   value: 15, color: '#34D399' },
  { name: 'Dermatology',   value: 20, color: '#FBBF24' },
  { name: 'Pediatrics',    value: 14, color: '#F87171' },
  { name: 'Ophthalmology', value: 9,  color: '#2DD4BF' },
]

const activityFeed = [
  { type: 'new',         text: 'Appointment request — Sarah Mitchell',   time: '2m ago'  },
  { type: 'completed',   text: 'APT-003 completed by Dr. Harrison',      time: '15m ago' },
  { type: 'payment',     text: 'Payment received — Robert Chen $200',    time: '42m ago' },
  { type: 'alert',       text: 'Dr. Harrison unavailable — slot opened', time: '1h ago'  },
  { type: 'rescheduled', text: 'APT-007 moved to Mar 15 at 11:00 AM',   time: '2h ago'  },
]

const moduleCards = [
  {
    title: 'Patients',      href: '/patients',      color: '#A78BFA', bg: '#2D1F52',
    total: '2,847',         totalLabel: 'Registered Patients',
    badge: '+24 this week', badgeUp: true,
    icon: <PatientsIcon />,
    stats: [
      { label: 'New Today',  value: '14',    color: '#4C9BE8' },
      { label: 'Active',     value: '2,104', color: '#34D399' },
      { label: 'Discharged', value: '743',   color: '#94A3B8' },
    ],
  },
  {
    title: 'Doctors',       href: '/doctors',       color: '#4C9BE8', bg: '#1A2F4A',
    total: '48',            totalLabel: 'Medical Staff',
    badge: '+4 this month', badgeUp: true,
    icon: <DoctorsIcon />,
    stats: [
      { label: 'On Duty',     value: '32', color: '#34D399' },
      { label: 'On Leave',    value: '6',  color: '#FBBF24' },
      { label: 'Departments', value: '8',  color: '#4C9BE8' },
    ],
  },
  {
    title: 'Appointments',  href: '/appointments',  color: '#34D399', bg: '#0F3128',
    total: '1,560',         totalLabel: 'This Month',
    badge: '96 today',      badgeUp: true,
    icon: <AppointmentsIcon />,
    stats: [
      { label: 'Confirmed', value: '812', color: '#34D399' },
      { label: 'Pending',   value: '384', color: '#FBBF24' },
      { label: 'Cancelled', value: '364', color: '#F87171' },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Avatar({ initials, color = '#4C9BE8', size = 28 }) {
  return (
    <span className="db-avatar" style={{ background: color, width: size, height: size, fontSize: size * 0.36 }}>
      {initials}
    </span>
  )
}

const activityMeta = {
  new:         { color: '#4C9BE8', icon: <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"/></svg> },
  completed:   { color: '#34D399', icon: <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg> },
  payment:     { color: '#A78BFA', icon: <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/></svg> },
  alert:       { color: '#FBBF24', icon: <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg> },
  rescheduled: { color: '#2DD4BF', icon: <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/></svg> },
}

function ActivityIcon({ type }) {
  const meta = activityMeta[type] || activityMeta.new
  return (
    <span className="act-icon" style={{ background: `${meta.color}18`, color: meta.color }}>
      {meta.icon}
    </span>
  )
}

// ─── Dark Metric Card ─────────────────────────────────────────────────────────
// Icon on the RIGHT, value on the left, trend badge top-right, accent bar bottom

function MetricCard({ label, value, trend, trendUp, sub, color, icon }) {
  return (
    <div className="mc">
      <div className="mc__top">
        <span className={`mc__badge ${trendUp ? 'mc__badge--up' : 'mc__badge--down'}`}>
          {trendUp ? '↑' : '↓'} {trend}
        </span>
        <span className="mc__icon-wrap" style={{ background: `${color}22` }}>
          <span style={{ color }}>{icon}</span>
        </span>
      </div>
      <div className="mc__value">{value}</div>
      <div className="mc__label">{label}</div>
      {sub && <div className="mc__sub">{sub}</div>}
      <div className="mc__bar">
        <div className="mc__bar-fill" style={{ width: trendUp ? '70%' : '34%', background: color }} />
      </div>
    </div>
  )
}

// ─── Module Card ──────────────────────────────────────────────────────────────

function ModuleCard({ title, href, color, bg, total, totalLabel, badge, badgeUp, icon, stats }) {
  return (
    <div className="modc">
      <div className="modc__head">
        <span className="modc__icon" style={{ background: bg, color }}>{icon}</span>
        <span className="modc__title">{title}</span>
        <a href={href} className="modc__cta" style={{ color, border: `1px solid ${color}40`, background: `${color}12` }}>
          Open <ChevronRightIcon />
        </a>
      </div>
      <div className="modc__body">
        <span className="modc__total" style={{ color }}>{total}</span>
        <div className="modc__meta">
          <span className="modc__total-lbl">{totalLabel}</span>
          <span className={`modc__badge ${badgeUp ? 'modc__badge--up' : 'modc__badge--down'}`}>
            {badgeUp ? '↑' : '↓'} {badge}
          </span>
        </div>
      </div>
      <hr className="modc__hr" />
      <div className="modc__stats">
        {stats.map((s, i) => (
          <div key={i} className="modc__stat">
            <span className="modc__stat-dot" style={{ background: s.color }} />
            <span className="modc__stat-val">{s.value}</span>
            <span className="modc__stat-lbl">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Chart Tooltip ────────────────────────────────────────────────────────────

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

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [range, setRange] = useState('Week')
  const chartData = range === 'Month' ? monthlyData : weeklyTrend
  const xKey      = range === 'Month' ? 'month' : 'day'

  return (
    <div className="db-shell">
      <Sidebar active="dashboard" />

      <div className="db-main">

        {/* ── Topbar ────────────────────────────────────────────────── */}
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

        {/* ── Page Header ───────────────────────────────────────────── */}
        <div className="db-page-hdr">
          <div>
            <h1 className="db-page-hdr__title">Dashboard</h1>
            <p className="db-page-hdr__date">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="db-page-hdr__pills">
            <span className="db-live-pill">● SYSTEM NORMAL</span>
            <span className="db-updated">Updated just now</span>
          </div>
        </div>

        {/* ── Scrollable body ───────────────────────────────────────── */}
        <div className="db-body">
          <div className="db-body__left">

            {/* KEY METRICS */}
            <p className="db-eyebrow">KEY METRICS</p>
            <div className="mc-grid">
              <MetricCard label="Total Patients"       value="2,847" trend="12%"   trendUp sub="vs last month"   color="#A78BFA" icon={<PatientsIcon />}      />
              <MetricCard label="Total Doctors"        value="48"    trend="4 new" trendUp sub="this month"      color="#4C9BE8" icon={<DoctorsIcon />}       />
              <MetricCard label="Total Appointments"   value="1,560" trend="18%"   trendUp sub="vs last month"   color="#34D399" icon={<AppointmentsIcon />}  />
              <MetricCard label="Today's Appointments" value="96"    trend="8%"    trendUp sub="vs yesterday"    color="#2DD4BF" icon={<CalTodayIcon />}      />
              <MetricCard label="Completed"            value="1,204" trend="77%"   trendUp sub="completion rate" color="#34D399" icon={<CheckCircleIcon />}   />
              <MetricCard label="Pending"              value="356"   trend="23%"   trendUp={false} sub="of total" color="#FBBF24" icon={<PendingIcon />}     />
            </div>

            {/* ANALYTICS */}
            <p className="db-eyebrow" style={{ marginTop: 28 }}>ANALYTICS</p>
            <div className="db-chart-row">

              {/* Area Chart */}
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
                    <XAxis dataKey={xKey} tick={{ fontSize: 10.5, fill: '#94A3B8', fontFamily: 'Plus Jakarta Sans' }} axisLine={false} tickLine={false} />
                    <YAxis               tick={{ fontSize: 10.5, fill: '#94A3B8', fontFamily: 'Plus Jakarta Sans' }} axisLine={false} tickLine={false} />
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

              {/* Donut */}
              <div className="db-card db-card--fixed">
                <div className="db-card__head">
                  <div>
                    <h2 className="db-card__title">By Department</h2>
                    <p className="db-card__sub">Patient distribution</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={136}>
                  <PieChart>
                    <Pie data={deptData} cx="50%" cy="50%" innerRadius={40} outerRadius={62} paddingAngle={2} dataKey="value">
                      {deptData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip formatter={v => [`${v}%`, 'Share']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="dept-rows">
                  {deptData.map(d => (
                    <div key={d.name} className="dept-row">
                      <span className="dept-row__dot" style={{ background: d.color }} />
                      <span className="dept-row__name">{d.name}</span>
                      <div className="dept-row__track">
                        <div style={{ width: `${d.value * 4}%`, height: '100%', background: d.color, borderRadius: 99 }} />
                      </div>
                      <span className="dept-row__pct">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* MODULE SUMMARY */}
            <p className="db-eyebrow" style={{ marginTop: 28 }}>MODULE SUMMARY</p>
            <div className="modc-grid">
              {moduleCards.map((m, i) => <ModuleCard key={i} {...m} />)}
            </div>

          </div>{/* /left */}

          {/* ── Activity Sidebar ─────────────────────────────────────── */}
          <aside className="db-aside">
            <div className="db-panel">
              <div className="db-panel__head">
                <span className="db-panel__title">ACTIVITY</span>
                <button className="db-panel__link">See all</button>
              </div>
              <ul className="db-activity">
                {activityFeed.map((a, i) => (
                  <li key={i} className="db-activity__item">
                    <ActivityIcon type={a.type} />
                    <div className="db-activity__body">
                      <p className="db-activity__text">{a.text}</p>
                      <span className="db-activity__time">{a.time}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

        </div>{/* /body */}
      </div>{/* /main */}
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function PatientsIcon()     { return <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg> }
function DoctorsIcon()      { return <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg> }
function AppointmentsIcon() { return <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg> }
function CalTodayIcon()     { return <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 9h12v7H4V9zm2 2a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd"/></svg> }
function CheckCircleIcon()  { return <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg> }
function PendingIcon()      { return <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg> }
function SearchIcon()       { return <svg width="13" height="13" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="5.5" stroke="#64748B" strokeWidth="1.6"/><path d="M13 13l3.5 3.5" stroke="#64748B" strokeWidth="1.6" strokeLinecap="round"/></svg> }
function BellIcon()         { return <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg> }
function ChevronRightIcon() { return <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg> }
function ChevronDownIcon()  { return <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/></svg> }