import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import PrivacyBadge from '../../components/PrivacyBadge';
import { Calendar, Compass, GraduationCap, ChevronRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ActivityTimeline = () => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchTimeline = async () => {
    try {
      const response = await API.get('/parent/timeline');
      setTimeline(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, []);

  const getCategoryColorClass = (cat) => {
    const c = cat.toLowerCase();
    if (c.includes('art')) return 'pink';
    if (c.includes('sport')) return 'green';
    if (c.includes('music') || c.includes('dance')) return 'purple';
    if (c.includes('story') || c.includes('learn')) return 'blue';
    return 'yellow';
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="My Child's Activity Timeline" />
        <div className="content-body">
          <PrivacyBadge />

          <div className="timeline-header-panel glass-panel">
            <Activity size={24} className="timeline-banner-icon" />
            <div>
              <h3>Learning Timeline</h3>
              <p>Witness the step-by-step development journey. Explore chronological milestones logged by your child's classroom teachers.</p>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>🏫 Loading developmental timeline...</div>
          ) : timeline.length === 0 ? (
            <div className="glass-panel text-center" style={{ padding: '3rem' }}>
              <Compass size={32} style={{ color: '#ccc', marginBottom: '0.5rem' }} />
              <p>No activity records logged in the timeline yet.</p>
            </div>
          ) : (
            <div className="timeline">
              {timeline.map((act, index) => {
                const alignClass = index % 2 === 0 ? 'timeline-container timeline-left' : 'timeline-container timeline-right';
                const colorClass = getCategoryColorClass(act.category);

                return (
                  <div key={act.id} className={alignClass}>
                    <div className="timeline-content">
                      <div className="timeline-top-meta">
                        <span className={`timeline-tag-cat ${colorClass}`}>{act.category}</span>
                        <span className="timeline-date-lbl">
                          <Calendar size={12} /> {new Date(act.activity_date).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h4 className="timeline-item-title">{act.title}</h4>
                      
                      <p className="timeline-item-desc">{act.description}</p>
                      
                      {act.ai_summary && (
                        <div className="timeline-summary-drawer">
                          <h5>💡 Developmental Benefit</h5>
                          <p>{act.ai_summary}</p>
                        </div>
                      )}

                      <button className="timeline-view-pics-btn" onClick={() => navigate('/parent/gallery')}>
                        View Photos <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      <style>{`
        .timeline-header-panel {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: linear-gradient(135deg, rgba(77, 150, 255, 0.04), rgba(158, 119, 241, 0.04));
          border-left: 5px solid var(--color-blue);
          font-family: 'Outfit', sans-serif;
          margin-bottom: 2.5rem;
        }

        .timeline-banner-icon {
          color: var(--color-blue);
        }

        .timeline-header-panel h3 {
          font-weight: 800;
          color: #2C3E50;
        }

        .timeline-header-panel p {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .timeline-top-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .timeline-date-lbl {
          font-size: 0.8rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-weight: 500;
        }

        .timeline-item-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #2C3E50;
          margin-bottom: 0.4rem;
        }

        .timeline-item-desc {
          font-size: 0.88rem;
          color: #5A6A85;
          line-height: 1.5;
          margin-bottom: 0.75rem;
        }

        .timeline-summary-drawer {
          background: rgba(77, 150, 255, 0.04);
          border-left: 2.5px solid var(--color-blue);
          padding: 0.6rem 0.8rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }

        .timeline-summary-drawer h5 {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--color-blue);
          text-transform: uppercase;
          margin-bottom: 0.15rem;
        }

        .timeline-summary-drawer p {
          font-size: 0.82rem;
          color: #555;
          line-height: 1.4;
        }

        .timeline-view-pics-btn {
          background: transparent;
          border: none;
          color: var(--color-pink);
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.2rem;
          padding: 0;
          transition: transform 0.2s;
        }

        .timeline-view-pics-btn:hover {
          color: #FF4A70;
          transform: translateX(3px);
        }
      `}</style>
    </div>
  );
};

export default ActivityTimeline;
