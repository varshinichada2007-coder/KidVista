import React, { useState } from 'react';
import { Download, ZoomIn, Eye, Sparkles, MessageCircleCode } from 'lucide-react';

const PhotoCard = ({ photo }) => {
  const [zoomOpen, setZoomOpen] = useState(false);
  const baseURL = 'http://localhost:5000';
  const fullImageUrl = photo.image_url.startsWith('http') 
    ? photo.image_url 
    : `${baseURL}${photo.image_url}`;

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      const response = await fetch(fullImageUrl);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `intellitots-${photo.activity_title.toLowerCase().replace(/\s+/g, '-')}-${photo.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      window.open(fullImageUrl, '_blank');
    }
  };

  return (
    <>
      <div className="polaroid-card" onClick={() => setZoomOpen(true)}>
        <div className="polaroid-photo-wrapper">
          {photo.image_url === '/uploads/sample-painting.jpg' ? (
            <div className="sample-photo-fallback">
              <span className="fallback-emoji">🎨</span>
              <p className="fallback-lbl">Preschool Learning Activity</p>
            </div>
          ) : (
            <img 
              src={fullImageUrl} 
              alt={photo.activity_title} 
              className="polaroid-photo"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML = '<div class="sample-photo-fallback"><span class="fallback-emoji">🖼️</span><p class="fallback-lbl">Intellitots Activity Image</p></div>';
              }}
            />
          )}
          
          <div className="photo-actions-overlay">
            <button className="overlay-btn" onClick={(e) => { e.stopPropagation(); setZoomOpen(true); }} title="Zoom In">
              <ZoomIn size={16} />
            </button>
            <button className="overlay-btn" onClick={handleDownload} title="Download Photo">
              <Download size={16} />
            </button>
          </div>
        </div>

        <div className="polaroid-content">
          <div className="polaroid-header-meta">
            <span className="polaroid-date">
              {new Date(photo.activity_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="activity-cat-pill">{photo.activity_category}</span>
          </div>

          <h3 className="polaroid-title">{photo.activity_title}</h3>

          {photo.ai_caption && (
            <div className="polaroid-caption">
              <Sparkles size={14} className="sparkle-icon" />
              <p>"{photo.ai_caption}"</p>
            </div>
          )}

          {photo.activity_summary && (
            <div className="polaroid-summary">
              <p>{photo.activity_summary}</p>
            </div>
          )}

          {photo.tags && photo.tags.length > 0 && (
            <div className="polaroid-tags">
              {photo.tags.map((tag, i) => (
                <span key={i} className="polaroid-tag">👦 {tag.student_name}</span>
              ))}
            </div>
          )}

          <div className="polaroid-footer">
            <span className="teacher-sign">✏️ {photo.teacher_name || 'Classroom Teacher'}</span>
          </div>
        </div>
      </div>

      {/* Zoom Modal Overlay */}
      {zoomOpen && (
        <div className="zoom-modal-overlay" onClick={() => setZoomOpen(false)}>
          <div className="zoom-modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="zoom-close-btn" onClick={() => setZoomOpen(false)}>✕</button>
            <div className="zoom-modal-image-box">
              {photo.image_url === '/uploads/sample-painting.jpg' ? (
                <div className="sample-photo-fallback large">
                  <span className="fallback-emoji">🎨</span>
                  <h2 style={{ margin: '1rem 0' }}>{photo.activity_title}</h2>
                  <p>Preschool Learning Demonstration Image</p>
                </div>
              ) : (
                <img 
                  src={fullImageUrl} 
                  alt={photo.activity_title} 
                  className="zoom-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = '<div class="sample-photo-fallback large"><span class="fallback-emoji">🖼️</span><h2>Image Loaded</h2></div>';
                  }}
                />
              )}
            </div>
            <div className="zoom-modal-details">
              <div className="zoom-meta-head">
                <span className="activity-cat-pill">{photo.activity_category}</span>
                <span style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                  📅 {new Date(photo.activity_date).toLocaleDateString()}
                </span>
              </div>
              <h2 style={{ color: '#2c3e50', margin: '0.5rem 0' }}>{photo.activity_title}</h2>
              {photo.ai_caption && (
                <blockquote className="zoom-blockquote">
                  <Sparkles size={16} style={{ color: '#FF6B8B', marginRight: '6px', shrink: '0' }} />
                  <em>"{photo.ai_caption}"</em>
                </blockquote>
              )}
              {photo.activity_summary && (
                <div style={{ marginTop: '1rem' }}>
                  <h4 style={{ color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                    <MessageCircleCode size={16} color="#4D96FF" /> AI Activity Summary
                  </h4>
                  <p style={{ color: '#7f8c8d', fontSize: '0.9rem', lineHeight: '1.4' }}>{photo.activity_summary}</p>
                </div>
              )}
              <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: '#2c3e50', fontWeight: 'bold' }}>
                  Tagged Student(s):
                </span>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {photo.tags && photo.tags.map((tag, i) => (
                    <span key={i} className="polaroid-tag">👦 {tag.student_name}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button className="btn btn-primary" onClick={handleDownload}>
                  <Download size={16} /> Download Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .sample-photo-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #FFE8EC, #E3F2FD);
          color: #FF6B8B;
          min-height: 200px;
        }
        .sample-photo-fallback.large {
          min-height: 400px;
          border-radius: 12px;
        }
        .fallback-emoji {
          font-size: 3.5rem;
          margin-bottom: 0.5rem;
          animation: pulse 2s infinite;
        }
        .fallback-lbl {
          font-size: 0.85rem;
          font-weight: 600;
          color: #7F8C8D;
        }
        
        .polaroid-header-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.4rem;
        }
        .activity-cat-pill {
          font-size: 0.75rem;
          font-weight: 700;
          background: rgba(77, 150, 255, 0.08);
          color: #4D96FF;
          padding: 0.15rem 0.5rem;
          border-radius: 8px;
        }

        .photo-actions-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          opacity: 0;
          transition: all 0.3s ease;
        }

        .polaroid-photo-wrapper:hover .photo-actions-overlay {
          opacity: 1;
        }

        .overlay-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: white;
          border: none;
          color: #2c3e50;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          transition: transform 0.2s;
        }

        .overlay-btn:hover {
          transform: scale(1.15);
          color: #FF6B8B;
        }

        .sparkle-icon {
          color: #FF6B8B;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .teacher-sign {
          font-size: 0.85rem;
          font-weight: 600;
          color: #7f8c8d;
        }

        /* Zoom modal styles */
        .zoom-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 2rem;
          animation: fadeIn 0.25s ease;
        }

        .zoom-modal-container {
          background: white;
          max-width: 900px;
          width: 100%;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 25px 60px rgba(0,0,0,0.3);
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          position: relative;
          animation: scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.1);
        }

        @media (max-width: 768px) {
          .zoom-modal-container {
            grid-template-columns: 1fr;
            max-height: 90vh;
            overflow-y: auto;
          }
        }

        .zoom-close-btn {
          position: absolute;
          top: 15px;
          right: 15px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(0,0,0,0.5);
          color: white;
          border: none;
          font-size: 1.1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          transition: all 0.2s;
        }

        .zoom-close-btn:hover {
          background: #FF6B8B;
        }

        .zoom-modal-image-box {
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .zoom-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          max-height: 550px;
        }

        .zoom-modal-details {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .zoom-meta-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .zoom-blockquote {
          background: #FFE8EC;
          border-left: 4px solid #FF6B8B;
          padding: 0.75rem 1rem;
          border-radius: 4px;
          color: #FF6B8B;
          font-weight: 500;
          display: flex;
          align-items: flex-start;
          margin: 0.75rem 0;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1) translateY(-3px); }
        }
        @keyframes scaleUp {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default PhotoCard;
