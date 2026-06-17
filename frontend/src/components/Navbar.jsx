import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ title = "Preschool Portal" }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'role-badge admin';
      case 'teacher': return 'role-badge teacher';
      case 'parent': return 'role-badge parent';
      default: return 'role-badge';
    }
  };

  return (
    <nav className="nav-header">
      <div className="nav-logo-group" onClick={() => navigate('/')}>
        <Sparkles className="logo-sparkle-icon" />
        <span className="nav-logo-title">Intellitots</span>
      </div>

      <div className="nav-page-title">{title}</div>

      <div className="nav-user-actions">
        {user ? (
          <>
            <div className="nav-user-profile">
              <div className="profile-avatar">
                <User size={18} />
              </div>
              <div className="profile-info-text">
                <span className="profile-username">{user.name}</span>
                <span className={getRoleBadgeClass(user.role)}>{user.role}</span>
              </div>
            </div>
            <button className="nav-logout-btn" onClick={handleLogout} title="Log Out">
              <LogOut size={18} />
              <span className="logout-text">Logout</span>
            </button>
          </>
        ) : (
          <button className="nav-login-redirect-btn" onClick={() => navigate('/login')}>
            Log In
          </button>
        )}
      </div>

      <style>{`
        .nav-header {
          height: 70px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.5);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 15px rgba(0,0,0,0.02);
          font-family: 'Outfit', sans-serif;
        }
        .nav-logo-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }
        .logo-sparkle-icon {
          color: #FF6B8B;
          fill: rgba(255, 107, 139, 0.2);
          animation: float 3s ease-in-out infinite;
        }
        .nav-logo-title {
          font-size: 1.3rem;
          font-weight: 800;
          background: linear-gradient(135deg, #FF6B8B, #4D96FF);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .nav-page-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #2C3E50;
        }
        .nav-user-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .nav-user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .profile-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(77, 150, 255, 0.1);
          color: #4D96FF;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        .profile-info-text {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }
        .profile-username {
          font-size: 0.9rem;
          font-weight: 600;
          color: #2C3E50;
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .role-badge {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          border-radius: 50px;
          padding: 0.1rem 0.5rem;
          margin-top: 0.15rem;
          width: fit-content;
        }
        .role-badge.admin { background: #FFE8EC; color: #FF6B8B; }
        .role-badge.teacher { background: #E8F5E9; color: #2E7D32; }
        .role-badge.parent { background: #E3F2FD; color: #1565C0; }

        .nav-logout-btn {
          background: transparent;
          border: 1px solid rgba(255, 107, 139, 0.25);
          color: #FF6B8B;
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          transition: all 0.2s;
        }
        .nav-logout-btn:hover {
          background: #FFE8EC;
          color: #FF6B8B;
          transform: translateY(-1px);
        }
        .nav-login-redirect-btn {
          background: #FF6B8B;
          color: white;
          border: none;
          padding: 0.5rem 1.2rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(255,107,139,0.25);
          transition: all 0.2s;
        }
        .nav-login-redirect-btn:hover {
          background: #FF4A70;
          transform: translateY(-2px);
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        @media (max-width: 768px) {
          .logout-text { display: none; }
          .nav-logout-btn { padding: 0.4rem; border-radius: 50%; }
          .nav-page-title { display: none; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
