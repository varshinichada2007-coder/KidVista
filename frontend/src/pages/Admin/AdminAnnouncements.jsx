import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { Megaphone, Trash2, Calendar, Send, CheckCircle } from 'lucide-react';

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sending, setSending] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const r = await API.get('/admin/announcements');
      setAnnouncements(r.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !message) { setError('Please fill in both title and message.'); return; }
    setError(''); setSuccess(''); setSending(true);
    try {
      await API.post('/admin/announcements', { title, message });
      setSuccess('Announcement published successfully!');
      setTitle(''); setMessage('');
      fetchAnnouncements();
      setTimeout(() => setSuccess(''), 4000);
    } catch { setError('Failed to publish announcement.'); }
    finally { setSending(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try { await API.delete(`/admin/announcements/${id}`); fetchAnnouncements(); }
    catch { alert('Could not delete.'); }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="ann-content">

          <div className="ann-header">
            <div>
              <h1 className="ann-title">School Bulletin Board</h1>
              <p className="ann-sub">Broadcast notices directly to all parents</p>
            </div>
          </div>

          <div className="ann-layout">
            {/* Compose */}
            <div className="ann-compose-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <Megaphone size={18} style={{ color: '#3B82F6' }} />
                <h3 className="ann-panel-title">Post Announcement</h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '1.25rem', marginTop: 0 }}>
                Publish directly to parents' dashboards
              </p>

              {error && <div className="ann-error">{error}</div>}
              {success && (
                <div className="ann-success">
                  <CheckCircle size={14} /> {success}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="ann-form-group">
                  <label>Notice Title</label>
                  <input type="text" className="ann-input" placeholder="e.g. Annual Sports Day 2026"
                    value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                <div className="ann-form-group">
                  <label>Message</label>
                  <textarea className="ann-input ann-textarea"
                    placeholder="Write the full announcement here..."
                    value={message} onChange={e => setMessage(e.target.value)} rows={5} required />
                </div>
                <button type="submit" className="ann-publish-btn" disabled={sending}>
                  <Send size={14} /> {sending ? 'Publishing...' : 'Publish Notice'}
                </button>
              </form>
            </div>

            {/* Feed */}
            <div className="ann-feed-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 className="ann-panel-title">Published Bulletins</h3>
                <span style={{ background: '#F1F5F9', color: '#475569', borderRadius: '6px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 600 }}>
                  {announcements.length} notice{announcements.length !== 1 ? 's' : ''}
                </span>
              </div>

              {loading ? (
                <div className="ann-loading">Loading bulletins...</div>
              ) : announcements.length === 0 ? (
                <div className="ann-empty">
                  <Megaphone size={32} style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
                  <p>No announcements posted yet.</p>
                </div>
              ) : (
                <div className="ann-feed">
                  {announcements.map(ann => (
                    <div key={ann.id} className="ann-card">
                      <div className="ann-card-header">
                        <span className="ann-date">
                          <Calendar size={11} />
                          {new Date(ann.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </span>
                        <button className="ann-delete-btn" onClick={() => handleDelete(ann.id)} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <h4 className="ann-card-title">{ann.title}</h4>
                      <p className="ann-card-msg">{ann.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .ann-content { padding: 1.75rem 2rem; font-family: 'Outfit', sans-serif; }
        .ann-header { margin-bottom: 1.5rem; }
        .ann-title { font-size: 1.6rem; font-weight: 800; color: #0F172A; margin: 0 0 0.2rem 0; }
        .ann-sub { font-size: 0.875rem; color: #94A3B8; margin: 0; }

        .ann-layout {
          display: grid; grid-template-columns: 360px 1fr; gap: 1.5rem; align-items: flex-start;
        }
        @media (max-width: 900px) { .ann-layout { grid-template-columns: 1fr; } }

        .ann-compose-panel {
          background: white; border: 1px solid #F1F5F9; border-radius: 14px;
          padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04); position: sticky; top: 80px;
        }
        .ann-feed-panel {
          background: white; border: 1px solid #F1F5F9; border-radius: 14px;
          padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04); min-height: 300px;
        }
        .ann-panel-title { font-size: 1rem; font-weight: 700; color: #1E293B; margin: 0; }

        .ann-error { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 0.7rem 0.9rem; font-size: 0.825rem; color: #DC2626; margin-bottom: 0.75rem; }
        .ann-success { display: flex; align-items: center; gap: 0.4rem; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 0.7rem 0.9rem; font-size: 0.825rem; color: #15803D; font-weight: 600; margin-bottom: 0.75rem; }

        .ann-form-group { display: flex; flex-direction: column; gap: 0.35rem; }
        .ann-form-group label { font-size: 0.825rem; font-weight: 600; color: #374151; }
        .ann-input {
          padding: 0.65rem 0.9rem; border: 1.5px solid #E5E7EB; border-radius: 8px;
          font-size: 0.875rem; font-family: 'Outfit', sans-serif; color: #1F2937;
          outline: none; transition: border-color 0.15s; width: 100%; box-sizing: border-box;
        }
        .ann-input:focus { border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .ann-textarea { resize: vertical; min-height: 100px; }
        .ann-publish-btn {
          display: flex; align-items: center; justify-content: center; gap: 0.4rem;
          padding: 0.7rem; background: #2563EB; color: white; border: none; border-radius: 8px;
          font-size: 0.875rem; font-weight: 600; cursor: pointer; font-family: 'Outfit', sans-serif;
          transition: background 0.15s;
        }
        .ann-publish-btn:hover:not(:disabled) { background: #1D4ED8; }
        .ann-publish-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .ann-loading { text-align: center; padding: 2rem; color: #94A3B8; }
        .ann-empty { text-align: center; padding: 3rem; color: #94A3B8; display: flex; flex-direction: column; align-items: center; font-size: 0.875rem; }

        .ann-feed { display: flex; flex-direction: column; gap: 1rem; }
        .ann-card {
          border: 1px solid #F1F5F9; border-radius: 10px; padding: 1.1rem 1.25rem;
          transition: box-shadow 0.15s, border-color 0.15s;
        }
        .ann-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); border-color: #E2E8F0; }
        .ann-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
        .ann-date { display: flex; align-items: center; gap: 0.35rem; font-size: 0.75rem; color: #94A3B8; font-weight: 500; }
        .ann-delete-btn {
          background: transparent; border: none; cursor: pointer; color: #CBD5E1;
          padding: 0.25rem; border-radius: 6px; display: flex; transition: all 0.15s;
        }
        .ann-delete-btn:hover { background: #FEF2F2; color: #EF4444; }
        .ann-card-title { font-size: 0.95rem; font-weight: 700; color: #1E293B; margin: 0 0 0.4rem 0; }
        .ann-card-msg { font-size: 0.85rem; color: #475569; line-height: 1.55; margin: 0; }
      `}</style>
    </div>
  );
};

export default AdminAnnouncements;
