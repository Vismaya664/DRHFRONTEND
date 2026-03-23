import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getAllDoctors, getDepartments, bookAppointment, getDoctorSlots } from "../api/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import '../style/RequestAppointment.scss';

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function formatDisplay(iso) {
  if (!iso) return "";
  const [y,m,d] = iso.split("-");
  return `${MONTH_NAMES[parseInt(m)-1]} ${parseInt(d)}, ${y}`;
}

// ── Toast ─────────────────────────────────────────────────────────────────
function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="ra-toast">
      <span className="ra-toast__icon">⚠️</span>
      <span className="ra-toast__msg">{message}</span>
      <button className="ra-toast__close" onClick={onDone} type="button">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="5" y1="5" x2="15" y2="15"/><line x1="15" y1="5" x2="5" y2="15"/>
        </svg>
      </button>
    </div>
  );
}

// ── Calendar Modal ────────────────────────────────────────────────────────
function CalendarModal({ value, onSelect, onClose }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const init  = value ? new Date(value+"T00:00:00") : today;
  const [yr, setYr]   = useState(init.getFullYear());
  const [mo, setMo]   = useState(init.getMonth());
  const ref = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  const prev = () => mo===0 ? (setMo(11), setYr(y=>y-1)) : setMo(m=>m-1);
  const next = () => mo===11? (setMo(0),  setYr(y=>y+1)) : setMo(m=>m+1);

  const first  = new Date(yr,mo,1).getDay();
  const days   = new Date(yr,mo+1,0).getDate();
  const cells  = [...Array(first).fill(null), ...Array.from({length:days},(_,i)=>i+1)];

  const sel   = value ? new Date(value+"T00:00:00") : null;
  const isSel = d => sel && sel.getFullYear()===yr && sel.getMonth()===mo && sel.getDate()===d;
  const past  = d => new Date(yr,mo,d) < today;
  const tod   = d => today.getFullYear()===yr && today.getMonth()===mo && today.getDate()===d;

  const pick = d => {
    if (!d || past(d)) return;
    onSelect(`${yr}-${String(mo+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`);
    onClose();
  };

  return (
    <div className="ra-overlay">
      <div className="jira-modal cal-modal" ref={ref}>
        <div className="jira-modal__header">
          <span className="jira-modal__title">Select Date</span>
          <button className="jira-modal__close" onClick={onClose} type="button">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="5" y1="5" x2="15" y2="15"/><line x1="15" y1="5" x2="5" y2="15"/>
            </svg>
          </button>
        </div>

        <div className="jira-modal__body">
          <div className="cal-nav-row">
            <button className="cal-nav-btn" onClick={prev} type="button">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="13 5 7 10 13 15"/></svg>
            </button>
            <span className="cal-month-label">{MONTH_NAMES[mo]} {yr}</span>
            <button className="cal-nav-btn" onClick={next} type="button">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="7 5 13 10 7 15"/></svg>
            </button>
          </div>
          <div className="cal-grid cal-grid--head">
            {DAY_NAMES.map(d=><span key={d} className="cal-day-name">{d}</span>)}
          </div>
          <div className="cal-grid">
            {cells.map((d,i)=>(
              <button key={i} type="button" onClick={()=>pick(d)} disabled={!d||past(d)}
                className={["cal-day",!d?"cal-day--empty":"",d&&past(d)?"cal-day--past":"",d&&tod(d)?"cal-day--today":"",d&&isSel(d)?"cal-day--sel":""].join(" ")}>
                {d||""}
              </button>
            ))}
          </div>
        </div>

        <div className="jira-modal__footer">
          <button className="jira-btn jira-btn--ghost" type="button" onClick={onClose}>Cancel</button>
          <button className="jira-btn jira-btn--primary" type="button" onClick={()=>{
            const t=new Date();
            onSelect(`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`);
            onClose();
          }}>Today</button>
        </div>
      </div>
    </div>
  );
}

