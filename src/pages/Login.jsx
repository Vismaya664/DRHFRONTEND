import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin, doctorLogin } from "../api/api";
import "../style/Login.scss";
import loginImage from "../assets/Loginpage.jpg";
import logoImage from "../assets/Logo.jpg";

// Role-based config — title and portal label per role
const ROLE_CONFIG = {
  PATIENT: { title: "PATIENT PORTAL" },
  DOCTOR:  { title: "DOCTOR PORTAL"  },
  ADMIN:   { title: "ADMIN DASHBOARD" },
};

const Login = ({ role = "PATIENT" }) => {
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const config = ROLE_CONFIG[role];
  const navigate = useNavigate();

  const handleChange = (e) => {
    setError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let response;
      
      if (role === "ADMIN") {
        // Admin login uses username (not email)
        // The input field is named 'email' but for admin it's actually username
        response = await adminLogin(formData.email, formData.password);
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
          localStorage.setItem('role', 'admin');
          navigate("/admin/dashboard");
        }
      } else if (role === "DOCTOR") {
        // Doctor login uses email field
        response = await doctorLogin(formData.email, formData.password);
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
          localStorage.setItem('role', 'doctor');
          localStorage.setItem('doctorCode', response.doctor_code);
          navigate("/doctor/dashboard");
        }
      } else {
        // Patient login not implemented yet
        setError("Patient login is not available yet.");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 
                       err.response?.data?.non_field_errors?.[0] || 
                       err.response?.data?.detail ||
                       "Login failed. Please check your credentials.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* ══ LEFT: 60% image panel ══ */}
      <div className="login-left">
        <img src={loginImage} alt="Healthcare professionals" className="login-image" />
        <div className="image-overlay">

          {/* Brand — centered */}
          <div className="brand">
            <img src={logoImage} alt="ApexHealth Logo" className="brand-logo" />
            <span className="brand-name">ApexHealth<br />Bookings</span>
          </div>

          {/* Tagline — bottom left */}
          <p className="overlay-tagline">WE CARE FOR YOU,<br />FROM EVERY SIDE.</p>

        </div>
      </div>

      {/* ══ RIGHT: 40% form panel ══ */}
      <div className="login-right">
        <div className="form-container">

          {/* Small role badge — subtle indicator of which portal */}
          <span className="role-badge">{config.title}</span>

          {activeTab === "login" ? (
            <>
              <h1 className="form-title">LOG IN TO YOUR<br />ACCOUNT</h1>

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="field-group">
                  <label className="field-label">{role === "ADMIN" ? "Username" : "Email or Username"}</label>
                  <input
                    type="text"
                    name="email"
                    className="field-input"
                    placeholder={role === "ADMIN" ? "Enter your username..." : "Enter your email..."}
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="field-group">
                  <div className="password-label-row">
                    <label className="field-label">Password</label>
                    <button
                      type="button"
                      className="show-hide-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      Show/Hide
                    </button>
                  </div>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className="field-input"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                        {showPassword
                          ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                          : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                        }
                      </svg>
                    </span>
                  </div>
                  <a href="#" className="forgot-link">Forgot password?</a>
                </div>

                {error && (
                  <div className="login-error">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className={`login-btn ${loading ? "loading" : ""}`}
                  disabled={loading}
                >
                  {loading ? <span className="spinner" /> : "Log In"}
                </button>

                <div className="bottom-links">
                  {/* Only patients can self-register */}
                  {role === "PATIENT" && (
                    <p className="switch-text">
                      Don't have an account?{" "}
                      <span className="switch-link" onClick={() => setActiveTab("signup")}>Sign up.</span>
                    </p>
                  )}
                  <p className="switch-text">
                    Problems logging in?{" "}
                    <span className="switch-link">Contact Support.</span>
                  </p>
                </div>
              </form>
            </>
          ) : (
            <>
              <h1 className="form-title">CREATE YOUR<br />ACCOUNT</h1>

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="field-group">
                  <label className="field-label">Full Name</label>
                  <input type="text" className="field-input" placeholder="Enter your full name" required />
                </div>
                <div className="field-group">
                  <label className="field-label">Email Address</label>
                  <input type="email" className="field-input" placeholder="Enter your email" required />
                </div>
                <div className="field-group">
                  <label className="field-label">Password</label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="field-input"
                      placeholder="Create a password"
                      required
                    />
                    <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`login-btn ${loading ? "loading" : ""}`}
                  disabled={loading}
                >
                  {loading ? <span className="spinner" /> : "Sign Up"}
                </button>

                <div className="bottom-links">
                  <p className="switch-text">
                    Already have an account?{" "}
                    <span className="switch-link" onClick={() => setActiveTab("login")}>Login.</span>
                  </p>
                </div>
              </form>
            </>
          )}

        </div>
      </div>

    </div>
  );
};

export default Login;