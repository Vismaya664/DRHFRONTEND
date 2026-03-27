import { useState, useRef, useEffect, useCallback } from "react";
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

// Convert "09:00" → "9:00 AM", "14:30" → "2:30 PM"
function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2,"0")} ${ampm}`;
}

// Group flat slot list from backend into tab groups by slot_number (DoctorTiming.slno)
// Returns: [{ slno, label, timeRange, slots: [...] }, ...]
function groupSlotsByTiming(rawSlots) {
  const groups = new Map();
  for (const s of rawSlots) {
    const key = s.slot_number;
    if (!groups.has(key)) groups.set(key, { slno: key, slots: [] });
    groups.get(key).slots.push(s);
  }
  return Array.from(groups.values()).map((g, idx) => {
    const first = g.slots[0];
    const last  = g.slots[g.slots.length - 1];
    return {
      slno:      g.slno,
      label:     `Session ${idx + 1}`,
      timeRange: `${formatTime(first.start_time)} – ${formatTime(last.end_time)}`,
      slots:     g.slots,
    };
  });
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
  const [yr, setYr] = useState(init.getFullYear());
  const [mo, setMo] = useState(init.getMonth());
  const ref = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  const prev = () => mo===0 ? (setMo(11), setYr(y=>y-1)) : setMo(m=>m-1);
  const next = () => mo===11? (setMo(0),  setYr(y=>y+1)) : setMo(m=>m+1);

  const first = new Date(yr,mo,1).getDay();
  const days  = new Date(yr,mo+1,0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({length:days},(_,i)=>i+1)];

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
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="13 5 7 10 13 15"/>
              </svg>
            </button>
            <span className="cal-month-label">{MONTH_NAMES[mo]} {yr}</span>
            <button className="cal-nav-btn" onClick={next} type="button">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="7 5 13 10 7 15"/>
              </svg>
            </button>
          </div>

          <div className="cal-grid cal-grid--head">
            {DAY_NAMES.map(d => <span key={d} className="cal-day-name">{d}</span>)}
          </div>

          <div className="cal-grid">
            {cells.map((d,i) => (
              <button key={i} type="button" onClick={() => pick(d)} disabled={!d || past(d)}
                className={[
                  "cal-day",
                  !d       ? "cal-day--empty" : "",
                  d && past(d)  ? "cal-day--past"  : "",
                  d && tod(d)   ? "cal-day--today" : "",
                  d && isSel(d) ? "cal-day--sel"   : ""
                ].join(" ").trim()}>
                {d || ""}
              </button>
            ))}
          </div>
        </div>

        <div className="jira-modal__footer">
          <button className="jira-btn jira-btn--ghost" type="button" onClick={onClose}>Cancel</button>
          <button className="jira-btn jira-btn--primary" type="button" onClick={() => {
            const t = new Date();
            onSelect(`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`);
            onClose();
          }}>Today</button>
        </div>
      </div>
    </div>
  );
}

// ── Slot Modal ─────────────────────────────────────────────────────────────
// groups: [{ slno, label, timeRange, slots: [{slot_number, start_time, end_time, status}] }]
function SlotModal({ groups, initSlotKey, onConfirm, onClose, appointmentDate }) {
  const [activeGroup, setActiveGroup] = useState(
    groups.length > 0 ? groups[0].slno : null
  );
  // selectedKey = "slno_start_time" uniquely identifies a specific slot
  const [selectedKey, setSelectedKey] = useState(initSlotKey || null);
  const ref = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  const currentGroup = groups.find(g => g.slno === activeGroup);

  // Find the selected slot across all groups (for the confirm bar)
  const selectedSlot = groups
    .flatMap(g => g.slots)
    .find(s => `${s.slot_number}_${s.start_time}` === selectedKey);

  const switchGroup = slno => {
    setActiveGroup(slno);
    setSelectedKey(null);
  };

  const pickSlot = s => {
    if (s.status === 'Booked') return;
    setSelectedKey(`${s.slot_number}_${s.start_time}`);
  };

  const confirm = () => {
    if (!selectedKey || !selectedSlot) return;
    onConfirm({
      slot_number: selectedSlot.slot_number,
      start_time:  selectedSlot.start_time,
      end_time:    selectedSlot.end_time,
      display:     `${formatTime(selectedSlot.start_time)} – ${formatTime(selectedSlot.end_time)}`,
    });
    onClose();
  };

  // Empty state — no slots from backend
  if (groups.length === 0) {
    return (
      <div className="ra-overlay">
        <div className="jira-modal slot-modal" ref={ref}>
          <div className="jira-modal__header">
            <span className="jira-modal__title">Select Appointment Time</span>
            <button className="jira-modal__close" type="button" onClick={onClose}>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="5" y1="5" x2="15" y2="15"/><line x1="15" y1="5" x2="5" y2="15"/>
              </svg>
            </button>
          </div>
          <div className="jira-modal__body slot-modal__empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p>No available slots for this date.</p>
            <span>Please select a different date.</span>
          </div>
          <div className="jira-modal__footer">
            <button className="jira-btn jira-btn--ghost" type="button" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ra-overlay">
      <div className="jira-modal slot-modal" ref={ref}>

        <div className="jira-modal__header">
          <div className="jira-modal__header-left">
            <span className="jira-modal__title">Select Appointment Time</span>
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

        {/* Session tabs — one per DoctorTiming row (slno) */}
        <div className="token-tabs">
          {groups.map(g => {
            const vacantCount = g.slots.filter(s => s.status === 'Vacant').length;
            return (
              <button key={g.slno} type="button"
                className={`token-tab ${activeGroup === g.slno ? "token-tab--active" : ""}`}
                onClick={() => switchGroup(g.slno)}>
                <span className="token-tab__name">{g.label}</span>
                <span className="token-tab__time">{g.timeRange}</span>
                <span className="token-tab__count">{vacantCount} open</span>
              </button>
            );
          })}
        </div>

        <div className="jira-modal__body slot-modal__body">

          {/* Legend */}
          <div className="token-legend">
            <span className="token-legend__item"><span className="tl-dot tl-dot--open"/> Available</span>
            <span className="token-legend__item"><span className="tl-dot tl-dot--sel"/> Selected</span>
            <span className="token-legend__item"><span className="tl-dot tl-dot--booked"/> Booked</span>
          </div>

          {/* Time slot chips */}
          <div className="slot-grid">
            {currentGroup?.slots.map(s => {
              const key        = `${s.slot_number}_${s.start_time}`;
              const isBooked   = s.status === 'Booked';
              const isSelected = selectedKey === key;
              return (
                <button key={key} type="button"
                  disabled={isBooked}
                  onClick={() => pickSlot(s)}
                  className={[
                    "slot-chip",
                    isBooked   ? "slot-chip--booked"   : "",
                    isSelected ? "slot-chip--selected"  : "",
                  ].join(" ").trim()}>
                  <span className="slot-chip__time">{formatTime(s.start_time)}</span>
                  <span className="slot-chip__label">
                    {isBooked ? "Booked" : isSelected ? "Selected" : "Open"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Confirm bar appears after selection */}
          {selectedSlot && (
            <div className="token-confirm-bar">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              {formatTime(selectedSlot.start_time)} – {formatTime(selectedSlot.end_time)} selected
            </div>
          )}
        </div>

        <div className="jira-modal__footer">
          <button className="jira-btn jira-btn--ghost" type="button" onClick={onClose}>Cancel</button>
          <button className="jira-btn jira-btn--primary" type="button"
            disabled={!selectedKey} onClick={confirm}>
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

  const [doctors,     setDoctors]     = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading,     setLoading]     = useState(true);

  // Live slot groups fetched from backend
  const [slotGroups,   setSlotGroups]   = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const incomingDoctor     = state?.doctor     || "";
  const incomingDoctorCode = state?.doctorCode || "";
  const incomingDepartment = state?.department || "";

  const [form, setForm] = useState({
    doctor:          incomingDoctor,
    doctorCode:      incomingDoctorCode,
    speciality:      incomingDepartment,
    appointmentDate: "",
    firstName:       "",
    mobile:          "",
  });

  // selectedSlotData: { slot_number, start_time, end_time, display }
  const [selectedSlotData, setSelectedSlotData] = useState(null);
  const [submitted,        setSubmitted]         = useState(false);
  const [errors,           setErrors]            = useState({});
  const [calOpen,          setCalOpen]           = useState(false);
  const [slotOpen,         setSlotOpen]          = useState(false);
  const [toast,            setToast]             = useState(null);
  const [submitting,       setSubmitting]        = useState(false);

  // ── Fetch doctors & departments ───────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsData, deptData] = await Promise.all([
          getAllDoctors(),
          getDepartments()
        ]);
        setDoctors(doctorsData);
        setDepartments(deptData);
        if (!incomingDoctor && doctorsData.length > 0) {
          setForm(prev => ({
            ...prev,
            doctor:     doctorsData[0].name,
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

  // ── Fetch live slots whenever doctor or date changes ──────────────────────
  const fetchSlots = useCallback(async (doctorCode, date) => {
    if (!doctorCode || !date) return;
    setSlotsLoading(true);
    setSelectedSlotData(null); // clear stale selection
    try {
      const raw = await getDoctorSlots({ doctor_code: doctorCode, date });
      setSlotGroups(groupSlotsByTiming(raw));
    } catch (err) {
      console.error('Failed to fetch slots:', err);
      setToast('Could not load available slots. Please try again.');
      setSlotGroups([]);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (form.doctorCode && form.appointmentDate) {
      fetchSlots(form.doctorCode, form.appointmentDate);
    }
  }, [form.doctorCode, form.appointmentDate, fetchSlots]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    setErrors(p => ({ ...p, [name]: undefined }));
  };

  const handleDateSelect = iso => {
    setForm(p => ({ ...p, appointmentDate: iso }));
    setErrors(p => ({ ...p, appointmentDate: undefined }));
  };

  const handleSlotBtnClick = () => {
    if (!form.appointmentDate) { setToast("Please select an appointment date first."); return; }
    setSlotOpen(true);
  };

  const handleSlotConfirm = slotData => {
    setSelectedSlotData(slotData);
    setErrors(p => ({ ...p, slot: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.appointmentDate)  e.appointmentDate = "Date is required";
    if (!selectedSlotData)      e.slot            = "Please select a time slot";
    if (!form.firstName.trim()) e.firstName       = "Patient name is required";
    if (!form.mobile.trim())    e.mobile          = "Mobile number is required";
    else if (!/^\d{10}$/.test(form.mobile.trim())) e.mobile = "Enter a valid 10-digit number";
    return e;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      // Combine date + slot's start_time into the appointment datetime
      const appointmentDateTime = new Date(
        `${form.appointmentDate}T${selectedSlotData.start_time}:00`
      );
      await bookAppointment({
        patient_name:     form.firstName.trim(),
        doctor_code:      form.doctorCode,
        department_code:  form.speciality,
        appointment_date: appointmentDateTime.toISOString(),
        slot_number:      selectedSlotData.slot_number,
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to book appointment:', error);
      setToast(error.response?.data?.error || 'Failed to book appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setSelectedSlotData(null);
    setSlotGroups([]);
    setCalOpen(false);
    setSlotOpen(false);
    setToast(null);
    setForm({
      doctor:          doctors.length > 0 ? doctors[0].name       : "",
      doctorCode:      doctors.length > 0 ? doctors[0].code       : "",
      speciality:      doctors.length > 0 ? doctors[0].department : "",
      appointmentDate: "",
      firstName:       "",
      mobile:          ""
    });
  };

  const slotBtnText = selectedSlotData
    ? selectedSlotData.display
    : slotsLoading
      ? "Loading available slots…"
      : "Select a time slot";

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="ra-page">
          <span className="ra-bg-blob ra-bg-blob--1"/>
          <span className="ra-bg-blob ra-bg-blob--2"/>
          <div className="ra-inner">
            <div style={{ textAlign: 'center', padding: '4rem', color: '#78716c', fontSize: '0.95rem' }}>
              Loading…
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
        <span className="ra-bg-blob ra-bg-blob--1"/>
        <span className="ra-bg-blob ra-bg-blob--2"/>

        <div className="ra-inner">
          <h1 className="ra-title">Request an Appointment</h1>

          <div className="ra-card">
            {submitted ? (

              /* ── Success State ──────────────────────────────────────── */
              <div className="ra-success">

                <div className="ra-success-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>

                <div className="ra-success-heading">
                  <h2 className="ra-success-title">Appointment requested</h2>
                  <p className="ra-success-sub">We'll reach out shortly to confirm your slot.</p>
                </div>

                <div className="ra-success-rows">

                  <div className="ra-success-row ra-success-row--doctor">
                    <span className="ra-success-row__label">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                      </svg>
                      Doctor
                    </span>
                    <span className="ra-success-row__val">{form.doctor}</span>
                  </div>

                  <div className="ra-success-row ra-success-row--date">
                    <span className="ra-success-row__label">
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <rect x="3" y="4" width="14" height="13" rx="2"/>
                        <line x1="3" y1="8" x2="17" y2="8"/>
                        <line x1="7" y1="2" x2="7" y2="5"/>
                        <line x1="13" y1="2" x2="13" y2="5"/>
                      </svg>
                      Date
                    </span>
                    <span className="ra-success-row__val">{formatDisplay(form.appointmentDate)}</span>
                  </div>

                  <div className="ra-success-row ra-success-row--slot">
                    <span className="ra-success-row__label">
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <circle cx="10" cy="10" r="7"/>
                        <polyline points="10 6 10 10 13 12"/>
                      </svg>
                      Time
                    </span>
                    <span className="ra-success-row__val">{selectedSlotData?.display}</span>
                  </div>

                </div>

                <div className="ra-success-notice">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  <p>
                    <strong>Timing may vary</strong> — actual appointment time may change based on the doctor's availability. We'll confirm with you directly.
                  </p>
                </div>

                <button className="jira-btn jira-btn--primary ra-success-btn" onClick={resetForm}>
                  Request another
                </button>

              </div>
              /* ── End Success State ───────────────────────────────────── */

            ) : (
              <form className="ra-form" onSubmit={handleSubmit} noValidate>

                {/* Doctor & Speciality */}
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

                {/* Appointment Date */}
                <div className="ra-row">
                  <div className="ra-field ra-field--span">
                    <label className="ra-label">
                      Appointment Date <span className="ra-req">*</span>
                    </label>
                    <button type="button"
                      className={[
                        "ra-picker-btn",
                        errors.appointmentDate ? "ra-picker-btn--error"  : "",
                        form.appointmentDate   ? "ra-picker-btn--filled" : ""
                      ].join(" ").trim()}
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

                {/* Appointment Time — driven by live backend slots */}
                <div className="ra-row">
                  <div className="ra-field ra-field--span">
                    <label className="ra-label">
                      Appointment Time <span className="ra-req">*</span>
                    </label>
                    <button type="button"
                      className={[
                        "ra-picker-btn",
                        errors.slot      ? "ra-picker-btn--error"   : "",
                        selectedSlotData ? "ra-picker-btn--filled"  : "",
                        slotsLoading     ? "ra-picker-btn--loading" : "",
                      ].join(" ").trim()}
                      onClick={handleSlotBtnClick}
                      disabled={slotsLoading}>
                      {slotsLoading ? (
                        <span className="ra-spinner"/>
                      ) : (
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                          <circle cx="10" cy="10" r="7"/>
                          <polyline points="10 6 10 10 13 12"/>
                        </svg>
                      )}
                      <span>{slotBtnText}</span>
                    </button>
                    {errors.slot && <span className="ra-err">{errors.slot}</span>}
                  </div>
                </div>

                {/* Patient Name */}
                <div className="ra-row">
                  <div className="ra-field ra-field--span">
                    <label className="ra-label">
                      Patient Name <span className="ra-req">*</span>
                    </label>
                    <input type="text" name="firstName"
                      className={`ra-input ${errors.firstName ? "ra-input--error" : ""}`}
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="Enter full name"/>
                    {errors.firstName && <span className="ra-err">{errors.firstName}</span>}
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="ra-row">
                  <div className="ra-field ra-field--span">
                    <label className="ra-label">
                      Mobile Number <span className="ra-req">*</span>
                    </label>
                    <div className={`ra-phone-wrap ${errors.mobile ? "ra-phone-wrap--error" : ""}`}>
                      <span className="ra-phone-prefix">
                        <span className="ra-flag">🇮🇳</span>
                        <span className="ra-dot">·</span>
                        <span className="ra-code">+91</span>
                      </span>
                      <input type="tel" name="mobile"
                        className="ra-input ra-input--phone"
                        value={form.mobile}
                        onChange={handleChange}
                        maxLength={10}
                        placeholder="Enter mobile number"/>
                    </div>
                    {errors.mobile && <span className="ra-err">{errors.mobile}</span>}
                  </div>
                </div>

                {/* Submit */}
                <div className="ra-submit-row">
                  <button type="submit" className="jira-btn jira-btn--primary jira-btn--lg" disabled={submitting}>
                    {submitting ? 'Submitting…' : 'Submit'}
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

      {slotOpen && (
        <SlotModal
          groups={slotGroups}
          initSlotKey={selectedSlotData
            ? `${selectedSlotData.slot_number}_${selectedSlotData.start_time}`
            : null}
          appointmentDate={form.appointmentDate}
          onConfirm={handleSlotConfirm}
          onClose={() => setSlotOpen(false)}
        />
      )}

      <Footer />
    </>
  );
}