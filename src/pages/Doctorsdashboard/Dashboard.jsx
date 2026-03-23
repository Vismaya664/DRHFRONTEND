import { useState, useEffect } from "react";
import { getDoctorAppointments } from "../../api/api";
import "../../style/Doctordashboard/Dashboard.scss";
import Doctorssidebar from "../../components/doctorssidebar";

// ══════════════════════════════════════════════════════════════
//  ICONS
// ══════════════════════════════════════════════════════════════
const MailIcon = () => (
  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="16" height="13" rx="2"/>
    <path d="M2 7l8 5 8-5"/>
  </svg>
);
const BellIcon = () => (
  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2C7 2 5.5 4.5 5.5 7v5l-2 2h13l-2-2V7C14.5 4.5 13 2 10 2z"/>
    <path d="M8.5 17a1.5 1.5 0 003 0"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="6.5" cy="6.5" r="4.5"/>
    <path d="M10.5 10.5l3 3"/>
  </svg>
);
const MenuIcon = () => (
  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M3 5h14M3 10h14M3 15h14"/>
  </svg>
);
const PatientIcon = () => (
  <svg width="26" height="26" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="14" cy="9" r="5"/>
    <path d="M4 24c0-5 4.5-8 10-8s10 3 10 8"/>
    <path d="M18 6h3M19.5 4.5v3"/>
  </svg>
);
const TodayPatientIcon = () => (
  <svg width="26" height="26" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="11" cy="9" r="4.5"/>
    <path d="M3 24c0-4.5 3.6-7 8-7s8 2.5 8 7"/>
    <path d="M20 12v6M23 15h-6"/>
  </svg>
);
const ApptIcon = () => (
  <svg width="26" height="26" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="14" cy="14" r="10"/>
    <path d="M14 8v6l4 3"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 7l3.5 3.5L12 3"/>
  </svg>
);
const XIcon = () => (
  <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M2 2l10 10M12 2L2 12"/>
  </svg>
);
const ChatIcon = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.5 8a.75.75 0 01-.75.75H4.5L2 12V2.75A.75.75 0 012.75 2h9a.75.75 0 01.75.75V8z"/>
  </svg>
);
const DocIcon = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="2" y="1" width="10" height="12" rx="1.5"/>
    <path d="M4.5 4.5h5M4.5 7h5M4.5 9.5h3"/>
  </svg>
);
const PhoneIcon = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 2.5A.75.75 0 012.75 2h2l1 3-1.5 1a7 7 0 003 3l1-1.5 3 1v2a.75.75 0 01-.75.75A10 10 0 012 2.5z"/>
  </svg>
);
const ChevLeft = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M9 3L5 7l4 4"/>
  </svg>
);
const ChevRight = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M5 3l4 4-4 4"/>
  </svg>
);

// ══════════════════════════════════════════════════════════════
//  DONUT CHART
// ══════════════════════════════════════════════════════════════
function Donut({ data }) {
  const size = 140, cx = 70, cy = 70, r = 52, sw = 18;
  const circ  = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + d.value, 0);
  let offset  = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.map((d, i) => {
        const dash     = (d.value / total) * circ;
        const gap      = circ - dash;
        const dashOff  = -(offset / total) * circ + circ / 4;
        offset        += d.value;
        return (
          <circle key={i} cx={cx} cy={cy} r={r}
            fill="none" stroke={d.color} strokeWidth={sw}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={dashOff}
          />
        );
      })}
      {/* white center */}
      <circle cx={cx} cy={cy} r={r - sw / 2 - 3} fill="white"/>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════
