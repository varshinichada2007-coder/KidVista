import React, { useContext, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard, BarChart3, Users, GraduationCap,
  BookOpen, CheckSquare, Bell, Settings, LogOut,
  Image, PlusCircle, Clock, User, UserCog, Menu, X
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const toggleSidebar = () => setIsOpen(!isOpen);

  const getRoutes = () => {
    switch (user.role) {
      case 'admin':
        return [
          { path: '/admin', name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
          { path: '/admin?tab=analytics', name: 'Analytics', icon: <BarChart3 size={18} /> },
          { path: '/admin?tab=users', name: 'Users', icon: <Users size={18} /> },
          { path: '/admin/students', name: 'Students', icon: <GraduationCap size={18} /> },
          { path: '/admin?tab=classrooms', name: 'Classes', icon: <BookOpen size={18} /> },
          { path: '/admin/approvals', name: 'Photo Approval', icon: <Image size={18} /> },
          { path: '/admin/announcements', name: 'Notifications', icon: <Bell size={18} /> },
          { path: '/admin?tab=settings', name: 'Settings', icon: <Settings size={18} /> },
        ];
      case 'teacher':
        return [
          { path: '/teacher', name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
          { path: '/teacher/upload', name: 'Upload Photos', icon: <Image size={18} /> },
          { path: '/teacher/tagging', name: 'Student Tagging', icon: <Users size={18} /> },
          { path: '/teacher/activities', name: 'Activities', icon: <PlusCircle size={18} /> },
          { path: '/teacher/attendance', name: 'Attendance', icon: <CheckSquare size={18} /> },
          { path: '/teacher/notifications', name: 'Notifications', icon: <Bell size={18} /> },
        ];
      case 'parent':
        if (user.status === 'pending') {
          return [{ path: '/parent', name: 'Dashboard', icon: <LayoutDashboard size={18} /> }];
        }
        return [
          { path: '/parent', name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
          { path: '/parent/my-child', name: "My Child's Day", icon: <Clock size={18} /> },
          { path: '/parent/gallery', name: 'Photo Gallery', icon: <Image size={18} /> },
          { path: '/parent/attendance', name: 'Attendance', icon: <CheckSquare size={18} /> },
          { path: '/parent/notifications', name: 'Notifications', icon: <Bell size={18} /> },
          { path: '/parent/profile', name: 'Profile', icon: <User size={18} /> },
        ];
      default:
        return [];
    }
  };

  const routes = getRoutes();

  return (
    <>
      {/* Mobile Toggle */}
      <button className="sidebar-mobile-toggle" onClick={toggleSidebar}>
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar} />}

      <aside className={`sidebar-aside ${isOpen ? 'mobile-open' : ''}`}>
        {/* Logo Header */}
        <div className="sidebar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="sidebar-logo-badge">FC</div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">KidVista</span>
            <span className="sidebar-logo-sub">FIRSTCRY INTELLITOTS</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {routes.map((route, idx) => {
            const currentPath = location.pathname + location.search;
            // Exact match, or match base path if no search params and route is base
            const isActive = currentPath === route.path || 
              (route.path === '/admin' && currentPath === '/admin') ||
              (route.path === '/teacher' && currentPath === '/teacher') ||
              (route.path === '/parent' && currentPath === '/parent');

            return (
              <NavLink
                key={idx}
                to={route.path}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <span className="sidebar-nav-icon">{route.icon}</span>
                <span className="sidebar-nav-label">{route.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sign Out at bottom */}
        <div className="sidebar-bottom">
          <div className="sidebar-nav-item signout-item" onClick={handleLogout}>
            <span className="sidebar-nav-icon"><LogOut size={18} /></span>
            <span className="sidebar-nav-label">Sign out</span>
          </div>
        </div>
      </aside>

      <style>{`
        .sidebar-aside {
          width: 220px;
          background: #ffffff;
          border-right: 1px solid #F1F5F9;
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          display: flex;
          flex-direction: column;
          z-index: 99;
          transition: transform 0.3s ease;
          font-family: 'Outfit', sans-serif;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 1.25rem 1.25rem 1rem 1.25rem;
          border-bottom: 1px solid #F8FAFC;
        }

        .sidebar-logo-badge {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #4F9CF9;
          color: white;
          font-size: 0.75rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sidebar-logo-text {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }

        .sidebar-logo-title {
          font-size: 1.05rem;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.02em;
        }

        .sidebar-logo-sub {
          font-size: 0.45rem;
          font-weight: 600;
          color: #94A3B8;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          overflow-y: auto;
        }

        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.6rem 0.75rem;
          color: #64748B;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 8px;
          transition: all 0.15s ease;
          cursor: pointer;
          border: none;
          background: transparent;
          width: 100%;
        }

        .sidebar-nav-item:hover {
          background: #F8FAFC;
          color: #334155;
        }

        .sidebar-nav-item.active {
          background: #EFF6FF;
          color: #2563EB;
          font-weight: 600;
        }

        .sidebar-nav-item.active .sidebar-nav-icon {
          color: #2563EB;
        }

        .sidebar-nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sidebar-nav-label {
          flex: 1;
        }

        .sidebar-bottom {
          padding: 0.75rem;
          border-top: 1px solid #F1F5F9;
        }

        .signout-item {
          color: #94A3B8;
        }

        .signout-item:hover {
          color: #EF4444;
          background: #FEF2F2;
        }

        .sidebar-mobile-toggle {
          display: none;
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: #4F9CF9;
          color: white;
          border: none;
          cursor: pointer;
          z-index: 100;
          box-shadow: 0 4px 15px rgba(79, 156, 249, 0.3);
          align-items: center;
          justify-content: center;
        }

        .sidebar-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.3);
          z-index: 98;
        }

        @media (max-width: 992px) {
          .sidebar-aside {
            transform: translateX(-100%);
          }
          .sidebar-aside.mobile-open {
            transform: translateX(0);
          }
          .sidebar-mobile-toggle {
            display: flex;
          }
          .sidebar-overlay {
            display: block;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
