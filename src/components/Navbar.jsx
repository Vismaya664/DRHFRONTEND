import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.scss";
import logoImage from "../assets/Logo.jpg";

const NAV_LINKS = [
  { label: "Homepage",   to: "/" },
  { label: "Our Team",   to: "/our-team", badge: true },
  // { label: "Contact Us", to: "/contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === "/";
  const isTransparent = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  return (
    <>
      <nav className={`navbar${isTransparent ? " navbar--transparent" : ""}${scrolled ? " scrolled" : ""}`}>
        <div className="navbar-inner">

          {/* ── Brand (left) ── */}
          <Link to="/" className="navbar-brand">
            <img src={logoImage} alt="Doctors United Logo" className="navbar-logo" />
            <span className="navbar-name">
              Doctors United<br />
              <em>Medicentre</em>
            </span>
          </Link>

          {/* ── Nav Links (center) ── */}
          <ul className={`navbar-links${menuOpen ? " open" : ""}`}>
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className={`navbar-link${link.badge ? " navbar-link--badge" : ""}${location.pathname === link.to ? " active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* ── Right section: CTA + Profile ── */}
          <div className="navbar-right">
            <Link to="/our-team" className="navbar-cta">
              Book Appointment
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>
            <button className="profile-icon" onClick={() => setShowModal(true)} aria-label="Login">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>
          </div>

          {/* ── Hamburger (mobile only) ── */}
          <button
            className={`navbar-hamburger${menuOpen ? " open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>

        </div>
      </nav>

      {!isTransparent && <div className="navbar-spacer" />}

      {/* ── Login Modal ── */}
      {showModal && (
        <>
          <div className="login-modal-overlay" onClick={() => setShowModal(false)} />
          <div className="login-modal-popup">
            <div className="modal-options">
              <button className="modal-option" onClick={() => { setShowModal(false); navigate('/login/admin'); }}>
                <div className="option-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <span className="option-label">Admin</span>
              </button>
              <button className="modal-option" onClick={() => { setShowModal(false); navigate('/login/doctor'); }}>
                <div className="option-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <span className="option-label">Doctor</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}