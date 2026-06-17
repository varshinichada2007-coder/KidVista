import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Lock, Mail, Key, AlertCircle, ShieldCheck } from 'lucide-react';
import API from '../../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // States for resetting Admin Password
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSecret, setResetSecret] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const isAdminEmail = email.trim().toLowerCase() === 'akhilkumarchada86@gmail.com';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in email and password.');
      return;
    }

    if (isAdminEmail && !adminSecret) {
      setError('Admin secret code is required.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const userObj = await login(email, password, adminSecret);

      if (userObj.role === 'admin') navigate('/admin');
      else if (userObj.role === 'teacher') navigate('/teacher');
      else if (userObj.role === 'parent') navigate('/parent');
      else navigate('/');
    } catch (err) {
      setError(err || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetEmail || !resetSecret || !resetNewPassword) {
      setResetError('All fields are required.');
      return;
    }
    setResetError('');
    setResetSuccess('');
    setResetLoading(true);
    try {
      const response = await API.post('/auth/reset-admin-password', {
        email: resetEmail,
        adminSecret: resetSecret,
        newPassword: resetNewPassword
      });
      setResetSuccess(response.data.message);
      setTimeout(() => {
        setShowResetModal(false);
        // Clear fields
        setResetEmail('');
        setResetSecret('');
        setResetNewPassword('');
        setResetSuccess('');
      }, 1500);
    } catch (err) {
      setResetError(err.response?.data?.message || 'Password reset failed.');
    } finally {
      setResetLoading(false);
    }
  };

  const fillDemoCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setAdminSecret('');
    setError('');
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <span className="school-logo-lrg">🏫</span>
          <h2>Intellitots Portal</h2>
          <p>Login to view classroom updates</p>
        </div>

        {error && (
          <div className="error-alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                className="form-control"
                placeholder="parent1@firstcry.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ marginBottom: 0 }}>Password</label>
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FF6B8B',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Forgot Password?
              </button>
            </div>
            <div className="input-with-icon" style={{ marginTop: '0.35rem' }}>
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {isAdminEmail && (
            <div className="form-group">
              <label>Admin Secret Code</label>
              <div className="input-with-icon">
                <ShieldCheck size={18} className="input-icon" />
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter admin secret code"
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="signup-text">
          Don&apos;t have an account? <Link to="/signup">Create Account</Link>
        </p>

        <div className="demo-credentials-section">
          <div className="demo-header-title">
            <Key size={14} />
            <span>Demo Accounts</span>
          </div>

          <div className="demo-badges-container" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <button
              className="demo-btn teacher"
              onClick={() => fillDemoCredentials('teacher@firstcry.com', 'teacher123')}
            >
              👩‍🏫 Teacher
            </button>

            <button
              className="demo-btn parent"
              onClick={() => fillDemoCredentials('Rajesh@firstcry.com', 'Rajesh@123')}
            >
              👨‍👩‍👦 Parent
            </button>
          </div>

          <p className="admin-note">
            Admin credentials are secure and must be typed manually.
          </p>
        </div>
      </div>

      {showResetModal && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          fontFamily: 'Outfit, sans-serif'
        }}>
          <div className="glass-panel" style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            boxSizing: 'border-box'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#2C3E50', fontSize: '1.25rem', fontWeight: 800 }}>Reset Admin Password</h3>
            
            {resetError && (
              <div className="error-alert" style={{ marginBottom: '1rem', padding: '0.5rem', fontSize: '0.85rem' }}>
                {resetError}
              </div>
            )}
            {resetSuccess && (
              <div className="success-alert" style={{ marginBottom: '1rem', padding: '0.5rem', fontSize: '0.85rem' }}>
                {resetSuccess}
              </div>
            )}

            <form onSubmit={handleResetSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.3rem', fontSize: '0.9rem' }}>Admin Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="akhilkumarchada86@gmail.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  style={{ boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.3rem', fontSize: '0.9rem' }}>Admin Secret Code</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter secret code"
                  value={resetSecret}
                  onChange={(e) => setResetSecret(e.target.value)}
                  style={{ boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.3rem', fontSize: '0.9rem' }}>New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter new password"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  style={{ boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowResetModal(false);
                    setResetError('');
                    setResetSuccess('');
                  }}
                  disabled={resetLoading}
                  style={{ background: 'none', border: '1px solid #ccc', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={resetLoading}
                  style={{ background: '#FF6B8B', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                >
                  {resetLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .login-wrapper {
          min-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          font-family: 'Outfit', sans-serif;
        }

        .login-card {
          width: 100%;
          max-width: 450px;
          padding: 2.5rem;
          border-radius: 18px;
          background: white;
          box-shadow: 0 20px 45px rgba(255, 107, 139, 0.12);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .school-logo-lrg {
          font-size: 3rem;
          display: block;
          margin-bottom: 0.5rem;
        }

        .login-header h2 {
          font-size: 1.6rem;
          font-weight: 800;
          color: #2C3E50;
        }

        .login-header p {
          font-size: 0.9rem;
          color: #777;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.35rem;
          font-weight: 700;
          color: #2C3E50;
          font-size: 0.9rem;
        }

        .input-with-icon {
          position: relative;
        }

        .input-with-icon input {
          padding-left: 2.5rem;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #777;
        }

        .form-control {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 10px;
          font-size: 0.95rem;
        }

        .btn-block {
          width: 100%;
          margin-top: 1rem;
        }

        .btn {
          border: none;
          border-radius: 10px;
          padding: 0.8rem;
          font-weight: 800;
          cursor: pointer;
        }

        .btn-primary {
          background: #FF6B8B;
          color: white;
        }

        .error-alert {
          background: #FFF0F2;
          border: 1px solid rgba(255,107,139,0.3);
          border-radius: 10px;
          color: #FF6B8B;
          padding: 0.75rem 1rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.88rem;
          font-weight: 600;
        }

        .signup-text {
          text-align: center;
          margin-top: 1rem;
          font-size: 0.9rem;
        }

        .signup-text a {
          color: #FF6B8B;
          font-weight: 800;
          text-decoration: none;
        }

        .demo-credentials-section {
          margin-top: 1.5rem;
          border-top: 1px dashed rgba(0,0,0,0.08);
          padding-top: 1.5rem;
        }

        .demo-header-title {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #777;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          margin-bottom: 0.75rem;
        }

        .demo-badges-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }

        .demo-btn {
          border: none;
          padding: 0.6rem 0.2rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
        }

        .demo-btn.admin { background: #FFE8EC; color: #FF6B8B; }
        .demo-btn.teacher { background: #E8F5E9; color: #2E7D32; }
        .demo-btn.parent { background: #E3F2FD; color: #1565C0; }

        .admin-note {
          margin-top: 0.7rem;
          font-size: 0.78rem;
          color: #888;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default Login;