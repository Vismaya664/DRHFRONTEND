import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAllDoctors, getDepartments } from "../api/api";
import Navbar from "../components/Navbar";
import '../style/Ourteam.scss';

const INITIAL_SHOW = 16;

// Memoized doctor card component
const DoctorCard = ({ doctor, onBook }) => (
  <div className="ot-card">
    <div className="ot-card__photo-col">
      <img 
        src={doctor.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=4C9BE8&color=fff&size=128`} 
        alt={doctor.name} 
        className="ot-card__avatar"
        loading="lazy"
      />
    </div>
    <div className="ot-card__info">
      <div className="ot-card__header-row">
        <h2 className="ot-card__name">{doctor.name}</h2>
        <span className="ot-card__spec-tag">{doctor.department}</span>
      </div>
      <p className="ot-card__designation">Consultant</p>
      <div className="ot-card__meta-row">
        <svg className="ot-card__meta-icon" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z"/>
        </svg>
        <span className="ot-card__qual">{doctor.qualification || 'MBBS, MD'}</span>
      </div>
      <div className="ot-card__meta-row">
        <svg className="ot-card__meta-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"/>
        </svg>
        <span className="ot-card__clinic">Doctors United Medicentre, Balussery</span>
      </div>
    </div>
    <div className="ot-card__cta-col">
      <button className="ot-book-btn" onClick={() => onBook(doctor)}>
        Book Appointment
      </button>
    </div>
  </div>
);

export default function OurTeam() {
  const [checkedSpecs, setCheckedSpecs] = useState([]);
  const [specSearch,   setSpecSearch]   = useState("");
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsData, deptData] = await Promise.all([
          getAllDoctors(),
          getDepartments()
        ]);
        setDoctors(doctorsData);
        setDepartments(deptData.map(d => d.name));
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleSpec = (s) =>
    setCheckedSpecs((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  const allMatchingSpecs = useMemo(() =>
    departments.filter((s) =>
      s.toLowerCase().includes(specSearch.toLowerCase())
    ), [specSearch, departments]);

  const visibleSpecs = showAllSpecs ? allMatchingSpecs : allMatchingSpecs.slice(0, INITIAL_SHOW);
  const hiddenCount  = Math.max(0, allMatchingSpecs.length - INITIAL_SHOW);

  const filtered = checkedSpecs.length === 0
    ? doctors
    : doctors.filter((m) => checkedSpecs.includes(m.department));

  const handleBookAppointment = useCallback((doctor) => {
    navigate("/request-appointment", { 
      state: { 
        doctor: doctor.name, 
        doctorCode: doctor.code, 
        department: doctor.department 
      } 
    });
  }, [navigate]);

  return (
    <>
      <Navbar />
      <div className="ot-root">

        {/* ── Page layout ── */}
        <div className="ot-container">
          <div className="ot-layout">

            {/* ── Sidebar ── */}
            <aside className="ot-sidebar">
              <div className="ot-sidebar__top">
                <span className="ot-sidebar__title">Filters</span>
                {checkedSpecs.length > 0 && (
                  <button className="ot-clear-link" onClick={() => setCheckedSpecs([])}>
                    Clear All
                  </button>
                )}
              </div>

              <div className="ot-sidebar__section">
                <p className="ot-sidebar__section-title">Filter by Specialty</p>

                <div className="ot-spec-search">
                  <svg className="ot-spec-search__icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="8.5" cy="8.5" r="5.5"/>
                    <line x1="13" y1="13" x2="17" y2="17"/>
                  </svg>
                  <input
                    type="text"
                    className="ot-spec-search__input"
                    placeholder="Search specialties..."
                    value={specSearch}
                    onChange={(e) => setSpecSearch(e.target.value)}
                  />
                </div>

                <div className="ot-checkbox-list">
                  {visibleSpecs.map((s) => {
                    const checked = checkedSpecs.includes(s);
                    return (
                      <label key={s} className="ot-checkbox-item">
                        <span className={`ot-cb-box${checked ? " ot-cb-box--on" : ""}`}>
                          {checked && (
                            <svg viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="1.5,5 4,8 8.5,2"/>
                            </svg>
                          )}
                        </span>
                        <input
                          type="checkbox"
                          className="ot-checkbox-item__native"
                          checked={checked}
                          onChange={() => toggleSpec(s)}
                        />
                        <span className={`ot-checkbox-item__label${checked ? " ot-checkbox-item__label--on" : ""}`}>
                          {s}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {!showAllSpecs && hiddenCount > 0 && (
                  <button className="ot-more-btn" onClick={() => setShowAllSpecs(true)}>
                    +{hiddenCount} more
                  </button>
                )}
                {showAllSpecs && hiddenCount > 0 && (
                  <button className="ot-more-btn" onClick={() => setShowAllSpecs(false)}>
                    − Show less
                  </button>
                )}
              </div>
            </aside>

            {/* ── Doctor cards ── */}
            <main className="ot-main">

              <p className="ot-main-heading">
                Nearby Specialists
                <span>({filtered.length} Results)</span>
              </p>

              {checkedSpecs.length > 0 && (
                <div className="ot-active-tags">
                  {checkedSpecs.map((s) => (
                    <span key={s} className="ot-tag">
                      {s}
                      <button className="ot-tag__remove" onClick={() => toggleSpec(s)} aria-label={`Remove ${s}`}>×</button>
                    </span>
                  ))}
                </div>
              )}

              {filtered.length === 0 ? (
                <div className="ot-empty">
                  <p className="ot-empty__title">No specialists found</p>
                  <p className="ot-empty__sub">Try adjusting or clearing your filters.</p>
                  <button className="ot-book-btn" style={{ marginTop: 16 }} onClick={() => setCheckedSpecs([])}>
                    Clear filters
                  </button>
                </div>
              ) : loading ? (
                <div className="ot-empty">
                  <p className="ot-empty__title">Loading doctors...</p>
                </div>
              ) : (
                <div className="ot-cards">
                  {filtered.map((m) => (
                    <DoctorCard 
                      key={m.code} 
                      doctor={m} 
                      onBook={handleBookAppointment}
                    />
                  ))}
                </div>
              )}
            </main>

          </div>
        </div>
      </div>
    </>
  );
}