# Backend API Integration Summary

## Overview
All frontend components have been successfully connected to the Django backend API. Hardcoded data has been removed and replaced with real-time data from the backend.

## API Service (`src/api/api.js`)
Created a centralized API service with axios that handles all backend communication:

### Base Configuration
- Base URL: `http://localhost:8000/api`
- Credentials: Enabled (withCredentials: true)
- Content-Type: application/json

### Implemented Endpoints

#### Authentication
- `adminLogin(username, password)` - Admin portal login
- `doctorLogin(username, password)` - Doctor portal login
- `getCSRFToken()` - Get CSRF token for secure requests

#### Departments
- `getDepartments()` - Fetch all departments

#### Doctors
- `getAllDoctors()` - Fetch all doctors
- `getDoctorsByDepartment(departmentCode)` - Fetch doctors by department
- `getDoctorTiming(doctorCode)` - Get doctor's timing schedule
- `getDoctorProfile()` - Get logged-in doctor's profile

#### Doctor Credentials (Admin)
- `getDoctorCredentials()` - Fetch all doctor login credentials
- `createDoctorCredentials(payload)` - Create new doctor login
- `updateDoctorCredentials(doctorCode, payload)` - Update doctor credentials

#### Appointments
- `bookAppointment(payload)` - Book a new appointment
- `getAdminAppointments()` - Fetch all appointments (admin view)
- `getDoctorAppointments(doctorCode)` - Fetch doctor's appointments
- `updateAppointmentStatus(appointmentId, status)` - Update appointment status
- `getDoctorSlots(doctorCode, date)` - Get available slots for a doctor

## Updated Components

### 1. Login (`src/pages/Login.jsx`)
**Changes:**
- Removed hardcoded dummy credentials
- Integrated `adminLogin()` and `doctorLogin()` API calls
- Store user data and role in localStorage
- Handle authentication errors from backend
- Redirect based on role after successful login

**Usage:**
```javascript
// Admin login
const response = await adminLogin(email, password);
localStorage.setItem('user', JSON.stringify(response.user));
localStorage.setItem('role', 'admin');

// Doctor login
const response = await doctorLogin(email, password);
localStorage.setItem('doctorCode', response.user.doctor_code);
```

### 2. Our Team (`src/pages/Ourteam.jsx`)
**Changes:**
- Removed hardcoded doctor list
- Fetch doctors from `getAllDoctors()`
- Fetch departments from `getDepartments()`
- Display doctor photos from backend or generate avatar
- Pass doctor code to appointment booking

**Data Flow:**
```javascript
useEffect(() => {
  const [doctorsData, deptData] = await Promise.all([
    getAllDoctors(),
    getDepartments()
  ]);
  setDoctors(doctorsData);
  setDepartments(deptData.map(d => d.name));
}, []);
```

### 3. Admin - Doctor Management (`src/pages/Admindoctors.jsx`)
**Changes:**
- Fetch doctors from `getAllDoctors()`
- Fetch existing credentials from `getDoctorCredentials()`
- Create credentials via `createDoctorCredentials()`
- Update credentials via `updateDoctorCredentials()`
- Generate initials and colors dynamically

**Key Features:**
- Real-time credential management
- Photo upload support (prepared for backend)
- Email validation
- Password strength requirements

### 4. Admin - Appointments (`src/pages/Adminappointment.jsx`)
**Changes:**
- Fetch appointments from `getAdminAppointments()`
- Fetch doctors and departments for dropdowns
- Update appointment status via `updateAppointmentStatus()`
- Format dates and times from backend data

**Data Transformation:**
```javascript
const formatted = appointmentsData.map(apt => ({
  id: `APT-${apt.id}`,
  patient: apt.patient_name,
  doctor: apt.doctor_code,
  department: apt.department_code,
  date: new Date(apt.appointment_date).toLocaleDateString(),
  time: new Date(apt.appointment_date).toLocaleTimeString(),
  status: apt.status
}));
```

### 5. Doctor Dashboard (`src/pages/Doctorsdashboard/Dashboard.jsx`)
**Changes:**
- Fetch doctor's appointments from `getDoctorAppointments()`
- Display appointment count dynamically
- Show today's appointments from backend
- Use doctorCode from localStorage

**Implementation:**
```javascript
const doctorCode = localStorage.getItem('doctorCode');
const data = await getDoctorAppointments(doctorCode);
```

### 6. Doctor Appointments (`src/pages/Doctorsdashboard/Appointments.jsx`)
**Changes:**
- Removed hardcoded appointment data
- Fetch appointments from `getDoctorAppointments()`
- Format appointment data for display
- Filter and search through backend data

### 7. Book Appointment (`src/pages/BookAppoinment.jsx`)
**Changes:**
- Fetch doctors from `getAllDoctors()`
- Fetch departments from `getDepartments()`
- Submit bookings via `bookAppointment()`
- Handle booking success/failure

**Booking Flow:**
```javascript
await bookAppointment({
  patient_name: form.name,
  doctor_code: doctor.code,
  department_code: doctor.department,
  appointment_date: new Date(form.date).toISOString()
});
```

