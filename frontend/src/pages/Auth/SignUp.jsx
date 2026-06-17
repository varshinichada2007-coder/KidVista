import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { User, Mail, Lock, AlertCircle, UserPlus } from 'lucide-react';

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
            setSuccess(message);

            setTimeout(() => {
                navigate('/login');
            }, 1200);
        } catch (err) {
            setError(err || 'Signup failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-wrapper">
            <div className="signup-card">
                <div className="signup-header">
                    <span className="school-logo-lrg">🏫</span>
                    <h2>Create Account</h2>
                    <p>Signup is only for teachers and parents</p>
                </div>

                {error && (
                    <div className="error-alert">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="success-alert">
                        <UserPlus size={18} />
                        <span>{success}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="signup-form">
                    <div className="form-group">
                        <label>Full Name</label>
                        <div className="input-with-icon">
                            <User size={18} className="input-icon" />
                            <input
                                type="text"
                                name="name"
                                className="form-control"
                                placeholder="Enter full name"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <div className="input-with-icon">
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                name="email"
                                className="form-control"
                                placeholder="Enter email address"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-with-icon">
                            <Lock size={18} className="input-icon" />
                            <input
                                type="password"
                                name="password"
                                className="form-control"
                                placeholder="Create password"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Select Role</label>
                        <select
                            name="role"
                            className="form-control"
                            value={form.role}
                            onChange={handleChange}
                        >
                            <option value="parent">Parent</option>
                            <option value="teacher">Teacher</option>
                        </select>
                    </div>

                    {form.role === 'parent' && (
                        <>
                            <div className="form-group">
                                <label>Child Name</label>
                                <input
                                    type="text"
                                    name="childName"
                                    className="form-control"
                                    placeholder="Enter child's full name"
                                    value={form.childName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Child Age</label>
                                <input
                                    type="number"
                                    name="childAge"
                                    className="form-control"
                                    placeholder="Enter child's age"
                                    value={form.childAge}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Requested Classroom</label>
                                <select
                                    name="requestedClassroom"
                                    className="form-control"
                                    value={form.requestedClassroom}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Nursery A">Nursery A</option>
                                    <option value="Nursery B">Nursery B</option>
                                    <option value="LKG A">LKG A</option>
                                    <option value="LKG B">LKG B</option>
                                    <option value="UKG A">UKG A</option>
                                </select>
                            </div>
                        </>
                    )}

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p className="login-text">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>

            <style>{`
        .signup-wrapper {
          min-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          font-family: 'Outfit', sans-serif;
        }

        .signup-card {
          width: 100%;
          max-width: 450px;
          padding: 2.5rem;
          border-radius: 18px;
          background: white;
          box-shadow: 0 20px 45px rgba(255, 107, 139, 0.12);
        }

        .signup-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .school-logo-lrg {
          font-size: 3rem;
          display: block;
          margin-bottom: 0.5rem;
        }

        .signup-header h2 {
          font-size: 1.6rem;
          font-weight: 800;
          color: #2C3E50;
        }

        .signup-header p {
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

        .success-alert {
          background: #E8F5E9;
          border: 1px solid rgba(46,125,50,0.3);
          border-radius: 10px;
          color: #2E7D32;
          padding: 0.75rem 1rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.88rem;
          font-weight: 600;
        }

        .login-text {
          text-align: center;
          margin-top: 1rem;
          font-size: 0.9rem;
        }

        .login-text a {
          color: #FF6B8B;
          font-weight: 800;
          text-decoration: none;
        }
      `}</style>
        </div>
    );
};

export default Signup;