import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';

const Navbar = ({ title = "Admin Portal" }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'AD';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Centre administrator';
      case 'teacher': return 'Class teacher';
      case 'parent': return 'Parent';
      default: return role;
    }
  };

  return (
    <nav className="top-navbar">
      {/* Search Bar */}
      <div className="navbar-search">
        <Search size={15} className="search-icon" />
        <input
          type="text"
          placeholder="Search students, photos, activities..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Right side */}
      <div className="navbar-right">
        {/* Admin Portal badge */}
        <button className="admin-portal-badge" onClick={() => navigate('/admin')}>
          Admin Portal
        </button>

        {/* Notification bell */}
        <button className="navbar-bell-btn">
          <Bell size={18} />
        </button>

        {/* User Info */}
        {user && (
          <div className="navbar-user-info" onClick={handleLogout} title="Click to logout" style={{ cursor: 'pointer' }}>
            <div className="navbar-avatar">
              {getInitials(user.name)}
            </div>
            <div className="navbar-user-text">
              <span className="navbar-user-name">{user.name || 'Admin'}</span>
              <span className="navbar-user-role">{getRoleLabel(user.role)}</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .top-navbar {
          height: 64px;
          background: #ffffff;
          border-bottom: 1px solid #F1F5F9;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          position: sticky;
          top: 0;
          z-index: 100;
          gap: 1.5rem;
          font-family: 'Outfit', sans-serif;
        }

        .navbar-search {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 0.5rem 0.9rem;
          min-width: 280px;
          max-width: 380px;
          flex: 1;
        }

        .search-icon {
          color: #94A3B8;
          flex-shrink: 0;
        }

        .search-input {
          border: none;
          background: transparent;
          outline: none;
          font-size: 0.875rem;
          color: #475569;
          font-family: 'Outfit', sans-serif;
          width: 100%;
        }

        .search-input::placeholder {
          color: #94A3B8;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-shrink: 0;
        }

        .admin-portal-badge {
          background: transparent;
          border: none;
          font-size: 0.875rem;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          font-family: 'Outfit', sans-serif;
          transition: background 0.2s;
        }

        .admin-portal-badge:hover {
          background: #F1F5F9;
        }

        .navbar-bell-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          color: #64748B;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          transition: background 0.2s, color 0.2s;
        }

        .navbar-bell-btn:hover {
          background: #F1F5F9;
          color: #334155;
        }

        .navbar-user-info {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.3rem 0.5rem;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .navbar-user-info:hover {
          background: #F8FAFC;
        }

        .navbar-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #4F9CF9;
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .navbar-user-text {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }

        .navbar-user-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1E293B;
        }

        .navbar-user-role {
          font-size: 0.75rem;
          color: #94A3B8;
          font-weight: 400;
        }

        @media (max-width: 768px) {
          .navbar-search { min-width: 0; }
          .admin-portal-badge { display: none; }
          .navbar-user-text { display: none; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
