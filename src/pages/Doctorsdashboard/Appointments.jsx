import { useState, useMemo, useEffect } from "react";
import { getDoctorAppointments, deleteAppointment } from "../../api/api";
import "../../style/Doctordashboard/Appointments.scss";
import Doctorssidebar from "../../components/doctorssidebar";

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="6.5" cy="6.5" r="4.5"/><path d="M10.5 10.5l3 3"/>
  </svg>
);
const FilterIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 2h12l-4.5 5.5V12l-3-1.5V7.5L1 2z"/>
  </svg>
);
const ExportIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 1v8M4 6l3 3 3-3"/><path d="M2 10v2a1 1 0 001 1h8a1 1 0 001-1v-2"/>
  </svg>
);
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z"/>
  </svg>
);
const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M1 7C2.5 4 4.5 2.5 7 2.5S11.5 4 13 7c-1.5 3-3.5 4.5-6 4.5S2.5 10 1 7z"/>
    <circle cx="7" cy="7" r="1.8"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3.5h10M5 3.5V2h4v1.5M5.5 6v4M8.5 6v4M3 3.5l.7 8a1 1 0 001 .9h4.6a1 1 0 001-.9l.7-8"/>
  </svg>
);
const ChevLeftIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M8 2L4 6l4 4"/>
  </svg>
);
const ChevRightIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M4 2l4 4-4 4"/>
  </svg>
);
const EmptyIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="6" width="32" height="36" rx="3"/>
    <path d="M16 16h16M16 22h16M16 28h10"/>
    <circle cx="36" cy="36" r="8" fill="white" stroke="currentColor"/>
    <path d="M33 36h6M36 33v6"/>
  </svg>
);

const APPOINTMENTS_DATA = [];

const ROWS_PER_PAGE = 20;

const STATUS_COLORS = {
  pending:   "#D97706",
  accepted:  "#16A34A",
  rejected:  "#DC2626",
};

const DEPT_CLASSES = {
  DERMATOLOGY:   "dermatology",
  CARDIOLOGY:    "cardiology",
  NEUROLOGY:     "neurology",
  ORTHOPEDICS:   "orthopedics",
  PEDIATRICS:    "pediatrics",
  GENERAL:       "general",
  ONCOLOGY:      "oncology",
  OPHTHALMOLOGY: "ophthalmology",
};

