import React from 'react';
import { Navigate } from 'react-router-dom';

function RequireAuth({ children, role }) {
  const token = localStorage.getItem('access_token');
  const user = localStorage.getItem('user');
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }
  try {
    const userObj = JSON.parse(user);
    if (role && userObj.role !== role) {
      return <Navigate to="/" replace />;
    }
  } catch {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default RequireAuth;
