import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get CSRF token from cookie
const getCSRFTokenFromCookie = () => {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

// Add CSRF token to all requests
api.interceptors.request.use((config) => {
  const csrfToken = getCSRFTokenFromCookie();
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Initialize CSRF token on app load
let csrfInitialized = false;
const initializeCSRF = async () => {
  if (!csrfInitialized) {
    try {
      await api.get('/csrf');
      csrfInitialized = true;
    } catch (error) {
      console.error('Failed to initialize CSRF token:', error);
    }
  }
};

// ─── CSRF Token ───────────────────────────────────────────────────────────────
export const getCSRFToken = async () => {
  const { data } = await api.get('/csrf');
  return data;
};

// Initialize CSRF before any other API calls
export const initCSRF = initializeCSRF;

// ─── Authentication ───────────────────────────────────────────────────────────
export const adminLogin = async (username, password) => {
  await initializeCSRF();
  const { data } = await api.post('/admin/login', { username, password });
  return data;
};

export const doctorLogin = async (email, password) => {
  await initializeCSRF();
  const { data } = await api.post('/doctor/login', { email, password });
  return data;
};

// ─── Departments ──────────────────────────────────────────────────────────────
export const getDepartments = async () => {
  const { data } = await api.get('/departments');
  return data.departments;
};

// ─── Doctors ──────────────────────────────────────────────────────────────────
export const getAllDoctors = async () => {
  const { data } = await api.get('/doctors');
  return data.doctors;
};

export const getDoctorsByDepartment = async (departmentCode) => {
  const { data } = await api.get(`/doctors/${departmentCode}`);
  return data.doctors;
};

export const getDoctorTiming = async (doctorCode) => {
  const { data } = await api.get(`/timing/${doctorCode}`);
  return data.timings;
};

export const getDoctorProfile = async () => {
  const { data } = await api.get('/profile/me');
  return data;
};

// ─── Doctor Credentials (Admin) ───────────────────────────────────────────────
export const getDoctorCredentials = async () => {
  const { data } = await api.get('/admin/doctor-credentials');
  return data;
};

export const createDoctorCredentials = async (payload) => {
  await initializeCSRF();
  const { data } = await api.post('/admin/create-doctor-login', payload);
  return data;
};

export const updateDoctorCredentials = async (doctorCode, payload) => {
  await initializeCSRF();
  const { data } = await api.patch(`/admin/doctor-credentials/${doctorCode}`, payload);
  return data;
};

export const deleteDoctorCredentials = async (doctorCode) => {
  await initializeCSRF();
  const { data } = await api.delete(`/admin/doctor-credentials/${doctorCode}/delete`);
  return data;
};

// ─── Appointments ─────────────────────────────────────────────────────────────
export const bookAppointment = async (payload) => {
  await initializeCSRF();
  const { data } = await api.post('/book-appointment', payload);
  return data;
};

export const getAdminAppointments = async () => {
  const { data } = await api.get('/admin/appointments');
  return data.appointments;
};

export const getDoctorAppointments = async (doctorCode) => {
  const { data } = await api.get(`/doctor/appointments/${doctorCode}`);
  return data;
};

export const updateAppointmentStatus = async (appointmentId, status) => {
  await initializeCSRF();
  const { data } = await api.patch(`/admin/appointments/${appointmentId}/status`, { status });
  return data;
};

export const deleteAppointment = async (appointmentId) => {
  await initializeCSRF();
  const { data } = await api.delete(`/admin/appointments/${appointmentId}/delete`);
  return data;
};

export const getDoctorSlots = async (doctorCode, date) => {
  const { data } = await api.get('/slots/', { params: { doctor_code: doctorCode, date } });
  return data;
};

export default api;
