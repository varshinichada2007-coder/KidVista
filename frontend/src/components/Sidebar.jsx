import React, { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, Users, UserCog, GraduationCap, 
  CheckSquare, Megaphone, PlusCircle, History, 
  Image, Heart, CalendarRange, Menu, X 
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Define navigation routes based on role
  const getRoutes = () => {
    switch (user.role) {
      case 'admin':
        return [
          { path: '/admin', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
          { path: '/admin/students', name: 'Students', icon: <GraduationCap size={20} /> },
          { path: '/admin/teachers', name: 'Teachers', icon: <Users size={20} /> },
          { path: '/admin/parents', name: 'Parents', icon: <UserCog size={20} /> },
          { path: '/admin/approvals', name: 'Photo Approvals', icon: <CheckSquare size={20} /> },
          { path: '/admin/announcements', name: 'Announcements', icon: <Megaphone size={20} /> },
        ];
      case 'teacher':
        return [
          { path: '/teacher', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
          { path: '/teacher/create-activity', name: 'Create Activity', icon: <PlusCircle size={20} /> },
          { path: '/teacher/history', name: 'Upload History', icon: <History size={20} /> },
        ];
      case 'parent':
        if (user.status === 'pending') {
          return [
            { path: '/parent', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
          ];
        }
        return [
          { path: '/parent', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
          { path: '/parent/my-child', name: 'My Child', icon: <GraduationCap size={20} /> },
          { path: '/parent/gallery', name: 'Secure Gallery', icon: <Image size={20} /> },
          { path: '/parent/memory-wall', name: 'Memory Wall', icon: <Heart size={20} /> },
          { path: '/parent/timeline', name: 'Activity Timeline', icon: <CalendarRange size={20} /> },
          { path: '/parent/announcements', name: 'School Notices', icon: <Megaphone size={20} /> },
        ];
      default:
        return [];
    }
  };

  const routes = getRoutes();

  return (
    <>
      {/* Mobile Toggle Button */}
      <button className="sidebar-mobile-toggle" onClick={toggleSidebar}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      <aside className={`sidebar-aside ${isOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="school-emblem">🏫</div>
          <div>
            <h2 className="school-name">FirstCry</h2>
            <p className="school-branch">Intellitots Preschool</p>
          </div>
        </div>

        <div className="sidebar-menu">
          <p className="menu-group-label">{user.role} workspace</p>
          {routes.map((route, idx) => (
            <NavLink 
              key={idx} 
              to={route.path} 
              className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
              end
            >
              <span className="menu-icon">{route.icon}</span>
              <span className="menu-text">{route.name}</span>
            </NavLink>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="safety-seal">
            🔒 Safe & Secure Portal
          </div>
        </div>
      </aside>

      <style>{`
        .sidebar-aside {
          width: 260px;
          background: #ffffff;
          border-right: 1px solid rgba(0, 0, 0, 0.05);
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

        .sidebar-header {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.03);
          background: linear-gradient(135deg, rgba(255, 107, 139, 0.02), rgba(77, 150, 255, 0.02));
        }

        .school-emblem {
          font-size: 2.2rem;
        }

        .school-name {
          font-size: 1.1rem;
          font-weight: 800;
          color: #FF6B8B;
        }

        .school-branch {
          font-size: 0.75rem;
          font-weight: 600;
          color: #7F8C8D;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .sidebar-menu {
          flex: 1;
          padding: 1.5rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          overflow-y: auto;
        }

        .menu-group-label {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #9E77F1;
          letter-spacing: 1px;
          margin-bottom: 0.6rem;
          padding-left: 0.75rem;
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          color: #5A6A85;
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 600;
          border-radius: 12px;
          transition: all 0.2s ease;
        }

        .menu-item:hover {
          background: rgba(77, 150, 255, 0.05);
          color: #4D96FF;
        }

        .menu-item.active {
          background: #FFE8EC;
          color: #FF6B8B;
        }

        .menu-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sidebar-footer {
          padding: 1.5rem 1rem;
          border-top: 1px solid rgba(0, 0, 0, 0.03);
        }

        .safety-seal {
          background: rgba(107, 203, 119, 0.08);
          color: #2E7D32;
          font-size: 0.8rem;
          font-weight: 700;
          text-align: center;
          padding: 0.6rem;
          border-radius: 8px;
        }

        /* Mobile Adjustments */
        .sidebar-mobile-toggle {
          display: none;
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: #FF6B8B;
          color: white;
          border: none;
          cursor: pointer;
          z-index: 100;
          box-shadow: 0 4px 15px rgba(255,107,139,0.3);
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
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(2px);
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
