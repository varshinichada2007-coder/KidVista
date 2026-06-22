import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import PrivacyBadge from '../../components/PrivacyBadge';
import PhotoCard from '../../components/PhotoCard';
import { Search, Calendar, Filter, Image } from 'lucide-react';

const PhotoGallery = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

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

  // Filter application logic
  const filteredPhotos = photos.filter((photo) => {
    const query = searchQuery.toLowerCase();
    const titleMatch = photo.activity_title.toLowerCase().includes(query) ||
                       (photo.ai_caption && photo.ai_caption.toLowerCase().includes(query));
                       
    const categoryMatch = categoryFilter === 'all' || photo.activity_category === categoryFilter;
    
    let dateMatch = true;
    if (dateFilter) {
      // Compare only YYYY-MM-DD parts
      const photoDateStr = new Date(photo.activity_date).toISOString().split('T')[0];
      dateMatch = photoDateStr === dateFilter;
    }

    return titleMatch && categoryMatch && dateMatch;
  });

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="My Child's Photo Gallery" />
        <div className="content-body">
          <PrivacyBadge />

          {/* Search and Filters panel */}
          <div className="glass-panel search-action-bar">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search by activity title or AI caption keywords..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filters-row flex-end-filter">
              <div className="form-group-inline">
                <label><Calendar size={14} /> Date</label>
                <input 
                  type="date"
                  className="form-control font-sm-input"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
                {dateFilter && (
                  <button className="clear-date-btn" onClick={() => setDateFilter('')}>✕</button>
                )}
              </div>

              <div className="form-group-inline">
                <label>Category</label>
                <select 
                  className="form-control font-sm-input"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
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

          {/* Photos list */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>🏫 Loading secure photos...</div>
          ) : filteredPhotos.length === 0 ? (
            <div className="glass-panel text-center" style={{ padding: '4rem 2rem' }}>
              <Image size={48} style={{ color: '#ccc', marginBottom: '0.75rem' }} />
              <h3>No Photos Visible</h3>
              <p style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                There are no approved tagged photos of your child matching the filters.
              </p>
            </div>
          ) : (
            <div className="memory-grid">
              {filteredPhotos.map((photo) => (
                <PhotoCard key={photo.id} photo={photo} />
              ))}
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

        .flex-end-filter {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .font-sm-input {
          padding: 0.45rem 0.75rem;
          font-size: 0.85rem;
          border-radius: 8px;
        }

        .clear-date-btn {
          background: rgba(0,0,0,0.05);
          color: #7f8c8d;
          border: none;
          padding: 0.2rem 0.4rem;
          cursor: pointer;
          border-radius: 4px;
          margin-left: -10px;
          z-index: 10;
        }

        .clear-date-btn:hover {
          background: #E3F2FD;
          color: #4F9CF9;
        }

        @media (max-width: 992px) {
          .search-action-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }
          .flex-end-filter {
            justify-content: flex-start;
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PhotoGallery;
