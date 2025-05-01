import React, { useState } from 'react';
import './App.css';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      setLoading(false);
      setError('Invalid credentials.');
    }, 1500);
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

export default App;
