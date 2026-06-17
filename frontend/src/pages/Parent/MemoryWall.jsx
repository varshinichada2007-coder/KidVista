import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import PrivacyBadge from '../../components/PrivacyBadge';
import PhotoCard from '../../components/PhotoCard';
import { Heart, Sparkles, HeartHandshake } from 'lucide-react';

const MemoryWall = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPhotos = async () => {
    try {
      const response = await API.get('/parent/photos');
      setPhotos(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Milestone Memory Scrapbook" />
        <div className="content-body">
          <PrivacyBadge />

          <div className="memory-wall-intro-banner glass-panel">
            <HeartHandshake size={28} className="intro-badge-icon" />
            <div>
              <h3>Classroom Memory Wall</h3>
              <p>Explore child memories, download cards, and witness daily childhood development stories compiled with love by classroom teachers.</p>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>🏫 Loading scrapbook wall...</div>
          ) : photos.length === 0 ? (
            <div className="glass-panel text-center" style={{ padding: '3rem' }}>
              <Heart size={32} style={{ color: '#ccc', marginBottom: '0.5rem' }} />
              <p>No childhood memories tagged yet. Check back soon!</p>
            </div>
          ) : (
            <div className="scrapbook-board-container">
              <div className="scrapbook-grid">
                {photos.map((photo, index) => {
                  // Apply random rotations to Polaroid cards to make it look like a physical board
                  const rotations = ['rotate-1', 'rotate-2', 'rotate-3', 'rotate-4'];
                  const rotationClass = rotations[index % rotations.length];
                  
                  return (
                    <div key={photo.id} className={`scrapbook-item ${rotationClass}`}>
                      <div className="push-pin">📌</div>
                      <PhotoCard photo={photo} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      <style>{`
        .memory-wall-intro-banner {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: linear-gradient(135deg, rgba(255, 107, 139, 0.04), rgba(158, 119, 241, 0.04));
          border-left: 5px solid var(--color-purple);
          font-family: 'Outfit', sans-serif;
        }

        .intro-badge-icon {
          color: var(--color-purple);
        }

        .memory-wall-intro-banner h3 {
          font-weight: 800;
          color: #2C3E50;
        }

        .memory-wall-intro-banner p {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .scrapbook-board-container {
          background-color: #f4eae1;
          background-image: 
            radial-gradient(#dbcdbc 1px, transparent 0),
            radial-gradient(#dbcdbc 1px, #f4eae1 0);
          background-size: 24px 24px;
          background-position: 0 0, 12px 12px;
          border-radius: var(--border-radius-lg);
          padding: 3rem 2rem;
          box-shadow: inset 0 0 40px rgba(0,0,0,0.06);
          border: 10px solid #e0d2c3;
          margin-top: 1.5rem;
        }

        .scrapbook-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
          gap: 3.5rem 2.5rem;
        }

        .scrapbook-item {
          position: relative;
        }

        .push-pin {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 1.5rem;
          z-index: 20;
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.15));
        }

        /* Polaroid Rotations */
        .rotate-1 { transform: rotate(-1.5deg); }
        .rotate-2 { transform: rotate(1deg); }
        .rotate-3 { transform: rotate(-1deg); }
        .rotate-4 { transform: rotate(2deg); }

        .rotate-1:hover, .rotate-2:hover, .rotate-3:hover, .rotate-4:hover {
          transform: scale(1.03) rotate(0deg);
        }
      `}</style>
    </div>
  );
};

export default MemoryWall;