export default function Appointments() {
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter,   setDeptFilter]   = useState("all");
  const [page,         setPage]         = useState(1);
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const doctorCode = localStorage.getItem('doctorCode');
        if (doctorCode) {
          const data = await getDoctorAppointments(doctorCode);
          const formatted = data.map(apt => ({
            id: apt.id,
            name: apt.patient_name,
            phone: apt.phone_number || 'N/A',
            email: apt.email || 'N/A',
            dept: apt.department_name || apt.department_code,
            apptDate: new Date(apt.appointment_date).toLocaleDateString(),
            apptTime: apt.appointment_time_range || new Date(apt.appointment_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            status: apt.status,
            bookedOn: new Date(apt.created_at).toLocaleDateString()
          }));
          setAppointments(formatted);
        }
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const filtered = useMemo(() => {
    let data = [...appointments];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.dept.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") data = data.filter(r => r.status === statusFilter);
    if (deptFilter   !== "all") data = data.filter(r => r.dept   === deptFilter);
    return data;
  }, [search, statusFilter, deptFilter, appointments]);

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const pageData   = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const counts = {
    all:      appointments.length,
    pending:  appointments.filter(r => r.status === "pending").length,
    accepted: appointments.filter(r => r.status === "accepted").length,
    rejected: appointments.filter(r => r.status === "rejected").length,
  };

  const uniqueDepts = [...new Set(appointments.map(r => r.dept))].sort();

  const handleDelete = async (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await deleteAppointment(appointmentId);
        setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
      } catch (error) {
        console.error('Failed to delete appointment:', error);
        alert('Failed to delete appointment. Please try again.');
      }
    }
  };

  return (
    <div className="ap-layout">
      <Doctorssidebar />
      <div className="ap-page">

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
            <div style={{ fontSize: '14px', marginTop: '2rem' }}>Loading appointments...</div>
          </div>
        ) : (
          <>

        {/* 1️⃣ Header */}
        <header className="ap-header">
          <div className="ap-header__left">
            <span className="ap-header__title">Appointments</span>
            <span className="ap-header__count">{appointments.length}</span>
          </div>
          <div className="ap-header__right" />
        </header>

        {/* 2️⃣ Stats */}
        <div className="ap-stats">
          {[
            { key: "all",      label: "All",      color: "#1A2B4B" },
            { key: "pending",  label: "Pending",  color: STATUS_COLORS.pending  },
            { key: "accepted", label: "Accepted", color: STATUS_COLORS.accepted },
            { key: "rejected", label: "Rejected", color: STATUS_COLORS.rejected },
          ].map(s => (
            <div
              key={s.key}
              className={`ap-stat-item ${statusFilter === s.key ? "ap-stat-item--active" : ""}`}
              onClick={() => { setStatusFilter(s.key); setPage(1); }}
            >
              <span className="ap-stat-item__dot" style={{ background: s.color }} />
              <span className="ap-stat-item__val">{counts[s.key]}</span>
              <span className="ap-stat-item__label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* 3️⃣ Toolbar */}
        <div className="ap-toolbar">
          <div className="ap-toolbar__left">
            <div className="ap-search">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search patient, phone, email..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <select
              className="ap-select"
              value={deptFilter}
              onChange={e => { setDeptFilter(e.target.value); setPage(1); }}
            >
              <option value="all">All Departments</option>
              {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <button className="ap-btn"><FilterIcon /> Filter</button>
          </div>
          <div className="ap-toolbar__right">
            <button className="ap-btn"><ExportIcon /> Export</button>
          </div>
        </div>

        {/* 4️⃣ Body */}
        <div className="ap-body">
          <div className="ap-table-card">
            {pageData.length === 0 ? (
              <div className="ap-empty">
                <EmptyIcon />
                <span className="ap-empty__title">No appointments found</span>
                <span className="ap-empty__sub">Try adjusting your search or filters</span>
              </div>
            ) : (
              // ✅ Scroll wrapper — horizontal scroll on smaller screens
              <div className="ap-table-scroll">
                <table className="ap-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Patient Name</th>
                      <th>Phone Number</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th>Appointment Date</th>
                      <th>Status</th>
                      <th>Booked On</th>
                      <th style={{ width: 90 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageData.map((row, i) => (
                      <tr key={row.id} style={{ animationDelay: `${i * 30}ms` }}>
                        <td><span className="ap-id">#{row.id}</span></td>
                        <td>
                          <div className="ap-patient-cell">
                            <div className="ap-patient-avatar">{row.name.charAt(0).toUpperCase()}</div>
                            <span className="ap-patient-name">{row.name}</span>
                          </div>
                        </td>
                        <td><span className="ap-phone">{row.phone}</span></td>
                        <td>
                          {row.email === "N/A"
                            ? <span style={{ color: "var(--ap-text-muted)" }}>N/A</span>
                            : <a href={`mailto:${row.email}`} className="ap-email">{row.email}</a>
                          }
                        </td>
                        <td><span className={`ap-dept ap-dept--${DEPT_CLASSES[row.dept] || "general"}`}>{row.dept}</span></td>
                        <td><div className="ap-date">{row.apptDate}, {row.apptTime}</div></td>
                        <td>
                          <span className={`ap-status ap-status--${row.status}`}>
                            <span className="ap-status__dot" />
                            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                          </span>
                        </td>
                        <td><span className="ap-booked">{row.bookedOn}</span></td>
                        <td>
                          <div className="ap-row-actions">
                            <button className="ap-row-btn" title="View"><EyeIcon /></button>
                            <button className="ap-row-btn" title="Delete" onClick={() => handleDelete(row.id)}><TrashIcon /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* 5️⃣ Pagination */}
        {filtered.length > 0 && (
          <div className="ap-pagination">
            <span className="ap-pagination__info">
              Showing {Math.min((page - 1) * ROWS_PER_PAGE + 1, filtered.length)}–{Math.min(page * ROWS_PER_PAGE, filtered.length)} of {filtered.length} appointments
            </span>
            <div className="ap-pagination__controls">
              <button className="ap-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevLeftIcon />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`e${i}`} style={{ padding: "0 4px", color: "var(--ap-text-muted)", fontSize: 12 }}>…</span>
                  ) : (
                    <button key={p} className={`ap-page-btn ${page === p ? "ap-page-btn--active" : ""}`} onClick={() => setPage(p)}>
                      {p}
                    </button>
                  )
                )}
              <button className="ap-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevRightIcon />
              </button>
            </div>
          </div>
        )}

        </>
        )}
      </div>
    </div>
  );
}