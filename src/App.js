import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import StudentDashboard from './StudentDashboard';
import InstructorDashboard from './InstructorDashboard';
import AdminDashboard from './AdminDashboard';
import RequireAuth from './RequireAuth';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      setLoading(false);
      if (response.ok && data.user && data.user.role) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.role === 'student') {
          navigate('/dashboard/student');
        } else if (data.user.role === 'instructor') {
          navigate('/dashboard/instructor');
        } else if (data.user.role === 'admin') {
          navigate('/dashboard/admin');
        } else {
          setError('Unknown role.');
        }
      } else {
        setError(data.message || 'Invalid credentials.');
      }
    } catch (err) {
      setLoading(false);
      setError('Network error.');
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-header">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="login icon"
            className="login-icon"
          />
          <h2 className="login-title">Smart Attendance</h2>
          <p className="login-subtitle">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-group">
            <label htmlFor="email" className="login-label">Email address</label>
            <input
              type="email"
              id="email"
              className="login-input"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="login-group">
            <label htmlFor="password" className="login-label">Password</label>
            <input
              type="password"
              id="password"
              className="login-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="login-error">{error}</div>
          )}
          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="login-spinner"></span>
            ) : (
              "Login"
            )}
            {loading && ' Logging in...'}
          </button>
        </form>
        <div className="login-footer">
          &copy; {new Date().getFullYear()} Smart Attendance. All rights reserved.
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard/student" element={
          <RequireAuth>
            <StudentDashboard />
          </RequireAuth>
        } />
        <Route path="/dashboard/instructor" element={
          <RequireAuth>
            <InstructorDashboard />
          </RequireAuth>
        } />
        <Route path="/dashboard/admin" element={
          <RequireAuth>
            <AdminDashboard />
          </RequireAuth>
        } />
      </Routes>
    </Router>
  );
}

export default App;
