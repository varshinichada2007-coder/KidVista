import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { Users, GraduationCap, Image, CheckSquare, Calendar, Megaphone, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [parentRequests, setParentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      const response = await API.get('/admin/stats');
      setStats(response.data);
    } catch (err) {
      setError('Could not retrieve dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  const fetchParentRequests = async () => {
    try {
      const response = await API.get('/admin/parent-requests');
      setParentRequests(response.data);
    } catch (err) {
      console.error('Could not fetch parent requests:', err);
    }
  };

  const handleApproveParent = async (id) => {
    try {
      await API.put(`/admin/parent-requests/${id}/approve`);
      fetchStats();
      fetchParentRequests();
    } catch (err) {
      console.error(err);
      alert('Failed to approve parent request.');
    }
  };

  const handleRejectParent = async (id) => {
    if (window.confirm('Are you sure you want to reject and delete this parent request?')) {
      try {
        await API.put(`/admin/parent-requests/${id}/reject`);
        fetchStats();
        fetchParentRequests();
      } catch (err) {
        console.error(err);
        alert('Failed to reject parent request.');
      }
    }
  };

  useEffect(() => {
    fetchStats();
    fetchParentRequests();
  }, []);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Admin Command Center" />
        <div className="content-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>🏫 Loading stats...</div>
          ) : error ? (
            <div className="error-alert">{error}</div>
          ) : (
            <>
              {/* Stats Cards Row */}
              <div className="stats-grid">
                <div className="stat-card blue" onClick={() => navigate('/admin/students')} style={{ cursor: 'pointer' }}>
                  <div className="stat-icon blue">
                    <GraduationCap size={24} />
                  </div>
                  <div className="stat-details">
                    <h3>{stats.totalStudents}</h3>
                    <p>Total Students</p>
                  </div>
                </div>

                <div className="stat-card pink" onClick={() => navigate('/admin/teachers')} style={{ cursor: 'pointer' }}>
                  <div className="stat-icon pink">
                    <Users size={24} />
                  </div>
                  <div className="stat-details">
                    <h3>{stats.totalTeachers}</h3>
                    <p>Classroom Teachers</p>
                  </div>
                </div>

                <div className="stat-card green" onClick={() => navigate('/admin/parents')} style={{ cursor: 'pointer' }}>
                  <div className="stat-icon green">
                    <Users size={24} />
                  </div>
                  <div className="stat-details">
                    <h3>{stats.totalParents}</h3>
                    <p>Registered Parents</p>
                  </div>
                </div>

                <div className="stat-card purple" onClick={() => navigate('/admin/approvals')} style={{ cursor: 'pointer' }}>
                  <div className="stat-icon purple">
                    <CheckSquare size={24} />
                  </div>
                  <div className="stat-details">
                    <h3>{stats.pendingPhotos}</h3>
                    <p>Pending Approvals</p>
                  </div>
                  {stats.pendingPhotos > 0 && (
                    <span className="stats-alert-badge">{stats.pendingPhotos} new</span>
                  )}
                </div>
              </div>

              {/* Action Banner for approvals */}
              {stats.pendingPhotos > 0 && (
                <div className="glass-panel approval-alert-banner">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CheckSquare size={22} className="alert-banner-icon" />
                    <div>
                      <h4 style={{ color: '#FF6B8B' }}>Photos Awaiting Administrative Moderation</h4>
                      <p style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>There are {stats.pendingPhotos} classroom activity photo(s) submitted by teachers waiting for safety review.</p>
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={() => navigate('/admin/approvals')}>
                    Review Queue <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* Parent Approval Requests */}
              <div className="glass-panel" style={{ marginBottom: '2rem' }}>
                <div className="panel-header-row">
                  <h3>Parent Approval Requests</h3>
                  <span className="classroom-tag" style={{ background: '#FFE8EC', color: '#FF6B8B' }}>
                    {parentRequests.length} pending
                  </span>
                </div>

                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Parent Name</th>
                        <th>Parent Email</th>
                        <th>Child Name</th>
                        <th>Child Age</th>
                        <th>Requested Classroom</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parentRequests && parentRequests.length > 0 ? (
                        parentRequests.map((req) => (
                          <tr key={req.id}>
                            <td style={{ fontWeight: 'bold' }}>{req.name}</td>
                            <td>{req.email}</td>
                            <td>{req.childName}</td>
                            <td>{req.childAge} yrs</td>
                            <td><span className="classroom-tag">{req.requestedClassroom}</span></td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                <button
                                  className="btn btn-primary"
                                  style={{ background: '#6BCB77', padding: '0.4rem 0.8rem', fontSize: '0.8rem', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' }}
                                  onClick={() => handleApproveParent(req.id)}
                                >
                                  Approve
                                </button>
                                <button
                                  className="btn btn-primary"
                                  style={{ background: '#FF6B8B', padding: '0.4rem 0.8rem', fontSize: '0.8rem', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' }}
                                  onClick={() => handleRejectParent(req.id)}
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
                            No pending parent registration requests.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Activity Table */}
              <div className="glass-panel">
                <div className="panel-header-row">
                  <h3>Recent Classroom Activities</h3>
                  <button className="btn btn-outline" onClick={() => navigate('/admin/announcements')}>
                    <Megaphone size={16} /> Manage Announcements
                  </button>
                </div>

                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Activity Title</th>
                        <th>Classroom</th>
                        <th>Teacher</th>
                        <th>Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentActivities && stats.recentActivities.length > 0 ? (
                        stats.recentActivities.map((act) => (
                          <tr key={act.id}>
                            <td>{new Date(act.activity_date).toLocaleDateString()}</td>
                            <td style={{ fontWeight: 'bold' }}>{act.title}</td>
                            <td><span className="classroom-tag">{act.classroom_name}</span></td>
                            <td>{act.teacher_name || 'Not Assigned'}</td>
                            <td><span className="category-tag">{act.category}</span></td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
                            No activities recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .panel-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .panel-header-row h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #2C3E50;
        }

        .classroom-tag {
          background: rgba(158, 119, 241, 0.08);
          color: #9E77F1;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.2rem 0.6rem;
          border-radius: 8px;
        }

        .category-tag {
          background: rgba(77, 150, 255, 0.08);
          color: #4D96FF;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.2rem 0.6rem;
          border-radius: 8px;
        }

        .stats-alert-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #FF6B8B;
          color: white;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.15rem 0.4rem;
          border-radius: 20px;
          text-transform: uppercase;
          animation: pulse 2s infinite;
        }

        .approval-alert-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-left: 5px solid var(--color-pink);
          background: #FFE8EC;
          padding: 1.25rem 1.5rem;
        }

        .alert-banner-icon {
          color: #FF6B8B;
          animation: bounce 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        @media (max-width: 768px) {
          .approval-alert-banner {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .approval-alert-banner button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
