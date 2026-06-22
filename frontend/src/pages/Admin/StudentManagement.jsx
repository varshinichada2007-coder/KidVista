import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { Plus, Edit2, Trash2, Search, User, AlertTriangle, X, BookOpen } from 'lucide-react';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [classroomName, setClassroomName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [sRes, cRes, pRes] = await Promise.all([
        API.get('/admin/students'),
        API.get('/admin/classrooms'),
        API.get('/admin/parents')
      ]);
      setStudents(sRes.data);
      setClassrooms(cRes.data);
      setParents(pRes.data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => {
    setEditId(null); setName(''); setAge(''); setClassroomName(''); setParentEmail(''); setError('');
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setEditId(s.id); setName(s.student_name); setAge(s.age);
    setClassroomName(s.classroom_name || ''); setParentEmail(s.parent_email || ''); setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !age) { setError('Name and age are required.'); return; }
    setSaving(true);
    try {
      const payload = { student_name: name, age: parseInt(age), classroom_name: classroomName, parent_email: parentEmail };
      if (editId) await API.put(`/admin/students/${editId}`, payload);
      else await API.post('/admin/students', payload);
      setModalOpen(false); fetchData();
    } catch { setError('Failed to save. Please try again.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try { await API.delete(`/admin/students/${id}`); fetchData(); }
    catch { alert('Could not delete.'); }
  };

  const filtered = students.filter(s =>
    s.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.classroom_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.parent_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const CLASS_COLORS = { Nursery: '#22C55E', LKG: '#3B82F6', UKG: '#F59E0B' };
  const classCounts = { Nursery: 0, LKG: 0, UKG: 0 };
  students.forEach(s => {
    if (s.classroom_name?.startsWith('Nursery')) classCounts.Nursery++;
    else if (s.classroom_name?.startsWith('LKG')) classCounts.LKG++;
    else if (s.classroom_name?.startsWith('UKG')) classCounts.UKG++;
  });

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="mgmt-content">
          <div className="mgmt-header">
            <div>
              <h1 className="mgmt-title">Student Registry</h1>
              <p className="mgmt-sub">{students.length} student{students.length !== 1 ? 's' : ''} enrolled</p>
            </div>
            <button className="mgmt-add-btn" onClick={openAdd}>
              <Plus size={16} /> Add Student
            </button>
          </div>

          {/* Class distribution */}
          <div className="mgmt-stats">
            {Object.entries(classCounts).map(([cls, cnt]) => {
              const col = CLASS_COLORS[cls];
              return (
                <div key={cls} className="mgmt-stat-pill" style={{ borderColor: col + '40', background: col + '08' }}>
                  <BookOpen size={14} style={{ color: col }} />
                  <span style={{ fontWeight: 600, color: '#1E293B' }}>{cls}</span>
                  <span style={{ color: col, fontWeight: 700 }}>{cnt} student{cnt !== 1 ? 's' : ''}</span>
                </div>
              );
            })}
          </div>

          {/* Search */}
          <div className="mgmt-search-bar">
            <Search size={15} style={{ color: '#94A3B8', flexShrink: 0 }} />
            <input type="text" placeholder="Search by name, classroom or parent..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="mgmt-search-input" />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="mgmt-clear-btn"><X size={14} /></button>}
          </div>

          <div className="mgmt-panel">
            {loading ? (
              <div className="mgmt-loading">Loading registry...</div>
            ) : (
              <div className="mgmt-table-wrap">
                <table className="mgmt-table">
                  <thead>
                    <tr>
                      <th>STUDENT</th>
                      <th>AGE</th>
                      <th>CLASSROOM</th>
                      <th>PARENT</th>
                      <th style={{ textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length > 0 ? filtered.map(s => {
                      const col = CLASS_COLORS[s.classroom_name?.split(' ')[0]] || '#94A3B8';
                      return (
                        <tr key={s.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <div className="mgmt-avatar" style={{ background: '#F0FDF4', color: '#22C55E' }}>
                                {s.student_name[0]}
                              </div>
                              <span className="mgmt-name">{s.student_name}</span>
                            </div>
                          </td>
                          <td>{s.age} yrs</td>
                          <td>
                            {s.classroom_name
                              ? <span className="mgmt-class-tag" style={{ background: col + '15', color: col }}>{s.classroom_name}</span>
                              : <span className="mgmt-unassigned">Unassigned</span>
                            }
                          </td>
                          <td>
                            {s.parent_name
                              ? <span style={{ fontWeight: 500, color: '#475569' }}>{s.parent_name}</span>
                              : <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#D97706', fontSize: '0.8rem', fontWeight: 600 }}>
                                  <AlertTriangle size={13} /> Unlinked
                                </span>
                            }
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="mgmt-actions">
                              <button className="mgmt-icon-btn edit" onClick={() => openEdit(s)}><Edit2 size={14} /></button>
                              <button className="mgmt-icon-btn delete" onClick={() => handleDelete(s.id)}><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                          <User size={28} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                          <br />
                          {searchQuery ? 'No students match your search.' : 'No students enrolled yet.'}
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

      {modalOpen && (
        <div className="mgmt-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="mgmt-modal" onClick={e => e.stopPropagation()}>
            <div className="mgmt-modal-header">
              <h2>{editId ? 'Edit Student' : 'Register New Student'}</h2>
              <button className="mgmt-modal-close" onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>
            {error && <div className="mgmt-error">{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="mgmt-form-group">
                <label>Student Name</label>
                <input type="text" className="mgmt-input" placeholder="e.g. Aarav Patel"
                  value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="mgmt-form-group">
                  <label>Age</label>
                  <input type="number" className="mgmt-input" placeholder="e.g. 4"
                    value={age} onChange={e => setAge(e.target.value)} min="1" max="10" required />
                </div>
                <div className="mgmt-form-group">
                  <label>Classroom</label>
                  <select className="mgmt-input" value={classroomName} onChange={e => setClassroomName(e.target.value)}>
                    <option value="">— Select —</option>
                    {classrooms.map(c => <option key={c.id} value={c.classroom_name}>{c.classroom_name}</option>)}
                  </select>
                </div>
              </div>
              <div className="mgmt-form-group">
                <label>Linked Parent</label>
                <select className="mgmt-input" value={parentEmail} onChange={e => setParentEmail(e.target.value)}>
                  <option value="">— Select Parent (Optional) —</option>
                  {parents.map(p => <option key={p.user_id} value={p.email}>{p.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="mgmt-cancel-btn" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="mgmt-submit-btn" disabled={saving}>
                  {saving ? 'Saving...' : editId ? 'Save Changes' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .mgmt-content { padding: 1.75rem 2rem; max-width: 1100px; width: 100%; font-family: 'Outfit', sans-serif; }
        .mgmt-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem; }
        .mgmt-title { font-size: 1.6rem; font-weight: 800; color: #0F172A; margin: 0 0 0.2rem 0; }
        .mgmt-sub { font-size: 0.875rem; color: #94A3B8; margin: 0; }
        .mgmt-add-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1.1rem; background: #2563EB; color: white; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; font-family: 'Outfit', sans-serif; transition: background 0.15s; }
        .mgmt-add-btn:hover { background: #1D4ED8; }
        .mgmt-stats { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
        .mgmt-stat-pill { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.9rem; border: 1px solid; border-radius: 8px; font-size: 0.8rem; }
        .mgmt-search-bar { display: flex; align-items: center; gap: 0.5rem; background: white; border: 1px solid #E2E8F0; border-radius: 10px; padding: 0.6rem 0.9rem; margin-bottom: 1rem; max-width: 480px; }
        .mgmt-search-input { border: none; background: transparent; outline: none; font-size: 0.875rem; color: #475569; font-family: 'Outfit', sans-serif; flex: 1; }
        .mgmt-search-input::placeholder { color: #CBD5E1; }
        .mgmt-clear-btn { background: none; border: none; cursor: pointer; color: #94A3B8; display: flex; align-items: center; padding: 0; }
        .mgmt-panel { background: white; border: 1px solid #F1F5F9; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); overflow: hidden; }
        .mgmt-loading { text-align: center; padding: 3rem; color: #94A3B8; font-size: 0.875rem; }
        .mgmt-table-wrap { overflow-x: auto; }
        .mgmt-table { width: 100%; border-collapse: collapse; }
        .mgmt-table th { background: #F8FAFC; padding: 0.75rem 1.25rem; font-size: 0.68rem; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.06em; text-align: left; border-bottom: 1px solid #F1F5F9; }
        .mgmt-table td { padding: 0.85rem 1.25rem; font-size: 0.875rem; color: #475569; border-bottom: 1px solid #F8FAFC; }
        .mgmt-table tr:last-child td { border-bottom: none; }
        .mgmt-table tr:hover td { background: #FAFAFA; }
        .mgmt-avatar { width: 30px; height: 30px; border-radius: 50%; font-size: 0.8rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .mgmt-name { font-weight: 600; color: #1E293B; }
        .mgmt-class-tag { padding: 0.2rem 0.65rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
        .mgmt-unassigned { font-size: 0.8rem; color: #CBD5E1; font-style: italic; }
        .mgmt-actions { display: flex; justify-content: flex-end; gap: 0.4rem; }
        .mgmt-icon-btn { width: 30px; height: 30px; border-radius: 7px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
        .mgmt-icon-btn.edit { background: #EFF6FF; color: #3B82F6; }
        .mgmt-icon-btn.edit:hover { background: #3B82F6; color: white; }
        .mgmt-icon-btn.delete { background: #FEF2F2; color: #EF4444; }
        .mgmt-icon-btn.delete:hover { background: #EF4444; color: white; }
        .mgmt-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .mgmt-modal { background: white; border-radius: 16px; padding: 2rem; width: 100%; max-width: 480px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); animation: mgmt-in 0.2s ease; }
        @keyframes mgmt-in { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
        .mgmt-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
        .mgmt-modal-header h2 { font-size: 1.1rem; font-weight: 700; color: #0F172A; margin: 0; }
        .mgmt-modal-close { background: #F8FAFC; border: none; border-radius: 8px; cursor: pointer; padding: 0.35rem; color: #64748B; display: flex; transition: background 0.15s; }
        .mgmt-modal-close:hover { background: #F1F5F9; }
        .mgmt-error { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 0.75rem 1rem; font-size: 0.825rem; color: #DC2626; margin-bottom: 1rem; }
        .mgmt-form-group { display: flex; flex-direction: column; gap: 0.35rem; }
        .mgmt-form-group label { font-size: 0.825rem; font-weight: 600; color: #374151; }
        .mgmt-input { padding: 0.65rem 0.9rem; border: 1.5px solid #E5E7EB; border-radius: 8px; font-size: 0.875rem; font-family: 'Outfit', sans-serif; color: #1F2937; outline: none; transition: border-color 0.15s; background: white; }
        .mgmt-input:focus { border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .mgmt-cancel-btn { flex: 1; padding: 0.65rem; background: #F8FAFC; border: 1.5px solid #E5E7EB; border-radius: 8px; font-size: 0.875rem; font-weight: 600; color: #64748B; cursor: pointer; font-family: 'Outfit', sans-serif; }
        .mgmt-cancel-btn:hover { background: #F1F5F9; }
        .mgmt-submit-btn { flex: 2; padding: 0.65rem; background: #2563EB; color: white; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; font-family: 'Outfit', sans-serif; transition: background 0.15s; }
        .mgmt-submit-btn:hover:not(:disabled) { background: #1D4ED8; }
        .mgmt-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </div>
  );
};

export default StudentManagement;
