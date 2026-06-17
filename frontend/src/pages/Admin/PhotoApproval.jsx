import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { Check, X, Sparkles, User, Calendar, Tag, ShieldCheck } from 'lucide-react';

const PhotoApproval = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const baseURL = 'http://localhost:5000';

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

  useEffect(() => {
    fetchPending();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      setError('');
      setSuccessMsg('');
      await API.put(`/admin/photos/${id}/status`, { status });
      setSuccessMsg(`Photo was successfully ${status === 'approved' ? 'Approved' : 'Rejected'}.`);
      
      // Animate card removal
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
        <Navbar title="Media Moderation Queue" />
        <div className="content-body">
          
          <div className="moderation-header">
            <div>
              <h2>Pending Approvals</h2>
              <p>Verify tagged student privacy and approve photos to make them visible to parents.</p>
            </div>
            <div className="status-indicator-badge">
              📋 {photos.length} Photo(s) Awaiting Review
            </div>
          </div>

          {successMsg && <div className="success-banner">✔ {successMsg}</div>}
          {error && <div className="error-alert">{error}</div>}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>🏫 Loading moderation queue...</div>
          ) : photos.length === 0 ? (
            <div className="empty-moderation-state glass-panel">
              <span className="party-popper-emoji">🎉</span>
              <h3>Queue is All Clear!</h3>
              <p>No photos are currently awaiting review. Teachers have either not submitted anything or all photos are processed.</p>
            </div>
          ) : (
            <div className="moderation-queue-grid">
              {photos.map((photo) => {
                const fullImageUrl = photo.image_url.startsWith('http') 
                  ? photo.image_url 
                  : `${baseURL}${photo.image_url}`;

                return (
                  <div key={photo.id} className="moderation-item-card glass-panel">
                    <div className="moderation-image-container">
                      {photo.image_url === '/uploads/sample-painting.jpg' ? (
                        <div className="sample-photo-fallback mid">
                          <span className="fallback-emoji text-pink">🎨</span>
                          <p className="fallback-lbl">Demo Activity Canvas</p>
                        </div>
                      ) : (
                        <img 
                          src={fullImageUrl} 
                          alt={photo.activity_title} 
                          className="moderation-img"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML = '<div class="sample-photo-fallback mid"><span class="fallback-emoji text-pink">🖼️</span><p class="fallback-lbl">Intellitots Activity Image</p></div>';
                          }}
                        />
                      )}
                    </div>
                    
                    <div className="moderation-details">
                      <div className="details-header-meta">
                        <span className="activity-cat-pill">{photo.activity_category}</span>
                        <span className="meta-text"><Calendar size={12} /> {new Date(photo.activity_date).toLocaleDateString()}</span>
                      </div>

                      <h3 className="moderation-title">{photo.activity_title}</h3>
                      
                      <div className="meta-text teacher-sign-meta">
                        <User size={12} /> <span>Uploaded by: <strong>{photo.teacher_name}</strong></span>
                      </div>

                      {photo.ai_caption && (
                        <blockquote className="caption-quote">
                          <Sparkles size={14} className="caption-sparkle-icon" />
                          <span>"{photo.ai_caption}"</span>
                        </blockquote>
                      )}

                      <div className="tags-label-group">
                        <span className="tags-headline-lbl"><Tag size={12} /> Tagged Student(s):</span>
                        <div className="moderation-tags-list">
                          {photo.tags && photo.tags.length > 0 ? (
                            photo.tags.map((tag, i) => (
                              <span key={i} className="polaroid-tag">👦 {tag.student_name}</span>
                            ))
                          ) : (
                            <span style={{ color: '#E53E3E', fontSize: '0.8rem', fontWeight: 'bold' }}>⚠️ No Students Tagged!</span>
                          )}
                        </div>
                      </div>

                      {/* Decisions row */}
                      <div className="decision-actions-row">
                        <button 
                          className="decision-btn reject" 
                          onClick={() => handleStatusUpdate(photo.id, 'rejected')}
                          title="Reject Photo"
                        >
                          <X size={18} /> Reject
                        </button>
                        <button 
                          className="decision-btn approve" 
                          onClick={() => handleStatusUpdate(photo.id, 'approved')}
                          title="Approve Photo"
                          disabled={!photo.tags || photo.tags.length === 0}
                        >
                          <Check size={18} /> Approve & Publish
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
        .moderation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          font-family: 'Outfit', sans-serif;
        }

        .moderation-header h2 {
          font-size: 1.6rem;
          color: #2C3E50;
        }

        .moderation-header p {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .status-indicator-badge {
          background: #FFE8EC;
          color: #FF6B8B;
          font-weight: 700;
          font-size: 0.85rem;
          padding: 0.5rem 1rem;
          border-radius: 50px;
        }

        .success-banner {
          background: #E8F5E9;
          color: #2E7D32;
          border: 1px solid rgba(46, 125, 50, 0.2);
          border-radius: 12px;
          padding: 0.75rem 1.25rem;
          margin-bottom: 1.5rem;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .empty-moderation-state {
          text-align: center;
          padding: 4rem 2rem;
        }

        .party-popper-emoji {
          font-size: 4rem;
          display: block;
          margin-bottom: 1rem;
          animation: wiggle 2s infinite;
        }

        .empty-moderation-state h3 {
          font-size: 1.4rem;
          color: #2C3E50;
          margin-bottom: 0.5rem;
        }

        .empty-moderation-state p {
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        .moderation-queue-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        .moderation-item-card {
          display: grid;
          grid-template-columns: 320px 1fr;
          padding: 1.5rem;
          gap: 1.5rem;
          background: white;
        }

        @media (max-width: 768px) {
          .moderation-item-card {
            grid-template-columns: 1fr;
          }
        }

        .moderation-image-container {
          border-radius: 10px;
          overflow: hidden;
          background: #f7f9fa;
          border: 1px solid rgba(0,0,0,0.05);
          height: 100%;
          min-height: 220px;
        }

        .sample-photo-fallback.mid {
          width: 100%;
          height: 100%;
          min-height: 220px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #FFE8EC, #E3F2FD);
        }
        .text-pink { color: #FF6B8B; }

        .moderation-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .moderation-details {
          display: flex;
          flex-direction: column;
        }

        .details-header-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .meta-text {
          font-size: 0.85rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-weight: 500;
        }

        .teacher-sign-meta {
          margin-bottom: 0.75rem;
        }

        .moderation-title {
          font-size: 1.3rem;
          font-weight: 800;
          color: #2C3E50;
          margin-bottom: 0.25rem;
        }

        .caption-quote {
          background: #FAFAFD;
          border-left: 3px solid var(--color-blue);
          padding: 0.75rem 1rem;
          border-radius: 4px;
          font-size: 0.9rem;
          font-style: italic;
          color: #555;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: flex-start;
          gap: 0.4rem;
        }

        .caption-sparkle-icon {
          color: var(--color-blue);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .tags-label-group {
          margin-bottom: 1.5rem;
          margin-top: auto;
        }

        .tags-headline-lbl {
          font-size: 0.85rem;
          font-weight: 700;
          color: #2C3E50;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          margin-bottom: 0.5rem;
        }

        .moderation-tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .decision-actions-row {
          display: flex;
          gap: 1rem;
        }

        .decision-btn {
          flex: 1;
          border: none;
          padding: 0.75rem 1rem;
          border-radius: var(--border-radius-sm);
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          transition: all 0.2s;
        }

        .decision-btn.reject {
          background: rgba(255, 107, 139, 0.1);
          color: #FF6B8B;
        }
        .decision-btn.reject:hover {
          background: #FF6B8B;
          color: white;
        }

        .decision-btn.approve {
          background: #6BCB77;
          color: white;
          box-shadow: 0 4px 10px rgba(107,203,119,0.25);
        }
        .decision-btn.approve:hover:not(:disabled) {
          background: #56b962;
          transform: translateY(-1px);
        }
        .decision-btn.approve:disabled {
          background: #cbd5e0;
          color: #718096;
          cursor: not-allowed;
          box-shadow: none;
        }

        @keyframes wiggle {
          0%, 100% { transform: rotate(0); }
          50% { transform: rotate(10deg); }
        }
      `}</style>
    </div>
  );
};

export default PhotoApproval;
