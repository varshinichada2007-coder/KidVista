import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import PrivacyBadge from '../../components/PrivacyBadge';
import { Mail, Shield, Award, CalendarDays, UserCheck } from 'lucide-react';

const MyChild = () => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChildren = async () => {
    try {
      const response = await API.get('/parent/child');
      setChildren(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="My Child's Student Card" />
        <div className="content-body">
          <PrivacyBadge />

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>🏫 Loading child details...</div>
          ) : children.length === 0 ? (
            <div className="glass-panel text-center" style={{ padding: '3rem' }}>
              <p>No students are linked to this parent account. Please contact Administration.</p>
            </div>
          ) : (
            <div className="kids-profile-grid">
              {children.map((child) => (
                <div key={child.student_id} className="glass-panel child-detail-box">
                  <div className="child-avatar-banner">
                    <span className="child-avatar-emoji">👶</span>
                    <h2 className="child-detail-name">{child.student_name}</h2>
                    <span className="classroom-bubble-sm">Classroom: {child.classroom_name || 'Unassigned'}</span>
                  </div>

                  <div className="child-meta-rows">
                    <div className="child-meta-item">
                      <CalendarDays size={20} className="meta-icon-purple" />
                      <div>
                        <h5>Age</h5>
                        <p>{child.age} Years Old</p>
                      </div>
                    </div>

                    <div className="child-meta-item">
                      <Award size={20} className="meta-icon-pink" />
                      <div>
                        <h5>Preschool Level</h5>
                        <p>{child.classroom_name ? `${child.classroom_name} Tier` : 'Milestone Level'}</p>
                      </div>
                    </div>

                    <div className="child-meta-item">
                      <UserCheck size={20} className="meta-icon-blue" />
                      <div>
                        <h5>Classroom Teacher</h5>
                        <p>{child.teacherName}</p>
                      </div>
                    </div>

                    {child.teacherEmail && (
                      <div className="child-meta-item">
                        <Mail size={20} className="meta-icon-green" />
                        <div>
                          <h5>Teacher Contact</h5>
                          <p>
                            <a href={`mailto:${child.teacherEmail}`} className="teacher-mail-link">
                              {child.teacherEmail}
                            </a>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="child-privacy-seal">
                    <Shield size={16} style={{ color: '#2E7D32' }} />
                    <span>Protected by FirstCry Student Safety & Privacy policy</span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      <style>{`
        .kids-profile-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
          font-family: 'Outfit', sans-serif;
        }

        @media (max-width: 500px) {
          .kids-profile-grid {
            grid-template-columns: 1fr;
          }
        }

        .child-detail-box {
          background: white;
          padding: 2.5rem 2rem;
          border-radius: var(--border-radius-lg);
          display: flex;
          flex-direction: column;
        }

        .child-avatar-banner {
          text-align: center;
          margin-bottom: 2rem;
          border-bottom: 1px dashed rgba(0,0,0,0.06);
          padding-bottom: 1.5rem;
        }

        .child-avatar-emoji {
          font-size: 4rem;
          display: block;
          margin-bottom: 0.5rem;
        }

        .child-detail-name {
          font-size: 1.6rem;
          font-weight: 800;
          color: #2C3E50;
        }

        .classroom-bubble-sm {
          display: inline-block;
          background: rgba(158, 119, 241, 0.08);
          color: #9E77F1;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 0.25rem 0.75rem;
          border-radius: 50px;
          margin-top: 0.4rem;
          text-transform: uppercase;
        }

        .child-meta-rows {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        @media (max-width: 480px) {
          .child-meta-rows {
            grid-template-columns: 1fr;
          }
        }

        .child-meta-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .child-meta-item h5 {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 700;
          line-height: 1.2;
        }

        .child-meta-item p {
          font-size: 0.95rem;
          font-weight: 600;
          color: #2C3E50;
        }

        .meta-icon-purple { color: #9E77F1; }
        .meta-icon-pink { color: #FF6B8B; }
        .meta-icon-blue { color: #4D96FF; }
        .meta-icon-green { color: #6BCB77; }

        .teacher-mail-link {
          color: #4D96FF;
          text-decoration: none;
        }
        .teacher-mail-link:hover {
          text-decoration: underline;
        }

        .child-privacy-seal {
          background: rgba(107, 203, 119, 0.08);
          border: 1px solid rgba(107, 203, 119, 0.2);
          padding: 0.6rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          color: #2E7D32;
          font-weight: 600;
          margin-top: auto;
        }
      `}</style>
    </div>
  );
};

export default MyChild;