// ── Token Modal — fully self-contained local state ────────────────────────
function TokenModal({ slots, initSlot, initToken, onConfirm, onClose, appointmentDate }) {
  // Local state — does NOT depend on parent until Confirm is clicked
  const [localSlot,  setLocalSlot]  = useState(initSlot  || slots[0].id);
  const [localToken, setLocalToken] = useState(initToken  || null);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  const currentSlot = slots.find(s => s.id === localSlot);
  // Only show available tokens — booked ones are excluded entirely
  const tokens = Array.from({ length: currentSlot.totalTokens }, (_, i) => i + 1)
    .filter(t => !currentSlot.disabledTokens.includes(t));

  const switchSlot = id => {
    setLocalSlot(id);
    setLocalToken(null); // reset token when slot changes
  };

  const pickToken = t => {
    if (currentSlot.disabledTokens.includes(t)) return;
    setLocalToken(t);
  };

  const confirm = () => {
    if (!localToken) return;
    onConfirm(localSlot, localToken);
    onClose();
  };

  return (
    <div className="ra-overlay">
      <div className="jira-modal token-modal" ref={ref}>

        {/* Header */}
        <div className="jira-modal__header">
          <div className="jira-modal__header-left">
            <span className="jira-modal__title">Select Time Slot & Token</span>
            {appointmentDate && (
              <span className="jira-modal__badge">{formatDisplay(appointmentDate)}</span>
            )}
          </div>
          <button className="jira-modal__close" type="button" onClick={onClose}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="5" y1="5" x2="15" y2="15"/><line x1="15" y1="5" x2="5" y2="15"/>
            </svg>
          </button>
        </div>

        {/* Slot tabs */}
        <div className="token-tabs">
          {slots.map(s => {
            const available = s.totalTokens - s.disabledTokens.length;
            return (
              <button key={s.id} type="button"
                className={`token-tab ${localSlot===s.id?"token-tab--active":""}`}
                onClick={() => switchSlot(s.id)}>
                <span className="token-tab__name">{s.label}</span>
                <span className="token-tab__time">{s.time}</span>
                <span className="token-tab__count">{available} open</span>
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="jira-modal__body token-modal__body">

          {/* Legend */}
          <div className="token-legend">
            <span className="token-legend__item"><span className="tl-dot tl-dot--open"/> Available</span>
            <span className="token-legend__item"><span className="tl-dot tl-dot--sel"/> Selected</span>
          </div>

          {/* Token grid — only available tokens shown */}
          <div className="token-grid">
            {tokens.map(t => {
              const isSelected = localToken === t;
              return (
                <button key={t} type="button"
                  onClick={() => setLocalToken(t)}
                  className={["token-chip", isSelected ? "token-chip--sel" : ""].join(" ").trim()}>
                  <span className="token-chip__n">{t}</span>
                  <span className="token-chip__s">{isSelected ? "Selected" : "Open"}</span>
                </button>
              );
            })}
          </div>

          {/* Confirm bar */}
          {localToken && (
            <div className="token-confirm-bar">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Token <strong>#{localToken}</strong> — {currentSlot.label} · {currentSlot.time}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="jira-modal__footer">
          <button className="jira-btn jira-btn--ghost" type="button" onClick={onClose}>Cancel</button>
          <button className="jira-btn jira-btn--primary" type="button"
            disabled={!localToken} onClick={confirm}>
            Confirm
          </button>
        </div>

      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
export default function RequestAppointment() {
  const { state } = useLocation();

  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState([
    { id: "morning",   label: "Morning",   time: "9:00 AM – 12:00 PM", totalTokens: 20, disabledTokens: [] },
    { id: "afternoon", label: "Afternoon", time: "2:00 PM – 5:00 PM",  totalTokens: 15, disabledTokens: []  },
    { id: "evening",   label: "Evening",   time: "6:00 PM – 9:00 PM",  totalTokens: 12, disabledTokens: []        },
  ]);

  const incomingDoctor = state?.doctor || "";
  const incomingDoctorCode = state?.doctorCode || "";
  const incomingDepartment = state?.department || "";

  const [form, setForm] = useState({
    doctor: incomingDoctor,
    doctorCode: incomingDoctorCode,
    speciality: incomingDepartment,
    appointmentDate: "",
    firstName: "",
    mobile: "",
  });

  const [selectedSlot,  setSelectedSlot]  = useState("");
  const [selectedToken, setSelectedToken] = useState(null);
  const [submitted,     setSubmitted]     = useState(false);
  const [errors,        setErrors]        = useState({});
  const [calOpen,       setCalOpen]       = useState(false);
  const [tokenOpen,     setTokenOpen]     = useState(false);
  const [toast,         setToast]         = useState(null);
  const [submitting,    setSubmitting]    = useState(false);

  // Fetch doctors and departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsData, deptData] = await Promise.all([
          getAllDoctors(),
          getDepartments()
        ]);
        setDoctors(doctorsData);
        setDepartments(deptData);
        
        // Set default doctor if not from navigation
        if (!incomingDoctor && doctorsData.length > 0) {
          setForm(prev => ({
            ...prev,
            doctor: doctorsData[0].name,
            doctorCode: doctorsData[0].code,
            speciality: doctorsData[0].department
          }));
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setToast('Failed to load doctors and departments');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [incomingDoctor]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type==="checkbox"?checked:value }));
    setErrors(p => ({ ...p, [name]: undefined }));
  };

  const handleDateSelect = iso => {
    setForm(p => ({ ...p, appointmentDate: iso }));
    setErrors(p => ({ ...p, appointmentDate: undefined }));
  };

  const handleTokenBtnClick = () => {
    if (!form.appointmentDate) {
      setToast("Please select an appointment date first.");
      return;
    }
    setTokenOpen(true);
  };

  // Called only when user clicks Confirm inside the modal
  const handleTokenConfirm = (slotId, token) => {
    setSelectedSlot(slotId);
    setSelectedToken(token);
    setErrors(p => ({ ...p, token: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.appointmentDate)       e.appointmentDate = "Date is required";
    if (!selectedSlot || !selectedToken) e.token       = "Please select a time slot and token";
    if (!form.firstName.trim())      e.firstName       = "Patient name is required";
    if (!form.mobile.trim())         e.mobile          = "Mobile number is required";
    else if (!/^\d{10}$/.test(form.mobile.trim())) e.mobile = "Enter a valid 10-digit number";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    
    setSubmitting(true);
    try {
      const appointmentDateTime = new Date(`${form.appointmentDate}T${getSlotTime(selectedSlot)}`);
      
      await bookAppointment({
        patient_name: form.firstName.trim(),
        doctor_code: form.doctorCode,
        department_code: form.speciality,
        appointment_date: appointmentDateTime.toISOString()
      });
      
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to book appointment:', error);
      setToast(error.response?.data?.error || 'Failed to book appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getSlotTime = (slotId) => {
    const times = {
      morning: '09:00:00',
      afternoon: '14:00:00',
      evening: '18:00:00'
    };
    return times[slotId] || '09:00:00';
  };

  const resetForm = () => {
    setSubmitted(false);
    setSelectedSlot("");
    setSelectedToken(null);
    setCalOpen(false);
    setTokenOpen(false);
    setToast(null);
    setForm({
      doctor: doctors.length > 0 ? doctors[0].name : "",
      doctorCode: doctors.length > 0 ? doctors[0].code : "",
      speciality: doctors.length > 0 ? doctors[0].department : "",
      appointmentDate: "",
      firstName: "",
      mobile: ""
    });
  };

  const activeSlot    = slots.find(s => s.id === selectedSlot);
  const tokenBtnText  = selectedToken && activeSlot
    ? `Token #${selectedToken} — ${activeSlot.label} (${activeSlot.time})`
    : "Select slot & token";

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="ra-page">
          <div className="ra-inner">
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '1.2rem', color: '#64748b' }}>Loading...</div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      <div className="ra-page">
        <div className="ra-inner">
          <h1 className="ra-title">Request an Appointment</h1>

          <div className="ra-card">
            {submitted ? (
              <div className="ra-success">
                <div className="ra-success-icon">&#10003;</div>
                <h2>Appointment Requested!</h2>
                <p>We'll contact you shortly to confirm your appointment with <strong>{form.doctor}</strong> — {activeSlot?.label} slot, Token <strong>#{selectedToken}</strong>.</p>
                <button className="jira-btn jira-btn--primary" style={{marginTop:8}} onClick={resetForm}>Request Another</button>
              </div>
            ) : (
              <form className="ra-form" onSubmit={handleSubmit} noValidate>

                {/* Doctor + Speciality — read only, pre-filled from navigation */}
                <div className="ra-row">
                  <div className="ra-field">
                    <label className="ra-label">Doctor</label>
                    <div className="ra-display-field">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                      </svg>
                      <span>{form.doctor}</span>
                    </div>
                  </div>
                  <div className="ra-field">
                    <label className="ra-label">Speciality</label>
                    <div className="ra-display-field">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                      </svg>
                      <span>{form.speciality}</span>
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div className="ra-row">
                  <div className="ra-field ra-field--span">
                    <label className="ra-label">Appointment Date <span className="ra-req">*</span></label>
                    <button type="button"
                      className={`ra-picker-btn ${errors.appointmentDate?"ra-picker-btn--error":""} ${form.appointmentDate?"ra-picker-btn--filled":""}`}
                      onClick={() => setCalOpen(true)}>
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <rect x="3" y="4" width="14" height="13" rx="2"/>
                        <line x1="3" y1="8" x2="17" y2="8"/>
                        <line x1="7" y1="2" x2="7" y2="5"/>
                        <line x1="13" y1="2" x2="13" y2="5"/>
                      </svg>
                      <span>{form.appointmentDate ? formatDisplay(form.appointmentDate) : "Select a date"}</span>
                    </button>
                    {errors.appointmentDate && <span className="ra-err">{errors.appointmentDate}</span>}
                  </div>
                </div>

                {/* Slot + Token */}
                <div className="ra-row">
                  <div className="ra-field ra-field--span">
                    <label className="ra-label">Time Slot & Token <span className="ra-req">*</span></label>
                    <button type="button"
                      className={`ra-picker-btn ${errors.token?"ra-picker-btn--error":""} ${selectedToken?"ra-picker-btn--filled":""}`}
                      onClick={handleTokenBtnClick}>
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <circle cx="10" cy="10" r="7"/>
                        <polyline points="10 6 10 10 13 12"/>
                      </svg>
                      <span>{tokenBtnText}</span>
                    </button>
                    {errors.token && <span className="ra-err">{errors.token}</span>}
                  </div>
                </div>

                {/* Patient Name */}
                <div className="ra-row">
                  <div className="ra-field ra-field--span">
                    <label className="ra-label">Patient Name <span className="ra-req">*</span></label>
                    <input type="text" name="firstName"
                      className={`ra-input ${errors.firstName?"ra-input--error":""}`}
                      value={form.firstName} onChange={handleChange} placeholder="Enter full name"/>
                    {errors.firstName && <span className="ra-err">{errors.firstName}</span>}
                  </div>
                </div>

                {/* Mobile */}
                <div className="ra-row">
                  <div className="ra-field ra-field--span">
                    <label className="ra-label">Mobile Number <span className="ra-req">*</span></label>
                    <div className={`ra-phone-wrap ${errors.mobile?"ra-phone-wrap--error":""}`}>
                      <span className="ra-phone-prefix">
                        <span className="ra-flag">🇮🇳</span>
                        <span className="ra-dot">·</span>
                        <span className="ra-code">+91</span>
                      </span>
                      <input type="tel" name="mobile" className="ra-input ra-input--phone"
                        value={form.mobile} onChange={handleChange}
                        maxLength={10} placeholder="Enter mobile number"/>
                    </div>
                    {errors.mobile && <span className="ra-err">{errors.mobile}</span>}
                  </div>
                </div>

                <div className="ra-submit-row">
                  <button type="submit" className="jira-btn jira-btn--primary jira-btn--lg" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>

              </form>
            )}
          </div>
        </div>
      </div>

      {calOpen && (
        <CalendarModal
          value={form.appointmentDate}
          onSelect={handleDateSelect}
          onClose={() => setCalOpen(false)}
        />
      )}

      {tokenOpen && (
        <TokenModal
          slots={slots}
          initSlot={selectedSlot}
          initToken={selectedToken}
          appointmentDate={form.appointmentDate}
          onConfirm={handleTokenConfirm}
          onClose={() => setTokenOpen(false)}
        />
      )}

      <Footer />
    </>
  );
}