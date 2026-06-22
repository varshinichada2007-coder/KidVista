import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import PrivacyBadge from '../../components/PrivacyBadge';
import { Megaphone, Calendar } from 'lucide-react';

const ParentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    try {
      const response = await API.get('/parent/announcements');
      setAnnouncements(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="School Bulletins & Updates" />
        <div className="content-body">
          <PrivacyBadge />

          <div className="glass-panel text-left">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2C3E50', fontFamily: 'Outfit, sans-serif' }}>
              <Megaphone size={22} color="#4F9CF9" /> School Bulletin Board
            </h3>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>🏫 Loading bulletin board...</div>
            ) : announcements.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#7f8c8d' }}>
                <Megaphone size={32} style={{ color: '#ccc', marginBottom: '0.5rem' }} />
                <p>No notices have been posted on the bulletin board yet.</p>
              </div>
            ) : (
              <div className="parent-announcements-list">
                {announcements.map((ann) => (
                  <div key={ann.id} className="bulletin-card-box">
                    <div className="bulletin-header">
                      <span className="bulletin-tag-alert">📢 School Notice</span>
                      <span className="bulletin-date-lbl">
                        <Calendar size={12} /> {new Date(ann.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="bulletin-title">{ann.title}</h4>
                    <p className="bulletin-text">{ann.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      <style>{`
        .parent-announcements-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          font-family: 'Outfit', sans-serif;
        }

        .bulletin-card-box {
          background: #fafafc;
          padding: 1.5rem;
          border-radius: 12px;
          border-left: 4px solid var(--color-pink);
        }

        .bulletin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .bulletin-tag-alert {
          font-size: 0.7rem;
          font-weight: 700;
          background: #E3F2FD;
          color: #4F9CF9;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          text-transform: uppercase;
        }

        .bulletin-date-lbl {
          font-size: 0.8rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-weight: 500;
        }

        .bulletin-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #2C3E50;
          margin-bottom: 0.5rem;
        }

        .bulletin-text {
          font-size: 0.92rem;
          color: #5A6A85;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};

export default ParentAnnouncements;