## Backend API Endpoints Used

### Authentication
- `POST /api/admin/login` - Admin authentication
- `POST /api/doctor/login` - Doctor authentication
- `GET /api/csrf` - CSRF token

### Departments & Doctors
- `GET /api/departments` - List all departments
- `GET /api/doctors` - List all doctors
- `GET /api/doctors/{department_code}` - Doctors by department
- `GET /api/timing/{doctor_code}` - Doctor timing
- `GET /api/profile/me` - Doctor profile

### Doctor Credentials (Admin)
- `GET /api/admin/doctor-credentials` - List credentials
- `POST /api/admin/create-doctor-login` - Create credentials
- `PUT /api/admin/doctor-credentials/{doctor_code}` - Update credentials

### Appointments
- `POST /api/book-appointment` - Book appointment
- `GET /api/admin/appointments` - All appointments (admin)
- `GET /api/doctor/appointments/{doctor_code}` - Doctor's appointments
- `PUT /api/admin/appointments/{id}/status` - Update status
- `GET /api/slots/` - Available slots

## Data Flow

### Admin Login Flow
1. User enters credentials
2. Frontend calls `adminLogin(username, password)`
3. Backend validates and returns user object
4. Frontend stores user data in localStorage
5. Redirect to `/admin/dashboard`

### Doctor Login Flow
1. Doctor enters credentials
2. Frontend calls `doctorLogin(username, password)`
3. Backend validates and returns user with doctor_code
4. Frontend stores user and doctorCode in localStorage
5. Redirect to `/doctor/dashboard`

### Appointment Booking Flow
1. User selects doctor from list (fetched from backend)
2. User fills booking form
3. Frontend calls `bookAppointment()` with patient details
4. Backend creates appointment record
5. Frontend shows success message

### Admin Appointment Management
1. Admin views all appointments via `getAdminAppointments()`
2. Admin can update status via `updateAppointmentStatus()`
3. Changes reflect immediately in UI

## Environment Setup

### Backend Requirements
1. Django backend running on `http://localhost:8000`
2. CORS enabled for frontend origin
3. Session authentication configured
4. All API endpoints implemented

### Frontend Configuration
Update `src/api/api.js` if backend URL changes:
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

## Testing Checklist

### Authentication
- [ ] Admin can login with valid credentials
- [ ] Doctor can login with valid credentials
- [ ] Invalid credentials show error message
- [ ] User data stored in localStorage
- [ ] Redirect works after login

### Doctors & Departments
- [ ] Doctors list loads from backend
- [ ] Departments list loads from backend
- [ ] Doctor photos display correctly
- [ ] Filter by department works
- [ ] Search functionality works

### Admin Functions
- [ ] Can create doctor credentials
- [ ] Can update doctor credentials
- [ ] Can view all appointments
- [ ] Can update appointment status
- [ ] Dropdowns populated from backend

### Doctor Functions
- [ ] Doctor dashboard shows appointments
- [ ] Appointments page loads doctor's appointments
- [ ] Filter and search work correctly
- [ ] Appointment counts are accurate

### Booking
- [ ] Can view all doctors
- [ ] Can filter by specialty
- [ ] Can book appointment
- [ ] Success message shows after booking
- [ ] Booking appears in admin/doctor views

## Error Handling

All API calls include try-catch blocks:
```javascript
try {
  const data = await getAllDoctors();
  setDoctors(data);
} catch (error) {
  console.error('Failed to fetch doctors:', error);
  // Show user-friendly error message
}
```

## Security Considerations

1. **CSRF Protection**: CSRF token fetched and included in requests
2. **Session Management**: withCredentials enabled for session cookies
3. **Password Handling**: Passwords never stored in frontend state
4. **Role-Based Access**: Admin/Doctor routes protected by role checks
5. **Data Validation**: Input validation on both frontend and backend

## Future Enhancements

1. **Token-based Auth**: Implement JWT for stateless authentication
2. **Real-time Updates**: WebSocket for live appointment updates
3. **Photo Upload**: Complete doctor photo upload to backend
4. **Slot Management**: Implement dynamic slot booking system
5. **Notifications**: Email/SMS notifications for appointments
6. **Patient Portal**: Add patient login and self-booking

## Troubleshooting

### CORS Errors
Ensure Django CORS settings allow frontend origin:
```python
CORS_ALLOWED_ORIGINS = ['http://localhost:5173']
CORS_ALLOW_CREDENTIALS = True
```

### 401 Unauthorized
- Check if user is logged in
- Verify session cookie is being sent
- Check CSRF token is included

### Data Not Loading
- Verify backend is running on port 8000
- Check browser console for errors
- Verify API endpoints match documentation

### Appointment Booking Fails
- Check date format (ISO 8601)
- Verify doctor_code and department_code exist
- Check backend logs for validation errors

## Summary

All major components have been successfully integrated with the backend API:
- ✅ Authentication (Admin & Doctor)
- ✅ Doctor Management
- ✅ Department Management
- ✅ Appointment Booking
- ✅ Appointment Management
- ✅ Doctor Credentials Management

The application now uses real-time data from the Django backend instead of hardcoded mock data.
