import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { Megaphone, Trash2, Calendar, Send } from 'lucide-react';

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAnnouncements = async () => {
    try {
      const response = await API.get('/admin/announcements');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !message) {
      setError('Please fill in both title and message.');
      return;
    }

    setError('');
    setSuccess('');
    try {
      await API.post('/admin/announcements', { title, message });
      setSuccess('Announcement published successfully.');
      setTitle('');
      setMessage('');
      fetchAnnouncements();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to publish announcement.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      await API.delete(`/admin/announcements/${id}`);
      fetchAnnouncements();
    } catch (err) {
      alert('Could not delete notice.');
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="School Bulletin Board" />
        <div className="content-body">
          
          <div className="announcements-layout">
            {/* Create Announcement Form */}
            <div className="glass-panel form-aside">
              <h3>Post New Announcement</h3>
              <p style={{ fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '1.25rem' }}>Send notifications directly to parents' dashboards instantly.</p>
              
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {error && <div className="error-alert">{error}</div>}
                {success && <div className="success-banner-sm">{success}</div>}

                <div className="form-group">
                  <label htmlFor="title">Notice Title</label>
                  <input 
                    type="text" 
                    id="title"
                    className="form-control"
                    placeholder="e.g. Mid-term Parent Teacher Meeting"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Announcement Details</label>
                  <textarea 
                    id="message"
                    className="form-control"
                    placeholder="Write details about scheduling, holiday calendar, instructions..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows="5"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  <Send size={16} /> Publish Notice
                </button>
              </form>
            </div>

            {/* List Announcements */}
            <div className="announcements-stream-wrapper">
              <div className="glass-panel flex-grow-stream">
                <h3>Published Bulletins</h3>
                
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>🏫 Loading bulletin board...</div>
                ) : announcements.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#7f8c8d' }}>
                    <Megaphone size={32} style={{ color: '#ccc', marginBottom: '0.5rem' }} />
                    <p>No announcements posted yet.</p>
                  </div>
                ) : (
                  <div className="announcements-list">
                    {announcements.map((ann) => (
                      <div key={ann.id} className="bulletin-item-card">
                        <div className="bulletin-meta-row">
                          <span className="bulletin-date">
                            <Calendar size={12} /> {new Date(ann.created_at).toLocaleDateString()}
                          </span>
                          <button 
                            className="bulletin-delete-btn" 
                            onClick={() => handleDelete(ann.id)}
                            title="Delete Announcement"
                          >
                            <Trash2 size={16} />
                          </button>
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

        </div>
      </div>

      <style>{`
        .announcements-layout {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 2rem;
          align-items: flex-start;
          font-family: 'Outfit', sans-serif;
        }

        @media (max-width: 992px) {
          .announcements-layout {
            grid-template-columns: 1fr;
          }
        }

        .form-aside h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #2C3E50;
          margin-bottom: 0.25rem;
        }

        .flex-grow-stream h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #2C3E50;
          margin-bottom: 1.5rem;
        }

        .success-banner-sm {
          background: #E8F5E9;
          color: #2E7D32;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .announcements-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .bulletin-item-card {
          border-bottom: 1px dashed rgba(0,0,0,0.06);
          padding-bottom: 1.25rem;
        }

        .bulletin-item-card:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .bulletin-meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.4rem;
        }

        .bulletin-date {
          font-size: 0.8rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-weight: 500;
        }

        .bulletin-delete-btn {
          background: transparent;
          border: none;
          color: #7f8c8d;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .bulletin-delete-btn:hover {
          background: #FFE8EC;
          color: #FF6B8B;
        }

        .bulletin-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #2C3E50;
          margin-bottom: 0.5rem;
        }

        .bulletin-text {
          font-size: 0.9rem;
          color: #5A6A85;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};

export default AdminAnnouncements;
