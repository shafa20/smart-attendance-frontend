import React from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function DashboardHeader() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="dashboard-header">
      <div className="dashboard-header-content">
        <span className="dashboard-title">Smart Attendance</span>
        <span className="user-name">{JSON.parse(localStorage.getItem('user'))?.name}</span>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
}

export default DashboardHeader;
