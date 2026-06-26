import React, { useState, useEffect } from 'react';
import API, { baseURL } from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { Sparkles, Calendar, Search, Tag, Filter } from 'lucide-react';

const UploadHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchHistory = async () => {
    try {
      const response = await API.get('/teacher/history');
      setHistory(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved': return 'badge badge-approved';
      case 'rejected': return 'badge badge-rejected';
      default: return 'badge badge-pending';
    }
  };

  const filteredHistory = history.filter(item => {
    const statusMatch = statusFilter === 'all' || item.status === statusFilter;
    const categoryMatch = categoryFilter === 'all' || item.activity_category === categoryFilter;
    return statusMatch && categoryMatch;
  });

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="My Upload Logs" />
        <div className="content-body">
          
          {/* History Filters bar */}
          <div className="glass-panel search-action-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2C3E50', fontWeight: 'bold' }}>
              <Filter size={18} />
              <span>Filters:</span>
            </div>
            
            <div className="filters-row">
              <div className="form-group-inline">
                <label>Status</label>
                <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Uploads</option>
                  <option value="pending">⏳ Pending Review</option>
                  <option value="approved">✔ Approved</option>
                  <option value="rejected">❌ Rejected</option>
                </select>
              </div>

              <div className="form-group-inline">
                <label>Category</label>
                <select className="form-control" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option value="all">All Categories</option>
                  <option>Art & Craft</option>
                  <option>Sports</option>
                  <option>Storytelling</option>
                  <option>Music</option>
                  <option>Dance</option>
                  <option>Celebration</option>
                  <option>Learning Activity</option>
                </select>
              </div>
            </div>
          </div>

          {/* History content */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>🏫 Loading upload history...</div>
          ) : filteredHistory.length === 0 ? (
            <div className="glass-panel empty-history-panel">
              <span className="empty-history-emoji">📂</span>
              <h3>No items found</h3>
              <p>You haven't uploaded any activity photos matching the selected filters yet.</p>
            </div>
          ) : (
            <div className="history-cards-grid">
              {filteredHistory.map((item) => {
                const fullImageUrl = item.image_url.startsWith('http') 
                  ? item.image_url 
                  : `${baseURL}${item.image_url}`;

                return (
                  <div key={item.id} className="history-polaroid-card">
                    <div className="polaroid-photo-wrapper">
                      {item.image_url === '/uploads/sample-painting.jpg' ? (
                        <div className="sample-photo-fallback sm">
                          <span className="fallback-emoji">🎨</span>
                        </div>
                      ) : (
                        <img 
                          src={fullImageUrl} 
                          alt={item.activity_title} 
                          className="polaroid-photo"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML = '<div class="sample-photo-fallback sm"><span class="fallback-emoji">🖼️</span></div>';
                          }}
                        />
                      )}
                      
                      <div className="status-overlay-badge">
                        <span className={getStatusBadgeClass(item.status)}>{item.status}</span>
                      </div>
                    </div>

                    <div className="polaroid-content">
                      <div className="polaroid-header-meta">
                        <span className="polaroid-date">
                          {new Date(item.activity_date).toLocaleDateString()}
                        </span>
                        <span className="activity-cat-pill">{item.activity_category}</span>
                      </div>

                      <h3 className="polaroid-title" style={{ fontSize: '1.05rem', minHeight: '40px' }}>{item.activity_title}</h3>

                      {item.ai_caption && (
                        <blockquote className="history-caption-quote">
                          <Sparkles size={12} style={{ color: '#4D96FF', shrink: '0' }} />
                          <span style={{ fontSize: '0.82rem' }}>"{item.ai_caption}"</span>
                        </blockquote>
                      )}

                      <div style={{ marginTop: 'auto', borderTop: '1px dashed #eee', paddingTop: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#2C3E50', display: 'flex', alignItems: 'center', gap: '0.2rem', marginBottom: '0.25rem' }}>
                          <Tag size={10} /> Tagged Students ({item.tags ? item.tags.length : 0}):
                        </span>
                        <div className="history-tags-row">
                          {item.tags && item.tags.length > 0 ? (
                            item.tags.map((tag, idx) => (
                              <span key={idx} className="tag-pill-sm">👦 {tag.student_name}</span>
                            ))
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#aaa' }}>No student tags</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      <style>{`
        .search-action-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          padding: 1rem 1.5rem;
        }

        .filters-row {
          display: flex;
          gap: 1.5rem;
        }

        .form-group-inline {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .form-group-inline label {
          font-size: 0.85rem;
          font-weight: 700;
          color: #2C3E50;
        }

        .form-group-inline select {
          padding: 0.45rem 0.75rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-family: 'Outfit', sans-serif;
          border: 1px solid rgba(0,0,0,0.1);
        }

        .empty-history-panel {
          text-align: center;
          padding: 4rem 2rem;
        }

        .empty-history-emoji {
          font-size: 3rem;
          display: block;
          margin-bottom: 0.5rem;
        }

        .history-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 2rem;
        }

        .history-polaroid-card {
          background: white;
          padding: 1rem 1rem 1.5rem 1rem;
          border-radius: 4px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(0,0,0,0.04);
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .sample-photo-fallback.sm {
          width: 100%;
          height: 100%;
          min-height: 170px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #E3F2FD, #E3F2FD);
          color: #4F9CF9;
        }

        .status-overlay-badge {
          position: absolute;
          top: 10px;
          right: 10px;
        }

        .history-caption-quote {
          background: #FAFAFD;
          border-left: 2px solid var(--color-blue);
          padding: 0.5rem;
          border-radius: 4px;
          font-style: italic;
          color: #555;
          margin-bottom: 0.75rem;
          display: flex;
          gap: 0.3rem;
          align-items: flex-start;
        }

        .history-tags-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.3rem;
        }

        .tag-pill-sm {
          font-size: 0.7rem;
          background: rgba(77, 150, 255, 0.06);
          color: var(--color-blue);
          padding: 0.1rem 0.4rem;
          border-radius: 6px;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .search-action-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }
          .filters-row {
            flex-direction: column;
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default UploadHistory;
