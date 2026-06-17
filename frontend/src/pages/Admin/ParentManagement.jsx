import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';
import { Plus, Edit2, Trash2, Search, Info, Baby } from 'lucide-react';

const ParentManagement = () => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [editUserId, setEditUserId] = useState(null); // stores user_id
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const response = await API.get('/admin/parents');
      setParents(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditUserId(null);
    setName('');
    setEmail('');
    setError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (parent) => {
    setEditUserId(parent.user_id);
    setName(parent.name);
    setEmail(parent.email);
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      setError('Name and email are required.');
      return;
    }

    const payload = { name, email };

    try {
      if (editUserId) {
        await API.put(`/admin/parents/${editUserId}`, payload);
      } else {
        await API.post('/admin/parents', payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save parent details.');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this parent? This will unlink their children.')) return;
    try {
      await API.delete(`/admin/parents/${userId}`);
      fetchData();
    } catch (err) {
      alert('Could not delete parent.');
    }
  };

  const filteredParents = parents.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.children.some(c => c.student_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Parent Directory" />
        <div className="content-body">
          
          <div className="glass-panel search-action-bar">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search parents, emails or children..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" onClick={handleOpenAdd}>
              <Plus size={18} /> Add Parent
            </button>
          </div>

          <div className="glass-panel">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>🏫 Loading parent database...</div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email Address</th>
                      <th>Linked Child(ren)</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParents.length > 0 ? (
                      filteredParents.map((parent) => (
                        <tr key={parent.user_id}>
                          <td style={{ fontWeight: 'bold', color: '#2c3e50' }}>{parent.name}</td>
                          <td>{parent.email}</td>
                          <td>
                            <div className="children-tags-list">
                              {parent.children && parent.children.length > 0 ? (
                                parent.children.map((child, i) => (
                                  <span key={i} className="child-avatar-tag">
                                    <Baby size={12} style={{ shrink: 0 }} />
                                    <span>{child.student_name} ({child.classroom_name || 'No Class'})</span>
                                  </span>
                                ))
                              ) : (
                                <span className="no-children-label">No children linked yet</span>
                              )}
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="table-actions">
                              <button className="icon-btn edit" onClick={() => handleOpenEdit(parent)} title="Edit Parent">
                                <Edit2 size={16} />
                              </button>
                              <button className="icon-btn delete" onClick={() => handleDelete(parent.user_id)} title="Delete Parent">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
                          No parents found matching your search.
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

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editUserId ? 'Modify Parent Details' : 'Add New Parent Account'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && <div className="error-alert">{error}</div>}

          {!editUserId && (
            <div className="info-banner">
              <Info size={16} style={{ color: '#4D96FF', shrink: '0' }} />
              <span>An account will automatically be created. Default password is <strong>parent123</strong>. Link students to this parent on the <strong>Students Page</strong>.</span>
            </div>
          )}

          <div className="form-group">
            <label>Parent Name</label>
            <input 
              type="text" 
              className="form-control"
              placeholder="e.g. Rahul Patel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              className="form-control"
              placeholder="e.g. rahul@patel.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifySelf: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
              {editUserId ? 'Save Changes' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        .children-tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .child-avatar-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: rgba(107, 203, 119, 0.08);
          color: #2E7D32;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.2rem 0.6rem;
          border-radius: 8px;
        }

        .no-children-label {
          color: #aaa;
          font-size: 0.85rem;
          font-style: italic;
        }

        .info-banner {
          background: #E3F2FD;
          border: 1px solid rgba(77, 150, 255, 0.3);
          border-radius: 10px;
          padding: 0.75rem 1rem;
          font-size: 0.85rem;
          color: #1565C0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }

        .search-action-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          padding: 1.25rem 1.5rem;
        }

        .search-box {
          position: relative;
          flex: 1;
          max-width: 450px;
        }

        .search-box input {
          width: 100%;
          padding: 0.65rem 1rem 0.65rem 2.2rem;
          font-size: 0.9rem;
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 10px;
          outline: none;
        }

        .search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #7f8c8d;
        }

        .table-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        }

        .icon-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .icon-btn.edit { background: rgba(77, 150, 255, 0.1); color: #4D96FF; }
        .icon-btn.edit:hover { background: #4D96FF; color: white; }
        
        .icon-btn.delete { background: rgba(255, 107, 139, 0.1); color: #FF6B8B; }
        .icon-btn.delete:hover { background: #FF6B8B; color: white; }

        @media (max-width: 768px) {
          .search-action-bar {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }
          .search-box {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ParentManagement;
