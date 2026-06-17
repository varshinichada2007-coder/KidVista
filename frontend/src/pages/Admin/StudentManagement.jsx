import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';
import { Plus, Edit2, Trash2, Search, User, ShieldAlert } from 'lucide-react';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [parents, setParents] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  
  // Form state
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [classroomName, setClassroomName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [studentsRes, classroomsRes, parentsRes] = await Promise.all([
        API.get('/admin/students'),
        API.get('/admin/classrooms'),
        API.get('/admin/parents')
      ]);
      setStudents(studentsRes.data);
      setClassrooms(classroomsRes.data);
      setParents(parentsRes.data);
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
    setEditId(null);
    setName('');
    setAge('');
    setClassroomName('');
    setParentEmail('');
    setError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setEditId(student.id);
    setName(student.student_name);
    setAge(student.age);
    setClassroomName(student.classroom_name || '');
    setParentEmail(student.parent_email || '');
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !age) {
      setError('Name and age are required.');
      return;
    }

    const payload = {
      student_name: name,
      age: parseInt(age),
      classroom_name: classroomName,
      parent_email: parentEmail
    };

    try {
      if (editId) {
        await API.put(`/admin/students/${editId}`, payload);
      } else {
        await API.post('/admin/students', payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setError('Failed to save student details. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await API.delete(`/admin/students/${id}`);
      fetchData();
    } catch (err) {
      alert('Could not delete student.');
    }
  };

  const filteredStudents = students.filter(s => 
    s.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.classroom_name && s.classroom_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.parent_name && s.parent_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Student Registry" />
        <div className="content-body">
          
          <div className="glass-panel search-action-bar">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search students, classrooms or parents..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" onClick={handleOpenAdd}>
              <Plus size={18} /> Add Student
            </button>
          </div>

          <div className="glass-panel">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>🏫 Loading registry...</div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Age</th>
                      <th>Classroom</th>
                      <th>Linked Parent</th>
                      <th>Parent Email</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <tr key={student.id}>
                          <td style={{ fontWeight: 'bold', color: '#2c3e50' }}>{student.student_name}</td>
                          <td>{student.age} yrs</td>
                          <td>
                            {student.classroom_name ? (
                              <span className="classroom-tag">{student.classroom_name}</span>
                            ) : (
                              <span style={{ color: '#aaa', fontSize: '0.85rem' }}>Unassigned</span>
                            )}
                          </td>
                          <td>
                            {student.parent_name ? (
                              <span style={{ fontWeight: 500 }}>{student.parent_name}</span>
                            ) : (
                              <span className="unlinked-lbl">⚠️ Unlinked</span>
                            )}
                          </td>
                          <td>{student.parent_email || '-'}</td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="table-actions">
                              <button className="icon-btn edit" onClick={() => handleOpenEdit(student)} title="Edit Student">
                                <Edit2 size={16} />
                              </button>
                              <button className="icon-btn delete" onClick={() => handleDelete(student.id)} title="Delete Student">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
                          No students found matching your search.
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
        title={editId ? 'Modify Student Details' : 'Register New Student'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && <div className="error-alert">{error}</div>}

          <div className="form-group">
            <label>Student Full Name</label>
            <input 
              type="text" 
              className="form-control"
              placeholder="e.g. Aarav Patel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Age</label>
            <input 
              type="number" 
              className="form-control"
              placeholder="e.g. 4"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="1"
              max="10"
              required
            />
          </div>

          <div className="form-group">
            <label>Assigned Classroom</label>
            <select 
              className="form-control"
              value={classroomName}
              onChange={(e) => setClassroomName(e.target.value)}
            >
              <option value="">-- Select Classroom (Optional) --</option>
              {classrooms.map(c => (
                <option key={c.id} value={c.classroom_name}>{c.classroom_name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Linked Parent Account</label>
            <select 
              className="form-control"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
            >
              <option value="">-- Select Parent (Optional) --</option>
              {parents.map(p => (
                <option key={p.user_id} value={p.email}>{p.name} ({p.email})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifySelf: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
              {editId ? 'Save Changes' : 'Register Student'}
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
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

        .unlinked-lbl {
          font-weight: 700;
          color: #856404;
          background: #FFF3CD;
          padding: 0.15rem 0.4rem;
          border-radius: 6px;
          font-size: 0.75rem;
          text-transform: uppercase;
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

export default StudentManagement;
