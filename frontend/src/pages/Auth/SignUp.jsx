import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { User, Mail, Lock, AlertCircle, ArrowLeft, ShieldCheck, CheckCircle } from 'lucide-react';

const Signup = () => {
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'parent',
    childName: '',
    childAge: '',
    requestedClassroom: 'Nursery A'
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleToggle = (selectedRole) => {
    setForm({
      ...form,
      role: selectedRole
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.role) {
      setError('Please fill in all fields.');
      return;
    }

    if (form.role === 'admin') {
      setError('Admin signup is not allowed.');
      return;
    }

    if (form.role === 'parent' && (!form.childName || !form.childAge || !form.requestedClassroom)) {
      setError('Please fill in Child Name, Age, and Requested Classroom.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const message = await signup(
        form.name,
        form.email,
        form.password,
        form.role,
        form.childName,
        form.childAge,
        form.requestedClassroom
      );
      setSuccess(message || 'Account registration submitted successfully.');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err || 'Signup failed.');
    } finally {
      setLoading(false);
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
            {form.role === 'teacher' ? '👩‍🏫' : '👨‍👩‍👧'}
          </span>
          <h1>
            Join the <br />
            KidVista Family
          </h1>
          <p>
            Create an account to securely access daily classroom photos, student tagging, attendance histories, and development milestones.
          </p>
        </div>

        <div className="left-pane-footer">
          <div className="encryption-pill">
            🛡️ Regulatory compliance: SOC 2 Type II certified, COPPA & GDPR compliant.
          </div>

          <div className="trust-families-row">
            <span>Already have an account? <Link to="/login" style={{ color: 'white', fontWeight: 800 }}>Sign In</Link></span>
          </div>
        </div>
      </div>

      {/* Right side form */}
      <div className="login-right-pane" style={{ overflowY: 'auto' }}>
        <div className="credentials-form-card" style={{ padding: '2rem 0' }}>
          <h2 className="form-title">Create Account</h2>
          <p className="form-subtitle">Register a new parent or teacher account</p>

          {error && <div className="error-badge-msg">{error}</div>}
          {success && <div className="success-badge-msg">{success}</div>}

          <form onSubmit={handleSubmit} className="login-form-widget">
            {/* Role picker tabs */}
            <div className="signup-role-tabs">
              <span 
                className={`signup-role-tab ${form.role === 'parent' ? 'active' : ''}`}
                onClick={() => handleRoleToggle('parent')}
              >
                👪 Parent
              </span>
              <span 
                className={`signup-role-tab ${form.role === 'teacher' ? 'active' : ''}`}
                onClick={() => handleRoleToggle('teacher')}
              >
                👩‍🏫 Teacher
              </span>
            </div>

            <div className="form-group-item">
              <label>Full Name</label>
              <div className="input-icon-box">
                <User size={16} className="inp-icon" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Priya Sharma"
                  required
                />
              </div>
            </div>

            <div className="form-group-item">
              <label>Email Address</label>
              <div className="input-icon-box">
                <Mail size={16} className="inp-icon" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="e.g. priya@gmail.com"
                  required
                />
              </div>
            </div>

            <div className="form-group-item">
              <label>Password</label>
              <div className="input-icon-box">
                <Lock size={16} className="inp-icon" />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  required
                />
              </div>
            </div>

            {form.role === 'parent' && (
              <>
                <div className="child-section-divider">Child Information</div>

                <div className="form-group-item">
                  <label>Child Full Name</label>
                  <input
                    type="text"
                    name="childName"
                    value={form.childName}
                    onChange={handleChange}
                    placeholder="e.g. Aarav Sharma"
                    className="child-inp"
                    required
                  />
                </div>

                <div className="form-group-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group-item">
                    <label>Child Age</label>
                    <input
                      type="number"
                      name="childAge"
                      value={form.childAge}
                      onChange={handleChange}
                      placeholder="e.g. 4"
                      className="child-inp"
                      min="1"
                      max="12"
                      required
                    />
                  </div>

                  <div className="form-group-item">
                    <label>Requested Class</label>
                    <select
                      name="requestedClassroom"
                      value={form.requestedClassroom}
                      onChange={handleChange}
                      className="child-inp-select"
                      required
                    >
                      <option value="Nursery A">Nursery A</option>
                      <option value="Nursery B">Nursery B</option>
                      <option value="LKG A">LKG A</option>
                      <option value="LKG B">LKG B</option>
                      <option value="UKG A">UKG A</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary form-submit-btn" disabled={loading} style={{ marginTop: '1rem' }}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <p className="signup-switch-lnk">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>

      <style>{`
        /* Reuse split login styles */
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
        }

        .left-pane-brand h2 {
          font-size: 1.25rem;
          font-weight: 800;
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

        .encryption-pill {
          background: rgba(255,255,255,0.12);
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          font-size: 0.82rem;
          font-weight: 600;
        }

        .trust-families-row {
          font-size: 0.88rem;
          font-weight: 600;
        }

        .login-right-pane {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3.5rem;
          background: #F8FAFC;
        }

        .credentials-form-card {
          width: 100%;
          max-width: 420px;
          text-align: left;
        }

        .form-subtitle {
          font-size: 0.95rem;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
        }

        .signup-role-tabs {
          display: flex;
          background: #E2E8F0;
          padding: 0.25rem;
          border-radius: 10px;
          gap: 0.25rem;
          margin-bottom: 0.5rem;
        }

        .signup-role-tab {
          flex: 1;
          padding: 0.5rem;
          text-align: center;
          font-size: 0.85rem;
          font-weight: 700;
          color: #64748B;
          border-radius: 8px;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .signup-role-tab.active {
          background: #ffffff;
          color: var(--color-primary);
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
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
        }

        .input-icon-box input:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(79, 156, 249, 0.12);
        }

        .child-section-divider {
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--color-primary);
          text-transform: uppercase;
          letter-spacing: 0.8px;
          border-bottom: 1px dashed #CBD5E1;
          padding-bottom: 0.4rem;
          margin-top: 0.75rem;
          margin-bottom: 0.25rem;
        }

        .child-inp {
          width: 100%;
          padding: 0.8rem 1rem;
          font-size: 0.92rem;
          border-radius: 12px;
          border: 1px solid #E2E8F0;
          background: #ffffff;
          outline: none;
          font-family: inherit;
        }

        .child-inp:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(79, 156, 249, 0.12);
        }

        .child-inp-select {
          width: 100%;
          padding: 0.8rem 1rem;
          font-size: 0.92rem;
          border-radius: 12px;
          border: 1px solid #E2E8F0;
          background: #ffffff;
          outline: none;
          font-family: inherit;
          cursor: pointer;
        }

        .child-inp-select:focus {
          border-color: var(--color-primary);
        }

        .form-submit-btn {
          width: 100%;
          border-radius: 12px;
          padding: 0.85rem;
          font-weight: 700;
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

        .signup-switch-lnk {
          text-align: center;
          margin-top: 1.25rem;
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .signup-switch-lnk a {
          color: var(--color-primary);
          font-weight: 700;
          text-decoration: none;
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

export default Signup;
