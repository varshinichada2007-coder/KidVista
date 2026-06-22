import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        fontFamily: 'Outfit, sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          color: 'var(--color-primary)',
          fontSize: '1.2rem',
          fontWeight: 'bold'
        }}>
          <p>🏫 Loading KidVista Portal...</p>
        </div>
      </div>
    );
  }

  // User is not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated but role is not allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div style={{
        padding: '3rem',
        textAlign: 'center',
        fontFamily: 'Outfit, sans-serif',
        background: '#fff',
        borderRadius: '16px',
        maxWidth: '500px',
        margin: '5rem auto',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
      }}>
        <h2 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>⛔ Access Denied</h2>
        <p style={{ color: '#7F8C8D', marginBottom: '1.5rem' }}>You do not have permission to view this page.</p>
        <Navigate to="/" replace />
      </div>
    );
  }

  // Redirect pending parent users to the main parent dashboard page
  if (user && user.role === 'parent' && user.status === 'pending' && window.location.pathname !== '/parent') {
    return <Navigate to="/parent" replace />;
  }

  return children;
};

export default ProtectedRoute;
