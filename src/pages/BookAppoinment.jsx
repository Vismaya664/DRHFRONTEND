import { useState, useEffect } from "react";
import { getAllDoctors, getDepartments, bookAppointment } from "../api/api";
import '../style/BookAppoinment.scss';

// ─── Static Data ──────────────────────────────────────────────
const DOCTORS = [];

const SPECIALITIES = [];
const HOSPITALS    = [];

// ─── Icons ─────────────────────────────────────────────────────
function SearchIcon() {
  return (
    <svg className="ba-search__icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="ba-card__cta-icon" width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="2.5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1 6.5h14" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 1v3M11 1v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="5.5" cy="9.5" r="0.8" fill="currentColor" />
      <circle cx="8"   cy="9.5" r="0.8" fill="currentColor" />
      <circle cx="10.5" cy="9.5" r="0.8" fill="currentColor" />
      <circle cx="5.5"  cy="12" r="0.8" fill="currentColor" />
      <circle cx="8"    cy="12" r="0.8" fill="currentColor" />
    </svg>
  );
}

function HospitalIcon() {
  return (
    <svg className="ba-meta__icon" width="12" height="12" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="4" width="14" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 15V10h6v5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 7V3M6 5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function SpecialityIcon() {
  return (
    <svg className="ba-meta__icon" width="12" height="12" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 5v4M8 11v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── Filter Section ────────────────────────────────────────────
function FilterSection({ title, items, checked, onToggle }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="ba-filter-section">
      <button
        className={`ba-filter-section__header${open ? " ba-filter-section__header--open" : ""}`}
        onClick={() => setOpen(o => !o)}
      >
        {title}
        <span className="ba-filter-section__arrow">▲</span>
      </button>

      {open && (
        <ul className="ba-filter-section__list">
          {items.map(item => (
            <li key={item} className="ba-filter-section__item">
              <label className={`ba-filter-section__label${checked.includes(item) ? " ba-filter-section__label--checked" : ""}`}>
                <input
                  type="checkbox"
                  checked={checked.includes(item)}
                  onChange={() => onToggle(item)}
                  className="ba-filter-section__checkbox"
                />
                {item}
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Doctor Card ───────────────────────────────────────────────
function DoctorCard({ doctor, onBook }) {
  return (
    <div className="ba-card">
      <div className="ba-card__avatar-wrap">
        <div className="ba-card__avatar">{doctor.initials}</div>
      </div>

      <div className="ba-card__body">
        <h2 className="ba-card__name">{doctor.name}</h2>
        <p className="ba-card__role">{doctor.role}</p>
        <p className="ba-card__quals">{doctor.qualifications}</p>
        <p className="ba-card__bio">{doctor.bio}</p>
      </div>

      <div className="ba-card__meta">
        <div className="ba-card__info-block">
          <span className="ba-card__info-label">
            STATUS <HospitalIcon />
          </span>
          <span className="ba-card__info-value">{doctor.hospital}</span>
        </div>

        <div className="ba-card__info-block">
          <span className="ba-card__info-label">
            PRIORITY <SpecialityIcon />
          </span>
          <span className="ba-card__info-value">{doctor.speciality}</span>
        </div>

        <button className="ba-card__cta" onClick={() => onBook(doctor)}>
          <CalendarIcon />
          Book An Appointment
        </button>
      </div>
    </div>
  );
}

// ─── Booking Modal ─────────────────────────────────────────────
function BookingModal({ doctor, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", date: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleSubmit = async () => { 
    if (form.name && form.phone && form.date) {
      setLoading(true);
      try {
        await bookAppointment({
          patient_name: form.name,
          doctor_code: doctor.code,
          department_code: doctor.department,
          appointment_date: new Date(form.date).toISOString()
        });
        setSubmitted(true);
      } catch (error) {
        console.error('Failed to book appointment:', error);
        alert('Failed to book appointment. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="ba-modal-overlay" onClick={onClose}>
      <div className="ba-modal" onClick={e => e.stopPropagation()}>
        <button className="ba-modal__close" onClick={onClose}>×</button>

        {!submitted ? (
          <>
            <h3 className="ba-modal__title">Book Appointment</h3>
            <p className="ba-modal__subtitle">
              with <strong>{doctor.name}</strong>
              <br />{doctor.speciality} · {doctor.hospital}
            </p>

            {[
              { label: "Your Name",      name: "name",  type: "text", placeholder: "Full name" },
              { label: "Phone Number",   name: "phone", type: "tel",  placeholder: "+91 98765 43210" },
              { label: "Preferred Date", name: "date",  type: "date", placeholder: "" },
            ].map(({ label, name, type, placeholder }) => (
              <div className="ba-modal__field" key={name}>
                <label className="ba-modal__label">{label}</label>
                <input
                  className="ba-modal__input"
                  type={type}
                  name={name}
                  placeholder={placeholder}
                  value={form[name]}
                  onChange={handleChange}
                />
              </div>
            ))}

            <button className="ba-modal__submit" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Booking...' : 'Confirm Appointment'}
            </button>
          </>
        ) : (
          <div className="ba-modal__success">
            <div className="ba-modal__success-icon">✅</div>
            <h3 className="ba-modal__success-title">Appointment Requested!</h3>
            <p className="ba-modal__success-text">
              We'll confirm your appointment with <strong>{doctor.name}</strong> on <strong>{form.date}</strong>.
              <br />A confirmation will be sent to <strong>{form.phone}</strong>.
            </p>
            <button className="ba-modal__done" onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────
export default function BookAppointment() {
  const [checkedSpecialities, setCheckedSpecialities] = useState([]);
  const [checkedHospitals,    setCheckedHospitals]    = useState([]);
  const [search,              setSearch]              = useState("");
  const [bookedDoctor,        setBookedDoctor]        = useState(null);
  const [doctors,             setDoctors]             = useState([]);
  const [departments,         setDepartments]         = useState([]);
  const [loading,             setLoading]             = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsData, deptData] = await Promise.all([
          getAllDoctors(),
          getDepartments()
        ]);
        
        const formattedDoctors = doctorsData.map(d => ({
          id: d.code,
          code: d.code,
          name: d.name,
          role: 'Consultant',
          qualifications: d.qualification || 'MBBS, MD',
          bio: `${d.name} is a specialist in ${d.department}.`,
          hospital: 'Doctors United Medicentre',
          speciality: d.department,
          department: d.department,
          initials: d.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        }));
        
        setDoctors(formattedDoctors);
        setDepartments(deptData.map(d => d.name));
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleSpeciality = (name) =>
    setCheckedSpecialities(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
  const toggleHospital = (name) =>
    setCheckedHospitals(prev =>
      prev.includes(name) ? prev.filter(h => h !== name) : [...prev, name]
    );
  const clearAll = () => {
    setCheckedSpecialities([]);
    setCheckedHospitals([]);
    setSearch("");
  };

  const filteredDoctors = doctors.filter(doc => {
    const matchSpec   = checkedSpecialities.length === 0 || checkedSpecialities.includes(doc.speciality);
    const matchHosp   = checkedHospitals.length === 0    || checkedHospitals.includes(doc.hospital);
    const matchSearch = !search.trim() ||
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.speciality.toLowerCase().includes(search.toLowerCase());
    return matchSpec && matchHosp && matchSearch;
  });

  const hasFilters = checkedSpecialities.length > 0 || checkedHospitals.length > 0 || search.trim();

  return (
    <div className="ba-page">

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="ba-header">
        <div className="ba-header__inner">
          <h1 className="ba-header__title">Find Doctors</h1>
          <div className="ba-search">
            <SearchIcon />
            <input
              className="ba-search__input"
              type="text"
              placeholder="Search doctors (e.g., name, speciality)"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="ba-search__clear" onClick={() => setSearch("")}>×</button>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="ba-body">

        {/* ── Sidebar ─────────────────────────────────────── */}
        <aside className="ba-sidebar">
          <p className="ba-sidebar__heading">FILTERS</p>

          <FilterSection
            title="Speciality"
            items={departments.length > 0 ? departments : SPECIALITIES}
            checked={checkedSpecialities}
            onToggle={toggleSpeciality}
          />
          <FilterSection
            title="Hospital"
            items={['Doctors United Medicentre']}
            checked={checkedHospitals}
            onToggle={toggleHospital}
          />

          {hasFilters && (
            <button className="ba-sidebar__clear" onClick={clearAll}>
              Clear all filters
            </button>
          )}
        </aside>

        {/* ── Main ────────────────────────────────────────── */}
        <main className="ba-main">
          <p className="ba-main__count">
            <strong>{filteredDoctors.length}</strong> Doctors found
          </p>

          <div className="ba-cards">
            {loading ? (
              <div className="ba-empty">
                <span className="ba-empty__title">Loading doctors...</span>
              </div>
            ) : filteredDoctors.length > 0 ? (
              filteredDoctors.map(doc => (
                <DoctorCard key={doc.id} doctor={doc} onBook={setBookedDoctor} />
              ))
            ) : (
              <div className="ba-empty">
                <div className="ba-empty__icon">🔍</div>
                No doctors found. Try adjusting your filters.
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Modal ───────────────────────────────────────────── */}
      {bookedDoctor && (
        <BookingModal doctor={bookedDoctor} onClose={() => setBookedDoctor(null)} />
      )}
    </div>
  );
}