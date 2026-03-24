import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./doctorssidebar.scss";

import logoImg from "../assets/Logo.jpg";

// ── Icons ─────────────────────────────────────────────────────────
function DashIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="7" height="7" rx="1.5" fill="currentColor" opacity=".9"/>
      <rect x="11" y="2" width="7" height="7" rx="1.5" fill="currentColor" opacity=".5"/>
      <rect x="2" y="11" width="7" height="7" rx="1.5" fill="currentColor" opacity=".5"/>
      <rect x="11" y="11" width="7" height="7" rx="1.5" fill="currentColor" opacity=".9"/>
    </svg>
  );
}
function CalIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <rect x="2.5" y="3.5" width="15" height="14" rx="2"/>
      <path d="M6.5 2v3M13.5 2v3M2.5 8h15"/>
      <circle cx="7" cy="12" r="1" fill="currentColor" stroke="none"/>
      <circle cx="10" cy="12" r="1" fill="currentColor" stroke="none"/>
      <circle cx="13" cy="12" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}
function PatientsIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="8" cy="6" r="3"/>
      <path d="M2 17c0-3.314 2.686-5 6-5s6 1.686 6 5"/>
      <circle cx="15" cy="7" r="2"/>
      <path d="M18 17c0-2.21-1.343-3.5-3-3.5"/>
    </svg>
  );
}
function CollapseIcon({ collapsed }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      {collapsed
        ? <><path d="M7 5l5 5-5 5"/><path d="M4 10h9" opacity=".4"/></>
        : <><path d="M13 5l-5 5 5 5"/><path d="M16 10H7" opacity=".4"/></>}
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 6l4 4m0 0l-4 4M17 10H7m0-7h8a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"/>
    </svg>
  );
}

// ── Nav config ────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard",    label: "Dashboard",    icon: DashIcon,     path: "/doctor/dashboard"    },
  { id: "appointments", label: "Appointments", icon: CalIcon,      path: "/doctor/appointments" },
  
];

// ── Component ─────────────────────────────────────────────────────
export default function DoctorsSidebar() {
  const [collapsed, setCollapsed]     = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [doctor, setDoctor]           = useState(null);
  const navigate  = useNavigate();
  const location  = useLocation();

  // Fetch logged-in doctor's information from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setDoctor(parsedUser);
      } catch (error) {
        console.error('Failed to parse doctor data:', error);
      }
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    // Confirm logout
    if (window.confirm('Are you sure you want to log out?')) {
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      localStorage.removeItem('doctorCode');
      
      // Redirect to login
      navigate('/login/doctor');
    }
  };

  const isActive  = (path) => location.pathname === path;
  const handleNav = (path) => navigate(path);

  return (
    <aside className={`jsb ${collapsed ? "jsb--collapsed" : ""}`}>

      {/* ── Logo ── */}
      <div className="jsb__logo">
        <div className="jsb__logo-mark">
          <img src={logoImg} alt="ApexHealth Logo" />
        </div>
        {!collapsed && (
          <div className="jsb__logo-text">
            <span className="jsb__logo-name">DRS Hospital</span>
            <span className="jsb__logo-sub">Doctor Portal</span>
          </div>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="jsb__nav">
        {NAV_ITEMS.map((item) => {
          const Icon   = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.id}
              className={`jsb__item ${active ? "jsb__item--active" : ""}`}
              onClick={() => handleNav(item.path)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span className="jsb__item-icon"><Icon /></span>

              {!collapsed && (
                <span className="jsb__item-label">{item.label}</span>
              )}

              {item.badge && !collapsed && (
                <span className="jsb__badge">{item.badge}</span>
              )}

              {item.badge && collapsed && (
                <span className="jsb__badge-dot" />
              )}

              {collapsed && hoveredItem === item.id && (
                <div className="jsb__tooltip">
                  {item.label}
                  {item.badge && (
                    <span className="jsb__tooltip-badge">{item.badge}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="jsb__footer">

        {/* Profile */}
        <div className={`jsb__profile ${collapsed ? "jsb__profile--collapsed" : ""}`}>
          <div className="jsb__avatar">
            {doctor?.photo_url ? (
              <img src={doctor.photo_url} alt={doctor.name || 'Doctor'} />
            ) : (
              <div className="jsb__avatar-initials">
                {doctor?.name?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'DR'}
              </div>
            )}
            <span className="jsb__avatar-status" />
          </div>
          {!collapsed && (
            <div className="jsb__profile-info">
              <span className="jsb__profile-name">{doctor?.name || 'Dr. Name'}</span>
              <span className="jsb__profile-role">{doctor?.department || doctor?.specialization || 'Specialist'}</span>
            </div>
          )}
        </div>

        <div className="jsb__actions">
          {/* Logout button */}
          <button
            className="jsb__logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
            <span className="jsb__logout-icon">
              <LogoutIcon />
            </span>
            {!collapsed && (
              <span className="jsb__logout-label">Logout</span>
            )}
          </button>

          {/* Collapse toggle */}
          <button
            className="jsb__collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <span className="jsb__collapse-icon">
              <CollapseIcon collapsed={collapsed} />
            </span>
            {!collapsed && (
              <span className="jsb__collapse-label">Collapse</span>
            )}
          </button>
        </div>

      </div>
    </aside>
  );
}