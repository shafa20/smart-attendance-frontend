import React from 'react';
import './App.css';

function DashboardFooter() {
  return (
    <footer className="dashboard-footer">
      &copy; {new Date().getFullYear()} Smart Attendance. All rights reserved.
    </footer>
  );
}

export default DashboardFooter;
