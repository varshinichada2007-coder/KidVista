import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { LayoutDashboard, PlusCircle, CheckCircle2, Clock, Image, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      const response = await API.get('/teacher/stats');
      setStats(response.data);
    } catch (err) {
      setError('Could not retrieve teacher statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Teacher Classroom Portal" />
        <div className="content-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>🏫 Loading dashboard...</div>
          ) : error ? (
            <div className="error-alert">{error}</div>
          ) : (
            <>
              {/* Classroom header card */}
              <div className="glass-panel teacher-classroom-hero">
                <div>
                  <h2 style={{ color: '#FF6B8B', fontWeight: 800 }}>Welcome to Your Classroom!</h2>
                  <p style={{ color: '#7f8c8d', fontSize: '0.95rem', marginTop: '0.2rem' }}>
                    {stats.classroom_id ? 'You are assigned and active in Toddlers classroom.' : 'Please wait for Admin to assign your classroom.'}
                  </p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/teacher/create-activity')}>
                  <PlusCircle size={18} /> Post Daily Activity
                </button>
              </div>

              {/* Stats row */}
              <div className="stats-grid">
                <div className="stat-card pink">
                  <div className="stat-icon pink">
                    <LayoutDashboard size={24} />
                  </div>
                  <div className="stat-details">
                    <h3>{stats.todayActivities}</h3>
                    <p>Activities Logged Today</p>
                  </div>
                </div>

                <div className="stat-card blue" onClick={() => navigate('/teacher/history')} style={{ cursor: 'pointer' }}>
                  <div className="stat-icon blue">
                    <Image size={24} />
                  </div>
                  <div className="stat-details">
                    <h3>{stats.totalUploads}</h3>
                    <p>Total Photos Uploaded</p>
                  </div>
                </div>

                <div className="stat-card green" onClick={() => navigate('/teacher/history')} style={{ cursor: 'pointer' }}>
                  <div className="stat-icon green">
                    <CheckCircle2 size={24} />
                  </div>
                  <div className="stat-details">
                    <h3>{stats.approvedUploads}</h3>
                    <p>Approved & Published</p>
                  </div>
                </div>

                <div className="stat-card purple" onClick={() => navigate('/teacher/history')} style={{ cursor: 'pointer' }}>
                  <div className="stat-icon purple">
                    <Clock size={24} />
                  </div>
                  <div className="stat-details">
                    <h3>{stats.pendingUploads}</h3>
                    <p>Awaiting Approval</p>
                  </div>
                </div>
              </div>

              {/* Quick links card */}
              <div className="glass-panel teacher-guide-panel">
                <h3>Quick Teacher Guide</h3>
                <div className="guide-steps-list">
                  <div className="guide-step">
                    <div className="step-num bg-pink">1</div>
                    <div className="step-desc">
                      <h4>Log classroom activity</h4>
                      <p>Enter the title, description (e.g. painting activity), select category, and select date.</p>
                    </div>
                  </div>
                  <div className="guide-step">
                    <div className="step-num bg-blue">2</div>
                    <div className="step-desc">
                      <h4>Generate Captions & Summaries using AI</h4>
                      <p>Click "Generate" to let Google Gemini AI compose newsletter captions and parents' developmental benefits summaries.</p>
                    </div>
                  </div>
                  <div className="guide-step">
                    <div className="step-num bg-green">3</div>
                    <div className="step-desc">
                      <h4>Upload photos and Tag present students</h4>
                      <p>Choose photos, tag students from your assigned classroom list, and submit. Photos go to Admin for review.</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .teacher-classroom-hero {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, rgba(255, 107, 139, 0.05), rgba(77, 150, 255, 0.05));
          padding: 2rem;
          border-left: 5px solid var(--color-pink);
        }

        .teacher-guide-panel h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #2C3E50;
          margin-bottom: 1.5rem;
        }

        .guide-steps-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .guide-step {
          display: flex;
          gap: 1.2rem;
          align-items: flex-start;
        }

        .step-num {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          color: white;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 0.9rem;
        }

        .step-num.bg-pink { background: var(--color-pink); }
        .step-num.bg-blue { background: var(--color-blue); }
        .step-num.bg-green { background: var(--color-green); }

        .step-desc h4 {
          font-size: 1rem;
          font-weight: 700;
          color: #2C3E50;
          margin-bottom: 0.2rem;
        }

        .step-desc p {
          font-size: 0.88rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        @media (max-width: 768px) {
          .teacher-classroom-hero {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .teacher-classroom-hero button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default TeacherDashboard;
