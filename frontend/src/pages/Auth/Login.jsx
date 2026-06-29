import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Lock, Mail, ShieldCheck, ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import API from '../../services/api';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Selected role can be null, 'parent', 'teacher', 'admin'
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal stats for reset admin
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSecret, setResetSecret] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Clear inputs when role is changed (do NOT pre-fill credentials)
  useEffect(() => {
    setError('');
    setEmail('');
    setPassword('');
    setAdminSecret('');
  }, [selectedRole]);

  const handleDemoFillAndSubmit = async (e) => {
    if (e) e.preventDefault();
    let targetEmail = '';
    let targetPassword = '';
    let targetSecret = '';

    if (selectedRole === 'parent') {
      targetEmail = 'Rajesh@KidVista.com';
      targetPassword = 'Rajesh@123';
    } else if (selectedRole === 'teacher') {
      targetEmail = 'Aadhya@Kidvista.com';
      targetPassword = 'Aadhya@789';
    } else if (selectedRole === 'admin') {
      targetEmail = 'akhilkumarchada86@gmail.com';
      targetPassword = 'Akhil@0806';
      targetSecret = 'Varshini@20';
    }

    setEmail(targetEmail);
    setPassword(targetPassword);
    setAdminSecret(targetSecret);
    setError('');
    setLoading(true);

    try {
      const userObj = await login(targetEmail, targetPassword, targetSecret);
      if (userObj.role === 'admin') navigate('/admin');
      else if (userObj.role === 'teacher') navigate('/teacher');
      else if (userObj.role === 'parent') navigate('/parent');
      else navigate('/');
    } catch (err) {
      setError(err || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userObj = await login(email, password, adminSecret);
      if (userObj.role === 'admin') navigate('/admin');
      else if (userObj.role === 'teacher') navigate('/teacher');
      else if (userObj.role === 'parent') navigate('/parent');
      else navigate('/');
    } catch (err) {
      setError(err || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
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

  return (
    <div className="login-split-container">
      {/* Left side brand banner pane */}
      <div className="login-left-pane">
        <span className="back-link" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Back to home
        </span>
        
        <div className="left-pane-brand">
          <div className="brand-logo-circle">
            📸
          </div>
          <h2>KidVista</h2>
        </div>

        <div className="left-pane-main">
          <span className="left-role-avatar">
            {selectedRole === 'teacher' ? '👩‍🏫' : selectedRole === 'admin' ? '👨‍💼' : '👨‍👩‍👧'}
          </span>
          <h1>
            Welcome back, <br />
            {selectedRole ? selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1) : 'Friend'}
          </h1>
          <p>
            {selectedRole === 'teacher' 
              ? 'Upload daily activities, tag children in photos, and communicate learning outcomes.'
              : selectedRole === 'admin'
              ? 'Moderate photos, manage registrations, review attendance, and view analytics.'
              : "View your child's daily journey, photos, milestones, and daycare updates."}
          </p>
        </div>

        <div className="left-pane-footer">
          <div className="encryption-pill">
            🛡️ Your account is protected with end-to-end encryption and COPPA compliance.
          </div>

          <div className="trust-families-row">
            <div className="avatar-group">
              <span className="avatar-group-item bg-pink">A</span>
              <span className="avatar-group-item bg-blue">S</span>
              <span className="avatar-group-item bg-green">R</span>
            </div>
            <span>50,000+ families trust KidVista</span>
          </div>
        </div>
      </div>

      {/* Right side interactive forms pane */}
      <div className="login-right-pane">
        {!selectedRole ? (
          /* Role Selector Page */
          <div className="role-router-card">
            <h2>Sign in to KidVista</h2>
            <p className="router-sub">Choose your role to continue</p>
            
            <div className="role-options-list">
              <div className="role-option" onClick={() => setSelectedRole('parent')}>
                <span className="role-icon font-pink">👪</span>
                <div className="role-details">
                  <h4>Parent</h4>
                  <p>View your child's daily journey, photos, and activities</p>
                </div>
                <ArrowRight size={18} className="role-arrow" />
              </div>

              <div className="role-option" onClick={() => setSelectedRole('teacher')}>
                <span className="role-icon font-green">👩‍🏫</span>
                <div className="role-details">
                  <h4>Teacher</h4>
                  <p>Upload activities, tag students, and engage with families</p>
                </div>
                <ArrowRight size={18} className="role-arrow" />
              </div>

              <div className="role-option" onClick={() => setSelectedRole('admin')}>
                <span className="role-icon font-blue">🏫</span>
                <div className="role-details">
                  <h4>Administrator</h4>
                  <p>Manage school operations, users, and analytics</p>
                </div>
                <ArrowRight size={18} className="role-arrow" />
              </div>
            </div>
          </div>
        ) : (
          /* Credentials entry form page */
          <div className="credentials-form-card">
            <span className="change-role-btn" onClick={() => setSelectedRole(null)}>
              <ArrowLeft size={14} /> Change role
            </span>

            <h2 className="form-title">
              {selectedRole === 'admin' ? 'Administrator' : selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Login
            </h2>
            <p className="form-subtitle">Secure, private access to KidVista</p>

            {error && <div className="error-badge-msg">{error}</div>}

            <form onSubmit={handleSubmit} className="login-form-widget">
              <div className="form-group-item">
                <label>Email Address</label>
                <div className="input-icon-box">
                  <Mail size={16} className="inp-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={`e.g. ${selectedRole}@kidvista.com`}
                    required
                  />
                </div>
              </div>

              <div className="form-group-item">
                <div className="label-row-forgot">
                  <label>Password</label>
                  {selectedRole === 'admin' && (
                    <span className="forgot-lnk" onClick={() => setShowResetModal(true)}>
                      Forgot password?
                    </span>
                  )}
                </div>
                <div className="input-icon-box">
                  <Lock size={16} className="inp-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <span className="pass-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </span>
                </div>
              </div>

              {selectedRole === 'admin' && (
                <div className="form-group-item">
                  <label>Admin Secret Code</label>
                  <div className="input-icon-box">
                    <ShieldCheck size={16} className="inp-icon" />
                    <input
                      type="password"
                      value={adminSecret}
                      onChange={(e) => setAdminSecret(e.target.value)}
                      placeholder="Enter secret code"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="remember-row">
                <label className="checkbox-wrap">
                  <input type="checkbox" defaultChecked />
                  <span className="checkbox-lbl">Remember me</span>
                </label>
              </div>

              <button type="submit" className="btn btn-primary form-submit-btn" disabled={loading}>
                {loading ? 'Authenticating...' : `Sign In as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
              </button>
            </form>



            <div className="secure-login-notice">
              <Lock size={14} color="var(--color-primary)" />
              <div>
                <strong>Secure Login</strong>
                <p>KidVista uses end-to-end encryption. Your child's data is never shared or sold. COPPA & GDPR compliant.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reset password Modal */}
      {showResetModal && (
        <div className="modal-backdrop">
          <div className="reset-modal-panel">
            <h3>Reset Admin Password</h3>
            {resetError && <div className="error-badge-msg">{resetError}</div>}
            {resetSuccess && <div className="success-badge-msg">{resetSuccess}</div>}
            
            <form onSubmit={handleResetSubmit}>
              <div className="form-group-item" style={{ marginBottom: '1rem' }}>
                <label>Admin Email</label>
                <input
                  type="email"
                  className="modal-inp"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="akhilkumarchada86@gmail.com"
                  required
                />
              </div>
              <div className="form-group-item" style={{ marginBottom: '1rem' }}>
                <label>Admin Secret Code</label>
                <input
                  type="password"
                  className="modal-inp"
                  value={resetSecret}
                  onChange={(e) => setResetSecret(e.target.value)}
                  placeholder="Enter secret code"
                  required
                />
              </div>
              <div className="form-group-item" style={{ marginBottom: '1.5rem' }}>
                <label>New Password</label>
                <input
                  type="password"
                  className="modal-inp"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowResetModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={resetLoading}>
                  {resetLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .login-split-container {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          min-height: 100vh;
          font-family: 'Outfit', sans-serif;
          background-color: #ffffff;
        }

        .login-left-pane {
          background: linear-gradient(135deg, var(--color-primary), var(--color-purple));
          color: #ffffff;
          padding: 3.5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
        }

        .back-link {
          position: absolute;
          top: 2rem;
          left: 3.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: rgba(255,255,255,0.8);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          transition: var(--transition-smooth);
        }

        .back-link:hover {
          color: #ffffff;
        }

        .left-pane-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .brand-logo-circle {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
        }

        .left-pane-brand h2 {
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .left-pane-main {
          max-width: 420px;
          text-align: left;
        }

        .left-role-avatar {
          font-size: 4rem;
          display: block;
          margin-bottom: 1rem;
          animation: float 4s ease-in-out infinite;
        }

        .left-pane-main h1 {
          font-size: 2.8rem;
          font-weight: 800;
          line-height: 1.15;
          margin-bottom: 1rem;
        }

        .left-pane-main p {
          font-size: 1.05rem;
          opacity: 0.85;
          line-height: 1.6;
        }

        .left-pane-footer {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .encryption-pill {
          background: rgba(255,255,255,0.12);
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          font-size: 0.82rem;
          line-height: 1.4;
          font-weight: 600;
          text-align: left;
        }

        .trust-families-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 0.88rem;
          font-weight: 600;
        }

        .avatar-group {
          display: flex;
        }

        .avatar-group-item {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 0.7rem;
          margin-right: -8px;
        }

        .avatar-group-item.bg-pink { background: var(--color-pink); }
        .avatar-group-item.bg-blue { background: var(--color-blue); border-color: var(--color-purple); }
        .avatar-group-item.bg-green { background: var(--color-green); }

        /* Right pane selector */
        .login-right-pane {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3.5rem;
          background: #F8FAFC;
        }

        .role-router-card, .credentials-form-card {
          width: 100%;
          max-width: 420px;
          text-align: left;
        }

        .role-router-card h2, .credentials-form-card h2 {
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--text-dark);
          margin-bottom: 0.25rem;
        }

        .router-sub {
          font-size: 0.95rem;
          color: var(--text-muted);
          margin-bottom: 2rem;
        }

        .role-options-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .role-option {
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.04);
          border-radius: 16px;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0,0,0,0.01);
          transition: var(--transition-smooth);
        }

        .role-option:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(79, 156, 249, 0.08);
          border-color: rgba(79, 156, 249, 0.2);
        }

        .role-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          flex-shrink: 0;
        }

        .role-icon.font-pink { background: #E3F2FD; }
        .role-icon.font-green { background: #E8F8EE; }
        .role-icon.font-blue { background: #E8F2FE; }

        .role-details h4 {
          font-size: 1rem;
          font-weight: 800;
          color: var(--text-dark);
          margin: 0;
        }

        .role-details p {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-top: 0.15rem;
          line-height: 1.4;
        }

        .role-arrow {
          margin-left: auto;
          color: #CBD5E1;
          transition: var(--transition-smooth);
        }

        .role-option:hover .role-arrow {
          color: var(--color-primary);
          transform: translateX(3px);
        }

        /* Credentials form */
        .change-role-btn {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--color-primary);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          margin-bottom: 1.5rem;
          transition: var(--transition-smooth);
        }

        .change-role-btn:hover {
          color: var(--color-primary-hover);
        }

        .form-subtitle {
          font-size: 0.95rem;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
        }

        .login-form-widget {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-group-item {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .form-group-item label {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-dark);
        }

        .label-row-forgot {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .forgot-lnk {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--color-primary);
          cursor: pointer;
        }

        .input-icon-box {
          position: relative;
        }

        .inp-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94A3B8;
        }

        .input-icon-box input {
          width: 100%;
          padding: 0.8rem 1rem 0.8rem 2.75rem;
          font-size: 0.92rem;
          border-radius: 12px;
          border: 1px solid #E2E8F0;
          background: #ffffff;
          outline: none;
          font-family: inherit;
          transition: var(--transition-smooth);
        }

        .input-icon-box input:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(79, 156, 249, 0.12);
        }

        .pass-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94A3B8;
          cursor: pointer;
        }

        .remember-row {
          margin-top: 0.25rem;
        }

        .checkbox-wrap {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .checkbox-lbl {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .form-submit-btn {
          width: 100%;
          border-radius: 12px;
          padding: 0.85rem;
          font-weight: 700;
          margin-top: 0.5rem;
        }

        .error-badge-msg {
          background: #E3F2FD;
          color: #4F9CF9;
          border-radius: 10px;
          padding: 0.6rem 1rem;
          font-size: 0.82rem;
          font-weight: 700;
          margin-bottom: 1rem;
          border-left: 4px solid #4F9CF9;
        }

        .success-badge-msg {
          background: #E8F8EE;
          color: var(--color-success);
          border-radius: 10px;
          padding: 0.6rem 1rem;
          font-size: 0.82rem;
          font-weight: 700;
          margin-bottom: 1rem;
          border-left: 4px solid var(--color-success);
        }

        /* Demo badge click indicator */
        .demo-fill-card {
          margin-top: 1.5rem;
          background: #F1F5F9;
          border: 1px dashed #CBD5E1;
          border-radius: 12px;
          padding: 0.85rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.85rem;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .demo-fill-card:hover {
          background: #E2E8F0;
          transform: translateY(-1px);
        }

        .fill-icon {
          font-size: 1.5rem;
        }

        .demo-fill-card strong {
          display: block;
          font-size: 0.85rem;
          color: var(--text-dark);
        }

        .demo-fill-card p {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 0;
        }

        .secure-login-notice {
          margin-top: 1.5rem;
          background: #E8F2FE;
          border-radius: 12px;
          padding: 0.85rem 1rem;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          font-size: 0.78rem;
          line-height: 1.4;
        }

        .secure-login-notice strong {
          color: var(--color-primary);
          display: block;
          margin-bottom: 0.1rem;
        }

        .secure-login-notice p {
          margin: 0;
          color: #475569;
        }

        /* Modal styling */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(2px);
          display: flex;
          justify-content: center;
          align-items: center;
          zIndex: 1000;
        }

        .reset-modal-panel {
          background: #ffffff;
          padding: 2.25rem;
          border-radius: 18px;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }

        .reset-modal-panel h3 {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--text-dark);
          margin-bottom: 1.25rem;
        }

        .modal-inp {
          width: 100%;
          padding: 0.75rem;
          border-radius: 8px;
          border: 1px solid #E2E8F0;
          outline: none;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          margin-top: 1.5rem;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @media (max-width: 850px) {
          .login-split-container {
            grid-template-columns: 1fr;
          }
          .login-left-pane {
            display: none;
          }
          .login-right-pane {
            padding: 2.5rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
