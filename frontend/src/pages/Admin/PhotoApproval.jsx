import React, { useState, useEffect } from 'react';
import API, { baseURL } from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { Check, X, Sparkles, User, Calendar, Tag, Image, CheckCircle } from 'lucide-react';

const PhotoApproval = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchPending = async () => {
    try {
      const response = await API.get('/admin/photos/pending');
      setPhotos(response.data);
    } catch (err) {
      setError('Could not retrieve pending approval list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      setError(''); setSuccessMsg('');
      await API.put(`/admin/photos/${id}/status`, { status });
      setSuccessMsg(`Photo was successfully ${status === 'approved' ? 'approved' : 'rejected'}.`);
      setPhotos(prev => prev.filter(p => p.id !== id));
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Error updating photo status. Please try again.');
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="pa-content">

          {/* Header */}
          <div className="pa-header">
            <div>
              <h1 className="pa-title">Photo Moderation</h1>
              <p className="pa-sub">Review and approve teacher-uploaded activity photos</p>
            </div>
            <div className="pa-badge">
              <Image size={14} />
              {photos.length} pending review
            </div>
          </div>

          {/* Alerts */}
          {successMsg && (
            <div className="pa-success">
              <CheckCircle size={14} /> {successMsg}
            </div>
          )}
          {error && <div className="pa-error">{error}</div>}

          {/* Content */}
          {loading ? (
            <div className="pa-loading">Loading moderation queue...</div>
          ) : photos.length === 0 ? (
            <div className="pa-empty">
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <CheckCircle size={28} style={{ color: '#22C55E' }} />
              </div>
              <h3>Queue is clear!</h3>
              <p>All photos have been reviewed. New uploads from teachers will appear here.</p>
            </div>
          ) : (
            <div className="pa-queue">
              {photos.map((photo) => {
                const fullImageUrl = photo.image_url.startsWith('http')
                  ? photo.image_url
                  : `${baseURL}${photo.image_url}`;

                return (
                  <div key={photo.id} className="pa-card">
                    {/* Image */}
                    <div className="pa-img-wrap">
                      {photo.image_url === '/uploads/sample-painting.jpg' ? (
                        <div className="pa-img-placeholder">
                          <span style={{ fontSize: '2.5rem' }}>🎨</span>
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Demo Activity</span>
                        </div>
                      ) : (
                        <img
                          src={fullImageUrl}
                          alt={photo.activity_title}
                          className="pa-img"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML = '<div class="pa-img-placeholder"><span style="font-size:2.5rem">🖼️</span><span style="font-size:0.75rem;color:#94A3B8">Image unavailable</span></div>';
                          }}
                        />
                      )}
                    </div>

                    {/* Details */}
                    <div className="pa-details">
                      <div className="pa-meta-row">
                        <span className="pa-cat-pill">{photo.activity_category}</span>
                        <span className="pa-date">
                          <Calendar size={11} />
                          {new Date(photo.activity_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      <h3 className="pa-card-title">{photo.activity_title}</h3>

                      <div className="pa-teacher-meta">
                        <User size={12} />
                        Uploaded by <strong>{photo.teacher_name}</strong>
                      </div>

                      {photo.ai_caption && (
                        <div className="pa-caption">
                          <Sparkles size={13} style={{ color: '#3B82F6', flexShrink: 0, marginTop: '1px' }} />
                          <span>"{photo.ai_caption}"</span>
                        </div>
                      )}

                      <div className="pa-tags-section">
                        <span className="pa-tags-label">
                          <Tag size={11} /> Tagged Students
                        </span>
                        <div className="pa-tags-list">
                          {photo.tags && photo.tags.length > 0 ? (
                            photo.tags.map((tag, i) => (
                              <span key={i} className="pa-tag">👦 {tag.student_name}</span>
                            ))
                          ) : (
                            <span className="pa-no-tags">⚠ No students tagged</span>
                          )}
                        </div>
                      </div>

                      <div className="pa-actions">
                        <button className="pa-btn reject" onClick={() => handleStatusUpdate(photo.id, 'rejected')}>
                          <X size={15} /> Reject
                        </button>
                        <button
                          className="pa-btn approve"
                          onClick={() => handleStatusUpdate(photo.id, 'approved')}
                          disabled={!photo.tags || photo.tags.length === 0}
                        >
                          <Check size={15} /> Approve & Publish
                        </button>
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
        .pa-content { padding: 1.75rem 2rem; max-width: 1100px; width: 100%; font-family: 'Outfit', sans-serif; }

        .pa-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
        .pa-title { font-size: 1.6rem; font-weight: 800; color: #0F172A; margin: 0 0 0.2rem 0; }
        .pa-sub { font-size: 0.875rem; color: #94A3B8; margin: 0; }
        .pa-badge {
          display: flex; align-items: center; gap: 0.4rem;
          background: #EFF6FF; color: #3B82F6; font-weight: 600; font-size: 0.8rem;
          padding: 0.45rem 0.9rem; border-radius: 20px;
        }

        .pa-success {
          display: flex; align-items: center; gap: 0.4rem;
          background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 10px;
          padding: 0.75rem 1rem; font-size: 0.85rem; color: #15803D; font-weight: 600;
          margin-bottom: 1.25rem;
        }
        .pa-error {
          background: #FEF2F2; border: 1px solid #FECACA; border-radius: 10px;
          padding: 0.75rem 1rem; font-size: 0.85rem; color: #DC2626;
          margin-bottom: 1.25rem;
        }

        .pa-loading { text-align: center; padding: 3rem; color: #94A3B8; }
        .pa-empty {
          text-align: center; padding: 4rem 2rem; display: flex; flex-direction: column;
          align-items: center; background: white; border: 1px solid #F1F5F9; border-radius: 14px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .pa-empty h3 { font-size: 1.15rem; font-weight: 700; color: #1E293B; margin: 0 0 0.35rem 0; }
        .pa-empty p { font-size: 0.875rem; color: #94A3B8; margin: 0; max-width: 400px; }

        .pa-queue { display: flex; flex-direction: column; gap: 1.25rem; }

        .pa-card {
          display: grid; grid-template-columns: 300px 1fr; gap: 1.5rem;
          background: white; border: 1px solid #F1F5F9; border-radius: 14px;
          padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          transition: box-shadow 0.2s;
        }
        .pa-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); }
        @media (max-width: 800px) { .pa-card { grid-template-columns: 1fr; } }

        .pa-img-wrap {
          border-radius: 10px; overflow: hidden; background: #F8FAFC;
          border: 1px solid #F1F5F9; min-height: 200px;
        }
        .pa-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .pa-img-placeholder {
          width: 100%; height: 100%; min-height: 200px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 0.25rem; background: linear-gradient(135deg, #F8FAFC, #EFF6FF);
        }

        .pa-details { display: flex; flex-direction: column; }
        .pa-meta-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
        .pa-cat-pill {
          background: #EFF6FF; color: #3B82F6; font-size: 0.72rem; font-weight: 600;
          padding: 0.2rem 0.55rem; border-radius: 6px; text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .pa-date { display: flex; align-items: center; gap: 0.3rem; font-size: 0.75rem; color: #94A3B8; font-weight: 500; }
        .pa-card-title { font-size: 1.1rem; font-weight: 700; color: #1E293B; margin: 0 0 0.35rem 0; }
        .pa-teacher-meta {
          display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem; color: #64748B;
          margin-bottom: 0.75rem;
        }
        .pa-teacher-meta strong { color: #475569; }

        .pa-caption {
          display: flex; align-items: flex-start; gap: 0.4rem;
          background: #F8FAFC; border-left: 3px solid #3B82F6; border-radius: 4px;
          padding: 0.65rem 0.85rem; font-size: 0.825rem; font-style: italic; color: #475569;
          margin-bottom: 1rem; line-height: 1.45;
        }

        .pa-tags-section { margin-top: auto; margin-bottom: 1rem; }
        .pa-tags-label {
          display: flex; align-items: center; gap: 0.3rem;
          font-size: 0.75rem; font-weight: 700; color: #1E293B;
          margin-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 0.04em;
        }
        .pa-tags-list { display: flex; flex-wrap: wrap; gap: 0.35rem; }
        .pa-tag {
          display: inline-flex; align-items: center; gap: 0.2rem;
          background: #F0FDF4; color: #15803D; font-size: 0.75rem; font-weight: 600;
          padding: 0.2rem 0.55rem; border-radius: 6px;
        }
        .pa-no-tags { font-size: 0.8rem; color: #D97706; font-weight: 600; }

        .pa-actions { display: flex; gap: 0.75rem; }
        .pa-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.35rem;
          padding: 0.6rem 1rem; border: none; border-radius: 8px;
          font-size: 0.85rem; font-weight: 600; cursor: pointer;
          font-family: 'Outfit', sans-serif; transition: all 0.15s;
        }
        .pa-btn.reject { background: #F8FAFC; color: #64748B; border: 1.5px solid #E2E8F0; }
        .pa-btn.reject:hover { border-color: #EF4444; color: #EF4444; background: #FEF2F2; }
        .pa-btn.approve { background: #22C55E; color: white; box-shadow: 0 2px 8px rgba(34,197,94,0.25); }
        .pa-btn.approve:hover:not(:disabled) { background: #16A34A; transform: translateY(-1px); }
        .pa-btn.approve:disabled { background: #CBD5E1; color: #94A3B8; cursor: not-allowed; box-shadow: none; }
      `}</style>
    </div>
  );
};

export default PhotoApproval;
