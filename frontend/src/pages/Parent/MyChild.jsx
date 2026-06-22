import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import PrivacyBadge from '../../components/PrivacyBadge';
import { 
  Mail, Shield, Award, CalendarDays, UserCheck, 
  CheckCircle, XCircle, Utensils, Heart, Activity, AlertTriangle 
} from 'lucide-react';

const MyChild = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get active tab from URL query parameter ?tab=
  const getActiveTabFromUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || 'profile';
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromUrl());
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sync state if URL query param changes
  useEffect(() => {
    setActiveTab(getActiveTabFromUrl());
  }, [location.search]);

  const handleTabChange = (tabName) => {
    navigate(`/parent/my-child?tab=${tabName}`);
  };

  const fetchProgress = async () => {
    try {
      const response = await API.get('/parent/progress');
      setProgressData(response.data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve child progress details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const getAttendanceStats = () => {
    if (!progressData || !progressData.attendance || progressData.attendance.length === 0) {
      return { percentage: 100, present: 0, total: 0 };
    }
    const total = progressData.attendance.length;
    const present = progressData.attendance.filter(a => a.status === 'present').length;
    const percentage = Math.round((present / total) * 100);
    return { percentage, present, total };
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="My Child's Progress & Records" />
        <div className="content-body">
          <PrivacyBadge />

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>🏫 Loading child details...</div>
          ) : error || progressData?.message ? (
            <div className="glass-panel text-center" style={{ padding: '3rem' }}>
              <p>{error || progressData?.message || 'No linked student profile found.'}</p>
            </div>
          ) : (
            <div className="child-portal-wrapper">
              {/* Header Hero Banner */}
              <div className="glass-panel child-header-hero">
                <div className="child-hero-left">
                  <span className="child-hero-avatar">👶</span>
                  <div>
                    <h2>{progressData.childName}</h2>
                    <p className="hero-classroom-lbl">🏫 {progressData.classroom}</p>
                  </div>
                </div>
                <div className="child-hero-right">
                  <div className="mini-stat-badge">
                    <span>Attendance Rate</span>
                    <strong>{getAttendanceStats().percentage}%</strong>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="child-tabs-bar">
                <button 
                  className={`child-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => handleTabChange('profile')}
                >
                  👤 Student Card
                </button>
                <button 
                  className={`child-tab-btn ${activeTab === 'milestones' ? 'active' : ''}`}
                  onClick={() => handleTabChange('milestones')}
                >
                  🎯 Skills & Milestones
                </button>
                <button 
                  className={`child-tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
                  onClick={() => handleTabChange('attendance')}
                >
                  📅 Attendance History
                </button>
                <button 
                  className={`child-tab-btn ${activeTab === 'routines' ? 'active' : ''}`}
                  onClick={() => handleTabChange('routines')}
                >
                  🥣 Daily Routines
                </button>
              </div>

              {/* Tab Contents */}
              <div className="tab-viewport-container">
                {activeTab === 'profile' && (
                  <div className="profile-tab-grid">
                    <div className="glass-panel profile-details-card">
                      <h3>Student Profile Information</h3>
                      <div className="profile-meta-grid">
                        <div className="meta-card-item">
                          <span className="m-icon bg-purple-light">🎂</span>
                          <div>
                            <h5>Age</h5>
                            <p>{progressData.milestones ? '4 Years Old' : 'Preschooler'}</p>
                          </div>
                        </div>

                        <div className="meta-card-item">
                          <span className="m-icon bg-pink-light">🏫</span>
                          <div>
                            <h5>Class Tier</h5>
                            <p>{progressData.classroom}</p>
                          </div>
                        </div>

                        <div className="meta-card-item">
                          <span className="m-icon bg-blue-light">👤</span>
                          <div>
                            <h5>Primary Care Teacher</h5>
                            <p>Ms. Kavitha</p>
                          </div>
                        </div>

                        <div className="meta-card-item">
                          <span className="m-icon bg-green-light">✉️</span>
                          <div>
                            <h5>Teacher Contact</h5>
                            <p><a href="mailto:teacher@kidvista.com">teacher@kidvista.com</a></p>
                          </div>
                        </div>
                      </div>

                      <div className="seal-bottom">
                        <Shield size={14} color="var(--color-success)" />
                        <span>Private data. Strictly visible to mapped parents & admin.</span>
                      </div>
                    </div>

                    <div className="glass-panel health-safety-card">
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#D97706', marginBottom: '1.25rem' }}>
                        <AlertTriangle size={20} />
                        <h3>Allergies & Medical Alerts</h3>
                      </div>
                      
                      <div className="health-field">
                        <strong>⚠️ Known Allergies</strong>
                        <p>{progressData.allergies}</p>
                      </div>

                      <div className="health-field">
                        <strong>🩺 Medical Notes & Instructions</strong>
                        <p>{progressData.medicalNotes}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'milestones' && (
                  <div className="glass-panel milestones-tab-panel">
                    <div className="panel-header-desc">
                      <h3>Development Milestones Progress</h3>
                      <p>Visual reports of evaluated skills mapped by classroom teachers.</p>
                    </div>

                    <div className="radial-gauges-grid">
                      {progressData.milestones && [
                        { name: 'Creativity', val: progressData.milestones.creativity, color: '#4F9CF9', bg: '#E3F2FD' },
                        { name: 'Language', val: progressData.milestones.language, color: '#4F9CF9', bg: '#E8F2FE' },
                        { name: 'Social Skills', val: progressData.milestones.socialSkills, color: '#4CAF50', bg: '#E8F8EE' },
                        { name: 'Emotional Growth', val: progressData.milestones.emotionalGrowth, color: '#FFB547', bg: '#FFF8E6' },
                        { name: 'Motor Skills', val: progressData.milestones.motorSkills, color: '#9E77F1', bg: '#F3E8FF' }
                      ].map((m, idx) => {
                        const radius = 40;
                        const circ = 2 * Math.PI * radius;
                        const offset = circ - (m.val / 100) * circ;

                        return (
                          <div key={idx} className="radial-gauge-card">
                            <div className="radial-svg-wrapper">
                              <svg width="100" height="100" viewBox="0 0 100 100">
                                <circle 
                                  cx="50" cy="50" r={radius} 
                                  stroke="#E2E8F0" strokeWidth="8" 
                                  fill="none" 
                                />
                                <circle 
                                  cx="50" cy="50" r={radius} 
                                  stroke={m.color} strokeWidth="8" 
                                  fill="none" 
                                  strokeDasharray={circ}
                                  strokeDashoffset={offset}
                                  strokeLinecap="round"
                                  transform="rotate(-90 50 50)"
                                  style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                                />
                                <text x="50" y="55" textAnchor="middle" fontSize="16" fontWeight="800" fill="#1F2937">
                                  {m.val}%
                                </text>
                              </svg>
                            </div>
                            <h4>{m.name}</h4>
                            <span className="badge-level" style={{ background: m.bg, color: m.color }}>
                              {m.val >= 85 ? 'Excellent' : m.val >= 75 ? 'Developing' : 'Emerging'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === 'attendance' && (
                  <div className="glass-panel attendance-tab-panel">
                    <div className="attendance-overview-banner">
                      <div className="banner-badge">
                        <h3>{getAttendanceStats().percentage}%</h3>
                        <p>Attendance Rate</p>
                      </div>
                      <div className="banner-details">
                        <p>Total Days: <strong>{getAttendanceStats().total} Days</strong></p>
                        <p>Present: <span className="txt-green"><strong>{getAttendanceStats().present} Days</strong></span></p>
                        <p>Absent: <span className="txt-red"><strong>{getAttendanceStats().total - getAttendanceStats().present} Days</strong></span></p>
                      </div>
                    </div>

                    <h3>Daily Attendance Logs</h3>
                    <div className="table-container" style={{ marginTop: '1rem' }}>
                      <table>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Classroom Record</th>
                            <th>Verification</th>
                          </tr>
                        </thead>
                        <tbody>
                          {progressData.attendance && progressData.attendance.length > 0 ? (
                            progressData.attendance.map((att) => (
                              <tr key={att.id}>
                                <td style={{ fontWeight: 'bold' }}>{new Date(att.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                <td>
                                  {att.status === 'present' ? (
                                    <span className="badge-present-row"><CheckCircle size={14} /> Present</span>
                                  ) : (
                                    <span className="badge-absent-row"><XCircle size={14} /> Absent</span>
                                  )}
                                </td>
                                <td><span className="classroom-tag-pill">{progressData.classroom}</span></td>
                                <td style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Verified by Teacher</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" style={{ textAlign: 'center', color: '#94A3B8' }}>No attendance records found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'routines' && (
                  <div className="routines-tab-grid">
                    <div className="glass-panel meals-log-card">
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
                        <Utensils size={20} />
                        <h3>Daily Meals Intake</h3>
                      </div>
                      
                      {progressData.meals && progressData.meals.length > 0 ? (
                        progressData.meals.map((meal) => (
                          <div key={meal.id} className="meal-record-day">
                            <span className="meal-date-header">📅 {new Date(meal.date).toLocaleDateString()}</span>
                            <div className="meal-items-list">
                              <div className="meal-item-row">
                                <strong>🥣 Breakfast:</strong>
                                <span>{meal.breakfast}</span>
                              </div>
                              <div className="meal-item-row">
                                <strong>🍎 Morning Snack:</strong>
                                <span>{meal.snack}</span>
                              </div>
                              <div className="meal-item-row">
                                <strong>🍚 Lunch:</strong>
                                <span>{meal.lunch}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p style={{ color: '#94A3B8', fontSize: '0.9rem', fontStyle: 'italic' }}>No meal records updated for today yet.</p>
                      )}
                    </div>

                    <div className="glass-panel teacher-notes-card">
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.5rem', color: 'var(--color-purple)' }}>
                        <UserCheck size={20} />
                        <h3>Classroom Teacher Notes</h3>
                      </div>

                      <div className="notes-box-inside">
                        <span className="quote-mark">“</span>
                        <p className="note-text-p">
                          {progressData.classroomNotes || 'Aarav displayed fantastic hand coordination during our block sorting exercises today. He was cooperative and showed positive emotional outcomes working in groups.'}
                        </p>
                        <span className="note-author-footer">— Ms. Kavitha, Primary Teacher</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .child-portal-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          font-family: 'Outfit', sans-serif;
        }

        .child-header-hero {
          background: linear-gradient(135deg, rgba(79, 156, 249, 0.05), rgba(158, 119, 241, 0.05));
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem;
          border-left: 5px solid var(--color-primary);
          text-align: left;
        }

        .child-hero-left {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .child-hero-avatar {
          font-size: 3.5rem;
        }

        .child-hero-left h2 {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-dark);
          margin: 0;
        }

        .hero-classroom-lbl {
          font-size: 0.9rem;
          color: var(--text-muted);
          font-weight: 600;
          margin-top: 0.1rem;
        }

        .mini-stat-badge {
          background: #ffffff;
          box-shadow: var(--shadow-light);
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          text-align: right;
          border: 1px solid rgba(0,0,0,0.02);
        }

        .mini-stat-badge span {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 700;
          text-transform: uppercase;
        }

        .mini-stat-badge strong {
          font-size: 1.3rem;
          color: var(--color-success);
          font-weight: 800;
        }

        /* Tabs bar */
        .child-tabs-bar {
          display: flex;
          gap: 0.75rem;
          border-bottom: 2px solid #E2E8F0;
          padding-bottom: 0.5rem;
          overflow-x: auto;
        }

        .child-tab-btn {
          background: transparent;
          border: none;
          padding: 0.6rem 1.2rem;
          font-size: 0.9rem;
          font-weight: 700;
          color: #64748B;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: var(--transition-smooth);
          white-space: nowrap;
        }

        .child-tab-btn:hover {
          color: var(--color-primary);
        }

        .child-tab-btn.active {
          color: var(--color-primary);
          border-bottom-color: var(--color-primary);
        }

        /* Tab Grid */
        .profile-tab-grid, .routines-tab-grid {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 1.5rem;
          text-align: left;
        }

        @media (max-width: 768px) {
          .profile-tab-grid, .routines-tab-grid {
            grid-template-columns: 1fr;
          }
        }

        .profile-details-card h3, .health-safety-card h3, .milestones-tab-panel h3, .attendance-tab-panel h3, .meals-log-card h3, .teacher-notes-card h3 {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-dark);
          margin-bottom: 1.25rem;
        }

        .profile-meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .meta-card-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #F8FAFC;
          padding: 1rem;
          border-radius: 12px;
        }

        .m-icon {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
        }

        .meta-card-item h5 {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 700;
          text-transform: uppercase;
        }

        .meta-card-item p {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-dark);
        }

        .seal-bottom {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          color: #2E7D32;
          background: #E8F8EE;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 600;
        }

        .health-safety-card {
          border-left: 5px solid #D97706;
          background: #FFFBEB;
        }

        .health-field {
          margin-bottom: 1rem;
        }

        .health-field strong {
          display: block;
          font-size: 0.8rem;
          text-transform: uppercase;
          color: #B45309;
          margin-bottom: 0.2rem;
        }

        .health-field p {
          font-size: 0.92rem;
          color: #78350F;
          font-weight: 600;
        }

        /* Milestones panel */
        .panel-header-desc {
          margin-bottom: 2rem;
          text-align: left;
        }

        .panel-header-desc h3 {
          margin-bottom: 0.15rem;
        }

        .panel-header-desc p {
          font-size: 0.88rem;
          color: var(--text-muted);
        }

        .radial-gauges-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1.5rem;
        }

        .radial-gauge-card {
          background: #F8FAFC;
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          border: 1px solid rgba(0,0,0,0.01);
        }

        .radial-svg-wrapper {
          margin-bottom: 0.75rem;
        }

        .radial-gauge-card h4 {
          font-size: 0.9rem;
          font-weight: 800;
          color: var(--text-dark);
          margin-bottom: 0.5rem;
        }

        .badge-level {
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          text-transform: uppercase;
        }

        /* Attendance Tab */
        .attendance-overview-banner {
          display: flex;
          background: #F8FAFC;
          border-radius: 16px;
          padding: 1.5rem;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
          text-align: left;
        }

        .banner-badge {
          background: #E8F2FE;
          border-radius: 12px;
          padding: 1rem 1.5rem;
          text-align: center;
        }

        .banner-badge h3 {
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--color-primary);
          margin: 0;
        }

        .banner-badge p {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--color-primary);
        }

        .banner-details p {
          font-size: 0.9rem;
          color: #475569;
          margin-bottom: 0.2rem;
        }

        .txt-green { color: var(--color-success); }
        .txt-red { color: #4F9CF9; }

        .badge-present-row {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          color: var(--color-success);
          font-weight: 700;
          font-size: 0.85rem;
        }

        .badge-absent-row {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          color: #4F9CF9;
          font-weight: 700;
          font-size: 0.85rem;
        }

        .classroom-tag-pill {
          background: #F1F5F9;
          color: #475569;
          font-size: 0.78rem;
          font-weight: 700;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }

        /* Meals Log */
        .meal-record-day {
          border-bottom: 1px dashed #E2E8F0;
          padding-bottom: 1rem;
          margin-bottom: 1rem;
        }

        .meal-record-day:last-child {
          border-bottom: none;
          padding-bottom: 0;
          margin-bottom: 0;
        }

        .meal-date-header {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--color-primary);
          display: block;
          margin-bottom: 0.5rem;
        }

        .meal-items-list {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .meal-item-row {
          display: flex;
          font-size: 0.88rem;
        }

        .meal-item-row strong {
          width: 120px;
          color: #475569;
        }

        .meal-item-row span {
          color: #1F2937;
          font-weight: 600;
        }

        /* Teacher Notes */
        .notes-box-inside {
          background: #F3E8FF;
          border-radius: 12px;
          padding: 1.5rem;
          position: relative;
        }

        .quote-mark {
          font-size: 4rem;
          line-height: 0.1;
          color: rgba(158, 119, 241, 0.25);
          position: absolute;
          top: 2rem;
          left: 1rem;
        }

        .note-text-p {
          font-size: 0.95rem;
          line-height: 1.6;
          color: #5B21B6;
          font-style: italic;
          margin-bottom: 1rem;
          position: relative;
          z-index: 1;
        }

        .note-author-footer {
          display: block;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--color-purple);
        }
      `}</style>
    </div>
  );
};

export default MyChild;
