import { useState, useEffect } from "react";
import { getDoctorAppointments } from "../../api/api";
import "../../style/Doctordashboard/Dashboard.scss";
import Doctorssidebar from "../../components/doctorssidebar";

// ── SVG Icons ────────────────────────────────────────────────
const Ico = ({ d, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {typeof d === "string" ? <path d={d} /> : d}
  </svg>
);

const IC = {
  search:      <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></>,
  bell:        <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></>,
  mail:        <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 7l10 7 10-7" /></>,
  cal:         <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  chevron:     <path d="M9 18l6-6-6-6" />,
  chevronDown: <path d="M6 9l6 6 6-6" />,
  activity:    <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></>,
  users:       <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></>,
};

// Avatar colours
const AVATAR_COLORS = [
  "linear-gradient(135deg,#00D4C8,#0099BB)",
  "linear-gradient(135deg,#F5A623,#E08A10)",
  "linear-gradient(135deg,#10D98C,#0AAD6E)",
  "linear-gradient(135deg,#F25C54,#C93F38)",
  "linear-gradient(135deg,#818CF8,#6366F1)",
];
const avatarColor = (name = "") =>
  AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];

// ── Static fallback activity ──────────────────────────────────
const STATIC_ACTIVITY = [
  { patient: "Sajith Kumar",  doctor: "Dr. 004", date: "Mar 17", status: "accepted" },
  { patient: "Amal Raj",      doctor: "Dr. 004", date: "Mar 18", status: "accepted" },
  { patient: "Sree Latha",    doctor: "Dr. 004", date: "Mar 24", status: "accepted" },
  { patient: "Mohammed Ali",  doctor: "Dr. 004", date: "Mar 25", status: "pending"  },
  { patient: "Priya Nair",    doctor: "Dr. 004", date: "Mar 25", status: "pending"  },
];

// ── Component ─────────────────────────────────────────────────
export default function Dashboard() {
  const [appointmentsData, setAppointmentsData] = useState([]);
  const [loading, setLoading]                   = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const doctorCode = localStorage.getItem("doctorCode");
        if (doctorCode) {
          const data = await getDoctorAppointments(doctorCode);
          setAppointmentsData(data);
        }
      } catch (e) {
        console.error("Failed to fetch appointments:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const totalAppointments = appointmentsData.length;

  const tableRows = appointmentsData.slice(0, 10).map((apt, i) => ({
    id:       `APT-${String(i + 1).padStart(4, "0")}`,
    initials: apt.patient_name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "PA",
    name:     apt.patient_name,
    diag:     "Health Checkup",
    time:     new Date(apt.appointment_date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  }));

  const activityRows = appointmentsData.length > 0
    ? appointmentsData.slice(0, 6).map((apt) => ({
        patient: apt.patient_name || "Patient",
        doctor:  `Dr. ${apt.doctor_code || "—"}`,
        date:    new Date(apt.appointment_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        status:  apt.status === "confirmed" ? "accepted" : apt.status || "pending",
      }))
    : STATIC_ACTIVITY;

  return (
    <div className="dsh-layout">
      <Doctorssidebar />

      <div className="dsh-main">

        {/* ── TOPBAR ─────────────────────────────────────────── */}
        <header className="dsh-topbar">
          <div className="dsh-topbar-left">
            <div className="dsh-topbar-icon">
              <Ico d={IC.cal} size={17} />
            </div>
            <div className="dsh-topbar-text">
              <span className="dsh-topbar-title">DOCTOR PORTAL</span>
              <span className="dsh-topbar-date">{today}</span>
            </div>
          </div>

          <div className="dsh-topbar-right">
            <div className="dsh-status-pill">
              <span className="dsh-status-dot" />
              ONLINE
            </div>
            <button className="dsh-icon-btn"><Ico d={IC.mail} /></button>
            <button className="dsh-icon-btn">
              <Ico d={IC.bell} />
              <span className="dsh-notif-dot" />
            </button>
            <button className="dsh-icon-btn"><Ico d={IC.search} /></button>
          </div>
        </header>

        {/* ── BODY ───────────────────────────────────────────── */}
        <div className="dsh-body">

          {/* HERO ROW */}
          <div className="dsh-hero">
            <div className="dsh-stat-wrap">
              <div className="dsh-stat-card">
                <div className="dsh-stat-card__top">
                  <div className="dsh-stat-card__icon">
                    <Ico d={IC.cal} size={17} />
                  </div>
                  {/* <span className="dsh-stat-card__badge">+8%</span> */}
                </div>
                <div className="dsh-stat-card__value">
                  {loading ? "—" : totalAppointments || 3}
                </div>
                <div className="dsh-stat-card__label">Total Appointments</div>
              </div>
            </div>

            <div className="dsh-appt-hero">
              <div className="dsh-appt-hero-title">
                Today's Schedule
                <span>/ {loading ? "—" : tableRows.length} visits</span>
              </div>
            </div>
          </div>

          {/* MAIN GRID */}
          <div className="dsh-grid">

            {/* APPOINTMENTS TABLE */}
            <div className="dsh-appt-card">
              <div className="dsh-card-hd">
                <Ico d={IC.users} size={14} />
                <span className="dsh-card-hd-title">Appointments</span>
                <span className="dsh-card-hd-count">{tableRows.length}</span>
                <button className="dsh-see-all">
                  See All <Ico d={IC.chevron} size={11} />
                </button>
              </div>

              <div className="dsh-table-wrap">
                <table className="dsh-appt-table">
                  <thead>
                    <tr>
                      <th style={{ width: 36 }}></th>
                      <th>Patient</th>
                      <th>Diagnosis</th>
                      <th>Time</th>
                      <th style={{ width: 32 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={5} className="dsh-empty">Loading…</td></tr>
                    ) : tableRows.length === 0 ? (
                      <tr><td colSpan={5} className="dsh-empty">No appointments found</td></tr>
                    ) : tableRows.map((a, i) => (
                      <tr key={i}>
                        <td>
                          <div
                            className="dsh-avatar"
                            style={{ background: avatarColor(a.name) }}
                          >
                            {a.initials}
                          </div>
                        </td>
                        <td>
                          <div className="dsh-appt-name">{a.name}</div>
                          <div className="dsh-appt-key">{a.id}</div>
                        </td>
                        <td>
                          <div className="dsh-appt-diag">{a.diag}</div>
                        </td>
                        <td>
                          <span className="dsh-appt-time">{a.time}</span>
                        </td>
                        <td>
                          <span className="dsh-row-chevron">
                            <Ico d={IC.chevronDown} size={14} />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RECENT ACTIVITY */}
            <div className="dsh-act-card">
              <div className="dsh-card-hd">
                <Ico d={IC.activity} size={14} />
                <span className="dsh-card-hd-title">Activity</span>
                <button className="dsh-see-all">
                  All <Ico d={IC.chevron} size={11} />
                </button>
              </div>
              <div className="dsh-act-list">
                {activityRows.map((a, i) => (
                  <div key={i} className="dsh-act-item">
                    <div className="dsh-act-dot-col">
                      <span className={`dsh-act-dot dsh-act-dot--${a.status}`} />
                      {i < activityRows.length - 1 && <span className="dsh-act-line" />}
                    </div>
                    <div className="dsh-act-body">
                      <span className="dsh-act-patient">{a.patient}</span>
                      <span className="dsh-act-doctor">{a.doctor}</span>
                    </div>
                    <div className="dsh-act-right">
                      <span className="dsh-act-date">{a.date}</span>
                      <span className={`dsh-act-status dsh-act-status--${a.status}`}>
                        {a.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}