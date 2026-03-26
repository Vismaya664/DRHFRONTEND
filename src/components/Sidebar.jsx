import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './Sidebar.scss'
import logoImage from '../assets/Logo.jpg'

const navItems = [
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
        <path d="M2 4a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H4a2 2 0 01-2-2V4zm9 0a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2-2V4zM2 13a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H4a2 2 0 01-2-2v-3zm9 0a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2-2v-3z" />
      </svg>
    ),
    label: 'Dashboard',
    id: 'dashboard',
    path: '/admin/dashboard',
  },
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
      </svg>
    ),
    label: 'Appointments',
    id: 'appointments',
    path: '/admin/appointments',
  },
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    ),
    label: 'Doctors',
    id: 'doctors',
    path: '/admin/Doctors',
  },
]

export default function Sidebar() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [admin, setAdmin] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setAdmin(parsedUser)
      } catch (error) {
        console.error('Failed to parse admin data:', error)
      }
    }
  }, [])

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('user')
      localStorage.removeItem('role')
      navigate('/login/admin')
    }
  }

  const activeItem = navItems.find(item => location.pathname === item.path)?.id ?? ''

  const handleNav = (item) => {
    setIsOpen(false)
    navigate(item.path)
  }

  return (
    <>
      {/* Hamburger toggle — mobile only */}
      <button className="sidebar-toggle" onClick={() => setIsOpen(true)} aria-label="Open menu">
        <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
          <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Backdrop overlay */}
      <div
        className={`sidebar-overlay${isOpen ? ' sidebar-overlay--open' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      <aside className={`sidebar${isOpen ? ' sidebar--open' : ''}`}>

        {/* Close button — mobile only */}
        <button className="sidebar__close" onClick={() => setIsOpen(false)} aria-label="Close menu">
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Logo */}
        <div className="sidebar__logo">
          <div className="sidebar__logo-icon">
            <img src={logoImage} alt="Logo" className="sidebar__logo-img" />
          </div>
          <div className="sidebar__logo-text">
            <span className="sidebar__logo-name">DRS<sup>+</sup></span>
            <span className="sidebar__logo-role">Admin Panel</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar__nav">
          <p className="sidebar__nav-section">MAIN MENU</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar__nav-item ${activeItem === item.id ? 'sidebar__nav-item--active' : ''}`}
              onClick={() => handleNav(item)}
            >
              <span className="sidebar__nav-icon">{item.icon}</span>
              <span className="sidebar__nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar__footer">
          <div className="sidebar__footer-avatar">
            {admin?.name?.split(' ').map((n) => n[0]).join('').toUpperCase() ||
             admin?.username?.substring(0, 2).toUpperCase() || 'AD'}
          </div>
          <div className="sidebar__footer-info">
            <span className="sidebar__footer-name">{admin?.name || admin?.username || 'Admin'}</span>
            <span className="sidebar__footer-role">Administrator</span>
          </div>
          {/* ── CHANGED: logout icon is now a proper exit/logout arrow ── */}
          <button
            className="sidebar__footer-logout"
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h6a1 1 0 100-2H4V5h5a1 1 0 100-2H3zm10.293 3.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L14.586 11H8a1 1 0 110-2h6.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

      </aside>
    </>
  )
}