//  MINI CALENDAR
// ══════════════════════════════════════════════════════════════
function MiniCalendar() {
  const [date, setDate] = useState(new Date(2021, 11, 1)); // Dec 2021
  const TODAY    = 21;
  const APPT_DAYS = [5, 10, 14, 18, 22, 25, 28];

  const y  = date.getFullYear();
  const m  = date.getMonth();
  const heading = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const firstDay    = new Date(y, m, 1).getDay();   // 0=Sun
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  const cells = [];
  // Start from Sunday (0), shift to Sa=0 Su=1 Mo=2 ...
  // Header is Sa Su Mo Tu We Th Fr → offset = (firstDay + 1) % 7
  const offset = (firstDay + 1) % 7;
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="cal-card card">
      <div className="cal-nav">
        <button className="cal-arrow" onClick={() => setDate(new Date(y, m - 1, 1))}><ChevLeft /></button>
        <span className="cal-nav__title">{heading}</span>
        <button className="cal-arrow" onClick={() => setDate(new Date(y, m + 1, 1))}><ChevRight /></button>
      </div>

      <div className="cal-grid">
        <div className="cal-weekdays">
          {["Sa","Su","Mo","Tu","We","Th","Fr"].map(d => <span key={d}>{d}</span>)}
        </div>
        <div className="cal-days">
          {cells.map((d, i) =>
            d === null
              ? <span key={i} className="cal-day cal-day--empty">·</span>
              : <span
                  key={i}
                  className={[
                    "cal-day",
                    d === TODAY              ? "cal-day--today"    : "",
                    APPT_DAYS.includes(d)   ? "cal-day--has-appt" : "",
                  ].join(" ")}
                >{d}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MAIN DASHBOARD
// ══════════════════════════════════════════════════════════════
export default function Dashboard() {
  const [appointmentsData, setAppointmentsData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const doctorCode = localStorage.getItem('doctorCode')
        if (doctorCode) {
          const data = await getDoctorAppointments(doctorCode)
          setAppointmentsData(data)
        }
      } catch (error) {
        console.error('Failed to fetch appointments:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAppointments()
  }, [])

  // ── Stat cards ──────────────────────────────────────────────
  const stats = [
    { label: "Total Patient",      value: "2000+", sub: "Till Today",   Icon: PatientIcon      },
    { label: "Today Patient",      value: "068",   sub: "21 Dec-2021",  Icon: TodayPatientIcon },
    { label: "Today Appointments", value: appointmentsData.length.toString(), sub: new Date().toLocaleDateString(),  Icon: ApptIcon         },
  ];

  // ── Patients Summary donut ───────────────────────────────────
  const summaryData = [
    { name: "New Patients",   value: 45, color: "#CBD5E1" },
    { name: "Old Patients",   value: 60, color: "#F0C040" },
    { name: "Total Patients", value: 95, color: "#1565D8" },
  ];

  // ── Today Appointments table ─────────────────────────────────
  const appointments = appointmentsData.slice(0, 4).map(apt => ({
    initials: apt.patient_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'PA',
    name: apt.patient_name,
    diag: 'Health Checkup',
    time: new Date(apt.appointment_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    type: apt.status === 'confirmed' ? 'upcoming' : 'ongoing'
  }));

  // ── Next patient ─────────────────────────────────────────────
  const next = {
    initials: "SD",
    name:     "Sanath Deo",
    type:     "Health Checkup",
    id:       "0220092620005",
    dob:      "15 January 1989",
    sex:      "Male",
    weight:   "59 Kg",
    lastAppt: "15 Dec - 2021",
    height:   "172 cm",
    regDate:  "10 Dec 2021",
    history:  ["Asthma", "Hypertension", "Fever"],
    phone:    "(305) 555-5192",
  };

  const tagClass = (t) => {
    const map = { Asthma:"asthma", Hypertension:"hypertension", Fever:"fever", Diabetes:"diabetes" };
    return `np-tag np-tag--${map[t] || "default"}`;
  };

  // ── Patients Review bars ─────────────────────────────────────
  const reviews = [
    { label: "Excellent", pct: 76, color: "#1565D8" },
    { label: "Great",     pct: 58, color: "#22C55E" },
    { label: "Good",      pct: 44, color: "#F59E0B" },
    { label: "Average",   pct: 28, color: "#EF4444" },
  ];

  // ── Appointment Requests ─────────────────────────────────────
  const requests = [
    { initials: "MS", name: "Maria Sarafat", type: "Cold"         },
    { initials: "JD", name: "Jhon Deo",      type: "Over Sitting" },
    { initials: "RK", name: "Riya Khan",     type: "Hypertension" },
    { initials: "AP", name: "Alex Patel",    type: "Fever"        },
  ];

  // ════════════════════════════════════════════════════════════
  return (
    <div className="dashboard-layout">
      <Doctorssidebar />

      <div className="dashboard">

        {/* ── HEADER ── */}
        <header className="dash-header">
          <span className="dash-header__title">Dashboard</span>
          <div className="dash-header__right">
            <button className="hdr-icon-btn"><MailIcon /></button>
            <button className="hdr-icon-btn">
              <BellIcon />
              <span className="hdr-notif-dot" />
            </button>
            <div className="hdr-search">
              <SearchIcon />
              <input type="text" placeholder="Search" />
            </div>
            <button className="hdr-icon-btn"><MenuIcon /></button>
          </div>
        </header>

        {/* ── SCROLLABLE BODY ── */}
        <div className="dash-body">

          {/* ════ ROW 1 — STAT CARDS ════ */}
          <div className="stat-row">
            {stats.map((s, i) => (
              <div key={i} className="stat-card" style={{ animationDelay: `${i * 70}ms` }}>
                <div className="stat-card__icon">
                  <s.Icon />
                </div>
                <div className="stat-card__info">
                  <span className="stat-card__label">{s.label}</span>
                  <span className="stat-card__value">{s.value}</span>
                  <span className="stat-card__sub">{s.sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ════ ROW 2 — SUMMARY + APPOINTMENTS + NEXT PATIENT ════ */}
          <div className="mid-row">

            {/* Left — Patients Summary */}
            <div className="summary-card card">
              <p className="summary-month">Patients Summary December 2021</p>
              <div className="donut-wrap">
                <Donut data={summaryData} />
              </div>
              <div className="donut-legend">
                {summaryData.map((d, i) => (
                  <div key={i} className="donut-leg-item">
                    <span className="donut-leg-item__dot" style={{ background: d.color }} />
                    <span className="donut-leg-item__name">{d.name}</span>
                    <span className="donut-leg-item__val">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Center — Today Appointment */}
            <div className="appt-card card">
              <div className="card-header" style={{ marginBottom: 0 }}>
                <span className="card-header__title">Today Appointment</span>
                <button className="see-all-btn">See All</button>
              </div>
              <table className="appt-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Name / Diagnosis</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((a, i) => (
                    <tr key={i}>
                      <td><div className="appt-avatar">{a.initials}</div></td>
                      <td>
                        <div className="appt-name">{a.name}</div>
                        <div className="appt-diag">{a.diag}</div>
                      </td>
                      <td>
                        <span className={`appt-badge appt-badge--${a.type}`}>{a.time}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Right — Next Patient Details */}
            <div className="next-patient-card card">
              <div className="card-header">
                <span className="card-header__title">Next Patient Details</span>
              </div>

              <div className="np-top">
                <div className="np-photo">{next.initials}</div>
                <div className="np-identity">
                  <div className="np-identity__name">{next.name}</div>
                  <div className="np-identity__type">{next.type}</div>
                </div>
                <div className="np-id-block">
                  <div className="np-id-block__label">Patient ID</div>
                  <div className="np-id-block__value">{next.id}</div>
                </div>
              </div>

              <div className="np-grid">
                <div className="np-grid-item">
                  <div className="np-grid-item__label">D.O.B</div>
                  <div className="np-grid-item__val">{next.dob}</div>
                </div>
                <div className="np-grid-item">
                  <div className="np-grid-item__label">Sex</div>
                  <div className="np-grid-item__val">{next.sex}</div>
                </div>
                <div className="np-grid-item">
                  <div className="np-grid-item__label">Weight</div>
                  <div className="np-grid-item__val">{next.weight}</div>
                </div>
                <div className="np-grid-item">
                  <div className="np-grid-item__label">Last Appointment</div>
                  <div className="np-grid-item__val">{next.lastAppt}</div>
                </div>
                <div className="np-grid-item">
                  <div className="np-grid-item__label">Height</div>
                  <div className="np-grid-item__val">{next.height}</div>
                </div>
                <div className="np-grid-item">
                  <div className="np-grid-item__label">Reg. Date</div>
                  <div className="np-grid-item__val">{next.regDate}</div>
                </div>
              </div>

              <div className="np-history">
                <div className="np-history__label">Patient History</div>
                <div className="np-tags">
                  {next.history.map((h, i) => (
                    <span key={i} className={tagClass(h)}>{h}</span>
                  ))}
                </div>
              </div>

              <div className="np-actions">
                <button className="np-btn np-btn--primary">
                  <PhoneIcon /> {next.phone}
                </button>
                <button className="np-btn"><DocIcon /> Document</button>
                <button className="np-btn"><ChatIcon /> Chat</button>
              </div>

              <div className="np-prescriptions">Last Prescriptions</div>
            </div>

          </div>{/* end .mid-row */}

          {/* ════ ROW 3 — REVIEW + REQUESTS + CALENDAR ════ */}
          <div className="bottom-row">

            {/* Left — Patients Review */}
            <div className="review-card card">
              <div className="card-header">
                <span className="card-header__title">Patients Review</span>
              </div>
              <div className="review-list">
                {reviews.map((r, i) => (
                  <div key={i} className="review-item">
                    <span className="review-item__label">{r.label}</span>
                    <div className="review-item__track">
                      <div className="review-item__fill" style={{ width: `${r.pct}%`, background: r.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Center — Appointment Requests */}
            <div className="req-card card">
              <div className="card-header" style={{ marginBottom: 0 }}>
                <span className="card-header__title">Appointment Request</span>
                <button className="see-all-btn">See All</button>
              </div>
              <div className="req-list">
                {requests.map((r, i) => (
                  <div key={i} className="req-item">
                    <div className="req-avatar">{r.initials}</div>
                    <div className="req-info">
                      <div className="req-info__name">{r.name}</div>
                      <div className="req-info__type">{r.type}</div>
                    </div>
                    <div className="req-actions">
                      <button className="req-btn req-btn--accept"><CheckIcon /></button>
                      <button className="req-btn req-btn--reject"><XIcon /></button>
                      <button className="req-btn req-btn--chat"><ChatIcon /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Calendar */}
            <MiniCalendar />

          </div>{/* end .bottom-row */}

        </div>{/* end .dash-body */}
      </div>{/* end .dashboard */}
    </div>
  );
}