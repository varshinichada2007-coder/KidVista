import React, { useState, useEffect, useContext } from 'react';
import API from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import PrivacyBadge from '../../components/PrivacyBadge';
import { Sparkles, Heart, Megaphone, Calendar, ArrowRight, GraduationCap, Bell, BellOff, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ParentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [children, setChildren] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const response = await API.get('/parent/notifications');
      setNotifications(response.data);
    } catch (err) {
      console.error('Could not fetch notifications:', err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await API.put(`/parent/notifications/${id}/read`);
      await fetchNotifications();
    } catch (err) {
      console.error('Could not mark notification as read:', err);
    }
  };

  const fetchData = async () => {
    try {
      if (user && user.status === 'approved') {
        const [statsRes, childRes, annRes] = await Promise.all([
          API.get('/parent/stats'),
          API.get('/parent/child'),
          API.get('/parent/announcements')
        ]);
        setStats(statsRes.data);
        setChildren(childRes.data);
        setAnnouncements(annRes.data);
      }
      await fetchNotifications();
    } catch (err) {
      setError('Could not retrieve child profile statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const unreadNotificationsCount = notifications.filter(n => n.readStatus === 'unread').length;

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="My Child's Preschool Portal" />
        <div className="content-body">
          <PrivacyBadge />

          {/* Premium Notification Center Bar */}
          <div className="glass-panel notification-center-bar" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.5rem',
            marginBottom: '1.5rem',
            background: 'rgba(255, 255, 255, 0.75)',
            borderRadius: '16px',
            position: 'relative',
            zIndex: 50
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>🔔</span>
              <span style={{ fontWeight: 700, color: '#2C3E50' }}>Notification Center</span>
            </div>
            
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="btn btn-outline"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                cursor: 'pointer',
                background: unreadNotificationsCount > 0 ? '#FFE8EC' : 'none',
                borderColor: '#FF6B8B',
                color: '#FF6B8B',
                position: 'relative',
                fontWeight: 700,
                border: '1px solid #FF6B8B'
              }}
            >
              <Bell size={18} />
              <span>Inbox</span>
              {unreadNotificationsCount > 0 && (
                <span style={{
                  background: '#FF6B8B',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 800
                }}>
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="glass-panel notifications-dropdown" style={{
                position: 'absolute',
                top: '60px',
                right: '1.5rem',
                width: '320px',
                maxHeight: '400px',
                overflowY: 'auto',
                background: 'white',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                borderRadius: '12px',
                zIndex: 999,
                padding: '1rem',
                textAlign: 'left'
              }}>
                <h4 style={{ marginBottom: '0.75rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', color: '#2C3E50' }}>
                  Latest Messages
                </h4>
                {notifications.length === 0 ? (
                  <p style={{ color: '#aaa', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>
                    No notifications yet.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {notifications.map(n => (
                      <div key={n.id} style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        background: n.readStatus === 'unread' ? '#FFE8EC' : '#F8F9FA',
                        borderLeft: n.readStatus === 'unread' ? '4px solid #FF6B8B' : '4px solid #BDC3C7',
                        fontSize: '0.85rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.3rem'
                      }}>
                        <p style={{ margin: 0, color: '#2C3E50', lineHeight: 1.3 }}>{n.message}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                          <span style={{ fontSize: '0.7rem', color: '#7f8c8d' }}>
                            {new Date(n.createdAt).toLocaleTimeString()}
                          </span>
                          {n.readStatus === 'unread' && (
                            <button
                              onClick={() => handleMarkAsRead(n.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#2E7D32',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                                padding: 0
                              }}
                            >
                              <CheckCircle size={12} /> Mark Read
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>🏫 Loading dashboard...</div>
          ) : error ? (
            <div className="error-alert">{error}</div>
          ) : user && user.status === 'pending' ? (
            <div className="glass-panel text-center" style={{
              padding: '4rem 2rem',
              background: 'linear-gradient(135deg, rgba(255, 107, 139, 0.05), rgba(77, 150, 255, 0.05))',
              borderLeft: '5px solid #FF6B8B',
              borderRadius: '16px',
              marginTop: '1rem'
            }}>
              <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1.5rem' }}>⏳</span>
              <h2 style={{ color: '#FF6B8B', fontWeight: 800, fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                Your account is pending admin approval.
              </h2>
              <p style={{ color: '#7f8c8d', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto', lineHeight: 1.5 }}>
                Thank you for registering! The preschool administrators are currently reviewing your parent application. 
                Once approved, you will have complete access to your child's private gallery, daily memory wall, activity timeline, and teacher communications.
              </p>
            </div>
          ) : (
            <>
              {/* Dashboard Hero Greeting */}
              <div className="glass-panel parent-welcome-hero">
                <div>
                  <h2 style={{ color: '#FF6B8B', fontWeight: 800 }}>
                    Hello, {children.map(c => c.student_name.split(' ')[0]).join(' & ')}'s Family!
                  </h2>
                  <p style={{ color: '#7f8c8d', fontSize: '0.95rem', marginTop: '0.2rem' }}>
                    Track daily updates, view photos, and celebrate classroom milestones.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-primary" onClick={() => navigate('/parent/gallery')}>
                    Open Photo Gallery
                  </button>
                  <button className="btn btn-outline" onClick={() => navigate('/parent/memory-wall')}>
                    <Heart size={16} fill="#FF6B8B" color="#FF6B8B" /> Memory Wall
                  </button>
                </div>
              </div>

              {/* Stats Cards row */}
              <div className="stats-grid">
                <div className="stat-card green" onClick={() => navigate('/parent/gallery')} style={{ cursor: 'pointer' }}>
                  <div className="stat-icon green">
                    <Heart size={24} />
                  </div>
                  <div className="stat-details">
                    <h3>{stats.totalPhotos}</h3>
                    <p>Tagged Photos of Your Child</p>
                  </div>
                </div>

                <div className="stat-card blue" onClick={() => navigate('/parent/timeline')} style={{ cursor: 'pointer' }}>
                  <div className="stat-icon blue">
                    <Calendar size={24} />
                  </div>
                  <div className="stat-details">
                    <h3 style={{ fontSize: '1.25rem', padding: '0.4rem 0' }}>Latest Event</h3>
                    <p>{stats.latestActivity}</p>
                  </div>
                </div>

                <div className="stat-card purple" onClick={() => navigate('/parent/announcements')} style={{ cursor: 'pointer' }}>
                  <div className="stat-icon purple">
                    <Megaphone size={24} />
                  </div>
                  <div className="stat-details">
                    <h3>{stats.totalAnnouncements}</h3>
                    <p>Active School Notices</p>
                  </div>
                </div>
              </div>

              {/* Kids Profile Section & Notice Boards Grid */}
              <div className="parent-dash-layout">
                {/* Child profile cards */}
                <div className="children-cards-column">
                  <h3>My Children</h3>
                  <div className="kids-list-wrap">
                    {children.map((child) => (
                      <div key={child.student_id} className="glass-panel kid-profile-card">
                        <div className="kid-emblem">👶</div>
                        <div className="kid-card-details">
                          <h4>{child.student_name}</h4>
                          <p className="kid-classroom-name">🏫 Classroom: <strong>{child.classroom_name || 'Not Assigned'}</strong></p>
                          <p style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>Teacher: <strong>{child.teacherName}</strong></p>
                          <button className="btn-text-link" onClick={() => navigate('/parent/my-child')} style={{ marginTop: '0.5rem' }}>
                            View child profile <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Announcements stream */}
                <div className="announcements-column">
                  <div className="glass-panel text-left">
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Megaphone size={18} color="#FF6B8B" /> School Announcements
                    </h3>
                    
                    {announcements.length === 0 ? (
                      <p style={{ color: '#aaa', fontSize: '0.9rem', fontStyle: 'italic' }}>No active notices at this time.</p>
                    ) : (
                      <div className="dash-announcements-list">
                        {announcements.slice(0, 3).map((ann) => (
                          <div key={ann.id} className="dash-announcement-card">
                            <span className="ann-date">📅 {new Date(ann.created_at).toLocaleDateString()}</span>
                            <h4>{ann.title}</h4>
                            <p>{ann.message.length > 120 ? ann.message.substring(0, 120) + '...' : ann.message}</p>
                          </div>
                        ))}
                        {announcements.length > 3 && (
                          <button className="btn-text-link" onClick={() => navigate('/parent/announcements')} style={{ marginTop: '0.5rem' }}>
                            View all notices <ArrowRight size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .parent-welcome-hero {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, rgba(107, 203, 119, 0.05), rgba(77, 150, 255, 0.05));
          padding: 2rem;
          border-left: 5px solid var(--color-green);
        }

        .parent-dash-layout {
          display: grid;
          grid-template-columns: 1fr 1.25fr;
          gap: 2rem;
          margin-top: 1.5rem;
          align-items: flex-start;
          font-family: 'Outfit', sans-serif;
        }

        @media (max-width: 992px) {
          .parent-dash-layout {
            grid-template-columns: 1fr;
          }
        }

        .children-cards-column h3, .announcements-column h3 {
          font-size: 1.2rem;
          font-weight: 700;
          color: #2C3E50;
          margin-bottom: 1rem;
        }

        .kids-list-wrap {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .kid-profile-card {
          display: flex;
          gap: 1.25rem;
          align-items: center;
          padding: 1.25rem 1.5rem;
          margin-bottom: 0;
          background: white;
        }

        .kid-emblem {
          font-size: 3rem;
          animation: float 4s ease-in-out infinite;
        }

        .kid-card-details h4 {
          font-size: 1.15rem;
          font-weight: 700;
          color: #2C3E50;
        }

        .kid-classroom-name {
          font-size: 0.9rem;
          color: #5A6A85;
          margin-top: 0.1rem;
        }

        .btn-text-link {
          background: transparent;
          border: none;
          color: var(--color-pink);
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.2rem;
          padding: 0;
          transition: transform 0.2s;
        }

        .btn-text-link:hover {
          color: #FF4A70;
          transform: translateX(3px);
        }

        .dash-announcements-list {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .dash-announcement-card {
          border-bottom: 1px dashed rgba(0,0,0,0.06);
          padding-bottom: 1rem;
        }

        .dash-announcement-card:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .ann-date {
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .dash-announcement-card h4 {
          font-size: 1rem;
          font-weight: 700;
          color: #2C3E50;
          margin: 0.2rem 0;
        }

        .dash-announcement-card p {
          font-size: 0.85rem;
          color: #5A6A85;
          line-height: 1.4;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @media (max-width: 768px) {
          .parent-welcome-hero {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .parent-welcome-hero button, .parent-welcome-hero div {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ParentDashboard;
