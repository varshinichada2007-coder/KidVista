import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { Plus, Edit2, Trash2, Search, Info, GraduationCap, BookOpen, Mail, X } from 'lucide-react';

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [classroomId, setClassroomId] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [teachersRes, classroomsRes] = await Promise.all([
        API.get('/admin/teachers'),
        API.get('/admin/classrooms')
      ]);
      setTeachers(teachersRes.data);
      setClassrooms(classroomsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenAdd = () => {
    setEditUserId(null); setName(''); setEmail(''); setClassroomId(''); setError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditUserId(t.user_id); setName(t.name); setEmail(t.email);
    setClassroomId(t.classroom_id || ''); setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) { setError('Name and email are required.'); return; }
    setSaving(true);
    try {
      const payload = { name, email, classroom_id: classroomId ? parseInt(classroomId) : null };
      if (editUserId) await API.put(`/admin/teachers/${editUserId}`, payload);
      else await API.post('/admin/teachers', payload);
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save teacher.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this teacher? Their account will be permanently removed.')) return;
    try {
      await API.delete(`/admin/teachers/${userId}`);
      fetchData();
    } catch { alert('Could not delete teacher.'); }
  };

  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.classroom_name && t.classroom_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const CLASSROOM_COLORS = { Nursery: '#22C55E', LKG: '#3B82F6', UKG: '#F59E0B' };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="mgmt-content">

          {/* Header */}
          <div className="mgmt-header">
            <div>
              <h1 className="mgmt-title">Faculty Directory</h1>
              <p className="mgmt-sub">{teachers.length} teacher{teachers.length !== 1 ? 's' : ''} registered</p>
            </div>
            <button className="mgmt-add-btn" onClick={handleOpenAdd}>
              <Plus size={16} /> Add Teacher
            </button>
          </div>

          {/* Stats row */}
          <div className="mgmt-stats">
            {classrooms.map(cls => {
              const count = teachers.filter(t => t.classroom_name === cls.classroom_name).length;
              const col = CLASSROOM_COLORS[cls.classroom_name] || '#94A3B8';
              return (
                <div key={cls.id} className="mgmt-stat-pill" style={{ borderColor: col + '40', background: col + '08' }}>
                  <BookOpen size={14} style={{ color: col }} />
                  <span style={{ fontWeight: 600, color: '#1E293B' }}>{cls.classroom_name}</span>
                  <span style={{ color: col, fontWeight: 700 }}>{count} teacher{count !== 1 ? 's' : ''}</span>
                </div>
              );
            })}
          </div>

          {/* Search */}
          <div className="mgmt-search-bar">
            <Search size={15} style={{ color: '#94A3B8', flexShrink: 0 }} />
            <input type="text" placeholder="Search by name, email or classroom..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="mgmt-search-input" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="mgmt-clear-btn"><X size={14} /></button>
            )}
          </div>

          {/* Table */}
          <div className="mgmt-panel">
            {loading ? (
              <div className="mgmt-loading">Loading faculty...</div>
            ) : (
              <div className="mgmt-table-wrap">
                <table className="mgmt-table">
                  <thead>
                    <tr>
                      <th>TEACHER</th>
                      <th>EMAIL</th>
                      <th>CLASSROOM</th>
                      <th style={{ textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeachers.length > 0 ? filteredTeachers.map(t => {
                      const col = CLASSROOM_COLORS[t.classroom_name] || '#94A3B8';
                      return (
                        <tr key={t.user_id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <div className="mgmt-avatar" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
                                {t.name[0]}
                              </div>
                              <span className="mgmt-name">{t.name}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontSize: '0.875rem' }}>
                              <Mail size={13} style={{ color: '#CBD5E1' }} /> {t.email}
                            </div>
                          </td>
                          <td>
                            {t.classroom_name ? (
                              <span className="mgmt-class-tag" style={{ background: col + '15', color: col }}>
                                {t.classroom_name}
                              </span>
                            ) : (
                              <span className="mgmt-unassigned">Not assigned</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="mgmt-actions">
                              <button className="mgmt-icon-btn edit" onClick={() => handleOpenEdit(t)} title="Edit">
                                <Edit2 size={14} />
                              </button>
                              <button className="mgmt-icon-btn delete" onClick={() => handleDelete(t.user_id)} title="Delete">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                          <GraduationCap size={28} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                          <br />
                          {searchQuery ? 'No teachers match your search.' : 'No teachers found.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="mgmt-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="mgmt-modal" onClick={e => e.stopPropagation()}>
            <div className="mgmt-modal-header">
              <h2>{editUserId ? 'Edit Teacher' : 'Add New Teacher'}</h2>
              <button className="mgmt-modal-close" onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>

            {!editUserId && (
              <div className="mgmt-info-banner">
                <Info size={14} style={{ color: '#3B82F6', flexShrink: 0 }} />
                <span>An account will be created automatically. Default password: <strong>teacher123</strong></span>
              </div>
            )}

            {error && <div className="mgmt-error">{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="mgmt-form-group">
                <label>Full Name</label>
                <input type="text" className="mgmt-input" placeholder="e.g. Ms. Priya Sharma"
                  value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="mgmt-form-group">
                <label>Email Address</label>
                <input type="email" className="mgmt-input" placeholder="e.g. priya@kidvista.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="mgmt-form-group">
                <label>Assign Classroom</label>
                <select className="mgmt-input" value={classroomId} onChange={e => setClassroomId(e.target.value)}>
                  <option value="">— Select Classroom (Optional) —</option>
                  {classrooms.map(c => (
                    <option key={c.id} value={c.id}>{c.classroom_name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="mgmt-cancel-btn" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="mgmt-submit-btn" disabled={saving}>
                  {saving ? 'Saving...' : editUserId ? 'Save Changes' : 'Register Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .mgmt-content {
          padding: 1.75rem 2rem; max-width: 1100px; width: 100%;
          font-family: 'Outfit', sans-serif;
        }
        .mgmt-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem;
        }
        .mgmt-title { font-size: 1.6rem; font-weight: 800; color: #0F172A; margin: 0 0 0.2rem 0; }
        .mgmt-sub { font-size: 0.875rem; color: #94A3B8; margin: 0; }
        .mgmt-add-btn {
          display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1.1rem;
          background: #2563EB; color: white; border: none; border-radius: 8px;
          font-size: 0.875rem; font-weight: 600; cursor: pointer; font-family: 'Outfit', sans-serif;
          transition: background 0.15s;
        }
        .mgmt-add-btn:hover { background: #1D4ED8; }
        .mgmt-stats {
          display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.25rem;
        }
        .mgmt-stat-pill {
          display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.9rem;
          border: 1px solid; border-radius: 8px; font-size: 0.8rem;
        }
        .mgmt-search-bar {
          display: flex; align-items: center; gap: 0.5rem; background: white;
          border: 1px solid #E2E8F0; border-radius: 10px; padding: 0.6rem 0.9rem;
          margin-bottom: 1rem; max-width: 480px;
        }
        .mgmt-search-input {
          border: none; background: transparent; outline: none; font-size: 0.875rem;
          color: #475569; font-family: 'Outfit', sans-serif; flex: 1;
        }
        .mgmt-search-input::placeholder { color: #CBD5E1; }
        .mgmt-clear-btn {
          background: none; border: none; cursor: pointer; color: #94A3B8;
          display: flex; align-items: center; padding: 0;
        }
        .mgmt-clear-btn:hover { color: #475569; }
        .mgmt-panel {
          background: white; border: 1px solid #F1F5F9; border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04); overflow: hidden;
        }
        .mgmt-loading { text-align: center; padding: 3rem; color: #94A3B8; font-size: 0.875rem; }
        .mgmt-table-wrap { overflow-x: auto; }
        .mgmt-table { width: 100%; border-collapse: collapse; }
        .mgmt-table th {
          background: #F8FAFC; padding: 0.75rem 1.25rem; font-size: 0.68rem; font-weight: 700;
          color: #94A3B8; text-transform: uppercase; letter-spacing: 0.06em; text-align: left;
          border-bottom: 1px solid #F1F5F9;
        }
        .mgmt-table td { padding: 0.85rem 1.25rem; font-size: 0.875rem; color: #475569; border-bottom: 1px solid #F8FAFC; }
        .mgmt-table tr:last-child td { border-bottom: none; }
        .mgmt-table tr:hover td { background: #FAFAFA; }
        .mgmt-avatar {
          width: 30px; height: 30px; border-radius: 50%; font-size: 0.8rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .mgmt-name { font-weight: 600; color: #1E293B; }
        .mgmt-class-tag {
          padding: 0.2rem 0.65rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;
        }
        .mgmt-unassigned { font-size: 0.8rem; color: #CBD5E1; font-style: italic; }
        .mgmt-actions { display: flex; justify-content: flex-end; gap: 0.4rem; }
        .mgmt-icon-btn {
          width: 30px; height: 30px; border-radius: 7px; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; transition: all 0.15s;
        }
        .mgmt-icon-btn.edit { background: #EFF6FF; color: #3B82F6; }
        .mgmt-icon-btn.edit:hover { background: #3B82F6; color: white; }
        .mgmt-icon-btn.delete { background: #FEF2F2; color: #EF4444; }
        .mgmt-icon-btn.delete:hover { background: #EF4444; color: white; }

        /* Modal */
        .mgmt-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
          z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem;
        }
        .mgmt-modal {
          background: white; border-radius: 16px; padding: 2rem; width: 100%; max-width: 460px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15); animation: mgmt-modal-in 0.2s ease;
        }
        @keyframes mgmt-modal-in { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
        .mgmt-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
        .mgmt-modal-header h2 { font-size: 1.1rem; font-weight: 700; color: #0F172A; margin: 0; }
        .mgmt-modal-close {
          background: #F8FAFC; border: none; border-radius: 8px; cursor: pointer;
          padding: 0.35rem; color: #64748B; display: flex; transition: background 0.15s;
        }
        .mgmt-modal-close:hover { background: #F1F5F9; }
        .mgmt-info-banner {
          display: flex; align-items: center; gap: 0.5rem; background: #EFF6FF;
          border: 1px solid #BFDBFE; border-radius: 8px; padding: 0.75rem 1rem;
          font-size: 0.825rem; color: #1D4ED8; margin-bottom: 1rem;
        }
        .mgmt-error {
          background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px;
          padding: 0.75rem 1rem; font-size: 0.825rem; color: #DC2626; margin-bottom: 1rem;
        }
        .mgmt-form-group { display: flex; flex-direction: column; gap: 0.35rem; }
        .mgmt-form-group label { font-size: 0.825rem; font-weight: 600; color: #374151; }
        .mgmt-input {
          padding: 0.65rem 0.9rem; border: 1.5px solid #E5E7EB; border-radius: 8px;
          font-size: 0.875rem; font-family: 'Outfit', sans-serif; color: #1F2937; outline: none;
          transition: border-color 0.15s; background: white;
        }
        .mgmt-input:focus { border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .mgmt-cancel-btn {
          flex: 1; padding: 0.65rem; background: #F8FAFC; border: 1.5px solid #E5E7EB;
          border-radius: 8px; font-size: 0.875rem; font-weight: 600; color: #64748B;
          cursor: pointer; font-family: 'Outfit', sans-serif; transition: background 0.15s;
        }
        .mgmt-cancel-btn:hover { background: #F1F5F9; }
        .mgmt-submit-btn {
          flex: 2; padding: 0.65rem; background: #2563EB; color: white; border: none;
          border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer;
          font-family: 'Outfit', sans-serif; transition: background 0.15s;
        }
        .mgmt-submit-btn:hover:not(:disabled) { background: #1D4ED8; }
        .mgmt-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </div>
  );
};

export default TeacherManagement;
